const { z } = require('zod');

// Enum pour les types d'identité
const idTypeEnum = z.enum(['CNI', 'PASSEPORT', 'PERMIS_CONDUITE']);

// Enum pour les types de blacklist
const blacklistTypeEnum = z.enum(['SYSTEM', 'AGENT', 'ALL']);

// Schéma pour ajouter un visiteur à la blacklist par un agent
const addBlacklistSchema = z.object({
  reason: z.string().min(1, 'La raison est requise'),
  severityLevel: z.number().int().min(1).max(4, 'Le niveau de gravité doit être entre 1 et 4').default(1).optional(),
  incidentDate: z.string().datetime('Date d\'incident invalide').optional(),
  incidentLocation: z.string().max(255, 'Le lieu d\'incident ne peut pas dépasser 255 caractères').optional()
});

// Schéma pour retirer un visiteur de la blacklist
const removeBlacklistSchema = z.object({
  reason: z.string().min(1, 'La raison du retrait est requise')
});

// Schéma pour l'ID du visiteur
const visitorIdSchema = z.object({
  id: z.string().uuid('ID de visiteur invalide')
});

// Schéma de requête avec filtres
const blacklistQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  type: blacklistTypeEnum.default('ALL').optional(),
  search: z.string().optional(),
  severityLevel: z.string().optional().transform(val => val ? parseInt(val) : undefined)
});

// Schéma pour recherche par identité
const searchByIdentitySchema = z.object({
  idType: idTypeEnum,
  idNumber: z.string().min(1, 'Le numéro d\'identité est requis')
});

module.exports = {
  addBlacklistSchema,
  removeBlacklistSchema,
  visitorIdSchema,
  blacklistQuerySchema,
  searchByIdentitySchema,
  // Export des énumérations pour réutilisation
  idTypeEnum,
  blacklistTypeEnum
};
