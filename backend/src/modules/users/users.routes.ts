import { Router } from 'express';
import { prisma } from '../../config/db';
import { authMiddleware, AuthRequest } from '../../middlewares/auth';

const router = Router();

router.get('/me/listings', authMiddleware, async (req: AuthRequest, res) => {
  const listings = await prisma.listing.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
  });
  res.json(listings);
});

router.put('/me', authMiddleware, async (req: AuthRequest, res) => {
  const { name, ville, quartier, photoUrl } = req.body;
  const updated = await prisma.user.update({
    where: { id: req.user!.userId },
    data: { name, ville, quartier, photoUrl },
  });
  res.json(updated);
});

export default router;
