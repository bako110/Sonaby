const express = require('express');
const visitController = require('./visit.controller');
const { authenticateToken } = require('../../middleware/authMiddleware');

const router = express.Router();
router.use(authenticateToken);

/**
 * @swagger
 * /api/v1/visits/filter:
 *   get:
 *     summary: Récupérer les visites avec filtres avancés et options automatiques
 *     tags: [Visits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Recherche textuelle (entité visitée, contact, origine, raison, notes, visiteur)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [present, left, refused, cancelled]
 *         description: Statut de la visite
 *       - in: query
 *         name: visitorId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrer par visiteur
 *       - in: query
 *         name: checkpointId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrer par checkpoint
 *       - in: query
 *         name: siteId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrer par site
 *       - in: query
 *         name: serviceId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrer par service
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Date d'entrée début
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Date d'entrée fin
 *       - in: query
 *         name: dateCreationDebut
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de création début
 *       - in: query
 *         name: dateCreationFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de création fin
 *       - in: query
 *         name: withIncidents
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filtrer visites avec/sans incidents
 *       - in: query
 *         name: overdue
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filtrer visites en retard (plus de 8h)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Visites filtrées récupérées avec succès
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
 *                   example: "Visites filtrées récupérées avec succès"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Visit'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     hasNext:
 *                       type: boolean
 *                     hasPrev:
 *                       type: boolean
 *                 filterOptions:
 *                   type: object
 *                   description: Options de filtre dynamiques
 *                 filters:
 *                   type: object
 *                   description: Filtres appliqués
 *       400:
 *         description: Requête invalide
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur serveur
 */
router.get('/filter', visitController.getFilteredVisits);

/**
 * @swagger
 * /api/v1/visits/filter-options:
 *   get:
 *     summary: Récupérer les options de filtre dynamiques pour les visites
 *     tags: [Visits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Pré-filtrer les options par statut
 *       - in: query
 *         name: siteId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Pré-filtrer les options par site
 *       - in: query
 *         name: checkpointId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Pré-filtrer les options par checkpoint
 *       - in: query
 *         name: serviceId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Pré-filtrer les options par service
 *     responses:
 *       200:
 *         description: Options de filtre récupérées avec succès
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
 *                   example: "Options de filtre récupérées avec succès"
 *                 data:
 *                   type: object
 *                   properties:
 *                     statuses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: string
 *                             example: "present"
 *                           label:
 *                             type: string
 *                             example: "present"
 *                           count:
 *                             type: integer
 *                             example: 25
 *                     origins:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: string
 *                             example: "Entreprise"
 *                           label:
 *                             type: string
 *                             example: "Entreprise"
 *                           count:
 *                             type: integer
 *                             example: 15
 *                     reasons:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: string
 *                             example: "Réunion"
 *                           label:
 *                             type: string
 *                             example: "Réunion"
 *                           count:
 *                             type: integer
 *                             example: 8
 *                     sites:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: string
 *                             format: uuid
 *                           label:
 *                             type: string
 *                             example: "Siège Social (PAR001)"
 *                           count:
 *                             type: integer
 *                             example: 12
 *                           city:
 *                             type: string
 *                             example: "Paris"
 *                     services:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: string
 *                             format: uuid
 *                           label:
 *                             type: string
 *                             example: "IT Support (technical)"
 *                           count:
 *                             type: integer
 *                             example: 5
 *                           type:
 *                             type: string
 *                             example: "technical"
 *                     checkpoints:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: string
 *                             format: uuid
 *                           label:
 *                             type: string
 *                             example: "Portail Principal (Zone A)"
 *                           count:
 *                             type: integer
 *                             example: 8
 *                           zone:
 *                             type: string
 *                             example: "Zone A"
 *                           checkpointType:
 *                             type: string
 *                             example: "entry"
 *                           site:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 format: uuid
 *                               name:
 *                                 type: string
 *                                 example: "Siège Social"
 *                               code:
 *                                 type: string
 *                                 example: "PAR001"
 *       400:
 *         description: Requête invalide
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur serveur
 */
router.get('/filter-options', visitController.getFilterOptions);

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
