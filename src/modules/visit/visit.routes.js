const express = require('express');
const visitController = require('./visit.controller');
const { authenticateToken } = require('../../middleware/authMiddleware');

const router = express.Router();
router.use(authenticateToken);

/**
 * @swagger
 * /api/visits:
 *   get:
 *     summary: Récupérer toutes les visites
 *     tags: [Visites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des visites
 */
router.get('/', visitController.getAllVisits);
router.get('/stats', visitController.getVisitStats);
router.get('/active', visitController.getActiveVisits);

/**
 * @swagger
 * /api/v1/visits/checkpoint/{checkpointId}/daily:
 *   get:
 *     summary: Récupérer les visiteurs d'un checkpoint par jour
 *     tags: [Visites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: checkpointId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du checkpoint
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date pour récupérer les visiteurs (format: YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Liste des visiteurs du checkpoint pour la date spécifiée
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
 *                     date:
 *                       type: string
 *                       example: "2024-11-24"
 *                     checkpoint:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *                         site:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               format: uuid
 *                             name:
 *                               type: string
 *                     visitors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                           email:
 *                             type: string
 *                           phone:
 *                             type: string
 *                           company:
 *                             type: string
 *                           isBlacklisted:
 *                             type: boolean
 *                           visitInfo:
 *                             type: object
 *                             properties:
 *                               visitId:
 *                                 type: string
 *                                 format: uuid
 *                               entryTime:
 *                                 type: string
 *                                 format: date-time
 *                               exitTime:
 *                                 type: string
 *                                 format: date-time
 *                               status:
 *                                 type: string
 *                               reason:
 *                                 type: string
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalVisitors:
 *                           type: integer
 *                         blacklistedCount:
 *                           type: integer
 *                         uniqueCompanies:
 *                           type: integer
 *                         visitsByHour:
 *                           type: object
 *                           additionalProperties:
 *                             type: integer
 *       400:
 *         description: Date manquante ou invalide
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Checkpoint non trouvé
 */
router.get('/checkpoint/:checkpointId/daily', visitController.getVisitorsByCheckpointByDay);
router.post('/', visitController.createVisit);
router.get('/:id', visitController.getVisitById);
router.patch('/:id/checkout', visitController.checkoutVisit);
router.delete('/:id', visitController.deleteVisit);

module.exports = router;
