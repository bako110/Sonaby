const { z } = require('zod');
const fs = require('fs');
const path = require('path');

// Enum pour les types d'identité
const idTypeEnum = z.enum(['CNI', 'PASSEPORT', 'PERMIS_CONDUITE']);

// Enum pour le sexe
const sexeEnum = z.enum(['M', 'F', 'HOMME', 'FEMME']);

// Validation Base64/URL/null/empty
const base64OrUrlOrNull = z.string()
  .nullable()
  .optional()
  .refine(val => {
    if (!val || val === '' || val === null || val === undefined) return true;

    // Base64
    if (val.startsWith('data:') && val.includes('base64,')) {
      const base64Part = val.split(',')[1];
      if (!base64Part) return false;
      return /^[A-Za-z0-9+/]*={0,2}$/.test(base64Part);
    }

    // URL
    if (val.startsWith('http://') || val.startsWith('https://')) {
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    }

    // "null" string
    if (val.toLowerCase() === 'null') return true;

    return false;
  }, {
    message: 'Doit être Base64, URL http/https, null ou vide'
  })
  .or(z.literal('').transform(() => null))
  .or(z.literal('null').transform(() => null))
  .or(z.null());

// Schema principal
const createVisitorSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  idType: idTypeEnum,
  idNumber: z.string().min(1).max(255),
  idScanUrl: base64OrUrlOrNull,
  photoUrl: base64OrUrlOrNull,
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

// Transformation + sauvegarde Base64
const createVisitorWithTransform = createVisitorSchema.transform((data) => {

  const saveBase64File = (fieldValue, defaultName) => {
    if (!fieldValue || fieldValue === '' || fieldValue === null || fieldValue === 'null') return null;

    if (fieldValue.startsWith('data:')) {
      const match = fieldValue.match(/^data:([^;]+);base64,/);
      if (!match) return { isBase64: false, url: fieldValue };

      const mimeType = match[1];
      const base64Data = fieldValue.replace(/^data:[^;]+;base64,/, '');
      let extension = 'jpg';
      if (mimeType.includes('png')) extension = 'png';
      else if (mimeType.includes('pdf')) extension = 'pdf';
      else if (mimeType.includes('jpeg')) extension = 'jpg';

      // Nom et chemin du fichier
      const fileName = `${defaultName}_${Date.now()}.${extension}`;
      const uploadDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, fileName);

      // Sauvegarde physique
      fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

      return {
        isBase64: true,
        fileName,
        mimeType,
        filePath
      };
    }

    // URL normale
    return {
      isBase64: false,
      url: fieldValue
    };
  };

  return {
    firstName: data.firstName,
    lastName: data.lastName,
    idType: data.idType,
    idNumber: data.idNumber,
    _idScanData: saveBase64File(data.idScanUrl, 'idscan'),
    _photoData: saveBase64File(data.photoUrl, 'photo'),
    idScanUrl: data.idScanUrl === '' || data.idScanUrl === 'null' ? null : data.idScanUrl,
    photoUrl: data.photoUrl === '' || data.photoUrl === 'null' ? null : data.photoUrl,
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
