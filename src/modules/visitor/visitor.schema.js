const { z } = require('zod');
const { optionalEmailValidation } = require('../../utils/validation');

// Enum pour les types d'identité
const idTypeEnum = z.enum(['CNI', 'PASSEPORT', 'PERMIS_CONDUITE']);

// Enum pour le sexe
const sexeEnum = z.enum(['M', 'F', 'HOMME', 'FEMME']);

// Validation PLUS PERMISSIVE: accepte Base64, URL, null, ou chaîne vide
const base64OrUrlOrNull = z.string()
    .nullable()
    .optional()
    .refine(val => {
        // Si vide/null, c'est OK
        if (!val || val === '' || val === null || val === undefined) return true;
        
        // Cas 1: C'est un Data URI Base64
        if (val.startsWith('data:') && val.includes('base64,')) {
            const base64Part = val.split(',')[1];
            // Vérifier que c'est du Base64 valide
            if (!base64Part) return false;
            return /^[A-Za-z0-9+/]*={0,2}$/.test(base64Part);
        }
        
        // Cas 2: C'est une URL normale
        if (val.startsWith('http://') || val.startsWith('https://')) {
            try {
                new URL(val);
                return true;
            } catch {
                return false;
            }
        }
        
        // Cas 3: C'est "null" comme string (pour compatibilité)
        if (val.toLowerCase() === 'null') return true;
        
        return false;
    }, {
        message: 'Doit être: 1) data:[mime-type];base64,[data] 2) URL http/https 3) null 4) chaîne vide'
    })
    .or(z.literal('').transform(() => null))
    .or(z.literal('null').transform(() => null))
    .or(z.null());

const createVisitorSchema = z.object({
    // OBLIGATOIRES
    firstName: z.string().min(1, 'Le prénom est requis').max(100),
    lastName: z.string().min(1, 'Le nom est requis').max(100),
    idType: idTypeEnum,
    idNumber: z.string().min(1, 'Le numéro d\'identité est requis').max(255),
    
    // URLS - OPTIONNELLES maintenant
    idScanUrl: base64OrUrlOrNull,
    photoUrl: base64OrUrlOrNull,
    
    // OPTIONNELS
    birthDate: z.string().nullable().optional(),
    birthPlace: z.string().max(255).nullable().optional(),
    residence: z.string().max(255).nullable().optional(),
    sexe: sexeEnum.nullable().optional(),
    givingDate: z.string().nullable().optional(),
    expirationDate: z.string().nullable().optional(),
    phone: z.string().max(20).nullable().optional(),
    email: z.string().email('Email invalide').nullable().optional(),
    isBlacklisted: z.boolean().default(false).optional(),
    blacklistReason: z.string().nullable().optional(),
    company: z.string().max(255).nullable().optional(),
    emergencyContactPhone: z.string().max(20).nullable().optional(),
    emergencyContactName: z.string().max(255).nullable().optional(),
})
// ⬇️ SUPPRIME les validations obligatoires pour les fichiers ⬇️
// .refine(data => {
//     // VALIDATION: idScanUrl obligatoire - MAINTENANT OPTIONNEL
//     if (!data.idScanUrl || data.idScanUrl === '' || data.idScanUrl === null) {
//         return false;
//     }
//     return true;
// }, {
//     message: 'Le scan d\'identité (idScanUrl) est requis',
//     path: ['idScanUrl']
// })
// .refine(data => {
//     // VALIDATION: photoUrl obligatoire - MAINTENANT OPTIONNEL
//     if (!data.photoUrl || data.photoUrl === '' || data.photoUrl === null) {
//         return false;
//     }
//     return true;
// }, {
//     message: 'La photo (photoUrl) est requise',
//     path: ['photoUrl']
// })
.refine(data => {
    // Rejeter les chemins locaux (sauf Base64)
    if (data.photoUrl && typeof data.photoUrl === 'string') {
        // Si c'est Base64, c'est OK
        if (data.photoUrl.startsWith('data:')) return true;
        // Si c'est null ou vide, OK
        if (data.photoUrl.toLowerCase() === 'null' || data.photoUrl === '') return true;
        
        // Sinon rejeter les chemins locaux
        return !data.photoUrl.startsWith('/uploads/') && 
               !data.photoUrl.startsWith('uploads/');
    }
    return true;
}, {
    message: 'photoUrl doit être Base64, URL complète, null ou vide',
    path: ['photoUrl']
})
.refine(data => {
    if (data.idScanUrl && typeof data.idScanUrl === 'string') {
        // Si c'est Base64, c'est OK
        if (data.idScanUrl.startsWith('data:')) return true;
        // Si c'est null ou vide, OK
        if (data.idScanUrl.toLowerCase() === 'null' || data.idScanUrl === '') return true;
        
        // Sinon rejeter les chemins locaux
        return !data.idScanUrl.startsWith('/uploads/') && 
               !data.idScanUrl.startsWith('uploads/');
    }
    return true;
}, {
    message: 'idScanUrl doit être Base64, URL complète, null ou vide',
    path: ['idScanUrl']
});

