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
  search: z.string().optional(),
  siteId: z.string().uuid().optional(),
  zone: z.string().optional(),
  checkpointType: z.enum(['internal', 'external', 'virtual']).optional(),
  status: z.enum(['active', 'inactive', 'maintenance']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  agentId: z.string().uuid().optional(),
  dateCreationDebut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateCreationFin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  avecAgent: z.enum(['true', 'false']).optional(),
  enAlerte: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10)
}).refine((data) => {
  // Validation croisée des dates
  if (data.dateCreationDebut && data.dateCreationFin) {
    const debut = new Date(data.dateCreationDebut);
    const fin = new Date(data.dateCreationFin);
    return debut <= fin;
  }
  return true;
}, {
  message: "La date de début ne peut pas être après la date de fin",
  path: ["dateCreationDebut"]
});

// Schéma pour l'assignation d'agent(s) à checkpoint
const assignAgentSchema = z.object({
  agentId: z.string().min(1, 'L\'ID de l\'agent est requis')
});

const unassignAgentSchema = z.object({
  agentId: z.string().uuid({ message: "L'ID de l'agent doit être un UUID valide" })
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
  controlFrequencyEnum,
  unassignAgentSchema 
};
