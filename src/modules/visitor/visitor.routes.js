const express = require('express');
const visitorController = require('./visitor.controller');
const { authenticateToken } = require('../../middleware/authMiddleware');
const {uploadVisitor}  = require('../../middleware/upload');

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
 *           enum: [CNI, PASSEPORT, PERMIS_CONDUITE]
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
 *                             example: "CNI"
 *                           label:
 *                             type: string
 *                             example: "CNI"
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
 *         firstName:
 *           type: string
 *           description: Prénom du visiteur
 *         lastName:
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
 *         idType:
 *           type: string
 *           enum: [CNI, PASSEPORT, PERMIS_CONDUITE]
 *           description: Type d'identité
 *         idNumber:
 *           type: string
 *           description: Numéro d'identité
 *         idScanUrl:
 *           type: string
 *           nullable: true
 *           description: URL du scan de la pièce d'identité
 *         photoUrl:
 *           type: string
 *           nullable: true
 *           description: URL de la photo du visiteur
 *         isBlacklisted:
 *           type: boolean
 *           description: Statut blacklist
 *         blacklistReason:
 *           type: string
 *           nullable: true
 *           description: Raison du blacklist
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de mise à jour
 *     CreateVisitorRequest:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - idType
 *         - idNumber
 *       properties:
 *         firstName:
 *           type: string
 *           description: Prénom du visiteur
 *         lastName:
 *           type: string
 *           description: Nom du visiteur
 *         birthDate:
 *           type: string
 *           nullable: true
 *           description: Date de naissance
 *         birthPlace:
 *           type: string
 *           nullable: true
 *           description: Lieu de naissance
 *         residence:
 *           type: string
 *           nullable: true
 *           description: Résidence
 *         sexe:
 *           type: string
 *           enum: [M, F, HOMME, FEMME]
 *           nullable: true
 *           description: Sexe
 *         givingDate:
 *           type: string
 *           nullable: true
 *           description: Date de délivrance
 *         expirationDate:
 *           type: string
 *           nullable: true
 *           description: Date d'expiration
 *         phone:
 *           type: string
 *           nullable: true
 *           description: Téléphone
 *         email:
 *           type: string
 *           format: email
 *           nullable: true
 *           description: Email
 *         idType:
 *           type: string
 *           enum: [CNI, PASSEPORT, PERMIS_CONDUITE]
 *           description: Type d'identité
 *         idNumber:
 *           type: string
 *           description: Numéro d'identité
 *         idScanUrl:
 *           type: string
 *           nullable: true
 *           description: URL du scan d'ID
 *         photoUrl:
 *           type: string
 *           nullable: true
 *           description: URL de la photo
 *         company:
 *           type: string
 *           nullable: true
 *           description: Entreprise
 *         emergencyContactPhone:
 *           type: string
 *           nullable: true
 *           description: Contact d'urgence - téléphone
 *         emergencyContactName:
 *           type: string
 *           nullable: true
 *           description: Contact d'urgence - nom
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

