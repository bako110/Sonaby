const express = require('express');
const siteController = require('./site.controller');
const { authenticateToken } = require('../../middleware/authMiddleware');

const router = express.Router();

// Middleware d'authentification pour toutes les routes
router.use(authenticateToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     Site:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID unique du site
 *           example: "550e8400-e29b-41d4-a716-446655440001"
 *         name:
 *           type: string
 *           description: Nom du site
 *           example: "Site Principal Ouagadougou"
 *         code:
 *           type: string
 *           description: Code unique du site
 *           example: "SITE-OUA-001"
 *         address:
 *           type: string
 *           description: Adresse complète du site
 *           example: "Avenue Kwame Nkrumah, Secteur 4"
 *         city:
 *           type: string
 *           description: Ville du site
 *           example: "Ouagadougou"
 *         postalCode:
 *           type: string
 *           description: Code postal
 *           example: "01 BP 1234"
 *         country:
 *           type: string
 *           description: Pays du site
 *           example: "Burkina Faso"
 *         region:
 *           type: string
 *           description: Région du site
 *           example: "Centre"
 *         activityType:
 *           type: string
 *           description: Type d'activité du site
 *           example: "Bureau administratif"
 *         status:
 *           type: string
 *           description: Statut du site
 *           example: "active"
 *         phone:
 *           type: string
 *           description: Téléphone du site
 *           example: "+226 25 30 40 50"
 *         email:
 *           type: string
 *           format: email
 *           description: Email du site
 *           example: "contact@site-ouaga.bf"
 *         manager:
 *           type: string
 *           description: Nom du responsable
 *           example: "Jean OUEDRAOGO"
 *         managerEmail:
 *           type: string
 *           format: email
 *           description: Email du responsable
 *           example: "jean.ouedraogo@site-ouaga.bf"
 *         managerPhone:
 *           type: string
 *           description: Téléphone du responsable
 *           example: "+226 70 11 22 33"
 *         area:
 *           type: number
 *           format: decimal
 *           description: Superficie en m²
 *           example: 1500.50
 *         usableArea:
 *           type: number
 *           format: decimal
 *           description: Surface utilisable en m²
 *           example: 1200.75
 *         employeeCount:
 *           type: integer
 *           description: Nombre d'employés
 *           example: 250
 *         maxEmployeeCapacity:
 *           type: integer
 *           description: Capacité maximale d'employés
 *           example: 300
 *         buildingCount:
 *           type: integer
 *           description: Nombre de bâtiments
 *           example: 3
 *         coordinates:
 *           type: object
 *           description: Coordonnées GPS
 *           properties:
 *             latitude:
 *               type: number
 *               format: decimal
 *               example: 12.3456789
 *             longitude:
 *               type: number
 *               format: decimal
 *               example: -1.2345678
 *         wheelchairAccessible:
 *           type: boolean
 *           description: Accessible aux fauteuils roulants
 *           example: true
 *         parkingAvailable:
 *           type: boolean
 *           description: Parking disponible
 *           example: true
 *         parkingSpaces:
 *           type: integer
 *           description: Nombre de places de parking
 *           example: 50
 *         securitySystem:
 *           type: boolean
 *           description: Système de sécurité installé
 *           example: true
 *         securityGuard:
 *           type: boolean
 *           description: Agent de sécurité présent
 *           example: false
 *         monthlyCost:
 *           type: number
 *           format: decimal
 *           description: Coût mensuel en FCFA
 *           example: 2500000.00
 *         annualBudget:
 *           type: number
 *           format: decimal
 *           description: Budget annuel en FCFA
 *           example: 30000000.00
 *         energyConsumption:
 *           type: number
 *           format: decimal
 *           description: Consommation énergétique
 *           example: 15000.50
 *         creationDate:
 *           type: string
 *           format: date-time
 *           description: Date de création
 *           example: "2024-01-15T08:00:00.000Z"
 *         modificationDate:
 *           type: string
 *           format: date-time
 *           description: Date de modification
 *           example: "2024-11-24T15:30:00.000Z"
 *         checkpoints:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Checkpoint'
 *           description: Checkpoints associés au site
 *     CreateSiteRequest:
 *       type: object
 *       required:
 *         - name
 *         - address
 *         - city
 *         - country
 *         - activityType
 *         - status
 *       properties:
 *         name:
 *           type: string
 *           description: Nom du site
 *           maxLength: 255
 *           example: "Site Principal Ouagadougou"
 *         code:
 *           type: string
 *           description: Code unique du site (optionnel, généré automatiquement si non fourni)
 *           maxLength: 50
 *           example: "SITE-OUA-001"
 *         address:
 *           type: string
 *           description: Adresse complète du site
 *           example: "Avenue Kwame Nkrumah, Secteur 4"
 *         city:
 *           type: string
 *           description: Ville du site
 *           maxLength: 100
 *           example: "Ouagadougou"
 *         postalCode:
 *           type: string
 *           description: Code postal
 *           maxLength: 20
 *           example: "01 BP 1234"
 *         country:
 *           type: string
 *           description: Pays du site
 *           maxLength: 100
 *           example: "Burkina Faso"
 *         region:
 *           type: string
 *           description: Région du site
 *           maxLength: 100
 *           example: "Centre"
 *         activityType:
 *           type: string
 *           description: Type d'activité du site
 *           maxLength: 50
 *           example: "Bureau administratif"
 *         status:
 *           type: string
 *           description: Statut du site
 *           maxLength: 50
 *           example: "active"
 *         phone:
 *           type: string
 *           description: Téléphone du site
 *           maxLength: 20
 *           example: "+226 25 30 40 50"
 *         email:
 *           type: string
 *           format: email
 *           description: Email du site
 *           maxLength: 255
 *           example: "contact@site-ouaga.bf"
 *         manager:
 *           type: string
 *           description: Nom du responsable
 *           maxLength: 255
 *           example: "Jean OUEDRAOGO"
 *         managerEmail:
 *           type: string
 *           format: email
 *           description: Email du responsable
 *           maxLength: 255
 *           example: "jean.ouedraogo@site-ouaga.bf"
 *         managerPhone:
 *           type: string
 *           description: Téléphone du responsable
 *           maxLength: 20
 *           example: "+226 70 11 22 33"
 *         area:
 *           type: number
 *           format: decimal
 *           description: Superficie en m²
 *           minimum: 0
 *           example: 1500.50
 *         usableArea:
 *           type: number
 *           format: decimal
 *           description: Surface utilisable en m²
 *           minimum: 0
 *           example: 1200.75
 *         employeeCount:
 *           type: integer
 *           description: Nombre d'employés
 *           minimum: 0
 *           example: 250
 *         maxEmployeeCapacity:
 *           type: integer
 *           description: Capacité maximale d'employés
 *           minimum: 0
 *           example: 300
 *         buildingCount:
 *           type: integer
 *           description: Nombre de bâtiments
 *           minimum: 1
 *           example: 3
 *         coordinates:
 *           type: object
 *           description: Coordonnées GPS
 *           properties:
 *             latitude:
 *               type: number
 *               format: decimal
 *               minimum: -90
 *               maximum: 90
 *               example: 12.3456789
 *             longitude:
 *               type: number
 *               format: decimal
 *               minimum: -180
 *               maximum: 180
 *               example: -1.2345678
 *         wheelchairAccessible:
 *           type: boolean
 *           description: Accessible aux fauteuils roulants
 *           example: true
 *         parkingAvailable:
 *           type: boolean
 *           description: Parking disponible
 *           example: true
 *         parkingSpaces:
 *           type: integer
 *           description: Nombre de places de parking
 *           minimum: 0
 *           example: 50
 *         securitySystem:
 *           type: boolean
 *           description: Système de sécurité installé
 *           example: true
 *         securityGuard:
 *           type: boolean
 *           description: Agent de sécurité présent
 *           example: false
 *         monthlyCost:
 *           type: number
 *           format: decimal
 *           description: Coût mensuel en FCFA
 *           minimum: 0
 *           example: 2500000.00
 *         annualBudget:
 *           type: number
 *           format: decimal
 *           description: Budget annuel en FCFA
 *           minimum: 0
 *           example: 30000000.00
 *         energyConsumption:
 *           type: number
 *           format: decimal
 *           description: Consommation énergétique
 *           minimum: 0
 *           example: 15000.50
 *       example:
 *         name: "Site Principal Ouagadougou"
 *         code: "SITE-OUA-001"
 *         address: "Avenue Kwame Nkrumah, Secteur 4"
 *         city: "Ouagadougou"
 *         postalCode: "01 BP 1234"
 *         country: "Burkina Faso"
 *         region: "Centre"
 *         activityType: "Bureau administratif"
 *         status: "active"
 *         phone: "+226 25 30 40 50"
 *         email: "contact@site-ouaga.bf"
 *         manager: "Jean OUEDRAOGO"
 *         managerEmail: "jean.ouedraogo@site-ouaga.bf"
 *         managerPhone: "+226 70 11 22 33"
 *         area: 1500.50
 *         usableArea: 1200.75
 *         employeeCount: 250
 *         maxEmployeeCapacity: 300
 *         buildingCount: 3
 *         coordinates:
 *           latitude: 12.3456789
 *           longitude: -1.2345678
 *         wheelchairAccessible: true
 *         parkingAvailable: true
 *         parkingSpaces: 50
 *         securitySystem: true
 *         securityGuard: false
 *         monthlyCost: 2500000.00
 *         annualBudget: 30000000.00
 *         energyConsumption: 15000.50
 *     UpdateSiteRequest:
 *       type: object
 *       description: Données pour mettre à jour un site (tous les champs sont optionnels)
 *       additionalProperties: false
 *       properties:
 *         name:
 *           type: string
 *           description: Nom du site
 *           maxLength: 255
 *           example: "Site Principal Ouagadougou - Rénové"
 *         code:
 *           type: string
 *           description: Code unique du site
 *           maxLength: 50
 *           example: "SITE-OUA-001-V2"
 *         address:
 *           type: string
 *           description: Adresse complète du site
 *           example: "Avenue Charles de Gaulle, Secteur 1"
 *         city:
 *           type: string
 *           description: Ville du site
 *           maxLength: 100
 *           example: "Bobo-Dioulasso"
 *         country:
 *           type: string
 *           description: Pays du site
 *           maxLength: 100
 *           example: "Burkina Faso"
 *         status:
 *           type: string
 *           description: Statut du site
 *           enum: ["active", "inactive", "maintenance", "closed"]
 *           example: "maintenance"
 *         area:
 *           type: number
 *           format: decimal
 *           description: Superficie en m²
 *           minimum: 0
 *           example: 1800.25
 *         employeeCount:
 *           type: integer
 *           description: Nombre d'employés
 *           minimum: 0
 *           example: 275
 *         wheelchairAccessible:
 *           type: boolean
 *           description: Accessible aux fauteuils roulants
 *           example: false
 *         parkingAvailable:
 *           type: boolean
 *           description: Parking disponible
 *           example: false
 *         securitySystem:
 *           type: boolean
 *           description: Système de sécurité installé
 *           example: false
 *       example:
 *         name: "Site Principal Ouagadougou - Rénové"
 *         status: "maintenance"
 *         area: 1800.25
 *         employeeCount: 275
 *         wheelchairAccessible: false
 *         parkingAvailable: false
 *         securitySystem: false
 */

/**
 * @swagger
 * /api/sites:
 *   get:
 *     summary: Récupérer tous les sites
 *     tags: [Sites]
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
 *         description: Recherche par nom ou localisation
 *     responses:
 *       200:
 *         description: Liste des sites
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
 *                     $ref: '#/components/schemas/Site'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 */
router.get('/', siteController.getAllSites);

/**
 * @swagger
 * /api/sites/stats:
 *   get:
 *     summary: Statistiques des sites
 *     tags: [Sites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques des sites
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
 *                     totalSites:
 *                       type: integer
 *                     checkpointsPerSite:
 *                       type: array
 *                       items:
 *                         type: object
 */
router.get('/stats', siteController.getSiteStats);

/**
 * @swagger
 * /api/sites:
 *   post:
 *     summary: Créer un nouveau site
 *     tags: [Sites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSiteRequest'
 *     responses:
 *       201:
 *         description: Site créé avec succès
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
 *                   $ref: '#/components/schemas/Site'
 *       403:
 *         description: Accès refusé - ADMIN requis
 *       400:
 *         description: Données invalides
 */
router.post('/', siteController.createSite);

/**
 * @swagger
 * /api/sites/validate:
 *   post:
 *     summary: Valider les données de site sans les créer (test)
 *     tags: [Sites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSiteRequest'
 *     responses:
 *       200:
 *         description: Données valides
 *       400:
 *         description: Erreur de validation
 */
router.post('/validate', siteController.validateSiteData);

/**
 * @swagger
 * /api/sites/{id}:
 *   get:
 *     summary: Récupérer un site par ID
 *     tags: [Sites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du site
 *     responses:
 *       200:
 *         description: Détails du site
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Site'
 *       404:
 *         description: Site non trouvé
 */
router.get('/:id', siteController.getSiteById);

/**
 * @swagger
 * /api/sites/{id}:
 *   put:
 *     summary: Mettre à jour un site
 *     tags: [Sites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du site
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSiteRequest'
 *     responses:
 *       200:
 *         description: Site mis à jour avec succès
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
 *                   $ref: '#/components/schemas/Site'
 *       403:
 *         description: Accès refusé - ADMIN requis
 *       404:
 *         description: Site non trouvé
 */
router.put('/:id', siteController.updateSite);

/**
 * @swagger
 * /api/sites/{id}:
 *   delete:
 *     summary: Supprimer un site
 *     tags: [Sites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du site
 *     responses:
 *       200:
 *         description: Site supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       403:
 *         description: Accès refusé - ADMIN requis
 *       404:
 *         description: Site non trouvé
 *       400:
 *         description: Site contient des checkpoints
 */
router.delete('/:id', siteController.deleteSite);

module.exports = router;
