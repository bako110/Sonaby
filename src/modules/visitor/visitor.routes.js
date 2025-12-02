const express = require('express');
const visitorController = require('./visitor.controller');
const { authenticateToken } = require('../../middleware/authMiddleware');

const router = express.Router();

// Middleware d'authentification pour toutes les routes
router.use(authenticateToken);

/**
 * @swagger
 * /api/v1/visitors/filter:
 *   get:
 *     summary: Récupérer les visiteurs avec filtres avancés et options automatiques
 *     tags: [Visitors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Recherche textuelle (nom, prénom, ID, entreprise, email, téléphone)
 *       - in: query
 *         name: isBlacklisted
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filtrer visiteurs blacklistés ou non
 *       - in: query
 *         name: idType
 *         schema:
 *           type: string
 *           enum: [CNIB, PASSEPORT, PERMIS_CONDUITE, CARTE_CONSULAIRE, AUTRE]
 *         description: Type d'identifiant
 *       - in: query
 *         name: company
 *         schema:
 *           type: string
 *         description: Filtrer par entreprise
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de première visite début
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de première visite fin
 *       - in: query
 *         name: siteId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrer par site visité
 *       - in: query
 *         name: checkpointId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrer par checkpoint visité
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
 *         name: actif
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filtrer visiteurs actifs (avec visites récentes - 30 jours)
 *       - in: query
 *         name: avecBadge
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filtrer visiteurs avec/sans badge
 *       - in: query
 *         name: avecIncidents
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filtrer visiteurs avec/sans incidents
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
 *         description: Visiteurs filtrés récupérés avec succès
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
 *                   example: "Visiteurs filtrés récupérés avec succès"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Visitor'
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
router.get('/filter', visitorController.getFilteredVisitors);

/**
 * @swagger
 * /api/v1/visitors/filter-options:
 *   get:
 *     summary: Récupérer les options de filtre dynamiques pour les visiteurs
 *     tags: [Visitors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: idType
 *         schema:
 *           type: string
 *         description: Pré-filtrer les options par type d'ID
 *       - in: query
 *         name: company
 *         schema:
 *           type: string
 *         description: Pré-filtrer les options par entreprise
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
 *         name: isBlacklisted
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Pré-filtrer les options par statut blacklist
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
 *                     idTypes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: string
 *                             example: "CNIB"
 *                           label:
 *                             type: string
 *                             example: "CNIB"
 *                           count:
 *                             type: integer
 *                             example: 45
 *                     companies:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: string
 *                             example: "TechCorp"
 *                           label:
 *                             type: string
 *                             example: "TechCorp"
 *                           count:
 *                             type: integer
 *                             example: 12
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
 *                             example: 8
 *                           city:
 *                             type: string
 *                             example: "Paris"
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
 *                             example: 5
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
 *                     blacklistOptions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: string
 *                             example: "true"
 *                           label:
 *                             type: string
 *                             example: "Oui"
 *                           count:
 *                             type: integer
 *                             example: 3
 *                     badgeOptions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: string
 *                             example: "true"
 *                           label:
 *                             type: string
 *                             example: "Avec badge"
 *                           count:
 *                             type: integer
 *                             example: 25
 *                     incidentOptions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: string
 *                             example: "true"
 *                           label:
 *                             type: string
 *                             example: "Avec incidents"
 *                           count:
 *                             type: integer
 *                             example: 4
 *       400:
 *         description: Requête invalide
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur serveur
 */
router.get('/filter-options', visitorController.getFilterOptions);

/**
 * @swagger
 * components:
 *   schemas:
 *     Visitor:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID unique du visiteur
 *         firstname:
 *           type: string
 *           description: Prénom du visiteur
 *         lastname:
 *           type: string
 *           description: Nom du visiteur
 *         email:
 *           type: string
 *           format: email
 *           nullable: true
 *           description: Email du visiteur
 *         phone:
 *           type: string
 *           nullable: true
 *           description: Téléphone du visiteur
 *         company:
 *           type: string
 *           nullable: true
 *           description: Entreprise du visiteur
 *         fileId:
 *           type: string
 *           nullable: true
 *           description: ID du fichier justificatif
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de mise à jour
 *         file:
 *           $ref: '#/components/schemas/File'
 *     CreateVisitorRequest:
 *       type: object
 *       required:
 *         - firstname
 *         - lastname
 *       properties:
 *         firstname:
 *           type: string
 *           description: Prénom du visiteur
 *           maxLength: 50
 *         lastname:
 *           type: string
 *           description: Nom du visiteur
 *           maxLength: 50
 *         email:
 *           type: string
 *           format: email
 *           description: Email du visiteur
 *         phone:
 *           type: string
 *           description: Téléphone du visiteur
 *         company:
 *           type: string
 *           description: Entreprise du visiteur
 *           maxLength: 100
 *         fileId:
 *           type: string
 *           description: ID du fichier justificatif
 *     UpdateVisitorRequest:
 *       type: object
 *       properties:
 *         firstname:
 *           type: string
 *           description: Prénom du visiteur
 *           maxLength: 50
 *         lastname:
 *           type: string
 *           description: Nom du visiteur
 *           maxLength: 50
 *         email:
 *           type: string
 *           format: email
 *           description: Email du visiteur
 *         phone:
 *           type: string
 *           description: Téléphone du visiteur
 *         company:
 *           type: string
 *           description: Entreprise du visiteur
 *           maxLength: 100
 *         fileId:
 *           type: string
 *           nullable: true
 *           description: ID du fichier justificatif
 */

