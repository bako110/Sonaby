const express = require('express');
const statsController = require('./stats.controller');
const { authenticateToken } = require('../../middleware/authMiddleware');

const router = express.Router();

// Middleware d'authentification pour toutes les routes
router.use(authenticateToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     TrendData:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           format: date
 *           example: "2024-11-28"
 *           description: Date au format YYYY-MM-DD
 *         value:
 *           type: integer
 *           example: 45
 *           description: Valeur pour cette date
 *     
 *     SiteStatusInfo:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Siège Principal"
 *           description: Nom du site
 *         status:
 *           type: string
 *           enum: ["OK", "WARNING", "ERROR"]
 *           example: "OK"
 *           description: Statut du site
 *         load:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *           example: 75
 *           description: Charge du site en pourcentage
     
 *     AdminStats:
 *       type: object
 *       properties:
 *         totalSites:
 *           type: integer
 *           example: 5
 *           description: Nombre total de sites
 *         totalCheckpoints:
 *           type: integer
 *           example: 23
 *           description: Nombre total de checkpoints
 *         totalAgents:
 *           type: integer
 *           example: 15
 *           description: Nombre total d'agents
 *         systemHealth:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *           example: 92
 *           description: Santé du système en pourcentage
 *         sitesStatus:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SiteStatusInfo'
 *           description: Statut de chaque site
 *         recentBlacklistHits:
 *           type: integer
 *           example: 3
 *           description: Nombre de blacklistages récents (7 derniers jours)
 *         totalSosAlerts:
 *           type: integer
 *           example: 7
 *           description: Nombre total d'alertes SOS
     
 *     ServiceStats:
 *       type: object
 *       properties:
 *         myAgentsTotal:
 *           type: integer
 *           example: 15
 *           description: Nombre total d'agents
 *         myAgentsActive:
 *           type: integer
 *           example: 12
 *           description: Nombre d'agents actifs
 *         myServiceAppointmentsToday:
 *           type: integer
 *           example: 8
 *           description: Nombre de rendez-vous aujourd'hui
 *         myServicePendingAppointments:
 *           type: integer
 *           example: 3
 *           description: Nombre de rendez-vous en attente
 *         incidentsInMyService:
 *           type: integer
 *           example: 2
 *           description: Nombre d'incidents dans le service
 *         topVisitors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Jean Dupont"
 *               count:
 *                 type: integer
 *                 example: 15
 *           description: Top des visiteurs les plus fréquents
 *         agentPerformance:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Marie Martin"
 *               visitsHandled:
 *                 type: integer
 *                 example: 45
 *           description: Performance des agents (visites traitées)
     
 *     OperationalStats:
 *       type: object
 *       properties:
 *         checkpointsOnline:
 *           type: integer
 *           example: 20
 *           description: Nombre de checkpoints en ligne
 *         checkpointsTotal:
 *           type: integer
 *           example: 23
 *           description: Nombre total de checkpoints
 *         busyCheckpoints:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Entrée Principale - Siège"
 *               queue:
 *                 type: integer
 *                 example: 5
 *           description: Checkpoints les plus occupés
 *         sosActive:
 *           type: integer
 *           example: 2
 *           description: Nombre d'alertes SOS actives
 *         blacklistAttemptsToday:
 *           type: integer
 *           example: 4
 *           description: Tentatives de blacklistage aujourd'hui
 *         hourlyTraffic:
 *           type: array
 *           items:
 *             type: integer
 *           description: Trafic horaire sur 24 heures
 *           example: [12, 8, 15, 25, 35, 45, 38, 42, 55, 48, 52, 61, 58, 63, 71, 68, 75, 82, 78, 65, 58, 45, 32, 18]
 *         peakHour:
 *           type: string
 *           example: "17:00"
 *           description: Heure de pointe
     
 *     StatsModel:
 *       type: object
 *       properties:
 *         totalVisitors:
 *           type: integer
 *           example: 1250
 *           description: Nombre total de visiteurs uniques
 *         totalVisits:
 *           type: integer
 *           example: 3450
 *           description: Nombre total de visites
 *         visitsToday:
 *           type: integer
 *           example: 45
 *           description: Nombre de visites aujourd'hui
 *         activeVisits:
 *           type: integer
 *           example: 12
 *           description: Nombre de visites actives (non sorties)
 *         adminStats:
 *           $ref: '#/components/schemas/AdminStats'
 *         serviceStats:
 *           $ref: '#/components/schemas/ServiceStats'
 *         operationalStats:
 *           $ref: '#/components/schemas/OperationalStats'
 *         visitsTrend:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TrendData'
 *           description: Tendance des visites sur 30 jours
 *         appointmentsTrend:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TrendData'
 *           description: Tendance des rendez-vous sur 30 jours
 *         visitsByType:
 *           type: object
 *           additionalProperties:
 *             type: integer
 *           example:
 *             "VISITEUR": 120
 *             "LIVRAISON": 35
 *             "MAINTENANCE": 15
 *           description: Visites par type
 *         appointmentsByStatus:
 *           type: object
 *           additionalProperties:
 *             type: integer
 *           example:
 *             "CONFIRMED": 25
 *             "PENDING": 8
 *             "CANCELLED": 3
 *           description: Rendez-vous par statut
 *         incidentsByCategory:
 *           type: object
 *           additionalProperties:
 *             type: integer
 *           example:
 *             "ACCIDENT": 2
 *             "REFUS": 5
 *             "AUTRE": 3
 *           description: Incidents par catégorie
 */

/**
 * @swagger
 * /api/stats:
 *   get:
 *     summary: 📊 Récupérer toutes les statistiques du système
 *     description: |
 *       Retourne l'ensemble des statistiques disponibles pour tous les rôles.
 *       
 *       **Données incluses :**
 *       - 📈 **Statistiques globales** : Visiteurs, visites, visites du jour
 *       - 👑 **Stats Admin** : Sites, checkpoints, agents, santé système
 *       - 👨‍💼 **Stats Service** : Performance agents, rendez-vous, incidents
 *       - 🚨 **Stats Opérationnelles** : Checkpoints, SOS, blacklistages, trafic
 *       - 📊 **Graphiques** : Tendances, répartitions, catégories
 *       
 *       **Périodes :**
 *       - Tendances : 30 derniers jours
 *       - Blacklistages récents : 7 derniers jours  
 *       - Trafic horaire : Aujourd'hui (24h)
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ✅ Statistiques récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/StatsModel'
 *             example:
 *               success: true
 *               data:
 *                 totalVisitors: 1250
 *                 totalVisits: 3450
 *                 visitsToday: 45
 *                 activeVisits: 12
 *                 adminStats:
 *                   totalSites: 5
 *                   totalCheckpoints: 23
 *                   totalAgents: 15
 *                   systemHealth: 92
 *                   sitesStatus:
 *                     - name: "Siège Principal"
 *                       status: "OK"
 *                       load: 75
 *                   recentBlacklistHits: 3
 *                   totalSosAlerts: 7
 *                 serviceStats:
 *                   myAgentsTotal: 15
 *                   myAgentsActive: 12
 *                   myServiceAppointmentsToday: 8
 *                   myServicePendingAppointments: 3
 *                   incidentsInMyService: 2
 *                   topVisitors:
 *                     - name: "Jean Dupont"
 *                       count: 15
 *                   agentPerformance:
 *                     - name: "Marie Martin"
 *                       visitsHandled: 45
 *                 operationalStats:
 *                   checkpointsOnline: 20
 *                   checkpointsTotal: 23
 *                   busyCheckpoints:
 *                     - name: "Entrée Principale - Siège"
 *                       queue: 5
 *                   sosActive: 2
 *                   blacklistAttemptsToday: 4
 *                   hourlyTraffic: [12, 8, 15, 25, 35, 45, 38, 42, 55, 48, 52, 61, 58, 63, 71, 68, 75, 82, 78, 65, 58, 45, 32, 18]
 *                   peakHour: "17:00"
 *                 visitsTrend:
 *                   - date: "2024-10-29"
 *                     value: 38
 *                   - date: "2024-10-30"
 *                     value: 42
 *                 appointmentsTrend:
 *                   - date: "2024-10-29"
 *                     value: 5
 *                   - date: "2024-10-30"
 *                     value: 8
 *                 visitsByType:
 *                   "VISITEUR": 120
 *                   "LIVRAISON": 35
 *                   "MAINTENANCE": 15
 *                 appointmentsByStatus:
 *                   "CONFIRMED": 25
 *                   "PENDING": 8
 *                   "CANCELLED": 3
 *                 incidentsByCategory:
 *                   "ACCIDENT": 2
 *                   "REFUS": 5
 *                   "AUTRE": 3
 *       401:
 *         description: ❌ Non authentifié
 *       403:
 *         description: ❌ Accès refusé
 *       500:
 *         description: ❌ Erreur serveur
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
 *                   example: "Erreur lors de la récupération des statistiques"
 */
router.get('/', statsController.getAllStats);

module.exports = router;
