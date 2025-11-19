const { z } = require('zod');
const { optionalEmailValidation } = require('../../utils/validation');

// Enum pour les types d'identité
const idTypeEnum = z.enum(['CNI', 'PASSEPORT', 'PERMIS_CONDUITE', 'CARTE_SEJOUR', 'AUTRE']);

const createVisitorSchema = z.object({
    firstName: z.string().min(1, 'Le prénom est requis'),
    lastName: z.string().min(1, 'Le nom est requis'),
    phone: z.string().optional(),
    email: optionalEmailValidation,
    idType: idTypeEnum,
    idNumber: z.string().min(1, 'Le numéro d\'identité est requis'),
    idScanUrl: z.string().url().optional(),
    photoUrl: z.string().url().optional(),
    company: z.string().optional()
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
