const { z } = require('zod');
const { optionalEmailValidation } = require('../../utils/validation');

// Enum pour les types d'identité (selon la nouvelle structure)
const idTypeEnum = z.enum(['CNI', 'PASSEPORT', 'PERMIS_CONDUITE']);

// Enum pour le sexe
const sexeEnum = z.enum(['M', 'F', 'HOMME', 'FEMME']);

const createVisitorSchema = z.object({
    firstName: z.string().min(1, 'Le prénom est requis').max(100),
    lastName: z.string().min(1, 'Le nom est requis').max(100),
    birthDate: z.string().optional(),
    birthPlace: z.string().max(255).optional(),
    sexe: sexeEnum.optional(),
    givingDate: z.string().optional(),
    expirationDate: z.string().optional(),
    phone: z.string().max(20).optional(),
    email: optionalEmailValidation,
    idType: idTypeEnum,
    idNumber: z.string().min(1, 'Le numéro d\'identité est requis').max(255),
    idScanUrl: z.string().url().optional(),
    photoUrl: z.string().url().optional(),
    isBlacklisted: z.boolean().default(false).optional(),
    blacklistReason: z.string().optional(),
    company: z.string().max(255).optional()
});

const updateVisitorSchema = createVisitorSchema.partial();

const visitorIdSchema = z.object({
    id: z.string().uuid('ID invalide')
});

const visitorQuerySchema = z.object({
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
    search: z.string().optional(),
    company: z.string().optional(),
    isBlacklisted: z.string().transform(val => val === 'true').optional(),
    idType: idTypeEnum.optional()
});

const blacklistVisitorSchema = z.object({
    reason: z.string().min(1, 'La raison est requise')
});

module.exports = {
    createVisitorSchema,
    updateVisitorSchema,
    visitorIdSchema,
    visitorQuerySchema,
    blacklistVisitorSchema,
    idTypeEnum
};
