const { z } = require('zod');

const createNonDesirableSchema = z.object({
  // ID du visiteur existant (obligatoire)
  visitorId: z.string().uuid('ID de visiteur invalide'),
  
  // Raison de l'ajout à la liste des indésirables (obligatoire)
  reason: z.string().min(1, 'La raison est requise').max(500, 'La raison ne peut pas dépasser 500 caractères')
});

const nonDesirableIdSchema = z.object({
  id: z.string().cuid('ID invalide')
});

const nonDesirableQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  search: z.string().optional()
});

// Schéma pour créer un indésirable sans visiteur existant (admin seulement)
const createUnknownNonDesirableSchema = z.object({
  // Informations d'identification obligatoires
  firstName: z.string().min(1, 'Le prénom est requis').max(100),
  lastName: z.string().min(1, 'Le nom est requis').max(100),
  idType: z.string().min(1, 'Le type d\'identité est requis').max(20),
  idNumber: z.string().min(1, 'Le numéro d\'identité est requis').max(255),
  
  // Informations personnelles
  birthDate: z.string().optional(),
  birthPlace: z.string().max(255).optional(),
  sexe: z.enum(['M', 'F', 'HOMME', 'FEMME']).optional(),
  givingDate: z.string().optional(),
  expirationDate: z.string().optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email('Email invalide').optional(),
  company: z.string().max(255).optional(),
  nationality: z.string().max(100).optional(),
  
  // URLs des documents
  idScanUrl: z.string().url('URL invalide').optional(),
  photoUrl: z.string().url('URL invalide').optional(),
  
  // Raison obligatoire
  reason: z.string().min(1, 'La raison est requise').max(500),
  
  // Informations sur l'incident
  incidentDate: z.string().date('Date d\'incident invalide').optional(),
  incidentLocation: z.string().max(255).optional(),
  severityLevel: z.number().int().min(1).max(4).default(2)
});

module.exports = {
  createNonDesirableSchema,
  createUnknownNonDesirableSchema,
  nonDesirableIdSchema,
  nonDesirableQuerySchema
};
