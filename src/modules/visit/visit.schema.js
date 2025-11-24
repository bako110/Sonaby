const { z } = require('zod');

// Enum pour les statuts de visite
const visitStatusEnum = z.enum(['active', 'finished', 'refused']);

const createVisitSchema = z.object({
  visitorId: z.string().uuid('ID de visiteur invalide'),
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
