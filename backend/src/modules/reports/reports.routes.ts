import { Router } from 'express';
import { prisma } from '../../config/db';
import { authMiddleware, AuthRequest } from '../../middlewares/auth';
import { reportSchema } from '../../utils/validator';

const router = Router();

router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  const parsed = reportSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

  const { listingId, motif, description } = parsed.data;

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) return res.status(404).json({ error: 'Annonce introuvable' });

  const report = await prisma.report.create({
    data: {
      listingId,
      reporterId: req.user!.userId,
      motif: motif as any,
      description,
    },
  });

  res.status(201).json(report);
});

export default router;
