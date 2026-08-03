import { Router } from 'express';
import { prisma } from '../../config/db';
import { authMiddleware, AuthRequest } from '../../middlewares/auth';
import { initCinetPayPayment, checkCinetPayPayment, BOOST_PRICING, BADGE_PRICING } from '../../config/cinetpay';
import { z } from 'zod';

const router = Router();

// GET /api/payments/pricing - public
router.get('/pricing', async (_req, res) => {
  res.json({ boost: BOOST_PRICING, badge: BADGE_PRICING });
});

// POST /api/payments/init-boost - auth
router.post('/init-boost', authMiddleware, async (req: AuthRequest, res) => {
  const schema = z.object({
    listingId: z.string(),
    durationDays: z.coerce.number().int().refine(v => [3,7,30].includes(v), 'Durée doit être 3,7 ou 30'),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

  const { listingId, durationDays } = parsed.data;
  const userId = req.user!.userId;

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) return res.status(404).json({ error: 'Annonce introuvable' });
  if (listing.userId !== userId) return res.status(403).json({ error: 'Pas propriétaire' });
  if (listing.statut !== 'APPROUVEE') return res.status(400).json({ error: 'Annonce doit être approuvée' });

  const pricing = BOOST_PRICING[durationDays];
  if (!pricing) return res.status(400).json({ error: 'Tarif invalide' });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const payment = await prisma.payment.create({
    data: {
      userId,
      listingId,
      type: 'BOOST',
      amountFcfa: pricing.amount,
      durationDays,
      provider: 'CINETPAY',
      status: 'PENDING',
      phone: user.phone,
    },
  });

  const returnUrl = `${process.env.FRONTEND_URL || 'https://frontend-teal-xi-19.vercel.app'}/mes-annonces?payment=${payment.id}`;
  const notifyUrl = `${process.env.BACKEND_URL || 'https://faso-elevage-production.up.railway.app'}/api/payments/webhook/cinetpay`;

  const cinetpay = await initCinetPayPayment({
    amountFcfa: pricing.amount,
    transactionId: payment.id,
    description: `Boost annonce ${listing.race || listing.espece} - ${durationDays} jours`,
    customerName: user.name,
    customerPhone: user.phone,
    returnUrl,
    notifyUrl,
  });

  if (!cinetpay) {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: 'FAILED' } });
    return res.status(500).json({ error: 'Erreur init paiement CinetPay' });
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: { providerTxId: cinetpay.transaction_id, metadata: cinetpay as any },
  });

  res.json({ payment, paymentUrl: cinetpay.payment_url });
});

// POST /api/payments/init-badge - auth
router.post('/init-badge', authMiddleware, async (req: AuthRequest, res) => {
  const schema = z.object({
    durationDays: z.coerce.number().int().refine(v => [30,90,365].includes(v), 'Durée 30,90,365'),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

  const { durationDays } = parsed.data;
  const userId = req.user!.userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const pricing = BADGE_PRICING[durationDays as keyof typeof BADGE_PRICING];
  if (!pricing) return res.status(400).json({ error: 'Tarif badge invalide' });

  const payment = await prisma.payment.create({
    data: {
      userId,
      type: 'BADGE',
      amountFcfa: pricing.amount,
      durationDays,
      provider: 'CINETPAY',
      status: 'PENDING',
      phone: user.phone,
    },
  });

  const returnUrl = `${process.env.FRONTEND_URL || 'https://frontend-teal-xi-19.vercel.app'}/profil?badge_payment=${payment.id}`;
  const notifyUrl = `${process.env.BACKEND_URL || 'https://faso-elevage-production.up.railway.app'}/api/payments/webhook/cinetpay`;

  const cinetpay = await initCinetPayPayment({
    amountFcfa: pricing.amount,
    transactionId: payment.id,
    description: `Badge vendeur vérifié ${durationDays} jours`,
    customerName: user.name,
    customerPhone: user.phone,
    returnUrl,
    notifyUrl,
  });

  if (!cinetpay) {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: 'FAILED' } });
    return res.status(500).json({ error: 'Erreur CinetPay' });
  }

  await prisma.payment.update({ where: { id: payment.id }, data: { providerTxId: cinetpay.transaction_id, metadata: cinetpay as any } });

  res.json({ payment, paymentUrl: cinetpay.payment_url });
});

