const { z } = require('zod');

// Schéma pour créer un incident (sans enum) avec dateIncident ISO complète
const createIncidentSchema = z.object({
  titre: z.string().min(1, 'Le titre est requis').max(255, 'Le titre ne peut pas dépasser 255 caractères'),
  description: z.string().min(1, 'La description est requise'),
  typeIncident: z.string().nullable().optional().default('AUTRE'),
  severite: z.string().nullable().optional().default('MOYENNE'),
  priorite: z.string().nullable().optional().default('NORMALE'),
  source: z.string().nullable().optional().default('AGENT'),
  dateIncident: z.string()
    .min(1, 'La date d\'incident est requise')
    .refine(val => !isNaN(Date.parse(val)), 'Format de date invalide (ISO 8601 attendu)'),
  siteId: z.string().uuid('ID du site invalide'),
  visitId: z.string().uuid('ID de la visite invalide').optional().or(z.literal('')),
  actionsImmediates: z.string().nullable().optional().default(null),
  temoinPresent: z.boolean().nullable().optional().default(false),
  notifierAgents: z.boolean().nullable().optional().default(false)
});

// Schéma de mise à jour d'un incident
const updateIncidentSchema = z.object({
  titre: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  typeIncident: z.string().optional(),
  severite: z.string().optional(),
  priorite: z.string().optional(),
  source: z.string().optional(),
  dateIncident: z.string().refine(val => !isNaN(Date.parse(val)), 'Format de date invalide (ISO 8601 attendu)').optional(),
  siteId: z.string().uuid().optional(),
  visitId: z.string().uuid().optional().or(z.literal('')),
  actionsImmediates: z.string().optional(),
  temoinPresent: z.boolean().optional(),
  notifierAgents: z.boolean().optional()
});

// Schéma pour résoudre un incident
const resolveIncidentSchema = z.object({
  resolutionNotes: z.string().min(1, 'Les notes de résolution sont requises')
});

const incidentIdSchema = z.object({
  id: z.string().uuid('ID d\'incident invalide')
});

const incidentQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  search: z.string().optional(),
  siteId: z.string().uuid().optional(),
  visiteurId: z.string().uuid().optional().or(z.literal('')),
  typeIncident: z.string().optional(),
  severite: z.string().optional(),
  priorite: z.string().optional(),
  source: z.string().optional(),
  isResolved: z.string().optional().transform(val => val === 'true' ? true : val === 'false' ? false : undefined),
  dateDebut: z.string().datetime().optional(),
  dateFin: z.string().datetime().optional()
});

module.exports = {
  createIncidentSchema,
  updateIncidentSchema,
  resolveIncidentSchema,
  incidentIdSchema,
  incidentQuerySchema
};
