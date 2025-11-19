const express = require('express');
const fileController = require('./file.controller');
const { upload } = require('../../config/multer');
const { authenticateToken } = require('../../middleware/authMiddleware');

const router = express.Router();

// Middleware d'authentification pour toutes les routes
router.use(authenticateToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     File:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID unique du fichier
 *         originalName:
 *           type: string
 *           description: Nom original du fichier
 *         mimeType:
 *           type: string
 *           description: Type MIME du fichier
 *         size:
 *           type: integer
 *           description: Taille du fichier en bytes
 *         path:
 *           type: string
 *           description: Chemin du fichier sur le serveur
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création
 */

/**
 * @swagger
 * /api/v1/files/upload:
 *   post:
 *     summary: Upload d'un fichier unique
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Fichier à uploader
 *     responses:
 *       201:
 *         description: Fichier uploadé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/File'
 *       400:
 *         description: Aucun fichier fourni
 *       500:
 *         description: Erreur serveur
 */
router.post('/upload', upload.single('file'), fileController.uploadSingle);

/**
 * @swagger
 * /api/files/upload-multiple:
 *   post:
 *     summary: Upload de fichiers multiples
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Fichiers à uploader (max 5)
 *     responses:
 *       201:
 *         description: Fichiers uploadés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/File'
 *       400:
 *         description: Aucun fichier fourni
 *       500:
 *         description: Erreur serveur
 */
router.post('/upload-multiple', upload.array('files', 5), fileController.uploadMultiple);

/**
 * @swagger
 * /api/files:
 *   get:
 *     summary: Récupérer tous les fichiers avec pagination
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Liste des fichiers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/File'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 */
router.get('/', fileController.getAllFiles);

/**
 * @swagger
 * /api/files/search:
 *   get:
 *     summary: Rechercher des fichiers
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Terme de recherche
 *       - in: query
 *         name: mimeType
 *         schema:
 *           type: string
 *         description: Filtrer par type MIME
 *     responses:
 *       200:
 *         description: Résultats de recherche
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/File'
 *                 count:
 *                   type: integer
 */
router.get('/search', fileController.searchFiles);

/**
 * @swagger
 * /api/files/stats:
 *   get:
 *     summary: Statistiques des fichiers
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques des fichiers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalFiles:
 *                       type: integer
 *                     totalSize:
 *                       type: integer
 *                     mimeTypeDistribution:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           mimeType:
 *                             type: string
 *                           _count:
 *                             type: object
 *                             properties:
 *                               mimeType:
 *                                 type: integer
 */
router.get('/stats', fileController.getFileStats);

/**
 * @swagger
 * /api/files/{id}:
 *   get:
 *     summary: Récupérer les métadonnées d'un fichier
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du fichier
 *     responses:
 *       200:
 *         description: Métadonnées du fichier
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/File'
 *       404:
 *         description: Fichier non trouvé
 */
router.get('/:id', fileController.getFileById);

/**
 * @swagger
 * /api/files/{id}/download:
 *   get:
 *     summary: Télécharger un fichier
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du fichier
 *     responses:
 *       200:
 *         description: Fichier téléchargé
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Fichier non trouvé
 */
router.get('/:id/download', fileController.downloadFile);

/**
 * @swagger
 * /api/files/{id}/view:
 *   get:
 *     summary: Visualiser un fichier dans le navigateur
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du fichier
 *     responses:
 *       200:
 *         description: Fichier affiché
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Fichier non trouvé
 */
router.get('/:id/view', fileController.viewFile);

/**
 * @swagger
 * /api/files/{id}:
 *   delete:
 *     summary: Supprimer un fichier
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du fichier
 *     responses:
 *       200:
 *         description: Fichier supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Fichier non trouvé
 */
router.delete('/:id', fileController.deleteFile);

module.exports = router;