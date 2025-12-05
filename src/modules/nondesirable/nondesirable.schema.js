const { z } = require('zod');

// ------------------------
// Création d'un indésirable connu (avec visitorId)
// ------------------------
const createNonDesirableSchema = z.object({
  visitorId: z.string().uuid('ID de visiteur invalide'),
  reason: z.string().min(1, 'La raison est requise').max(500, 'La raison ne peut pas dépasser 500 caractères')
});

// ------------------------
// Schéma pour les IDs (si nécessaire ailleurs)
// ------------------------
const nonDesirableIdSchema = z.object({
  id: z.string().cuid('ID invalide') // uniquement pour contexte où CUID est utilisé
});

// ------------------------
// Query pour pagination / recherche
// ------------------------
const nonDesirableQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  search: z.string().optional()
});

// ------------------------
// Création d'un indésirable inconnu (admin seulement)
// ------------------------
const createUnknownNonDesirableSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis').max(100),
  lastName: z.string().min(1, 'Le nom est requis').max(100),
  idType: z.string().min(1, "Le type d'identité est requis").max(20),
  idNumber: z.string().min(1, "Le numéro d'identité est requis").max(255),
  birthDate: z.string().refine(v => !v || !isNaN(Date.parse(v)), "La date de naissance est invalide").optional(),
  birthPlace: z.string().max(255).optional(),
  sexe: z.enum(['M', 'F', 'HOMME', 'FEMME']).optional(),
  givingDate: z.string().refine(v => !v || !isNaN(Date.parse(v)), "Date de délivrance invalide").optional(),
  expirationDate: z.string().refine(v => !v || !isNaN(Date.parse(v)), "Date d'expiration invalide").optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email("Email invalide").optional(),
  company: z.string().max(255).optional(),
  nationality: z.string().max(100).optional(),
  idScanUrl: z.string().url("URL du scan invalide").optional(),
  photoUrl: z.string().url("URL de la photo invalide").optional(),
  reason: z.string().min(1, "La raison est requise").max(500),
  incidentDate: z.string().refine(v => !v || !isNaN(Date.parse(v)), "Date d'incident invalide").optional(),
  incidentLocation: z.string().max(255).optional(),
  severityLevel: z.number().int().min(1).max(4).default(2),
  attachedFileUrl: z.string().url().optional(),
  attachedFileName: z.string().optional(),
  attachedFileType: z.string().optional(),
  attachedFileSize: z.number().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  createdBy: z.string().optional(),
  isActive: z.boolean().optional()
});

// ------------------------
// Suppression d'un indésirable inconnu
// ------------------------
const removeUnknownSchema = z.object({
  id: z.string().uuid(),        // UUID obligatoire
  reason: z.string().min(3),
  reportedBy: z.string().uuid()
});

module.exports = {
  createNonDesirableSchema,
  createUnknownNonDesirableSchema,
  nonDesirableIdSchema,
  nonDesirableQuerySchema,
  removeUnknownSchema
};
