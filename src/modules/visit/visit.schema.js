const { z } = require('zod');

const createVisitSchema = z.object({
  visitorId: z.string().cuid('ID de visiteur invalide'),
  checkpointId: z.string().cuid('ID de checkpoint invalide'),
  serviceId: z.string().cuid('ID de service invalide'),
  personVisited: z.string().optional(),
  groupRepresentativeId: z.string().cuid('ID de représentant de groupe invalide').optional(),
  reason: z.string().min(1, 'La raison de la visite est requise').max(200, 'La raison ne peut pas dépasser 200 caractères')
});

const updateVisitSchema = z.object({
  personVisited: z.string().optional(),
  reason: z.string().min(1, 'La raison de la visite est requise').max(200, 'La raison ne peut pas dépasser 200 caractères').optional(),
  endAt: z.string().datetime('Date de fin invalide').optional()
});

const visitIdSchema = z.object({
  id: z.string().cuid('ID de visite invalide')
});

const visitQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  search: z.string().optional(),
  visitorId: z.string().cuid().optional(),
  checkpointId: z.string().cuid().optional(),
  serviceId: z.string().cuid().optional(),
  status: z.enum(['active', 'completed', 'all']).optional().default('all')
});

const checkoutSchema = z.object({
  endAt: z.string().datetime('Date de fin invalide').optional()
});

module.exports = {
  createVisitSchema,
  updateVisitSchema,
  visitIdSchema,
  visitQuerySchema,
  checkoutSchema
};
