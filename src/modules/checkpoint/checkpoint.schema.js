const { z } = require('zod');

// Énumérations pour les checkpoints
const checkpointStatusEnum = z.enum(['active', 'inactive', 'maintenance', 'error']);
const checkpointTypeEnum = z.enum(['entry', 'exit', 'internal', 'external', 'emergency', 'patrol']);
const checkpointPriorityEnum = z.enum(['low', 'medium', 'high', 'critical']);
const controlFrequencyEnum = z.enum(['hourly', 'daily', 'weekly', 'monthly', 'on_demand']);
const alertTypeEnum = z.enum(['silent', 'audible', 'visual', 'combined']);

// Schéma pour la configuration SOS complète
const sosConfigurationSchema = z.object({
  sosId: z.string().min(1, 'L\'identifiant SOS est requis'),
  alertType: alertTypeEnum.default('silent'),
  delaiAlerte: z.number().min(0, 'Le délai d\'alerte doit être positif').default(5),
  emailsPrincipaux: z.array(z.string().email('Email invalide')).default([]),
  emailsSecondaires: z.array(z.string().email('Email invalide')).default([]),
  escaladeAutomatique: z.boolean().default(true),
  intervalleVerification: z.number().min(1, 'L\'intervalle de vérification doit être positif').default(60),
  messageAlerte: z.string().min(1, 'Le message d\'alerte est requis'),
  messageEscalade: z.string().optional(),
  nombreTentativesMax: z.number().min(1, 'Le nombre de tentatives doit être positif').default(3),
  notifyAdmin: z.boolean().default(true),
  notifySecurity: z.boolean().default(true),
  telephonesPrincipaux: z.array(z.string()).default([]),
  telephonesSecondaires: z.array(z.string()).default([]),
  timeoutReponse: z.number().min(1, 'Le timeout de réponse doit être positif').default(30)
}).optional();

// Schéma de création d'un checkpoint correspondant exactement au frontend
const createCheckpointSchema = z.object({
  // Informations de base
  name: z.string().min(1, 'Le nom du checkpoint est requis').max(255, 'Le nom ne peut pas dépasser 255 caractères'),
  description: z.string().optional(),
  siteId: z.string().uuid('ID de site invalide'),
  
  // Statut et état
  active: z.boolean().default(true),
  status: checkpointStatusEnum.default('active'),
  checkpointType: checkpointTypeEnum.default('internal'),
  priority: checkpointPriorityEnum.default('medium'),
  
  // Affectation d'agent
  agentId: z.string().uuid('ID d\'agent invalide').optional(),
  
  // Localisation
  building: z.string().max(100, 'Le bâtiment ne peut pas dépasser 100 caractères').optional(),
  floor: z.string().max(50, 'L\'étage ne peut pas dépasser 50 caractères').optional(),
  zone: z.string().max(100, 'La zone ne peut pas dépasser 100 caractères').optional(),
  coordinatesLatitude: z.number().min(-90).max(90, 'Latitude invalide').optional(),
  coordinatesLongitude: z.number().min(-180).max(180, 'Longitude invalide').optional(),
  
  // Planification
  controlFrequency: controlFrequencyEnum.optional(),
  
  // Équipements et matériels
  equipment: z.array(z.string()).default([]),
  requiredMaterial: z.array(z.string()).default([]),
  specialInstructions: z.string().optional(),
  
  // Configuration SOS complète
  sosConfiguration: sosConfigurationSchema
});

// Schéma de mise à jour (tous les champs optionnels)
const updateCheckpointSchema = createCheckpointSchema.partial();

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
  sosConfigurationSchema,
  // Export des énumérations pour réutilisation
  checkpointStatusEnum,
  checkpointTypeEnum,
  checkpointPriorityEnum,
  controlFrequencyEnum,
  alertTypeEnum
};
