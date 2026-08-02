import { Router } from 'express';
import { prisma } from '../../config/db';
import { authMiddleware, AuthRequest } from '../../middlewares/auth';

const router = Router();

router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  const favs = await prisma.favorite.findMany({
    where: { userId: req.user!.userId },
    include: { listing: { include: { user: { select: { name: true, ville: true } } } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(favs.map(f => f.listing));
});

router.post('/:listingId', authMiddleware, async (req: AuthRequest, res) => {
  const { listingId } = req.params;
  const exists = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!exists) return res.status(404).json({ error: 'Annonce introuvable' });

  const fav = await prisma.favorite.upsert({
    where: { userId_listingId: { userId: req.user!.userId, listingId } },
    create: { userId: req.user!.userId, listingId },
    update: {},
  });
  res.json(fav);
});

router.delete('/:listingId', authMiddleware, async (req: AuthRequest, res) => {
  await prisma.favorite.deleteMany({
    where: { userId: req.user!.userId, listingId: req.params.listingId },
  });
  res.json({ message: 'Retiré des favoris' });
});

export default router;
