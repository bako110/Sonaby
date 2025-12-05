const { z } = require('zod');

// Énumérations pour les statuts
// Note: activityType est géré par le frontend, pas de validation enum côté backend

const siteStatusEnum = z.enum([
  'ACTIVE', 'INACTIVE', 'UNDER_CONSTRUCTION', 'MAINTENANCE', 
  'CLOSED', 'PLANNED', 'SUSPENDED'
]);

// Schéma pour les coordonnées
const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90, 'Latitude invalide'),
  longitude: z.number().min(-180).max(180, 'Longitude invalide')
}).optional();

// Préprocesseur pour nettoyer les valeurs vides
const preprocessSiteData = (data) => {
  const cleaned = { ...data };
  
  // Convertir les chaînes vides en null
  Object.keys(cleaned).forEach(key => {
    if (cleaned[key] === '' || cleaned[key] === undefined) {
      cleaned[key] = null;
    }
  });
  
  return cleaned;
};

// Schéma de base pour un site
const baseSiteSchema = z.object({
  // Informations de base (SEULS CHAMPS OBLIGATOIRES)
  name: z.string().min(1, 'Le nom du site est requis').max(255, 'Le nom ne peut pas dépasser 255 caractères'),
  address: z.string().min(1, 'L\'adresse est requise'),
  city: z.string().min(1, 'La ville est requise').max(100, 'La ville ne peut pas dépasser 100 caractères'),
  
  // Tous les autres champs sont optionnels
  postalCode: z.string().max(20, 'Le code postal ne peut pas dépasser 20 caractères').optional().nullable(),
  country: z.string().max(100, 'Le pays ne peut pas dépasser 100 caractères').optional().nullable(),
  activityType: z.string().max(50, 'Le type d\'activité ne peut pas dépasser 50 caractères').optional().nullable(),
  status: siteStatusEnum.optional().nullable(),
  
  // Informations optionnelles (peuvent être null ou vides)
  code: z.string().max(50, 'Le code ne peut pas dépasser 50 caractères').optional().nullable(),
  region: z.string().max(100, 'La région ne peut pas dépasser 100 caractères').optional().nullable(),
  phone: z.string().max(20, 'Le téléphone ne peut pas dépasser 20 caractères').optional().nullable(),
  fax: z.string().max(20, 'Le fax ne peut pas dépasser 20 caractères').optional().nullable(),
  email: z.string().email('Email invalide').optional().nullable(),
  website: z.string().url('URL du site web invalide').optional().nullable(),
  
  // Management
  manager: z.string().uuid('ID du manager invalide').optional().nullable(),
  managerEmail: z.string().email('Email du manager invalide').optional().nullable(),
  managerPhone: z.string().max(20, 'Le téléphone du manager ne peut pas dépasser 20 caractères').optional().nullable(),
  
  // Surfaces et capacités (peuvent être null ou vides)
  area: z.number().min(0, 'La surface doit être positive').optional().nullable(),
  usableArea: z.number().min(0, 'La surface utile doit être positive').optional().nullable(),
  employeeCount: z.number().int().min(0, 'Le nombre d\'employés doit être un entier positif').optional().nullable(),
  maxEmployeeCapacity: z.number().int().min(0, 'La capacité maximale doit être un entier positif').optional().nullable(),
  buildingCount: z.number().int().min(0, 'Le nombre de bâtiments doit être un entier positif').optional().nullable(),
  
  // Dates
  creationDate: z.string().datetime('Date de création invalide').optional().nullable(),
  openingDate: z.string().datetime('Date d\'ouverture invalide').optional().nullable(),
  closingDate: z.string().datetime('Date de fermeture invalide').optional().nullable(),
  
  // Localisation
  coordinates: coordinatesSchema.nullable(),
  
  // Descriptions
  description: z.string().optional().nullable(),
  
  // Informations financières
  monthlyCost: z.number().min(0, 'Le coût mensuel doit être positif').optional().nullable(),
  annualBudget: z.number().min(0, 'Le budget annuel doit être positif').optional().nullable(),
  
  // Certifications et conformité
  certifications: z.array(z.string()).optional().nullable(),
  lastInspection: z.string().datetime('Date de dernière inspection invalide').optional().nullable(),
  nextInspection: z.string().datetime('Date de prochaine inspection invalide').optional().nullable(),
  
  // Équipements et services
  equipment: z.array(z.string()).optional().nullable(),
  services: z.array(z.string()).optional().nullable(),
  
  // Accessibilité
  wheelchairAccessible: z.boolean().optional().nullable(),
  parkingAvailable: z.boolean().optional().nullable(),
  parkingSpaces: z.number().int().min(0, 'Le nombre de places de parking doit être un entier positif').optional().nullable(),
  
  // Sécurité
  securitySystem: z.boolean().optional().nullable(),
  securityGuard: z.boolean().optional().nullable(),
  
  // Environnement
  environmentalCertification: z.string().max(255, 'La certification environnementale ne peut pas dépasser 255 caractères').optional().nullable(),
  energyConsumption: z.number().min(0, 'La consommation d\'énergie doit être positive').optional().nullable(),
  
  // Métadonnées
  createdBy: z.string().max(255, 'Le créateur ne peut pas dépasser 255 caractères').optional().nullable(),
  modifiedBy: z.string().max(255, 'Le modificateur ne peut pas dépasser 255 caractères').optional().nullable(),
  version: z.number().int().min(1, 'La version doit être un entier positif').optional().nullable()
});

