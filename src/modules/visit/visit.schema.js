const { z } = require('zod');

// Enum pour les statuts de visite (correspond au modèle Flutter)
const visitStatusEnum = z.enum(['present', 'left']);

const createVisitSchema = z.object({
  visitorId: z.string().uuid('ID de visiteur invalide'),
  checkpointId: z.string().uuid('ID de checkpoint invalide'),
  entityVisited: z.string().min(1, 'L\'entité visitée est requise'),
  contactPerson: z.string().min(1, 'La personne contact est requise'),
  origin: z.string().min(1, 'L\'origine est requise'),
  reason: z.string().min(1, 'La raison de la visite est requise'),
  notes: z.string().min(1, 'Les notes sont requises'),
  status: visitStatusEnum.default('present').optional()
});

const updateVisitSchema = z.object({
  exitTime: z.string().datetime('Date de sortie invalide').optional(),
  status: visitStatusEnum.optional(),
  notes: z.string().min(1, 'Les notes sont requises').optional()
});

const visitIdSchema = z.object({
  id: z.string().uuid('ID de visite invalide')
});

const visitQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  search: z.string().optional(),
  visitorId: z.string().uuid().optional(),
  status: visitStatusEnum.optional()
});

const checkoutSchema = z.object({
  endAt: z.string().datetime('Date de fin invalide')
});

module.exports = {
  visitStatusEnum,
  createVisitSchema,
  updateVisitSchema,
  visitIdSchema,
  visitQuerySchema,
  checkoutSchema
};
