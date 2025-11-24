const { z } = require('zod');

// Schéma pour créer un incident de visite
const createIncidentSchema = z.object({
  visitId: z.string().uuid('ID de visite invalide'),
  reportedBy: z.string().uuid('ID du rapporteur invalide'),
  title: z.string().min(1, 'Le titre est requis').max(255, 'Le titre ne peut pas dépasser 255 caractères'),
  description: z.string().min(1, 'La description est requise'),
  severityLevel: z.number().int().min(1).max(3, 'Le niveau de gravité doit être entre 1 et 3').default(1).optional(),
  isResolved: z.boolean().default(false).optional(),
  resolvedAt: z.string().datetime('Date de résolution invalide').optional(),
  resolutionNotes: z.string().optional()
});

// Schéma de mise à jour d'un incident
const updateIncidentSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(255, 'Le titre ne peut pas dépasser 255 caractères').optional(),
  description: z.string().min(1, 'La description est requise').optional(),
  severityLevel: z.number().int().min(1).max(3, 'Le niveau de gravité doit être entre 1 et 3').optional(),
  isResolved: z.boolean().optional(),
  resolvedAt: z.string().datetime('Date de résolution invalide').optional(),
  resolutionNotes: z.string().optional()
});

// Schéma pour résoudre un incident
const resolveIncidentSchema = z.object({
  isResolved: z.literal(true),
  resolvedAt: z.string().datetime('Date de résolution invalide').optional(),
  resolutionNotes: z.string().min(1, 'Les notes de résolution sont requises')
});

const incidentIdSchema = z.object({
  id: z.string().uuid('ID d\'incident invalide')
});

const incidentQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  search: z.string().optional(),
  visitId: z.string().uuid().optional(),
  reportedBy: z.string().uuid().optional(),
  severityLevel: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  isResolved: z.string().optional().transform(val => val === 'true' ? true : val === 'false' ? false : undefined)
});

module.exports = {
  createIncidentSchema,
  updateIncidentSchema,
  resolveIncidentSchema,
  incidentIdSchema,
  incidentQuerySchema
};