const createVisitorWithTransform = createVisitorSchema
    .transform((data) => {
        // Fonction pour extraire les données Base64 OU garder l'URL
        const processFileField = (fieldValue, defaultName) => {
            if (!fieldValue || fieldValue === '' || fieldValue === null || fieldValue === 'null') {
                return null;
            }
            
            // Si c'est Base64
            if (fieldValue.startsWith('data:')) {
                const match = fieldValue.match(/^data:([^;]+);base64,/);
                if (!match) return { isBase64: false, url: fieldValue };
                
                const mimeType = match[1];
                const base64Data = fieldValue.replace(/^data:[^;]+;base64,/, '');
                
                // Déterminer l'extension
                let extension = 'jpg';
                if (mimeType.includes('png')) extension = 'png';
                else if (mimeType.includes('pdf')) extension = 'pdf';
                else if (mimeType.includes('jpeg')) extension = 'jpg';
                
                return {
                    isBase64: true,
                    fileName: `${defaultName}_${Date.now()}.${extension}`,
                    mimeType: mimeType,
                    base64: base64Data
                };
            }
            
            // Si c'est une URL normale
            return {
                isBase64: false,
                url: fieldValue
            };
        };
        
        const idScanProcessed = processFileField(data.idScanUrl, 'idscan');
        const photoProcessed = processFileField(data.photoUrl, 'photo');
        
        return {
            // Données de base
            firstName: data.firstName,
            lastName: data.lastName,
            idType: data.idType,
            idNumber: data.idNumber,
            
            // Données fichiers traitées (peuvent être null)
            _idScanData: idScanProcessed,
            _photoData: photoProcessed,
            
            // URLs originales (pour référence)
            idScanUrl: data.idScanUrl === '' || data.idScanUrl === 'null' ? null : data.idScanUrl,
            photoUrl: data.photoUrl === '' || data.photoUrl === 'null' ? null : data.photoUrl,
            
            // Optionnels nettoyés
            birthDate: data.birthDate === '' || data.birthDate === 'null' ? null : data.birthDate,
            birthPlace: data.birthPlace === '' || data.birthPlace === 'null' ? null : data.birthPlace,
            residence: data.residence === '' || data.residence === 'null' ? null : data.residence,
            sexe: data.sexe === '' || data.sexe === 'null' ? null : data.sexe,
            givingDate: data.givingDate === '' || data.givingDate === 'null' ? null : data.givingDate,
            expirationDate: data.expirationDate === '' || data.expirationDate === 'null' ? null : data.expirationDate,
            phone: data.phone === '' || data.phone === 'null' ? null : data.phone,
            email: data.email === '' || data.email === 'null' ? null : data.email,
            blacklistReason: data.blacklistReason === '' || data.blacklistReason === 'null' ? null : data.blacklistReason,
            company: data.company === '' || data.company === 'null' ? null : data.company,
            emergencyContactPhone: data.emergencyContactPhone === '' || data.emergencyContactPhone === 'null' ? null : data.emergencyContactPhone,
            emergencyContactName: data.emergencyContactName === '' || data.emergencyContactName === 'null' ? null : data.emergencyContactName,
            isBlacklisted: data.isBlacklisted || false
        };
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
    createVisitorWithTransform,
    updateVisitorSchema,
    visitorIdSchema,
    visitorQuerySchema,
    blacklistVisitorSchema,
    idTypeEnum
};