const { z } = require('zod');

/**
 * Création d'un groupe de visiteurs
 * - visitorId : ID du visiteur responsable (existant)
 * - otherVisitors : liste de noms complets ["Bako Robert", "Amidoi Sanour", ...]
 */
const createVisitorGroupSchema = z.object({
  visitorId: z
    .string()
    .uuid('ID du visiteur responsable invalide'),

  otherVisitors: z
    .array(
      z.string().min(1, 'Nom complet requis').max(255)
    )
    .optional()
});

/**
 * (Prévu pour évolution future si besoin)
 * Actuellement non utilisé
 */
const updateVisitorGroupSchema = z.object({
  visitorId: z.string().uuid().optional()
});

/**
 * ID groupe
 */
const visitorGroupIdSchema = z.object({
  id: z
    .string()
    .uuid('ID du groupe invalide')
});

/**
 * Filtres & pagination
 */
const visitorGroupQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 1)),

  limit: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 10)),

  search: z
    .string()
    .optional()
});

module.exports = {
  createVisitorGroupSchema,
  updateVisitorGroupSchema,
  visitorGroupIdSchema,
  visitorGroupQuerySchema
};
