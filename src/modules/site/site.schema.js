const { z } = require('zod');

// Énumérations pour les types d'activité et statuts
const activityTypeEnum = z.enum([
  'OFFICE', 'PRODUCTION', 'WAREHOUSE', 'RETAIL', 'RESEARCH', 
  'DATACENTER', 'LOGISTICS', 'MANUFACTURING', 'HEADQUARTERS', 'OTHER'
]);

const siteStatusEnum = z.enum([
  'ACTIVE', 'INACTIVE', 'UNDER_CONSTRUCTION', 'MAINTENANCE', 
  'CLOSED', 'PLANNED', 'SUSPENDED'
]);

// Schéma pour les coordonnées
const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90, 'Latitude invalide'),
  longitude: z.number().min(-180).max(180, 'Longitude invalide')
}).optional();

// Schéma de création d'un site selon l'interface TypeScript
const createSiteSchema = z.object({
  // Informations de base (obligatoires)
  name: z.string().min(1, 'Le nom du site est requis').max(255, 'Le nom ne peut pas dépasser 255 caractères'),
  address: z.string().min(1, 'L\'adresse est requise'),
  city: z.string().min(1, 'La ville est requise').max(100, 'La ville ne peut pas dépasser 100 caractères'),
  postalCode: z.string().min(1, 'Le code postal est requis').max(20, 'Le code postal ne peut pas dépasser 20 caractères'),
  country: z.string().min(1, 'Le pays est requis').max(100, 'Le pays ne peut pas dépasser 100 caractères'),
  activityType: activityTypeEnum,
  status: siteStatusEnum,
  
  // Informations optionnelles
  code: z.string().max(50, 'Le code ne peut pas dépasser 50 caractères').optional(),
  region: z.string().max(100, 'La région ne peut pas dépasser 100 caractères').optional(),
  phone: z.string().max(20, 'Le téléphone ne peut pas dépasser 20 caractères').optional(),
  fax: z.string().max(20, 'Le fax ne peut pas dépasser 20 caractères').optional(),
  email: z.string().email('Email invalide').optional(),
  website: z.string().url('URL du site web invalide').optional(),
  
  // Management
  manager: z.string().max(255, 'Le nom du manager ne peut pas dépasser 255 caractères').optional(),
  managerEmail: z.string().email('Email du manager invalide').optional(),
  managerPhone: z.string().max(20, 'Le téléphone du manager ne peut pas dépasser 20 caractères').optional(),
  
  // Surfaces et capacités
  area: z.number().min(0, 'La surface doit être positive').optional(),
  usableArea: z.number().min(0, 'La surface utile doit être positive').optional(),
  employeeCount: z.number().int().min(0, 'Le nombre d\'employés doit être un entier positif').optional(),
  maxEmployeeCapacity: z.number().int().min(0, 'La capacité maximale doit être un entier positif').optional(),
  buildingCount: z.number().int().min(0, 'Le nombre de bâtiments doit être un entier positif').optional(),
  
  // Dates
  creationDate: z.string().datetime('Date de création invalide').optional(),
  openingDate: z.string().datetime('Date d\'ouverture invalide').optional(),
  closingDate: z.string().datetime('Date de fermeture invalide').optional(),
  
  // Localisation
  coordinates: coordinatesSchema,
  
  // Descriptions
  description: z.string().optional(),
  comments: z.string().optional(),
  
  // Informations financières
  monthlyCost: z.number().min(0, 'Le coût mensuel doit être positif').optional(),
  annualBudget: z.number().min(0, 'Le budget annuel doit être positif').optional(),
  
  // Certifications et conformité
  certifications: z.array(z.string()).optional(),
  lastInspection: z.string().datetime('Date de dernière inspection invalide').optional(),
  nextInspection: z.string().datetime('Date de prochaine inspection invalide').optional(),
  
  // Équipements et services
  equipment: z.array(z.string()).optional(),
  services: z.array(z.string()).optional(),
  
  // Accessibilité
  wheelchairAccessible: z.boolean().optional(),
  parkingAvailable: z.boolean().optional(),
  parkingSpaces: z.number().int().min(0, 'Le nombre de places de parking doit être un entier positif').optional(),
  
  // Sécurité
  securitySystem: z.boolean().optional(),
  securityGuard: z.boolean().optional(),
  
  // Environnement
  environmentalCertification: z.string().max(255, 'La certification environnementale ne peut pas dépasser 255 caractères').optional(),
  energyConsumption: z.number().min(0, 'La consommation d\'énergie doit être positive').optional(),
  
  // Métadonnées
  createdBy: z.string().max(255, 'Le créateur ne peut pas dépasser 255 caractères').optional(),
  modifiedBy: z.string().max(255, 'Le modificateur ne peut pas dépasser 255 caractères').optional(),
  version: z.number().int().min(1, 'La version doit être un entier positif').optional()
});

// Schéma de mise à jour (tous les champs optionnels)
const updateSiteSchema = createSiteSchema.partial();

// Schéma pour l'ID du site
const siteIdSchema = z.object({
  id: z.string().uuid('ID de site invalide')
});

// Schéma de requête avec filtres adaptés à la nouvelle interface
const siteQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  search: z.string().optional(),
  city: z.string().optional(),
  status: siteStatusEnum.optional(),
  activityType: activityTypeEnum.optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  manager: z.string().optional(),
  wheelchairAccessible: z.string().optional().transform(val => val === 'true' ? true : val === 'false' ? false : undefined),
  parkingAvailable: z.string().optional().transform(val => val === 'true' ? true : val === 'false' ? false : undefined),
  securitySystem: z.string().optional().transform(val => val === 'true' ? true : val === 'false' ? false : undefined),
  minEmployeeCount: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  maxEmployeeCount: z.string().optional().transform(val => val ? parseInt(val) : undefined)
});

module.exports = {
  createSiteSchema,
  updateSiteSchema,
  siteIdSchema,
  siteQuerySchema,
  // Export des énumérations pour réutilisation
  activityTypeEnum,
  siteStatusEnum,
  coordinatesSchema
};
