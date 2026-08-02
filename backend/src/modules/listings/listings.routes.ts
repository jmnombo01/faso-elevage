import { Router } from 'express';
import multer from 'multer';
import { prisma } from '../../config/db';
import { authMiddleware, AuthRequest } from '../../middlewares/auth';
import { listingCreateSchema } from '../../utils/validator';
import { uploadToCloudinary } from '../../config/cloudinary';

const router = Router();
const upload = multer({ dest: 'uploads/', limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/listings?ville=...&espece=...&minPrice=...&maxPrice=...&q=...&page=1
router.get('/', async (req, res) => {
  const { ville, espece, minPrice, maxPrice, q, page = '1', limit = '20', statut } = req.query;
  const pageNum = Math.max(1, parseInt(page as string) || 1);
  const limitNum = Math.min(50, parseInt(limit as string) || 20);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};
  // Par défaut, seulement APPROUVEE pour public, sauf si filtre statut admin
  if (!statut) where.statut = 'APPROUVEE';
  else if (typeof statut === 'string') where.statut = statut;

  if (ville && ville !== 'Toutes') where.ville = { equals: ville as string, mode: 'insensitive' };
  if (espece && espece !== 'Toutes') where.espece = espece;
  if (minPrice || maxPrice) {
    where.prixFcfa = {};
    if (minPrice) where.prixFcfa.gte = parseInt(minPrice as string);
    if (maxPrice) where.prixFcfa.lte = parseInt(maxPrice as string);
  }
  if (q) {
    where.OR = [
      { race: { contains: q as string, mode: 'insensitive' } },
      { description: { contains: q as string, mode: 'insensitive' } },
    ];
  }

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: { user: { select: { name: true, phone: true, ville: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    }),
    prisma.listing.count({ where }),
  ]);

  res.json({ data: listings, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
});

// GET /api/listings/:id - incrémente vues
router.get('/:id', async (req, res) => {
  const listing = await prisma.listing.findUnique({
    where: { id: req.params.id },
    include: { user: { select: { id: true, name: true, phone: true, ville: true, quartier: true } } },
  });
  if (!listing) return res.status(404).json({ error: 'Annonce introuvable' });

  // incr vues async
  prisma.listing.update({ where: { id: listing.id }, data: { vues: { increment: 1 } } }).catch(() => {});

  res.json(listing);
});

// POST /api/listings - auth + multipart photos
router.post('/', authMiddleware, upload.array('photos', 5), async (req: AuthRequest, res) => {
  const parsed = listingCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

  const userId = req.user!.userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.isBlocked) return res.status(403).json({ error: 'Compte bloqué' });

  // upload photos
  const files = req.files as Express.Multer.File[] | undefined;
  const photoUrls: string[] = [];
  if (files && files.length > 0) {
    for (const file of files) {
      const url = await uploadToCloudinary(file.path);
      photoUrls.push(url);
    }
  }

  const data = parsed.data;
  const listing = await prisma.listing.create({
    data: {
      userId,
      espece: data.espece as any,
      race: data.race,
      ageMois: data.ageMois,
      poidsKg: data.poidsKg,
      quantite: data.quantite,
      prixFcfa: data.prixFcfa,
      ville: data.ville,
      quartier: data.quartier,
      description: data.description,
      disponibilite: data.disponibilite ? new Date(data.disponibilite) : null,
      photos: photoUrls,
      statut: 'EN_ATTENTE', // modération manuelle
    },
  });

  res.status(201).json(listing);
});

// PUT /api/listings/:id - owner
router.put('/:id', authMiddleware, upload.array('photos', 5), async (req: AuthRequest, res) => {
  const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
  if (!listing) return res.status(404).json({ error: 'Annonce introuvable' });
  if (listing.userId !== req.user!.userId) return res.status(403).json({ error: 'Non autorisé' });

  const parsed = listingCreateSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

  const files = req.files as Express.Multer.File[] | undefined;
  let photoUrls = listing.photos;
  if (files && files.length > 0) {
    photoUrls = [];
    for (const file of files) {
      const url = await uploadToCloudinary(file.path);
      photoUrls.push(url);
    }
  }

  const updated = await prisma.listing.update({
    where: { id: listing.id },
    data: {
      ...parsed.data,
      photos: photoUrls,
      statut: 'EN_ATTENTE', // re-modération si edit
    } as any,
  });

  res.json(updated);
});

// DELETE /api/listings/:id
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
  if (!listing) return res.status(404).json({ error: 'Introuvable' });
  if (listing.userId !== req.user!.userId) return res.status(403).json({ error: 'Non autorisé' });

  await prisma.listing.delete({ where: { id: listing.id } });
  res.json({ message: 'Supprimé' });
});

// PATCH /api/listings/:id/sold
router.patch('/:id/sold', authMiddleware, async (req: AuthRequest, res) => {
  const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
  if (!listing) return res.status(404).json({ error: 'Introuvable' });
  if (listing.userId !== req.user!.userId) return res.status(403).json({ error: 'Non autorisé' });

  const updated = await prisma.listing.update({ where: { id: listing.id }, data: { statut: 'VENDUE' } });
  res.json(updated);
});

export default router;
