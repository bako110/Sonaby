const express = require('express');
const agentController = require('./agent.controller');
const { authenticateToken } = require('../../middleware/authMiddleware');

const router = express.Router();

// Middleware d'authentification pour toutes les routes
router.use(authenticateToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     AgentControle:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID unique de l'agent
 *         firstname:
 *           type: string
 *           description: Prénom de l'agent
 *         lastname:
 *           type: string
 *           description: Nom de l'agent
 *         email:
 *           type: string
 *           format: email
 *           description: Email de l'agent
 *         checkpointId:
 *           type: string
 *           nullable: true
 *           description: ID du checkpoint assigné
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de mise à jour
 *         checkpoint:
 *           $ref: '#/components/schemas/Checkpoint'
 *     CreateAgentRequest:
 *       type: object
 *       required:
 *         - firstname
 *         - lastname
 *         - email
 *         - password
 *       properties:
 *         firstname:
 *           type: string
 *           description: Prénom de l'agent
 *           maxLength: 50
 *         lastname:
 *           type: string
 *           description: Nom de l'agent
 *           maxLength: 50
 *         email:
 *           type: string
 *           format: email
 *           description: Email de l'agent
 *         password:
 *           type: string
 *           minLength: 8
 *           description: Mot de passe de l'agent
 *         checkpointId:
 *           type: string
 *           description: ID du checkpoint à assigner (optionnel)
 *     UpdateAgentRequest:
 *       type: object
 *       properties:
 *         firstname:
 *           type: string
 *           description: Prénom de l'agent
 *           maxLength: 50
 *         lastname:
 *           type: string
 *           description: Nom de l'agent
 *           maxLength: 50
 *         email:
 *           type: string
 *           format: email
 *           description: Email de l'agent
 *         password:
 *           type: string
 *           minLength: 8
 *           description: Nouveau mot de passe
 *         checkpointId:
 *           type: string
 *           nullable: true
 *           description: ID du checkpoint à assigner
 */

/**
 * @swagger
 * /api/agents:
 *   get:
 *     summary: Récupérer tous les agents de contrôle
 *     tags: [Agents de contrôle]
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
 *         description: Recherche par nom, prénom ou email
 *       - in: query
 *         name: checkpointId
 *         schema:
 *           type: string
 *         description: Filtrer par checkpoint
 *     responses:
 *       200:
 *         description: Liste des agents de contrôle
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
 *                     $ref: '#/components/schemas/AgentControle'
 *                 pagination:
 *                   type: object
 *       403:
 *         description: Accès refusé - ADMIN requis
 */
router.get('/', agentController.getAllAgents);

/**
 * @swagger
 * /api/agents/stats:
 *   get:
 *     summary: Statistiques des agents de contrôle
 *     tags: [Agents de contrôle]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques des agents
 *       403:
 *         description: Accès refusé - ADMIN requis
 */
router.get('/stats', agentController.getAgentStats);

/**
 * @swagger
 * /api/agents:
 *   post:
 *     summary: Créer un nouvel agent de contrôle
 *     tags: [Agents de contrôle]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAgentRequest'
 *     responses:
 *       201:
 *         description: Agent créé avec succès
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
 *                   $ref: '#/components/schemas/AgentControle'
 *       403:
 *         description: Accès refusé - ADMIN requis
 *       400:
 *         description: Email déjà utilisé ou checkpoint non trouvé
 */
router.post('/', agentController.createAgent);

/**
 * @swagger
 * /api/agents/{id}:
 *   get:
 *     summary: Récupérer un agent par ID
 *     tags: [Agents de contrôle]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'agent
 *     responses:
 *       200:
 *         description: Détails de l'agent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/AgentControle'
 *       403:
 *         description: Accès refusé - ADMIN requis
 *       404:
 *         description: Agent non trouvé
 */
router.get('/:id', agentController.getAgentById);

/**
 * @swagger
 * /api/agents/{id}:
 *   put:
 *     summary: Mettre à jour un agent
 *     tags: [Agents de contrôle]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'agent
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAgentRequest'
 *     responses:
 *       200:
 *         description: Agent mis à jour avec succès
 *       403:
 *         description: Accès refusé - ADMIN requis
 *       404:
 *         description: Agent non trouvé
 *       400:
 *         description: Email déjà utilisé
 */
router.put('/:id', agentController.updateAgent);

/**
 * @swagger
 * /api/agents/{id}:
 *   delete:
 *     summary: Supprimer un agent
 *     tags: [Agents de contrôle]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'agent
 *     responses:
 *       200:
 *         description: Agent supprimé avec succès
 *       403:
 *         description: Accès refusé - ADMIN requis
 *       404:
 *         description: Agent non trouvé
 */
router.delete('/:id', agentController.deleteAgent);

/**
 * @swagger
 * /api/agents/{id}/assign-checkpoint:
 *   post:
 *     summary: Assigner un agent à un checkpoint
 *     tags: [Agents de contrôle]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'agent
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - checkpointId
 *             properties:
 *               checkpointId:
 *                 type: string
 *                 description: ID du checkpoint
 *     responses:
 *       200:
 *         description: Agent assigné avec succès
 *       403:
 *         description: Accès refusé - ADMIN requis
 *       404:
 *         description: Agent ou checkpoint non trouvé
 */
router.post('/:id/assign-checkpoint', agentController.assignToCheckpoint);

module.exports = router;
