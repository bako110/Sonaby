const express = require('express');
const serviceController = require('./service.controller');
const { authenticateToken } = require('../../middleware/authMiddleware');

const router = express.Router();

// Middleware d'authentification pour toutes les routes
router.use(authenticateToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     Service:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID unique du service
 *         name:
 *           type: string
 *           description: Nom du service
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de mise à jour
 *     CreateServiceRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Nom du service
 *           maxLength: 100
 *     UpdateServiceRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Nom du service
 *           maxLength: 100
 */

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Récupérer tous les services
 *     tags: [Services]
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
 *         description: Recherche par nom
 *     responses:
 *       200:
 *         description: Liste des services
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
 *                     $ref: '#/components/schemas/Service'
 *                 pagination:
 *                   type: object
 */
router.get('/', serviceController.getAllServices);

/**
 * @swagger
 * /api/services/stats:
 *   get:
 *     summary: Statistiques des services
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques des services
 */
router.get('/stats', serviceController.getServiceStats);

/**
 * @swagger
 * /api/services:
 *   post:
 *     summary: Créer un nouveau service
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateServiceRequest'
 *     responses:
 *       201:
 *         description: Service créé avec succès
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
 *                   $ref: '#/components/schemas/Service'
 *       403:
 *         description: Accès refusé - ADMIN requis
 */
router.post('/', serviceController.createService);

/**
 * @swagger
 * /api/services/{id}:
 *   get:
 *     summary: Récupérer un service par ID
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du service
 *     responses:
 *       200:
 *         description: Détails du service
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Service'
 *       404:
 *         description: Service non trouvé
 */
router.get('/:id', serviceController.getServiceById);

/**
 * @swagger
 * /api/services/{id}/activity:
 *   get:
 *     summary: Récupérer l'activité d'un service
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du service
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Nombre de jours d'historique
 *     responses:
 *       200:
 *         description: Activité du service
 *       404:
 *         description: Service non trouvé
 */
router.get('/:id/activity', serviceController.getServiceActivity);

/**
 * @swagger
 * /api/services/{id}:
 *   put:
 *     summary: Mettre à jour un service
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du service
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateServiceRequest'
 *     responses:
 *       200:
 *         description: Service mis à jour avec succès
 *       403:
 *         description: Accès refusé - ADMIN requis
 *       404:
 *         description: Service non trouvé
 */
router.put('/:id', serviceController.updateService);

/**
 * @swagger
 * /api/services/{id}:
 *   delete:
 *     summary: Supprimer un service
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du service
 *     responses:
 *       200:
 *         description: Service supprimé avec succès
 *       403:
 *         description: Accès refusé - ADMIN requis
 *       404:
 *         description: Service non trouvé
 *       400:
 *         description: Service a des visites ou rendez-vous associés
 */
router.delete('/:id', serviceController.deleteService);

module.exports = router;
