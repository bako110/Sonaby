const { z } = require('zod');

// Énumérations pour les checkpoints
const checkpointStatusEnum = z.enum(['active', 'inactive', 'maintenance', 'error']);
const checkpointTypeEnum = z.enum(['entry', 'exit', 'internal', 'emergency', 'patrol']);
const checkpointPriorityEnum = z.enum(['low', 'medium', 'high', 'critical']);
const controlFrequencyEnum = z.enum(['hourly', 'daily', 'weekly', 'monthly', 'on_demand']);

// Schéma pour la configuration SOS
const sosConfigurationSchema = z.object({
  emergency_contacts: z.array(z.string()).optional(),
  alert_level: z.string().optional(),
  auto_notify: z.boolean().optional()
}).optional();

// Schéma de création d'un checkpoint avec tous les nouveaux champs
const createCheckpointSchema = z.object({
  // Informations de base
  name: z.string().min(1, 'Le nom du checkpoint est requis').max(255, 'Le nom ne peut pas dépasser 255 caractères'),
  description: z.string().optional(),
  siteId: z.string().uuid('ID de site invalide'),
  
  // Localisation
  zone: z.string().max(100, 'La zone ne peut pas dépasser 100 caractères').optional(),
  building: z.string().max(100, 'Le bâtiment ne peut pas dépasser 100 caractères').optional(),
  floor: z.string().max(50, 'L\'étage ne peut pas dépasser 50 caractères').optional(),
  coordinatesLatitude: z.number().min(-90).max(90, 'Latitude invalide').optional(),
  coordinatesLongitude: z.number().min(-180).max(180, 'Longitude invalide').optional(),
  
  // Configuration SOS
  sosId: z.string().min(1, 'L\'identifiant SOS est requis').max(100, 'L\'identifiant SOS ne peut pas dépasser 100 caractères'),
  sosConfiguration: sosConfigurationSchema,
  
  // Affectation d'agent (dénormalisé)
  agentId: z.string().uuid('ID d\'agent invalide').optional(),
  agentName: z.string().max(255, 'Le nom de l\'agent ne peut pas dépasser 255 caractères').optional(),
  agentEmail: z.string().email('Email de l\'agent invalide').optional(),
  agentPhone: z.string().max(20, 'Le téléphone de l\'agent ne peut pas dépasser 20 caractères').optional(),
  assignmentDate: z.string().datetime('Date d\'affectation invalide').optional(),
  
  // Statut et état
  status: checkpointStatusEnum.default('active').optional(),
  checkpointType: checkpointTypeEnum.default('internal').optional(),
  priority: checkpointPriorityEnum.default('medium').optional(),
  
  // Planification
  controlFrequency: controlFrequencyEnum.optional(),
  nextControl: z.string().datetime('Date de prochain contrôle invalide').optional(),
  lastControl: z.string().datetime('Date de dernier contrôle invalide').optional(),
  
  // Équipements et matériels
  equipment: z.array(z.string()).optional(),
  requiredMaterial: z.array(z.string()).optional(),
  specialInstructions: z.string().optional(),
  
  // Métadonnées
  active: z.boolean().default(true).optional(),
  createdBy: z.string().max(255, 'Le créateur ne peut pas dépasser 255 caractères').optional(),
  modifiedBy: z.string().max(255, 'Le modificateur ne peut pas dépasser 255 caractères').optional()
});

// Schéma de mise à jour (tous les champs optionnels sauf sosId qui ne peut pas être modifié)
const updateCheckpointSchema = createCheckpointSchema.omit({ sosId: true }).partial();

// Schéma pour l'ID du checkpoint
const checkpointIdSchema = z.object({
  id: z.string().uuid('ID de checkpoint invalide')
});

// Schéma de requête avec filtres
const checkpointQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  search: z.string().optional(),
  siteId: z.string().uuid().optional(),
  status: checkpointStatusEnum.optional(),
  checkpointType: checkpointTypeEnum.optional(),
  priority: checkpointPriorityEnum.optional(),
  agentId: z.string().uuid().optional(),
  active: z.string().optional().transform(val => val === 'true' ? true : val === 'false' ? false : undefined)
});

// Schéma pour l'affectation d'agent
const assignAgentSchema = z.object({
  agentId: z.string().uuid('ID d\'agent invalide'),
  agentName: z.string().max(255, 'Le nom de l\'agent ne peut pas dépasser 255 caractères').optional(),
  agentEmail: z.string().email('Email de l\'agent invalide').optional(),
  agentPhone: z.string().max(20, 'Le téléphone de l\'agent ne peut pas dépasser 20 caractères').optional()
});

// Schéma pour les alertes SOS
const sosSchema = z.object({
  message: z.string().optional(),
  checkpointId: z.string().uuid('ID de checkpoint invalide')
});

// Schéma pour la mise à jour de la configuration SOS
const updateSosConfigurationSchema = z.object({
  sosConfiguration: sosConfigurationSchema
});

module.exports = {
  createCheckpointSchema,
  updateCheckpointSchema,
  checkpointIdSchema,
  checkpointQuerySchema,
  assignAgentSchema,
  sosSchema,
  updateSosConfigurationSchema,
  // Export des énumérations pour réutilisation
  checkpointStatusEnum,
  checkpointTypeEnum,
  checkpointPriorityEnum,
  controlFrequencyEnum
};