// /**
//  * @swagger
//  * /api/visitors/site/{siteId}:
//  *   get:
//  *     summary: Récupérer les visiteurs d'un site spécifique
//  *     tags: [Visiteurs]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: siteId
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: ID du site
//  *       - in: query
//  *         name: page
//  *         schema:
//  *           type: integer
//  *           default: 1
//  *         description: Numéro de page
//  *       - in: query
//  *         name: limit
//  *         schema:
//  *           type: integer
//  *           default: 10
//  *         description: Nombre d'éléments par page
//  *       - in: query
//  *         name: search
//  *         schema:
//  *           type: string
//  *         description: Recherche par nom, prénom, email, téléphone ou entreprise
//  *     responses:
//  *       200:
//  *         description: Liste des visiteurs du site
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                 data:
//  *                   type: array
//  *                   items:
//  *                     $ref: '#/components/schemas/Visitor'
//  *                 pagination:
//  *                   type: object
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
 * /api/visitors/week-planning/{siteId}:
 *   get:
 *     summary: Récupérer le planning de la semaine automatique pour un site
 *     tags: [Visiteurs]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Retourne automatiquement le planning de la semaine actuelle (lundi à dimanche) 
 *       avec les visiteurs uniques et les visites organisées par jour.
 *       
 *       **Fonctionnement automatique:**
 *       - Calcul du lundi de la semaine actuelle
 *       - Calcul du dimanche de la semaine actuelle  
 *       - Pas besoin de saisir les dates
 *       
 *       **Données retournées:**
 *       - Planning organisé par jour (YYYY-MM-DD)
 *       - Liste des visiteurs uniques (sans duplication)
 *       - Statistiques de la semaine
 *     parameters:
 *       - in: path
 *         name: siteId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du site concerné
 *     responses:
 *       200:
 *         description: Planning de la semaine récupéré avec succès
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
 *                   example: 'Planning de la semaine récupéré avec succès'
 *                 data:
 *                   type: object
 *                   properties:
 *                     weekPeriod:
 *                       type: object
 *                       description: Période automatique (semaine actuelle)
 *                       properties:
 *                         start:
 *                           type: string
 *                           format: date-time
 *                           example: '2025-12-01T00:00:00.000Z'
 *                           description: Début automatique (lundi)
 *                         end:
 *                           type: string
 *                           format: date-time
 *                           example: '2025-12-07T23:59:59.999Z'
 *                           description: Fin automatique (dimanche)
 *                         siteId:
 *                           type: string
 *                           format: uuid
 *                           description: ID du site
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalVisits:
 *                           type: integer
 *                           example: 15
 *                           description: Nombre total de visites
 *                         totalVisitors:
 *                           type: integer
 *                           example: 12
 *                           description: Nombre de visiteurs uniques
 *                         visitsByDay:
 *                           type: integer
 *                           example: 5
 *                           description: Nombre de jours avec visites
 *                         averageVisitsPerDay:
 *                           type: string
 *                           example: '3.0'
 *                           description: Moyenne de visites par jour
 *                     planning:
 *                       type: object
 *                       description: Visites organisées par jour (format: YYYY-MM-DD)
 *                       example:
 *                         '2025-12-01':
 *                           - id: 'visit-uuid-1'
 *                             visitDate: '2025-12-01T09:00:00.000Z'
 *                             exitDate: '2025-12-01T10:30:00.000Z'
 *                             purpose: 'Réunion commerciale'
 *                             status: 'COMPLETED'
 *                             visitorId: 'visitor-uuid-1'
 *                             agentId: 'agent-uuid-1'
 *                             visitor:
 *                               id: 'visitor-uuid-1'
 *                               firstName: 'Jean'
 *                               lastName: 'Dupont'
 *                             agent:
 *                               id: 'agent-uuid-1'
 *                               firstName: 'Marie'
 *                               lastName: 'Curie'
 *                     visitors:
 *                       type: array
 *                       description: Liste des visiteurs uniques (sans duplication)
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                             description: ID du visiteur
 *                           firstName:
 *                             type: string
 *                             example: 'Jean'
 *                             description: Prénom du visiteur
 *                           lastName:
 *                             type: string
 *                             example: 'Dupont'
 *                             description: Nom du visiteur
 *                           phone:
 *                             type: string
 *                             example: '+22612345678'
 *                           email:
 *                             type: string
 *                             format: email
 *                             example: 'jean.dupont@example.com'
 *                           company:
 *                             type: string
 *                             example: 'Société ABC'
 *                           photoUrl:
 *                             type: string
 *                             example: '/uploads/visitors/photo_jean_dupont.jpg'
 *                           visitsCount:
 *                             type: integer
 *                             example: 2
 *                             description: Nombre de visites cette semaine
 *       403:
 *         description: Accès refusé - permissions insuffisantes
 *       500:
 *         description: Erreur serveur
 */
router.get('/week-planning/:siteId', visitorController.getWeekPlanning);

/**
 * @swagger
 * /api/visitors:
 *   post:
 *     summary: Créer un nouveau visiteur avec upload de fichiers
 *     tags: [Visiteurs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               birthDate:
 *                 type: string
 *                 nullable: true
 *               birthPlace:
 *                 type: string
 *                 nullable: true
 *               residence:
 *                 type: string
 *                 nullable: true
 *               sexe:
 *                 type: string
 *                 enum: [M, F, HOMME, FEMME]
 *                 nullable: true
 *               givingDate:
 *                 type: string
 *               expirationDate:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *                 nullable: true
 *               idType:
 *                 type: string
 *                 enum: [CNI, PASSEPORT, PERMIS_CONDUITE]
 *               idNumber:
 *                 type: string
 *               company:
 *                 type: string
 *                 nullable: true
 *               emergencyContactPhone:
 *                 type: string
 *                 nullable: true
 *               emergencyContactName:
 *                 type: string
 *                 nullable: true
 * 
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Photo du visiteur (image JPEG/PNG)
 * 
 *               idScan:
 *                 type: string
 *                 format: binary
 *                 description: Scan de la pièce d'identité (PDF ou image)
 * 
 *     responses:
 *       201:
 *         description: Visiteur créé avec succès
 *       400:
 *         description: Données invalides
 *       403:
 *         description: Accès refusé
 *       409:
 *         description: Visiteur existe déjà
 */
router.post(
  '/',
  uploadVisitor,
  visitorController.createVisitor
);


