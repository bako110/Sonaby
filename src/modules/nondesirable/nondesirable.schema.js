const { z } = require('zod');

const createNonDesirableSchema = z.object({
  visitorId: z.string().cuid('ID de visiteur invalide'),
  reason: z.string().min(1, 'La raison est requise').max(200, 'La raison ne peut pas dépasser 200 caractères')
});

const nonDesirableIdSchema = z.object({
  id: z.string().cuid('ID invalide')
});

const nonDesirableQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  search: z.string().optional()
});

module.exports = {
  createNonDesirableSchema,
  nonDesirableIdSchema,
  nonDesirableQuerySchema
};
