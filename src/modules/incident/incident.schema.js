const { z } = require('zod');

// Énumérations correspondant à votre formulaire Angular
const TypeIncident = {
  ACCES: 'ACCES',
  COMPORTEMENT: 'COMPORTEMENT',
  SECURITE: 'SECURITE',
  VOL: 'VOL',
  DEGRADATION: 'DEGRADATION',
  MEDICAL: 'MEDICAL',
  AUTRE: 'AUTRE'
};

const SeveriteIncident = {
  FAIBLE: 'FAIBLE',
  MOYENNE: 'MOYENNE',
  ELEVEE: 'ELEVEE',
  CRITIQUE: 'CRITIQUE'
};

const PrioriteIncident = {
  BASSE: 'BASSE',
  NORMALE: 'NORMALE',
  HAUTE: 'HAUTE',
  URGENTE: 'URGENTE'
};

const SourceIncident = {
  AGENT: 'AGENT',
  VISITEUR: 'VISITEUR',
  SYSTEME: 'SYSTEME'
};

// Schéma pour créer un incident (adapté à votre formulaire Angular)
const createIncidentSchema = z.object({
  titre: z.string().min(1, 'Le titre est requis').max(255, 'Le titre ne peut pas dépasser 255 caractères'),
  description: z.string().min(1, 'La description est requise'),
  typeIncident: z.enum(Object.values(TypeIncident)).default(TypeIncident.AUTRE),
  severite: z.enum(Object.values(SeveriteIncident)).default(SeveriteIncident.MOYENNE),
  priorite: z.enum(Object.values(PrioriteIncident)).default(PrioriteIncident.NORMALE),
  source: z.enum(Object.values(SourceIncident)).default(SourceIncident.AGENT),
  dateIncident: z.string().min(1, 'La date d\'incident est requise').regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
  heureIncident: z.string().datetime('Heure d\'incident invalide'),
  siteId: z.string().uuid('ID du site invalide'),
  visitId: z.string().uuid('ID de la visite invalide').optional().or(z.literal('')),
  actionsImmediates: z.string().optional(),
  temoinPresent: z.boolean().default(false),
  notifierAgents: z.boolean().default(false)
});

// Schéma de mise à jour d'un incident
const updateIncidentSchema = z.object({
  titre: z.string().min(1, 'Le titre est requis').max(255, 'Le titre ne peut pas dépasser 255 caractères').optional(),
  description: z.string().min(1, 'La description est requise').optional(),
  typeIncident: z.enum(Object.values(TypeIncident)).optional(),
  severite: z.enum(Object.values(SeveriteIncident)).optional(),
  priorite: z.enum(Object.values(PrioriteIncident)).optional(),
  source: z.enum(Object.values(SourceIncident)).optional(),
  dateIncident: z.string().datetime('Date d\'incident invalide').optional(),
  heureIncident: z.string().datetime('Heure d\'incident invalide').optional(),
  siteId: z.string().uuid('ID du site invalide').optional(),
  visitId: z.string().uuid('ID de la visite invalide').optional().or(z.literal('')),
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
  typeIncident: z.enum(Object.values(TypeIncident)).optional(),
  severite: z.enum(Object.values(SeveriteIncident)).optional(),
  priorite: z.enum(Object.values(PrioriteIncident)).optional(),
  source: z.enum(Object.values(SourceIncident)).optional(),
  isResolved: z.string().optional().transform(val => val === 'true' ? true : val === 'false' ? false : undefined),
  dateDebut: z.string().datetime('Date de début invalide').optional(),
  dateFin: z.string().datetime('Date de fin invalide').optional()
});

module.exports = {
  TypeIncident,
  SeveriteIncident,
  PrioriteIncident,
  SourceIncident,
  createIncidentSchema,
  updateIncidentSchema,
  resolveIncidentSchema,
  incidentIdSchema,
  incidentQuerySchema
};