// /**
//  * @swagger
//  * /api/visitors/no-files:
//  *   post:
//  *     summary: Créer un visiteur sans fichiers
//  *     tags: [Visiteurs]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: '#/components/schemas/CreateVisitorRequest'
//  *     responses:
//  *       201:
//  *         description: Visiteur créé avec succès
//  *       400:
//  *         description: Données invalides
//  *       403:
//  *         description: Accès refusé
//  */
// router.post('/no-files', visitorController.createVisitor);

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

// /**
//  * @swagger
//  * /api/visitors/{id}/photo:
//  *   get:
//  *     summary: Récupérer la photo d'un visiteur
//  *     tags: [Visiteurs]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: ID du visiteur
//  *     responses:
//  *       200:
//  *         description: Photo du visiteur
//  *         content:
//  *           image/*:
//  *             schema:
//  *               type: string
//  *               format: binary
//  *       404:
//  *         description: Photo non trouvée
//  */
// router.get('/:id/photo', visitorController.getVisitorPhoto);

// /**
//  * @swagger
//  * /api/visitors/{id}/idscan:
//  *   get:
//  *     summary: Récupérer le scan d'ID d'un visiteur
//  *     tags: [Visiteurs]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: ID du visiteur
//  *     responses:
//  *       200:
//  *         description: Scan d'ID du visiteur
//  *         content:
//  *           application/pdf:
//  *             schema:
//  *               type: string
//  *               format: binary
//  *           image/*:
//  *             schema:
//  *               type: string
//  *               format: binary
//  *       404:
//  *         description: Scan d'ID non trouvé
//  */
// router.get('/:id/idscan', visitorController.getVisitorIdScan);

// /**
//  * @swagger
//  * /api/visitors/{id}/download-idscan:
//  *   get:
//  *     summary: Télécharger le scan d'ID d'un visiteur
//  *     tags: [Visiteurs]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: ID du visiteur
//  *     responses:
//  *       200:
//  *         description: Scan d'ID téléchargé
//  *         content:
//  *           application/octet-stream:
//  *             schema:
//  *               type: string
//  *               format: binary
//  *       404:
//  *         description: Scan d'ID non trouvé
//  */
// router.get('/:id/download-idscan', visitorController.downloadIdScan);

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
 *     summary: Mettre à jour un visiteur (sans fichiers)
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
 *             $ref: '#/components/schemas/CreateVisitorRequest'
 *     responses:
 *       200:
 *         description: Visiteur mis à jour avec succès
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Visiteur non trouvé
 */
router.put('/:id', visitorController.updateVisitor);

// /**
//  * @swagger
//  * /api/visitors/{id}/files:
//  *   put:
//  *     summary: Mettre à jour un visiteur avec fichiers
//  *     tags: [Visiteurs]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: ID du visiteur
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         multipart/form-data:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               firstName:
//  *                 type: string
//  *                 nullable: true
//  *               lastName:
//  *                 type: string
//  *                 nullable: true
//  *               birthDate:
//  *                 type: string
//  *                 nullable: true
//  *               birthPlace:
//  *                 type: string
//  *                 nullable: true
//  *               residence:
//  *                 type: string
//  *                 nullable: true
//  *               sexe:
//  *                 type: string
//  *                 enum: [M, F, HOMME, FEMME]
//  *                 nullable: true
//  *               givingDate:
//  *                 type: string
//  *                 nullable: true
//  *               expirationDate:
//  *                 type: string
//  *                 nullable: true
//  *               phone:
//  *                 type: string
//  *                 nullable: true
//  *               email:
//  *                 type: string
//  *                 format: email
//  *                 nullable: true
//  *               company:
//  *                 type: string
//  *                 nullable: true
//  *               emergencyContactPhone:
//  *                 type: string
//  *                 nullable: true
//  *               emergencyContactName:
//  *                 type: string
//  *                 nullable: true
//  *               photo:
//  *                 type: string
//  *                 format: binary
//  *                 description: Nouvelle photo (image, max 5MB)
//  *               idScan:
//  *                 type: string
//  *                 format: binary
//  *                 description: Nouveau scan d'ID (PDF ou image, max 5MB)
//  *     responses:
//  *       200:
//  *         description: Visiteur mis à jour avec succès
//  *       400:
//  *         description: Données invalides
//  *       403:
//  *         description: Accès refusé
//  *       404:
//  *         description: Visiteur non trouvé
//  */
// router.put('/:id/files',
//   visitorUpload.fields([
//     { name: 'photo', maxCount: 1 },
//     { name: 'idScan', maxCount: 1 }
//   ]),
//   visitorController.updateVisitorWithFiles
// );

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