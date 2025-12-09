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

  /**
 * @swagger
 * tags:
 *   name: VisitorPresent
 *   description: API pour les visiteurs présents par checkpoint
 */

/**
 * @swagger
 * /api/v1/dashboard/visitors-present:
 *   get:
 *     summary: Récupérer les visiteurs présents pour un checkpoint
 *     description: Retourne la liste des visiteurs actuellement présents dans un checkpoint spécifique
 *     tags: [VisitorPresent]
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
 *         description: Liste des visiteurs présents récupérée avec succès
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
 *                     count:
 *                       type: integer
 *                       example: 5
 *                     visitors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           visitId:
 *                             type: string
 *                             format: uuid
 *                           visitor:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 format: uuid
 *                               firstName:
 *                                 type: string
 *                               lastName:
 *                                 type: string
 *                               company:
 *                                 type: string
 *                               phone:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                           visit:
 *                             type: object
 *                             properties:
 *                               entryTime:
 *                                 type: string
 *                                 format: date-time
 *                               reason:
 *                                 type: string
 *                               service:
 *                                 type: string
 *                               checkpoint:
 *                                 type: string
 *                               site:
 *                                 type: string
 *                               siteId:
 *                                 type: string
 *                                 format: uuid
 *                               status:
 *                                 type: string
 *                               exitTime:
 *                                 type: string
 *                                 format: date-time
 *                     checkpointId:
 *                       type: string
 *                       format: uuid
 *                     checkpointName:
 *                       type: string
 *                     siteId:
 *                       type: string
 *                       format: uuid
 *                     siteName:
 *                       type: string
 *                     date:
 *                       type: string
 *                       format: date
 *       400:
 *         description: checkpointId manquant
 *       404:
 *         description: Checkpoint non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/visitors-present', authenticateToken, dashboardController.getVisitorsPresent);

module.exports = router;