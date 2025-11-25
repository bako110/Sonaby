const { z } = require('zod');

// Enum pour les statuts de visite
const visitStatusEnum = z.enum(['active', 'finished', 'refused']);

// Schéma pour les données du visiteur (création à la volée)
const visitorDataSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  idType: z.string().min(1, 'Le type de pièce est requis'),
  idNumber: z.string().min(1, 'Le numéro de pièce est requis'),
  phone: z.string().optional(),
  email: z.string().email('Email invalide').optional(),
  company: z.string().optional(),
  birthDate: z.string().optional(),
  birthPlace: z.string().optional(),
  sexe: z.string().optional(),
  givingDate: z.string().optional(),
  expirationDate: z.string().optional(),
  idScanUrl: z.string().url('URL invalide').optional(),
  photoUrl: z.string().url('URL invalide').optional()
});

const createVisitSchema = z.object({
  visitorId: z.string().uuid('ID de visiteur invalide').optional(),
  visitorData: visitorDataSchema.optional(),
  checkpointId: z.string().uuid('ID de checkpoint invalide'),
  serviceId: z.string().uuid('ID de service invalide'),
  reason: z.string().min(1, 'La raison de la visite est requise'),
  plannedId: z.string().uuid('ID de rendez-vous invalide').optional(),
  isGroup: z.boolean().default(false).optional(),
  groupCode: z.string().max(100, 'Le code de groupe ne peut pas dépasser 100 caractères').optional(),
  entryTime: z.string().datetime('Date d\'entrée invalide').optional(),
  status: visitStatusEnum.default('active').optional(),
  signatureUrl: z.string().url('URL de signature invalide').optional(),
  notes: z.string().optional()
}).refine(data => data.visitorId || data.visitorData, {
  message: "Vous devez fournir soit un visitorId, soit les données du visiteur (visitorData)",
  path: ["visitorId"]
});

const updateVisitSchema = z.object({
  reason: z.string().min(1, 'La raison de la visite est requise').optional(),
  exitTime: z.string().datetime('Date de sortie invalide').optional(),
  status: visitStatusEnum.optional(),
  signatureUrl: z.string().url('URL de signature invalide').optional(),
  notes: z.string().optional()
});

const visitIdSchema = z.object({
  id: z.string().uuid('ID de visite invalide')
});

const visitQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  search: z.string().optional(),
  visitorId: z.string().uuid().optional(),
  checkpointId: z.string().uuid().optional(),
  serviceId: z.string().uuid().optional(),
  status: visitStatusEnum.optional(),
  isGroup: z.string().optional().transform(val => val === 'true' ? true : val === 'false' ? false : undefined),
  plannedId: z.string().uuid().optional()
});

const checkoutSchema = z.object({
  exitTime: z.string().datetime('Date de sortie invalide').optional(),
  signatureUrl: z.string().url('URL de signature invalide').optional(),
  notes: z.string().optional()
});

module.exports = {
  createVisitSchema,
  updateVisitSchema,
  visitIdSchema,
  visitQuerySchema,
  checkoutSchema
};
