const { z } = require('zod');

// Énumérations pour les checkpoints (basées sur le payload)
const checkpointStatusEnum = z.enum(['active', 'inactive', 'maintenance', 'error']);
const checkpointTypeEnum = z.enum(['entry', 'exit', 'internal', 'external', 'emergency', 'patrol']);
const checkpointPriorityEnum = z.enum(['low', 'medium', 'high', 'critical']);
const controlFrequencyEnum = z.enum(['hourly', 'daily', 'weekly', 'monthly', 'on_demand']);

// Schéma de création d'un checkpoint correspondant exactement au payload
const createCheckpointSchema = z.object({
  // Informations de base
  name: z.string().min(1, 'Le nom du checkpoint est requis'),
  description: z.string().optional(),
  siteId: z.string().min(1, 'L\'ID du site est requis'),
  
  // Localisation
  zone: z.string().optional(),
  building: z.string().optional(),
  floor: z.string().optional(),
  coordinatesLatitude: z.string().optional(),
  coordinatesLongitude: z.string().optional(),
  
  // SOS
  sosId: z.string().min(1, 'L\'ID SOS est requis'),
  agentId: z.string().optional(),
  
  // Statut et configuration
  checkpointType: z.string(),
  status: z.string(),
  priority: z.string(),
  controlFrequency: z.string(),
  
  // Équipements et instructions
  equipment: z.array(z.string()).default([]),
  devicesId: z.array(z.string()).default([]),
  specialInstructions: z.string().optional(),
  
  // État
  active: z.boolean()
});

// Schéma de mise à jour (tous les champs optionnels)
const updateCheckpointSchema = createCheckpointSchema.partial();

// Schéma pour l'ID du checkpoint
const checkpointIdSchema = z.object({
  id: z.string().min(1, 'ID de checkpoint requis')
});

// Schéma de requête avec filtres
const checkpointQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  search: z.string().optional(),
  siteId: z.string().optional(),
  name: z.string().optional(),
  status: z.string().optional(),
  checkpointType: z.string().optional(),
  priority: z.string().optional(),
  agentId: z.string().optional(),
  active: z.string().optional().transform(val => val === 'true' ? true : val === 'false' ? false : undefined),
  // Filtres avancés
  dateCreationStart: z.string().datetime().optional(),
  dateCreationEnd: z.string().datetime().optional(),
  hasAgent: z.string().optional().transform(val => val === 'true' ? true : val === 'false' ? false : undefined),
  inAlert: z.string().optional().transform(val => val === 'true' ? true : val === 'false' ? false : undefined)
});

// Schéma pour l'assignation d'agent(s) à checkpoint
const assignAgentSchema = z.object({
  agentId: z.string().min(1, 'L\'ID de l\'agent est requis')
});

module.exports = {
  createCheckpointSchema,
  updateCheckpointSchema,
  checkpointIdSchema,
  checkpointQuerySchema,
  assignAgentSchema,
  // Export des énumérations pour réutilisation
  checkpointStatusEnum,
  checkpointTypeEnum,
  checkpointPriorityEnum,
  controlFrequencyEnum
};
