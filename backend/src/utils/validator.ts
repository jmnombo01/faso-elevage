import { z } from 'zod';

export const phoneSchema = z.string().regex(/^(?:\+226)?[0-9]{8}$/, 'Numéro BF invalide (ex: 70000000 ou +22670000000)');

export const otpRequestSchema = z.object({
  phone: phoneSchema,
});

export const otpVerifySchema = z.object({
  phone: phoneSchema,
  otp: z.string().length(6),
  name: z.string().min(2).max(100).optional(),
  ville: z.string().min(2).max(50).optional(),
});

// Base schema sans refine pour permettre partial()
const baseListingSchema = z.object({
  espece: z.enum(['POULET','PINTADE','LAPIN','BOVIN','OVIN','CAPRIN','PORCIN','AUTRE']),
  especeCustom: z.string().min(2).max(50).optional(),
  race: z.string().max(100).optional(),
  ageMois: z.coerce.number().int().min(0).max(240).optional(),
  poidsKg: z.coerce.number().min(0).max(2000).optional(),
  quantite: z.coerce.number().int().min(1).max(1000).default(1),
  prixFcfa: z.coerce.number().int().min(500).max(10000000),
  ville: z.string().min(2).max(50),
  quartier: z.string().max(100).optional(),
  description: z.string().max(1000).optional(),
  disponibilite: z.string().optional(),
});

export const listingCreateSchema = baseListingSchema.superRefine((data, ctx) => {
  if (data.espece === 'AUTRE' && !data.especeCustom) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Si espèce AUTRE, veuillez préciser le nom de l animal (ex: Âne, Cheval, Canard)',
      path: ['especeCustom'],
    });
  }
});

export const listingUpdateSchema = baseListingSchema.partial();

export const reportSchema = z.object({
  listingId: z.string(),
  motif: z.enum(['ARNAQUE','PRIX_ABUSIF','PHOTO_TROMPEUSE','ANIMAL_MALADE','AUTRE']),
  description: z.string().max(500).optional(),
});
