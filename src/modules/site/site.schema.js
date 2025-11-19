const { z } = require('zod');

const createSiteSchema = z.object({
  name: z.string().min(1, 'Le nom du site est requis').max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  location: z.string().min(1, 'La localisation est requise').max(200, 'La localisation ne peut pas dépasser 200 caractères')
});

const updateSiteSchema = z.object({
  name: z.string().min(1, 'Le nom du site est requis').max(100, 'Le nom ne peut pas dépasser 100 caractères').optional(),
  location: z.string().min(1, 'La localisation est requise').max(200, 'La localisation ne peut pas dépasser 200 caractères').optional()
});

const siteIdSchema = z.object({
  id: z.string().cuid('ID de site invalide')
});

const siteQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  search: z.string().optional()
});

module.exports = {
  createSiteSchema,
  updateSiteSchema,
  siteIdSchema,
  siteQuerySchema
};
