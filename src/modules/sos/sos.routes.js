const express = require('express');
const sosController = require('./sos.controller');
const { authenticateToken } = require('../../middleware/authMiddleware');

const router = express.Router();
router.use(authenticateToken);

router.get('/', sosController.getAllSOS);
router.get('/active', sosController.getActiveSOS);
router.get('/stats', sosController.getSOSStats);
router.post('/', sosController.createSOS);

/**
 * @swagger
 * /api/v1/sos/general:
 *   post:
 *     summary: Créer une alerte SOS générale pour un checkpoint
 *     tags: [SOS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGeneralSOSInput'
 *     responses:
 *       201:
 *         description: Alerte SOS générale créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Alerte SOS générale déclenchée avec succès"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     checkpointId:
 *                       type: string
 *                       format: uuid
 *                     message:
 *                       type: string
 *                     triggeredBy:
 *                       type: string
 *                       format: uuid
 *                     isResolved:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Données invalides ou checkpoint non trouvé
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur serveur
 */
router.post('/general', sosController.createGeneralSOS);
router.get('/:id', sosController.getSOSById);
router.patch('/:id', sosController.deactivateSOS);

module.exports = router;
