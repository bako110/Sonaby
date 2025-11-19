const { z } = require('zod');

const createSOSSchema = z.object({
  checkpointId: z.string().cuid('ID de checkpoint invalide'),
  message: z.string().optional()
});

const sosIdSchema = z.object({
  id: z.string().cuid('ID de SOS invalide')
});

const sosQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  checkpointId: z.string().cuid().optional(),
  active: z.string().optional().transform(val => val === 'true')
});

const deactivateSOSSchema = z.object({
  isActive: z.boolean().optional().default(false)
});

module.exports = {
  createSOSSchema,
  sosIdSchema,
  sosQuerySchema,
  deactivateSOSSchema
};
