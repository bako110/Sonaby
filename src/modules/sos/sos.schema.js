const { z } = require('zod');

// Schéma pour créer une alerte SOS
const createSOSSchema = z.object({
  checkpointId: z.string().uuid('ID de checkpoint invalide'),
  triggeredBy: z.string().uuid('ID de l\'utilisateur invalide').optional(),
  // Template est prioritaire sur message
  templateId: z.number().int().positive('ID de template invalide'),
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
  searchTerm: z.string().optional(),
  checkpointId: z.string().uuid().optional(),
  agentId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  isResolved: z.string().optional().transform(val => val === 'true' ? true : val === 'false' ? false : undefined),
  statut: z.string().optional(),
  priorite: z.string().optional(), 
  typeIncident: z.string().optional(),
  dateDebut: z.string().optional().transform(val => val ? new Date(val) : undefined),
  dateFin: z.string().optional().transform(val => val ? new Date(val) : undefined),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  // Backwards compatibility
  search: z.string().optional().transform(val => val),
  triggeredBy: z.string().uuid().optional().transform(val => val),
  active: z.string().optional().transform(val => val === 'true' ? false : val === 'false' ? true : undefined)
});


const sosParamsSchema = z.object({
  titre: z.string().max(255, 'Titre trop long').optional(),
  message: z.string().optional()
});

module.exports = {
  createSOSSchema,
  createGeneralSOSSchema,
  resolveSOSSchema,
  sosIdSchema,
  sosQuerySchema,
  sosParamsSchema
};
