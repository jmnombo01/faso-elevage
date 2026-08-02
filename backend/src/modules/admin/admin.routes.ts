import { Router } from 'express';
import { prisma } from '../../config/db';
import { authMiddleware, adminOnly, AuthRequest } from '../../middlewares/auth';

const router = Router();

router.use(authMiddleware, adminOnly);

// GET /api/admin/listings/pending
router.get('/listings/pending', async (_req, res) => {
  const listings = await prisma.listing.findMany({
    where: { statut: 'EN_ATTENTE' },
    include: { user: { select: { name: true, phone: true, ville: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(listings);
});

// PATCH /api/admin/listings/:id/validate
router.patch('/listings/:id/validate', async (req, res) => {
  const { status } = req.body as { status: 'APPROUVEE' | 'REJETEE' };
  if (!['APPROUVEE', 'REJETEE'].includes(status)) return res.status(400).json({ error: 'Statut invalide' });

  const listing = await prisma.listing.update({
    where: { id: req.params.id },
    data: { statut: status as any },
  });
  res.json(listing);
});

// GET /api/admin/users
router.get('/users', async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { listings: true } } },
  });
  res.json(users);
});

// PATCH /api/admin/users/:id/block
router.patch('/users/:id/block', async (req, res) => {
  const { isBlocked } = req.body as { isBlocked: boolean };
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { isBlocked: !!isBlocked },
  });
  res.json(user);
});

// GET /api/admin/reports
router.get('/reports', async (_req, res) => {
  const reports = await prisma.report.findMany({
    where: { isResolved: false },
    include: {
      listing: { select: { id: true, espece: true, prixFcfa: true, photos: true } },
      reporter: { select: { name: true, phone: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(reports);
});

router.patch('/reports/:id/resolve', async (req, res) => {
  const report = await prisma.report.update({
    where: { id: req.params.id },
    data: { isResolved: true },
  });
  res.json(report);
});

// GET /api/admin/stats
router.get('/stats', async (_req, res) => {
  const [totalUsers, totalListings, pending, approved, todayListings] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count(),
    prisma.listing.count({ where: { statut: 'EN_ATTENTE' } }),
    prisma.listing.count({ where: { statut: 'APPROUVEE' } }),
    prisma.listing.count({ where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
  ]);

  const byEspece = await prisma.listing.groupBy({
    by: ['espece'],
    _count: { espece: true },
    orderBy: { _count: { espece: 'desc' } },
  });

  const byVille = await prisma.listing.groupBy({
    by: ['ville'],
    _count: { ville: true },
    orderBy: { _count: { ville: 'desc' } },
    take: 10,
  });

  const last7days = await prisma.$queryRaw`
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM listings
    WHERE created_at >= NOW() - INTERVAL '7 days'
    GROUP BY DATE(created_at)
    ORDER BY date DESC
  `;

  res.json({
    totalUsers,
    totalListings,
    pending,
    approved,
    todayListings,
    byEspece,
    byVille,
    last7days,
  });
});

export default router;