// POST /api/payments/webhook/cinetpay - public (CinetPay notifie)
router.post('/webhook/cinetpay', async (req, res) => {
  const { transaction_id, cpm_trans_id, cpm_result } = req.body as any;
  const txId = transaction_id || cpm_trans_id;
  if (!txId) return res.status(400).json({ error: 'transaction_id manquant' });

  const payment = await prisma.payment.findUnique({ where: { id: txId } });
  if (!payment) return res.status(404).json({ error: 'Payment not found' });

  const check = await checkCinetPayPayment(txId);
  
  if (check.status === 'SUCCESS') {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'SUCCESS', metadata: { ...payment.metadata as any, webhook: req.body, check: check.data } },
    });

    if (payment.type === 'BOOST' && payment.listingId && payment.durationDays) {
      const until = new Date();
      until.setDate(until.getDate() + payment.durationDays);
      await prisma.listing.update({
        where: { id: payment.listingId },
        data: { isBoosted: true, boostedUntil: until },
      });
    }

    if (payment.type === 'BADGE' && payment.durationDays) {
      const until = new Date();
      until.setDate(until.getDate() + payment.durationDays);
      await prisma.user.update({
        where: { id: payment.userId },
        data: { isVerified: true, verifiedUntil: until },
      });
    }

    return res.json({ message: 'Payment SUCCESS, boost/badge applied' });
  }

  if (check.status === 'FAILED') {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: 'FAILED', metadata: { ...payment.metadata as any, webhook: req.body } } });
    return res.json({ message: 'Payment FAILED' });
  }

  return res.json({ message: 'Payment PENDING' });
});

// GET /api/payments/check/:id - auth - vérifie manuellement (pour mock)
router.get('/check/:id', authMiddleware, async (req: AuthRequest, res) => {
  const payment = await prisma.payment.findUnique({ where: { id: req.params.id } });
  if (!payment) return res.status(404).json({ error: 'Not found' });
  if (payment.userId !== req.user!.userId && req.user!.role !== 'ADMIN') return res.status(403).json({ error: 'Non autorisé' });

  const check = await checkCinetPayPayment(payment.id);

  if (check.status === 'SUCCESS' && payment.status !== 'SUCCESS') {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: 'SUCCESS' } });
    if (payment.type === 'BOOST' && payment.listingId && payment.durationDays) {
      const until = new Date();
      until.setDate(until.getDate() + payment.durationDays);
      await prisma.listing.update({ where: { id: payment.listingId }, data: { isBoosted: true, boostedUntil: until } });
    }
    if (payment.type === 'BADGE' && payment.durationDays) {
      const until = new Date();
      until.setDate(until.getDate() + payment.durationDays);
      await prisma.user.update({ where: { id: payment.userId }, data: { isVerified: true, verifiedUntil: until } });
    }
  }

  const updated = await prisma.payment.findUnique({ where: { id: payment.id } });
  res.json({ payment: updated, cinetpay: check });
});

// GET /api/payments/my - auth
router.get('/my', authMiddleware, async (req: AuthRequest, res) => {
  const payments = await prisma.payment.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
    include: { listing: { select: { race: true, espece: true, photos: true } } },
  });
  res.json(payments);
});

// GET /api/payments/admin - admin only
router.get('/admin', authMiddleware, async (req: AuthRequest, res) => {
  if (req.user!.role !== 'ADMIN') return res.status(403).json({ error: 'Admin requis' });
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { user: { select: { name: true, phone: true } }, listing: { select: { race: true } } },
  });
  const stats = await prisma.payment.groupBy({
    by: ['status'],
    _count: { status: true },
    _sum: { amountFcfa: true },
  });
  res.json({ payments, stats });
});

export default router;
