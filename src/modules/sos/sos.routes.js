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
 *     summary: Déclencher une alerte SOS générale automatique pour un checkpoint
 *     description: Déclenche automatiquement une alerte SOS générale avec un message prédéfini. Un seul paramètre requis : checkpointId. Le message est généré automatiquement au format "ALERTE GÉNÉRALE - [Nom du checkpoint]"
 *     tags: [SOS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGeneralSOSInput'
 *           example:
 *             checkpointId: "770e8400-e29b-41d4-a716-446655440002"
 *     responses:
 *       201:
 *         description: Alerte SOS générale déclenchée automatiquement
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
 *                   example: "SOS général déclenché automatiquement"
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
 *                       example: "ALERTE GÉNÉRALE - Portail Principal"
 *                     triggeredBy:
 *                       type: string
 *                       format: uuid
 *                     isResolved:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Checkpoint non trouvé
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur serveur
 */
router.post('/general', sosController.createGeneralSOS);
router.get('/:id', sosController.getSOSById);
router.patch('/:id', sosController.deactivateSOS);

module.exports = router;
