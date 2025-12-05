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
/**
 * @swagger
 * tags:
 *   name: SOS
 *   description: Gestion des alertes SOS générales
 */

/**
 * @swagger
 * /sos:
 *   post:
 *     summary: Créer une alerte SOS générale
 *     tags: [SOS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               params:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                     maxLength: 255
 *                     example: "Urgence générale"
 *                   description:
 *                     type: string
 *                     example: "Un SOS a été déclenché sans checkpoint spécifique"
 *     responses:
 *       201:
 *         description: Alerte SOS créée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 sos:
 *                   type: object
 *       400:
 *         description: Erreur de validation ou création
 */
router.post('/', sosController.createSOS);

/**
 * @swagger
 * /sos:
 *   get:
 *     summary: Récupérer la liste des SOS générales
 *     tags: [SOS]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           description: Rechercher dans le titre ou description
 *       - in: query
 *         name: isResolved
 *         schema:
 *           type: boolean
 *           description: Filtrer par statut résolu
 *     responses:
 *       200:
 *         description: Liste des SOS
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
 *                     type: object
 *       400:
 *         description: Erreur lors de la récupération
 */
router.get('/', sosController.getSOSList);

/**
 * @swagger
 * /sos/{id}/resolve:
 *   patch:
 *     summary: Résoudre une alerte SOS
 *     tags: [SOS]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'alerte SOS
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resolvedBy:
 *                 type: string
 *                 format: uuid
 *                 description: ID de l'utilisateur qui résout le SOS
 *               resolvedAt:
 *                 type: string
 *                 format: date-time
 *                 description: Date de résolution (optionnel)
 *               resolutionNotes:
 *                 type: string
 *                 description: Notes sur la résolution
 *     responses:
 *       200:
 *         description: SOS résolu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 sos:
 *                   type: object
 *       400:
 *         description: Erreur lors de la résolution
 */
router.patch('/:id/resolve', sosController.resolveSOS);

module.exports = router;