/**
 * @swagger
 * /api/visitors:
 *   get:
 *     summary: Récupérer tous les visiteurs
 *     tags: [Visiteurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Recherche par nom, prénom, email ou téléphone
 *       - in: query
 *         name: company
 *         schema:
 *           type: string
 *         description: Filtrer par entreprise
 *     responses:
 *       200:
 *         description: Liste des visiteurs
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
 *                     $ref: '#/components/schemas/Visitor'
 *                 pagination:
 *                   type: object
 *       403:
 *         description: Accès refusé
 */
router.get('/', visitorController.getAllVisitors);

/**
 * @swagger
 * /api/visitors/site/{siteId}:
 *   get:
 *     summary: Récupérer les visiteurs d'un site spécifique
 *     tags: [Visiteurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: siteId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du site
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Recherche par nom, prénom, email, téléphone ou entreprise
 *     responses:
 *       200:
 *         description: Liste des visiteurs du site
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
 *                     $ref: '#/components/schemas/VisitorWithSiteCount'
 *                 pagination:
 *                   type: object
 *       403:
 *         description: Accès refusé
 */
router.get('/site/:siteId', visitorController.getVisitorsBySite);

/**
 * @swagger
 * /api/visitors/stats:
 *   get:
 *     summary: Statistiques des visiteurs
 *     tags: [Visiteurs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques des visiteurs
 *       403:
 *         description: Accès refusé - ADMIN ou AGENT_GESTION requis
 */
router.get('/stats', visitorController.getVisitorStats);

/**
 * @swagger
 * /api/visitors:
 *   post:
 *     summary: Créer un nouveau visiteur
 *     tags: [Visiteurs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateVisitorRequest'
 *     responses:
 *       201:
 *         description: Visiteur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Visitor'
 *       403:
 *         description: Accès refusé
 *       400:
 *         description: Fichier non trouvé
 */
router.post('/', visitorController.createVisitor);

/**
 * @swagger
 * /api/visitors/{id}:
 *   get:
 *     summary: Récupérer un visiteur par ID
 *     tags: [Visiteurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du visiteur
 *     responses:
 *       200:
 *         description: Détails du visiteur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Visitor'
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Visiteur non trouvé
 */
router.get('/:id', visitorController.getVisitorById);

/**
 * @swagger
 * /api/visitors/{id}/check-non-desirable:
 *   get:
 *     summary: Vérifier si un visiteur est indésirable
 *     tags: [Visiteurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du visiteur
 *     responses:
 *       200:
 *         description: Statut indésirable du visiteur
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
 *                     visitor:
 *                       type: object
 *                     isNonDesirable:
 *                       type: boolean
 *                     nonDesirable:
 *                       type: object
 *                       nullable: true
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Visiteur non trouvé
 */
router.get('/:id/check-non-desirable', visitorController.checkNonDesirable);

/**
 * @swagger
 * /api/visitors/{id}/history:
 *   get:
 *     summary: Récupérer l'historique d'un visiteur
 *     tags: [Visiteurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du visiteur
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Nombre de jours d'historique
 *     responses:
 *       200:
 *         description: Historique du visiteur
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Visiteur non trouvé
 */
router.get('/:id/history', visitorController.getVisitorHistory);

/**
 * @swagger
 * /api/visitors/{id}:
 *   put:
 *     summary: Mettre à jour un visiteur
 *     tags: [Visiteurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du visiteur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateVisitorRequest'
 *     responses:
 *       200:
 *         description: Visiteur mis à jour avec succès
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Visiteur non trouvé
 */
router.put('/:id', visitorController.updateVisitor);

/**
 * @swagger
 * /api/visitors/{id}:
 *   delete:
 *     summary: Supprimer un visiteur
 *     tags: [Visiteurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du visiteur
 *     responses:
 *       200:
 *         description: Visiteur supprimé avec succès
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Visiteur non trouvé
 *       400:
 *         description: Visiteur a des visites associées
 */
router.delete('/:id', visitorController.deleteVisitor);

module.exports = router;