// Schéma de création avec préprocesseur
const createSiteSchema = z.preprocess(preprocessSiteData, baseSiteSchema);

// Schéma de mise à jour (tous les champs optionnels)
const updateSiteSchema = baseSiteSchema.partial();

// Schéma pour l'ID du site
const siteIdSchema = z.object({
  id: z.string().uuid('ID de site invalide')
});

// Schéma de requête avec filtres adaptés à la nouvelle interface
const siteQuerySchema = z.object({
  // Pagination
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  
  // Recherche et filtres de base
  search: z.string().optional(),
  code: z.string().optional(),  // NOUVEAU
  city: z.string().optional(),
  region: z.string().optional(),
  country: z.string().optional(),
  status: siteStatusEnum.optional(),
  activityType: z.string().optional(),
  manager: z.string().optional(),
  
  // Filtres numériques
  minEmployeeCount: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  maxEmployeeCount: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  minArea: z.string().optional().transform(val => val ? parseFloat(val) : undefined),  // NOUVEAU
  maxArea: z.string().optional().transform(val => val ? parseFloat(val) : undefined),  // NOUVEAU
  
  // Filtres booléens
  wheelchairAccessible: z.string().optional().transform(val => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return undefined;
  }),
  parkingAvailable: z.string().optional().transform(val => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return undefined;
  }),
  securitySystem: z.string().optional().transform(val => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return undefined;
  }),
  securityGuard: z.string().optional().transform(val => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return undefined;
  }),
  
  // Filtres dates (renommés pour correspondre au frontend)
  creationDateStart: z.string().datetime().optional(),  // NOUVEAU nom
  creationDateEnd: z.string().datetime().optional(),    // NOUVEAU nom
  
  // Tri
  sortBy: z.enum(['name', 'city', 'creationDate', 'employeeCount', 'area', 'code']).optional().default('creationDate'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
}).refine(data => {
  // Validation: date de début doit être avant date de fin
  if (data.creationDateStart && data.creationDateEnd) {
    return new Date(data.creationDateStart) <= new Date(data.creationDateEnd);
  }
  return true;
}, {
  message: "La date de début doit être avant la date de fin",
  path: ["creationDateStart"]
});

module.exports = {
  baseSiteSchema,
  createSiteSchema,
  updateSiteSchema,
  siteIdSchema,
  siteQuerySchema,
  // Export des énumérations pour réutilisation
  siteStatusEnum,
  coordinatesSchema
};
