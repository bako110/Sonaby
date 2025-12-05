const express = require('express');
const serviceController = require('./service.controller');
const { authenticateToken } = require('../../middleware/authMiddleware');

const router = express.Router();

// Middleware d'authentification pour toutes les routes
router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Services
 *   description: Gestion des sites et des agents affectés
 */

/**
 * @swagger
 * /api/v1/services/sites/{siteId}/assign/{userId}:
 *   post:
 *     summary: Affecter un agent à un site
 *     tags: [Sites]
 *     parameters:
 *       - in: path
 *         name: siteId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du site
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l’agent
 *     responses:
 *       200:
 *         description: Agent affecté avec succès
 *       404:
 *         description: Site ou utilisateur introuvable
 */
router.post("/sites/:siteId/assign/:userId", serviceController.assignAgent);

/**
 * @swagger
 * /api/v1/services/sites/{siteId}/agents:
 *   get:
 *     summary: Lister tous les agents affectés à un site
 *     tags: [Sites]
 *     parameters:
 *       - in: path
 *         name: siteId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du site
 *     responses:
 *       200:
 *         description: Liste des agents du site
 */
router.get("/sites/:siteId/agents", serviceController.getSiteAgents);

/**
 * @swagger
 * /api/v1/services/sites/{siteId}/agent/{userId}:
 *   delete:
 *     summary: Retirer un agent d’un site
 *     tags: [Sites]
 *     parameters:
 *       - in: path
 *         name: siteId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du site
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l’agent
 *     responses:
 *       200:
 *         description: Agent retiré avec succès
 *       404:
 *         description: Site ou agent introuvable
 */
router.delete("/sites/:siteId/agent/:userId", serviceController.removeAgent);

module.exports = router;
