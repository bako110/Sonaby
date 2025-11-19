const express = require('express');
const checkpointController = require('./checkpoint.controller');
const { authenticateToken } = require('../../middleware/authMiddleware');

const router = express.Router();

// Middleware d'authentification pour toutes les routes
router.use(authenticateToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     Checkpoint:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID unique du checkpoint
 *         name:
 *           type: string
 *           description: Nom du checkpoint
 *         siteId:
 *           type: string
 *           description: ID du site associé
 *         sosIdentifier:
 *           type: string
 *           description: Identifiant unique pour les alertes SOS
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de mise à jour
 *         site:
 *           $ref: '#/components/schemas/Site'
 *         agents:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AgentControle'
 *     CreateCheckpointRequest:
 *       type: object
 *       required:
 *         - name
 *         - siteId
 *         - sosIdentifier
 *       properties:
 *         name:
 *           type: string
 *           description: Nom du checkpoint
 *           maxLength: 100
 *         siteId:
 *           type: string
 *           description: ID du site associé
 *         sosIdentifier:
 *           type: string
 *           description: Identifiant unique pour les alertes SOS
 *           maxLength: 50
 *     UpdateCheckpointRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Nom du checkpoint
 *           maxLength: 100
 *         siteId:
 *           type: string
 *           description: ID du site associé
 *         sosIdentifier:
 *           type: string
 *           description: Identifiant unique pour les alertes SOS
 *           maxLength: 50
 *     AssignAgentRequest:
 *       type: object
 *       required:
 *         - agentId
 *       properties:
 *         agentId:
 *           type: string
 *           description: ID de l'agent à assigner
 *     SOSRequest:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Message optionnel pour l'alerte SOS
 */

/**
 * @swagger
 * /api/checkpoints:
 *   get:
 *     summary: Récupérer tous les checkpoints
 *     tags: [Checkpoints]
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
 *         description: Recherche par nom ou identifiant SOS
 *       - in: query
 *         name: siteId
 *         schema:
 *           type: string
 *         description: Filtrer par site
 *     responses:
 *       200:
 *         description: Liste des checkpoints
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
 *                     $ref: '#/components/schemas/Checkpoint'
 *                 pagination:
 *                   type: object
 */
router.get('/', checkpointController.getAllCheckpoints);

/**
 * @swagger
 * /api/checkpoints/stats:
 *   get:
 *     summary: Statistiques des checkpoints
 *     tags: [Checkpoints]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques des checkpoints
 */
router.get('/stats', checkpointController.getCheckpointStats);

/**
 * @swagger
 * /api/checkpoints:
 *   post:
 *     summary: Créer un nouveau checkpoint
 *     tags: [Checkpoints]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCheckpointRequest'
 *     responses:
 *       201:
 *         description: Checkpoint créé avec succès
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
 *                   $ref: '#/components/schemas/Checkpoint'
 *       403:
 *         description: Accès refusé - ADMIN ou AGENT_GESTION requis
 *       400:
 *         description: Données invalides ou identifiant SOS déjà utilisé
 */
router.post('/', checkpointController.createCheckpoint);

/**
 * @swagger
 * /api/checkpoints/{id}:
 *   get:
 *     summary: Récupérer un checkpoint par ID
 *     tags: [Checkpoints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du checkpoint
 *     responses:
 *       200:
 *         description: Détails du checkpoint
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Checkpoint'
 *       404:
 *         description: Checkpoint non trouvé
 */
router.get('/:id', checkpointController.getCheckpointById);

/**
 * @swagger
 * /api/checkpoints/{id}:
 *   put:
 *     summary: Mettre à jour un checkpoint
 *     tags: [Checkpoints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du checkpoint
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCheckpointRequest'
 *     responses:
 *       200:
 *         description: Checkpoint mis à jour avec succès
 *       403:
 *         description: Accès refusé - ADMIN ou AGENT_GESTION requis
 *       404:
 *         description: Checkpoint non trouvé
 *       400:
 *         description: Identifiant SOS déjà utilisé
 */
router.put('/:id', checkpointController.updateCheckpoint);

/**
 * @swagger
 * /api/checkpoints/{id}:
 *   delete:
 *     summary: Supprimer un checkpoint
 *     tags: [Checkpoints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du checkpoint
 *     responses:
 *       200:
 *         description: Checkpoint supprimé avec succès
 *       403:
 *         description: Accès refusé - ADMIN ou AGENT_GESTION requis
 *       404:
 *         description: Checkpoint non trouvé
 *       400:
 *         description: Checkpoint a des visites associées
 */
router.delete('/:id', checkpointController.deleteCheckpoint);

/**
 * @swagger
 * /api/checkpoints/{id}/assign-agent:
 *   post:
 *     summary: Assigner un agent à un checkpoint
 *     tags: [Checkpoints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du checkpoint
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignAgentRequest'
 *     responses:
 *       200:
 *         description: Agent assigné avec succès
 *       403:
 *         description: Accès refusé - ADMIN ou AGENT_GESTION requis
 *       404:
 *         description: Checkpoint ou agent non trouvé
 */
router.post('/:id/assign-agent', checkpointController.assignAgent);

/**
 * @swagger
 * /api/checkpoints/{id}/sos:
 *   post:
 *     summary: Envoyer une alerte SOS depuis un checkpoint
 *     tags: [Checkpoints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du checkpoint
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SOSRequest'
 *     responses:
 *       201:
 *         description: SOS envoyé avec succès
 *       404:
 *         description: Checkpoint non trouvé
 *       400:
 *         description: Un SOS est déjà actif pour ce checkpoint
 */
router.post('/:id/sos', checkpointController.sendSOS);

module.exports = router;
