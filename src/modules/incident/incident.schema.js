const { z } = require('zod');

const createIncidentSchema = z.object({
  visitorId: z.string().cuid('ID de visiteur invalide'),
  serviceId: z.string().cuid('ID de service invalide'),
  reason: z.string().min(1, 'La raison est requise').max(200, 'La raison ne peut pas dépasser 200 caractères'),
  description: z.string().max(500, 'La description ne peut pas dépasser 500 caractères').optional()
});

const incidentIdSchema = z.object({
  id: z.string().cuid('ID d\'incident invalide')
});

const incidentQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  search: z.string().optional(),
  visitorId: z.string().cuid().optional(),
  serviceId: z.string().cuid().optional()
});

module.exports = {
  createIncidentSchema,
  incidentIdSchema,
  incidentQuerySchema
};
