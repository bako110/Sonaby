const { z } = require('zod');

const fileUploadSchema = z.object({
  originalname: z.string().min(1, 'Le nom du fichier est requis'),
  mimetype: z.string().min(1, 'Le type MIME est requis'),
  size: z.number().positive('La taille doit être positive').max(10 * 1024 * 1024, 'Fichier trop volumineux (max 10MB)'),
  path: z.string().min(1, 'Le chemin du fichier est requis')
});

const fileQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  search: z.string().optional(),
  mimeType: z.string().optional()
});

const fileIdSchema = z.object({
  id: z.string().cuid('ID de fichier invalide')
});

const fileSearchSchema = z.object({
  query: z.string().min(1, 'La requête de recherche est requise'),
  mimeType: z.string().optional()
});

module.exports = {
  fileUploadSchema,
  fileQuerySchema,
  fileIdSchema,
  fileSearchSchema
};
