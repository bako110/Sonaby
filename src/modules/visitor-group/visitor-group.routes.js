const express = require('express');
const visitorGroupController = require('./visitor-group.controller');
const { authenticateToken } = require('../../middleware/authMiddleware');

const router = express.Router();
router.use(authenticateToken);

/**
 * @swagger
 * /api/v1/visitor-groups/visitors/available:
 *   get:
 *     summary: Récupérer les visiteurs disponibles pour créer un groupe
 *     tags: [VisitorGroups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Visiteurs disponibles
 */
router.get('/visitors/available', visitorGroupController.getAvailableVisitors);

/**
 * @swagger
 * /api/v1/visitor-groups:
 *   post:
 *     summary: Créer un groupe de visiteurs
 *     description: |
 *       Crée un groupe avec un visiteur responsable et une liste d'autres visiteurs.
 *       Les autres visiteurs sont stockés directement comme noms complets.
 *
 *       Workflow:
 *       1. Créer d'abord le visiteur responsable (via POST /api/v1/visitors) et noter son ID
 *       2. Appeler cet endpoint avec l'ID du visiteur responsable + liste des autres visiteurs
 *     tags: [VisitorGroups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - visitorId
 *             properties:
 *               visitorId:
 *                 type: string
 *                 format: uuid
 *                 description: ID du visiteur responsable (déjà créé)
 *               otherVisitors:
 *                 type: array
 *                 description: Autres visiteurs à stocker directement comme noms complets
 *                 items:
 *                   type: string
 *                 example:
 *                   - "Bako Robert"
 *                   - "Amidoi Sanour"
 *     responses:
 *       201:
 *         description: Groupe créé avec succès
 *       400:
 *         description: Validation échouée
 *       404:
 *         description: Visiteur responsable non trouvé
 */
router.post('/', visitorGroupController.createVisitorGroup);

/**
 * @swagger
 * /api/v1/visitor-groups/filter:
 *   get:
 *     summary: Récupérer les groupes avec filtres et pagination
 *     description: Si checkpointId est fourni, retourne uniquement les groupes de la semaine courante (lundi-dimanche) avec la période
 *     tags: [VisitorGroups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Recherche par nom/prénom du visiteur responsable
 *       - in: query
 *         name: checkpointId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du checkpoint (filtre par semaine courante)
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
 *     responses:
 *       200:
 *         description: Groupes récupérés avec succès
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
 *                   example: Groupes récupérés avec succès
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       responsibleVisitor:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                       otherVisitors:
 *                         type: array
 *                         items:
 *                           type: string
 *                       expectedCount:
 *                         type: integer
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *                 periode:
 *                   type: object
 *                   description: Présent uniquement si checkpointId est fourni
 *                   properties:
 *                     debut:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-03-09T23:00:00.000Z"
 *                     fin:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-03-15T22:59:59.999Z"
 *                 date:
 *                   type: string
 *                   format: date
 *                   description: Présent uniquement si checkpointId est fourni
 *                   example: "2026-03-10"
 */
router.get('/filter', visitorGroupController.getFilteredVisitorGroups);

/**
 * @swagger
 * /api/v1/visitor-groups/{id}:
 *   get:
 *     summary: Récupérer un groupe par ID
 *     tags: [VisitorGroups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Groupe détaillé avec responsable et liste des noms complets
 *       404:
 *         description: Groupe non trouvé
 */
router.get('/:id', visitorGroupController.getVisitorGroupById);

module.exports = router;
