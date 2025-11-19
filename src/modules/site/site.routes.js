const express = require('express');
const siteController = require('./site.controller');
const { authenticateToken } = require('../../middleware/authMiddleware');

const router = express.Router();

// Middleware d'authentification pour toutes les routes
router.use(authenticateToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     Site:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID unique du site
 *         name:
 *           type: string
 *           description: Nom du site
 *         location:
 *           type: string
 *           description: Localisation du site
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de mise à jour
 *         checkpoints:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Checkpoint'
 *           description: Checkpoints associés au site
 *     CreateSiteRequest:
 *       type: object
 *       required:
 *         - name
 *         - location
 *       properties:
 *         name:
 *           type: string
 *           description: Nom du site
 *           maxLength: 100
 *         location:
 *           type: string
 *           description: Localisation du site
 *           maxLength: 200
 *     UpdateSiteRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Nom du site
 *           maxLength: 100
 *         location:
 *           type: string
 *           description: Localisation du site
 *           maxLength: 200
 */

/**
 * @swagger
 * /api/sites:
 *   get:
 *     summary: Récupérer tous les sites
 *     tags: [Sites]
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Recherche par nom ou localisation
 *     responses:
 *       200:
 *         description: Liste des sites
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
 *                     $ref: '#/components/schemas/Site'
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
router.get('/', siteController.getAllSites);

/**
 * @swagger
 * /api/sites/stats:
 *   get:
 *     summary: Statistiques des sites
 *     tags: [Sites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques des sites
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
 *                     totalSites:
 *                       type: integer
 *                     checkpointsPerSite:
 *                       type: array
 *                       items:
 *                         type: object
 */
router.get('/stats', siteController.getSiteStats);

/**
 * @swagger
 * /api/sites:
 *   post:
 *     summary: Créer un nouveau site
 *     tags: [Sites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSiteRequest'
 *     responses:
 *       201:
 *         description: Site créé avec succès
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
 *                   $ref: '#/components/schemas/Site'
 *       403:
 *         description: Accès refusé - ADMIN requis
 *       400:
 *         description: Données invalides
 */
router.post('/', siteController.createSite);

/**
 * @swagger
 * /api/sites/{id}:
 *   get:
 *     summary: Récupérer un site par ID
 *     tags: [Sites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du site
 *     responses:
 *       200:
 *         description: Détails du site
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Site'
 *       404:
 *         description: Site non trouvé
 */
router.get('/:id', siteController.getSiteById);

/**
 * @swagger
 * /api/sites/{id}:
 *   put:
 *     summary: Mettre à jour un site
 *     tags: [Sites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du site
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSiteRequest'
 *     responses:
 *       200:
 *         description: Site mis à jour avec succès
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
 *                   $ref: '#/components/schemas/Site'
 *       403:
 *         description: Accès refusé - ADMIN requis
 *       404:
 *         description: Site non trouvé
 */
router.put('/:id', siteController.updateSite);

/**
 * @swagger
 * /api/sites/{id}:
 *   delete:
 *     summary: Supprimer un site
 *     tags: [Sites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du site
 *     responses:
 *       200:
 *         description: Site supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       403:
 *         description: Accès refusé - ADMIN requis
 *       404:
 *         description: Site non trouvé
 *       400:
 *         description: Site contient des checkpoints
 */
router.delete('/:id', siteController.deleteSite);

module.exports = router;
