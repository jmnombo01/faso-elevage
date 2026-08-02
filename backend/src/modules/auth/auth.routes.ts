import { Router } from 'express';
import { prisma } from '../../config/db';
import { signToken } from '../../config/jwt';
import { otpRequestSchema, otpVerifySchema, phoneSchema } from '../../utils/validator';
import { authMiddleware, AuthRequest } from '../../middlewares/auth';

const router = Router();

// Génère OTP 6 chiffres - mock SMS en dev
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const normalizePhone = (phone: string) => {
  let p = phone.replace(/\D/g, '');
  if (p.startsWith('226')) p = p.slice(3);
  return '+226' + p;
};

// POST /api/auth/request-otp
router.post('/request-otp', async (req, res) => {
  const parsed = otpRequestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

  const phone = normalizePhone(parsed.data.phone);
  const code = generateOtp();

  await prisma.otp.create({
    data: {
      phone,
      code,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
    },
  });

  console.log(`\n=== OTP MOCK pour ${phone}: ${code} ===\n`);
  // TODO prod: appeler API SMS CinetPay / SMS BF

  // En dev on retourne le code pour faciliter les tests
  const isDev = process.env.NODE_ENV !== 'production';
  res.json({ message: 'OTP envoyé', ...(isDev && { debugOtp: code }) });
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  const parsed = otpVerifySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

  const phone = normalizePhone(parsed.data.phone);
  const { otp, name, ville } = parsed.data;

  const existingOtp = await prisma.otp.findFirst({
    where: { phone, code: otp, attempted: false },
    orderBy: { createdAt: 'desc' },
  });

  if (!existingOtp) return res.status(400).json({ error: 'OTP invalide' });
  if (existingOtp.expiresAt < new Date()) return res.status(400).json({ error: 'OTP expiré' });

  await prisma.otp.update({ where: { id: existingOtp.id }, data: { attempted: true } });

  let user = await prisma.user.findUnique({ where: { phone } });

  if (!user) {
    if (!name || !ville) {
      return res.status(200).json({ needSignup: true, message: 'Nouvel utilisateur, veuillez fournir nom et ville' });
    }
    user = await prisma.user.create({
      data: { phone, name, ville, quartier: '' },
    });
  }

  if (user.isBlocked) return res.status(403).json({ error: 'Compte bloqué' });

  const token = signToken({ userId: user.id, phone: user.phone, role: user.role });

  res.json({ token, user });
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
  res.json(user);
});

export default router;
