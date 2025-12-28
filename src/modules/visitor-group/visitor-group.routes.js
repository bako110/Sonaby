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
 *           default: 10
 *     responses:
 *       200:
 *         description: Groupes récupérés avec succès
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
