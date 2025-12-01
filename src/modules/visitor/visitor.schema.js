const { z } = require('zod');
const { optionalEmailValidation } = require('../../utils/validation');

// Enum pour les types d'identité (selon la nouvelle structure)
const idTypeEnum = z.enum(['CNI', 'PASSEPORT', 'PERMIS_CONDUITE']);

// Enum pour le sexe
const sexeEnum = z.enum(['M', 'F', 'HOMME', 'FEMME']);

const createVisitorSchema = z.object({
    firstName: z.string().min(1, 'Le prénom est requis').max(100),
    lastName: z.string().min(1, 'Le nom est requis').max(100),
    birthDate: z.string().nullable().optional(),
    birthPlace: z.string().max(255).nullable().optional(),
    residence: z.string().max(255).nullable().optional(),
    sexe: sexeEnum.nullable().optional(),
    givingDate: z.string().nullable().optional(),
    expirationDate: z.string().nullable().optional(),
    phone: z.string().max(20).nullable().optional(),
    email: z.string().email().nullable().optional(),
    idType: idTypeEnum,
    idNumber: z.string().min(1, 'Le numéro d\'identité est requis').max(255),
    idScanUrl: z.string().url().nullable().optional(),
    photoUrl: z.string().url().nullable().optional(),
    isBlacklisted: z.boolean().default(false).optional(),
    blacklistReason: z.string().nullable().optional(),
    company: z.string().max(255).nullable().optional(),
    emergencyContactPhone: z.string().max(20).nullable().optional(),
    emergencyContactName: z.string().max(255).nullable().optional(),
    
});

const createVisitorWithTransform = createVisitorSchema.transform((data) => ({
    ...data,
    // Convertir les chaînes vides et "null" en null
    birthDate: (data.birthDate === '' || data.birthDate === 'null') ? null : data.birthDate,
    birthPlace: (data.birthPlace === '' || data.birthPlace === 'null') ? null : data.birthPlace,
    residence: (data.residence === '' || data.residence === 'null') ? null : data.residence,
    sexe: (data.sexe === '' || data.sexe === 'null') ? null : data.sexe,
    givingDate: (data.givingDate === '' || data.givingDate === 'null') ? null : data.givingDate,
    expirationDate: (data.expirationDate === '' || data.expirationDate === 'null') ? null : data.expirationDate,
    phone: (data.phone === '' || data.phone === 'null') ? null : data.phone,
    email: (data.email === '' || data.email === 'null') ? null : data.email,
    idScanUrl: (data.idScanUrl === '' || data.idScanUrl === 'null') ? null : data.idScanUrl,
    photoUrl: (data.photoUrl === '' || data.photoUrl === 'null') ? null : data.photoUrl,
    blacklistReason: (data.blacklistReason === '' || data.blacklistReason === 'null') ? null : data.blacklistReason,
    company: (data.company === '' || data.company === 'null') ? null : data.company,
    emergencyContactPhone: (data.emergencyContactPhone === '' || data.emergencyContactPhone === 'null') ? null : data.emergencyContactPhone,
    emergencyContactName: (data.emergencyContactName === '' || data.emergencyContactName === 'null') ? null : data.emergencyContactName,
    // checkpointId: (data.checkpointId === '' || data.checkpointId === 'null') ? null : data.checkpointId
}));

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
    createVisitorWithTransform,
    updateVisitorSchema,
    visitorIdSchema,
    visitorQuerySchema,
    blacklistVisitorSchema,
    idTypeEnum
};
