const { z } = require('zod');

// Enum pour les types d'identité - RENDU OPTIONNEL ET PLUS FLEXIBLE
const idTypeEnum = z.string().optional();

// Enum pour le sexe
const sexeEnum = z.enum(['M', 'F', 'HOMME', 'FEMME']).optional();

// Schema principal pour la création d'un visiteur
const createVisitorSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  idType: idTypeEnum,
  idNumber: z.string().min(1).max(255),
  birthDate: z.string().nullable().optional(),
  birthPlace: z.string().max(255).nullable().optional(),
  residence: z.string().max(255).nullable().optional(),
  sexe: sexeEnum.nullable().optional(),
  givingDate: z.string().nullable().optional(),
  expirationDate: z.string().nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
  email: z.string().email().nullable().optional(),
  isBlacklisted: z.boolean().default(false).optional(),
  blacklistReason: z.string().nullable().optional(),
  company: z.string().max(255).nullable().optional(),
  emergencyContactPhone: z.string().max(20).nullable().optional(),
  emergencyContactName: z.string().max(255).nullable().optional()
});

// Transformation TRÈS SIMPLE - ne fait rien d'autre que valider
const createVisitorWithTransform = createVisitorSchema.transform((data) => {
  return data;
});

// Schema pour mise à jour (champs optionnels)
const updateVisitorSchema = createVisitorSchema.partial();

// Schema pour ID visiteur (validation UUID)
const visitorIdSchema = z.object({
  id: z.string().uuid('ID invalide')
});

// Query params pour filtrer ou paginer les visiteurs
const visitorQuerySchema = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  search: z.string().optional(),
  company: z.string().optional(),
  isBlacklisted: z.string().transform(val => val === 'true').optional(),
  idType: idTypeEnum.optional()
});

// Schema pour mettre un visiteur sur blacklist
const blacklistVisitorSchema = z.object({
  reason: z.string().min(1, 'La raison est requise')
});

// Filtre des visiteurs - TOUS LES CHAMPS OPTIONNELS
const visitorFilterSchema = z.object({
  // Filtres de base - TOUS OPTIONNELS
  search: z.string().optional(),
  idType: idTypeEnum.optional(),
  idNumber: z.string().optional(),
  company: z.string().optional(),
  isBlacklisted: z.enum(['true', 'false']).optional(),
  sexe: sexeEnum.optional(),
  
  // Filtres dates d'identité
  givingDateStart: z.string().optional(),
  givingDateEnd: z.string().optional(),
  expirationDateStart: z.string().optional(),
  expirationDateEnd: z.string().optional(),
  birthDateStart: z.string().optional(),
  birthDateEnd: z.string().optional(),
  
  // Filtres dates création/mise à jour
  dateCreationDebut: z.string().optional(),
  dateCreationFin: z.string().optional(),
  dateUpdateDebut: z.string().optional(),
  dateUpdateFin: z.string().optional(),
  
  // Filtres relationnels
  siteId: z.string().optional(),
  checkpointId: z.string().optional(),
  actif: z.enum(['true', 'false']).optional(),
  avecBadge: z.enum(['true', 'false']).optional(),
  avecIncidents: z.enum(['true', 'false']).optional(),
  avecVisites: z.enum(['true', 'false']).optional(),
  visiteSiteId: z.string().optional(),
  visiteCheckpointId: z.string().optional(),
  
  // Filtres démographiques
  residence: z.string().optional(),
  birthPlace: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  
  // Pagination
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10)
}).refine((data) => {
  // Validation croisée des dates - SEULEMENT SI LES DEUX DATES SONT PRÉSENTES
  const datePairs = [
    ['givingDateStart', 'givingDateEnd'],
    ['expirationDateStart', 'expirationDateEnd'],
    ['birthDateStart', 'birthDateEnd'],
    ['dateCreationDebut', 'dateCreationFin'],
    ['dateUpdateDebut', 'dateUpdateFin']
  ];
  
  for (const [start, end] of datePairs) {
    if (data[start] && data[end]) {
      const startDate = new Date(data[start]);
      const endDate = new Date(data[end]);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        // Date invalide, la validation échouera ailleurs
        continue;
      }
      if (startDate > endDate) return false;
    }
  }
  return true;
}, {
  message: "La date de début ne peut pas être après la date de fin",
  path: ["dateValidation"]
});

module.exports = {
  createVisitorSchema,
  createVisitorWithTransform,
  updateVisitorSchema,
  visitorIdSchema,
  visitorQuerySchema,
  blacklistVisitorSchema,
  idTypeEnum,
  visitorFilterSchema,
};