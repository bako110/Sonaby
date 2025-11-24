const { z } = require('zod');

// Enum pour les types d'identité
const idTypeEnum = z.enum(['CNIB', 'PASSEPORT', 'PERMIS_CONDUITE']);

// Enum pour les actions de blacklist
const blacklistActionEnum = z.enum(['added', 'removed']);

// Schéma pour créer un signalement blacklist (niveau national)
const createBlacklistSchema = z.object({
  // Référence visiteur (optionnelle si déjà enregistré)
  visitorId: z.string().uuid('ID de visiteur invalide').optional(),
  
  // Informations d'identification (pour signalement national)
  firstName: z.string().min(1, 'Le prénom est requis').max(100, 'Le prénom ne peut pas dépasser 100 caractères').optional(),
  lastName: z.string().min(1, 'Le nom est requis').max(100, 'Le nom ne peut pas dépasser 100 caractères').optional(),
  idType: idTypeEnum.optional(),
  idNumber: z.string().min(1, 'Le numéro d\'identité est requis').max(255, 'Le numéro d\'identité ne peut pas dépasser 255 caractères').optional(),
  phone: z.string().max(20, 'Le téléphone ne peut pas dépasser 20 caractères').optional(),
  email: z.string().email('Email invalide').optional(),
  nationality: z.string().max(100, 'La nationalité ne peut pas dépasser 100 caractères').optional(),
  birthDate: z.string().date('Date de naissance invalide').optional(),
  birthPlace: z.string().max(255, 'Le lieu de naissance ne peut pas dépasser 255 caractères').optional(),
  
  // Informations du signalement
  action: blacklistActionEnum,
  reason: z.string().min(1, 'La raison est requise'),
  severityLevel: z.number().int().min(1).max(4, 'Le niveau de gravité doit être entre 1 et 4').default(1).optional(),
  incidentDate: z.string().date('Date d\'incident invalide').optional(),
  incidentLocation: z.string().max(255, 'Le lieu d\'incident ne peut pas dépasser 255 caractères').optional()
}).refine(
  (data) => {
    // Au moins une identification doit être fournie
    return data.visitorId || (data.firstName && data.lastName && data.idNumber);
  },
  {
    message: "Soit un visitorId, soit les informations d'identification complètes (prénom, nom, numéro d'identité) doivent être fournies",
    path: ["identification"]
  }
);

// Schéma de mise à jour
const updateBlacklistSchema = createBlacklistSchema.partial();

// Schéma pour l'ID du blacklist
const blacklistIdSchema = z.object({
  id: z.string().uuid('ID de blacklist invalide')
});

// Schéma de requête avec filtres
const blacklistQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  search: z.string().optional(),
  visitorId: z.string().uuid().optional(),
  severityLevel: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  nationality: z.string().optional(),
  incidentDate: z.string().optional(),
  action: blacklistActionEnum.optional(),
  idType: idTypeEnum.optional()
});

// Schéma pour recherche par identité
const searchByIdentitySchema = z.object({
  idType: idTypeEnum,
  idNumber: z.string().min(1, 'Le numéro d\'identité est requis')
});

module.exports = {
  createBlacklistSchema,
  updateBlacklistSchema,
  blacklistIdSchema,
  blacklistQuerySchema,
  searchByIdentitySchema,
  // Export des énumérations pour réutilisation
  idTypeEnum,
  blacklistActionEnum
};
