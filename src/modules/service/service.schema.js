const { z } = require('zod');

const createServiceSchema = z.object({
  name: z.string().min(1, 'Le nom du service est requis').max(100, 'Le nom ne peut pas dépasser 100 caractères')
});

const updateServiceSchema = z.object({
  name: z.string().min(1, 'Le nom du service est requis').max(100, 'Le nom ne peut pas dépasser 100 caractères').optional()
});

const serviceIdSchema = z.object({
  id: z.string().cuid('ID de service invalide')
});

const serviceQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  search: z.string().optional()
});

module.exports = {
  createServiceSchema,
  updateServiceSchema,
  serviceIdSchema,
  serviceQuerySchema
};
