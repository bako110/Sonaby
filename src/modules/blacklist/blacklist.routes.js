const express = require('express');
const blacklistController = require('./blacklist.controller');
const { authenticateToken } = require('../../middleware/authMiddleware');

const router = express.Router();
router.use(authenticateToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     BlacklistStatus:
 *       type: object
 *       properties:
 *         visitor:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *             phone:
 *               type: string
 *             email:
 *               type: string
 *             company:
 *               type: string
 *         isBlacklisted:
 *           type: boolean
 *         blacklistType:
 *           type: string
 *           enum: [SYSTEM, AGENT, NONE]
 *         systemBlacklist:
 *           type: object
 *           properties:
 *             isActive:
 *               type: boolean
 *             reason:
 *               type: string
 *         agentBlacklist:
 *           type: object
 *           properties:
 *             isActive:
 *               type: boolean
 *             reason:
 *               type: string
 *             createdBy:
 *               type: object
 *             createdAt:
 *               type: string
 *             severityLevel:
 *               type: integer
 *     
 *     AddBlacklistRequest:
 *       type: object
 *       required:
 *         - reason
 *       properties:
 *         reason:
 *           type: string
 *           description: Raison de l'ajout à la blacklist
 *           example: "Comportement agressif envers le personnel"
 *         severityLevel:
 *           type: integer
 *           minimum: 1
 *           maximum: 4
 *           default: 1
 *           description: Niveau de gravité (1=faible, 4=critique)
 *         incidentDate:
 *           type: string
 *           format: date-time
 *           description: Date de l'incident
 *         incidentLocation:
 *           type: string
 *           description: Lieu de l'incident
 *           example: "Hall d'accueil, Site Principal"
 */

/**
 * @swagger
 * /api/blacklist:
 *   get:
 *     summary: Lister tous les visiteurs blacklistés
 *     tags: [Blacklist]
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: [SYSTEM, AGENT, ALL]
 *           default: ALL
 *         description: Type de blacklist à filtrer
 *       - in: query
 *         name: severityLevel
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 4
 *         description: Niveau de gravité à filtrer
 *     responses:
 *       200:
 *         description: Liste des visiteurs blacklistés
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
 *                     visitors:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/BlacklistStatus'
 *                     pagination:
 *                       type: object
 */
router.get('/', blacklistController.getAllBlacklisted);

/**
 * @swagger
 * /api/blacklist/visitor/{id}:
 *   get:
 *     summary: Vérifier le statut blacklist d'un visiteur
 *     tags: [Blacklist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du visiteur
 *     responses:
 *       200:
 *         description: Statut blacklist du visiteur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/BlacklistStatus'
 *       404:
 *         description: Visiteur non trouvé
 */
router.get('/visitor/:id', blacklistController.checkVisitorBlacklist);

/**
 * @swagger
 * /api/blacklist/visitor/{id}:
 *   post:
 *     summary: Ajouter un visiteur à la blacklist (agents seulement)
 *     tags: [Blacklist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du visiteur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddBlacklistRequest'
 *     responses:
 *       201:
 *         description: Visiteur ajouté à la blacklist avec succès
 *       400:
 *         description: Erreur de validation ou visiteur déjà blacklisté
 *       403:
 *         description: Accès refusé - permissions insuffisantes
 */
router.post('/visitor/:id', blacklistController.addToBlacklist);

/**
 * @swagger
 * /api/blacklist/visitor/{id}:
 *   delete:
 *     summary: Retirer un visiteur de la blacklist agent
 *     tags: [Blacklist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du visiteur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Raison du retrait de la blacklist
 *                 example: "Malentendu résolu, comportement corrigé"
 *     responses:
 *       200:
 *         description: Visiteur retiré de la blacklist avec succès
 *       400:
 *         description: Visiteur non blacklisté par un agent
 *       403:
 *         description: Accès refusé - permissions insuffisantes
 */
router.delete('/visitor/:id', blacklistController.removeFromBlacklist);

/**
 * @swagger
 * /api/blacklist/visitor/{id}/history:
 *   get:
 *     summary: Obtenir l'historique des blacklists d'un visiteur
 *     tags: [Blacklist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du visiteur
 *     responses:
 *       200:
 *         description: Historique des blacklists du visiteur
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
 *                     visitor:
 *                       type: object
 *                     history:
 *                       type: array
 *                       items:
 *                         type: object
 *       404:
 *         description: Visiteur non trouvé
 */
router.get('/visitor/:id/history', blacklistController.getVisitorHistory);

module.exports = router;
