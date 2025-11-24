const { z } = require('zod');

const createServiceSchema = z.object({
  name: z.string().min(1, 'Le nom du service est requis').max(255, 'Le nom ne peut pas dépasser 255 caractères'),
  description: z.string().optional(),
  chefId: z.string().uuid('ID de chef invalide').optional(),
  isActive: z.boolean().default(true).optional()
});

const updateServiceSchema = z.object({
  name: z.string().min(1, 'Le nom du service est requis').max(255, 'Le nom ne peut pas dépasser 255 caractères').optional(),
  description: z.string().optional(),
  chefId: z.string().uuid('ID de chef invalide').optional(),
  isActive: z.boolean().optional()
});

const serviceIdSchema = z.object({
  id: z.string().uuid('ID de service invalide')
});

const serviceQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  search: z.string().optional(),
  chefId: z.string().uuid().optional(),
  isActive: z.string().optional().transform(val => val === 'true' ? true : val === 'false' ? false : undefined)
});

module.exports = {
  createServiceSchema,
  updateServiceSchema,
  serviceIdSchema,
  serviceQuerySchema
};
