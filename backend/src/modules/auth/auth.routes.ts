import { Router } from 'express';
import { prisma } from '../../config/db';
import { signToken } from '../../config/jwt';
import { otpRequestSchema, otpVerifySchema, phoneSchema } from '../../utils/validator';
import { authMiddleware, AuthRequest } from '../../middlewares/auth';
import { sendWhatsAppOtp, getWhatsAppLink } from '../../config/whatsapp';
import { sendSmsOtp } from '../../config/sms';

const router = Router();

// Génère OTP 6 chiffres
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

  console.log(`\n=== OTP pour ${phone}: ${code} ===\n`);

  // Envoi SMS via CinetPay (ou autre provider) + WhatsApp en parallèle
  const [smsResult, waResult] = await Promise.all([
    sendSmsOtp(phone, code),
    sendWhatsAppOtp(phone, code),
  ]);
  
  const whatsappLink = getWhatsAppLink(phone, code);

  // Phase 1 MVP: on retourne toujours debugOtp + liens pour tests sans coût SMS
  res.json({ 
    message: 'OTP envoyé via SMS (CinetPay) + WhatsApp',
    debugOtp: code, 
    whatsappLink,
    whatsappStatus: waResult,
    smsStatus: smsResult,
    info: 'Phase 1 MVP: OTP affiché ici + envoyé via SMS/WhatsApp si configuré. CinetPay pour SMS: set SMS_PROVIDER=cinetpay + SMS_API_URL'
  });
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

  if (!existingOtp) return res.status(400).json({ error: 'OTP invalide - déjà utilisé ou expiré, redemandez un code' });
  if (existingOtp.expiresAt < new Date()) return res.status(400).json({ error: 'OTP expiré, redemandez' });

  let user = await prisma.user.findUnique({ where: { phone } });

  if (!user) {
    if (!name || !ville) {
      // Ne marque PAS attempted=true ici, pour permettre réutilisation du même OTP à l'étape signup
      return res.status(200).json({ needSignup: true, message: 'Nouvel utilisateur, veuillez fournir nom et ville' });
    }
    user = await prisma.user.create({
      data: { phone, name, ville, quartier: '' },
    });
  }

  // Maintenant que tout est OK, marque OTP comme utilisé
  await prisma.otp.update({ where: { id: existingOtp.id }, data: { attempted: true } });

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
