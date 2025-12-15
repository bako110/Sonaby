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
 *     summary: Créer une alerte SOS avec un template prédéfini
 *     description: |
 *       Créer une alerte SOS en utilisant un template prédéfini.
 *       
 *       **Workflow :**
 *       1. Le frontend sélectionne un template et un checkpoint
 *       2. Envoie `checkpointId` et `templateId`
 *       3. Le backend cherche le template dans la table `sos_templates`
 *       4. Récupère le `message` du template
 *       5. Crée un `SosAlert` avec ce message
 *       
 *       **Important :** Le champ `message` dans la requête n'est PAS utilisé.
 *       Le message vient toujours de la table `sos_templates`.
 *     tags: [SOS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - checkpointId
 *               - templateId
 *             properties:
 *               checkpointId:
 *                 type: string
 *                 format: uuid
 *                 example: "770e8400-e29b-41d4-a716-446655440002"
 *                 description: ID du checkpoint concerné (table checkpoints)
 *               templateId:
 *                 type: integer
 *                 example: 1
 *                 description: ID du template dans la table sos_templates
 *               triggeredAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-15T10:30:00Z"
 *                 description: Date/heure du déclenchement (optionnel)
 *             example:
 *               checkpointId: "770e8400-e29b-41d4-a716-446655440002"
 *               templateId: 1
 *     responses:
 *       201:
 *         description: Alerte SOS créée avec succès
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
 *                   example: "SOS créé avec le template 'Urgence médicale'"
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
 *                       description: Message récupéré du template sos_templates
 *                     triggeredBy:
 *                       type: string
 *                       format: uuid
 *                     triggeredAt:
 *                       type: string
 *                       format: date-time
 *                     isResolved:
 *                       type: boolean
 *                     templateId:
 *                       type: integer
 *                       description: ID du template utilisé (sos_templates.id)
 *       400:
 *         description: |
 *           Erreurs possibles :
 *           - Checkpoint non trouvé (table checkpoints)
 *           - Template non trouvé (table sos_templates)
 *           - SOS déjà actif pour ce checkpoint
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Template non trouvé dans sos_templates"
 *       403:
 *         description: Accès refusé (permissions insuffisantes)
 *       500:
 *         description: Erreur serveur interne
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

/**
 * @swagger
 * tags:
 *   name: SOS Templates
 *   description: Gestion des templates de messages SOS
 */

/**
 * @swagger
 * /templates/admin_message:
 *   post:
 *     summary: Créer un nouveau template SOS (alias)
 *     tags:  [SOS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titre
 *               - message
 *             properties:
 *               titre:
 *                 type: string
 *                 example: "Urgence médicale"
 *                 maxLength: 100
 *               message:
 *                 type: string
 *                 example: "Besoin d'aide médicale immédiate"
 *     responses:
 *       201:
 *         description: Template créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SosTemplate'
 *       400:
 *         description: Données invalides
 */
router.post('/templates/admin_message', sosController.create);

/**
 * @swagger
 * /admin_message:
 *   get:
 *     summary: Lister tous les templates SOS (alias)
 *     tags: [SOS]
 *     responses:
 *       200:
 *         description: Liste des templates
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SosTemplate'
 */
router.get('/templates/admin_message', sosController.getAll);

/**
 * @swagger
 * /admin_message/{id}:
 *   get:
 *     summary: Récupérer un template SOS spécifique (alias)
 *     tags: [SOS]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du template
 *     responses:
 *       200:
 *         description: Template trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SosTemplate'
 *       404:
 *         description: Template non trouvé
 */
router.get('/admin_message/:id', sosController.getById);

/**
 * @swagger
 * /admin_message/{id}:
 *   put:
 *     summary: Mettre à jour un template SOS (alias)
 *     tags: [SOS]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du template
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titre
 *               - message
 *             properties:
 *               titre:
 *                 type: string
 *                 example: "Urgence médicale modifiée"
 *                 maxLength: 100
 *               message:
 *                 type: string
 *                 example: "Besoin d'une ambulance rapidement"
 *     responses:
 *       200:
 *         description: Template mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SosTemplate'
 *       404:
 *         description: Template non trouvé
 *       400:
 *         description: Données invalides
 */
router.put('/templates/admin_message/:id', sosController.update);

/**
 * @swagger
 * /admin_message/{id}:
 *   delete:
 *     summary: Supprimer un template SOS (alias)
 *     tags: [SOS]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du template
 *     responses:
 *       200:
 *         description: Template supprimé
 *       404:
 *         description: Template non trouvé
 */
router.delete('/templates/admin_message/:id', sosController.delete);

module.exports = router;
