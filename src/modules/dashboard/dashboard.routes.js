const express = require('express');
const router = express.Router();

const dashboardController = require('./dashboard.controller');
const { authenticateToken } = require('../../middleware/authMiddleware');


router.use(authenticateToken);


/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: API pour les statistiques du dashboard par checkpoint
 */

/**
 * @swagger
 * /api/v1/dashboard/checkpoint-stats:
 *   get:
 *     summary: Récupérer les statistiques pour un checkpoint
 *     description: Retourne les statistiques chiffrées pour un checkpoint spécifique
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: checkpointId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du checkpoint
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Statistiques du checkpoint récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     checkpointId:
 *                       type: string
 *                       format: uuid
 *                       example: "123e4567-e89b-12d3-a456-426614174000"
 *                     checkpointName:
 *                       type: string
 *                       example: "Point de contrôle principal"
 *                     visitsInProgress:
 *                       type: integer
 *                       description: Nombre de visites en cours aujourd'hui
 *                       example: 5
 *                     visitsCompleted:
 *                       type: integer
 *                       description: Nombre de visites terminées aujourd'hui
 *                       example: 15
 *                     totalVisitsToday:
 *                       type: integer
 *                       description: Total des visites pour ce checkpoint (toutes dates)
 *                       example: 500
 */
router.get(
  '/checkpoint-stats', authenticateToken, dashboardController.getCheckpointStats);

module.exports = router;