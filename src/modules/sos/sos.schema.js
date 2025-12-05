const { z } = require('zod');

// Schéma pour créer une alerte SOS
const createSOSSchema = z.object({
  checkpointId: z.string().uuid('ID de checkpoint invalide'),
  triggeredBy: z.string().uuid('ID de l\'utilisateur invalide').optional(),
  message: z.string().optional(),
  triggeredAt: z.string().datetime('Date de déclenchement invalide').optional()
});

// Schéma pour créer une alerte SOS générale (automatique)
const createGeneralSOSSchema = z.object({
  checkpointId: z.string().uuid('ID du checkpoint invalide'),
  triggeredBy: z.string().uuid('ID de l\'utilisateur invalide').optional()
});

// Schéma pour résoudre une alerte SOS
const resolveSOSSchema = z.object({
  isResolved: z.literal(true),
  resolvedAt: z.string().datetime('Date de résolution invalide').optional(),
  resolvedBy: z.string().uuid('ID du résolveur invalide'),
  resolutionNotes: z.string().optional()
});

const sosIdSchema = z.object({
  id: z.string().uuid('ID de SOS invalide')
});

const sosQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  search: z.string().optional(),
  checkpointId: z.string().uuid().optional(),
  triggeredBy: z.string().uuid().optional(),
  isResolved: z.string().optional().transform(val => val === 'true' ? true : val === 'false' ? false : undefined)
});


const sosParamsSchema = z.object({
  title: z.string().max(255, 'Titre trop long').optional(),
  description: z.string().optional()
});

module.exports = {
  createSOSSchema,
  createGeneralSOSSchema,
  resolveSOSSchema,
  sosIdSchema,
  sosQuerySchema,
  sosParamsSchema
};
