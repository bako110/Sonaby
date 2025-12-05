const { z } = require('zod');

// Enum pour les types d'identité
const idTypeEnum = z.enum(['CNI', 'PASSEPORT', 'PERMIS_CONDUITE']);

// Enum pour le sexe
const sexeEnum = z.enum(['M', 'F', 'HOMME', 'FEMME']);

// Schema principal pour la création d'un visiteur
const createVisitorSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  idType: idTypeEnum,
  idNumber: z.string().min(1).max(255),
  birthDate: z.string().nullable().optional(),
  birthPlace: z.string().max(255).nullable().optional(),
  residence: z.string().max(255).nullable().optional(),
  sexe: sexeEnum.nullable().optional(),
  givingDate: z.string().nullable().optional(),
  expirationDate: z.string().nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
  email: z.string().email().nullable().optional(),
  isBlacklisted: z.boolean().default(false).optional(),
  blacklistReason: z.string().nullable().optional(),
  company: z.string().max(255).nullable().optional(),
  emergencyContactPhone: z.string().max(20).nullable().optional(),
  emergencyContactName: z.string().max(255).nullable().optional()
});

// Transformation TRÈS SIMPLE - ne fait rien d'autre que valider
const createVisitorWithTransform = createVisitorSchema.transform((data) => {
  // Retourne simplement les données sans modifier
  return data;
});

// Schema pour mise à jour (champs optionnels)
const updateVisitorSchema = createVisitorSchema.partial();

// Schema pour ID visiteur (validation UUID)
const visitorIdSchema = z.object({
  id: z.string().uuid('ID invalide')
});

// Query params pour filtrer ou paginer les visiteurs
const visitorQuerySchema = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  search: z.string().optional(),
  company: z.string().optional(),
  isBlacklisted: z.string().transform(val => val === 'true').optional(),
  idType: idTypeEnum.optional()
});

// Schema pour mettre un visiteur sur blacklist
const blacklistVisitorSchema = z.object({
  reason: z.string().min(1, 'La raison est requise')
});

module.exports = {
  createVisitorSchema,
  createVisitorWithTransform,
  updateVisitorSchema,
  visitorIdSchema,
  visitorQuerySchema,
  blacklistVisitorSchema,
  idTypeEnum
};