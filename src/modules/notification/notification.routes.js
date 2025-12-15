// src/routes/notification.routes.js
const express = require('express');
const router = express.Router();
const notificationController = require('./notification.controller');
const { authenticateToken } = require('../../middleware/authMiddleware');

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Gestion des notifications
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Récupère toutes les notifications de l'utilisateur
 *     description: Retourne les notifications personnelles et globales
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Nombre maximum de notifications à retourner
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Retourner uniquement les notifications non lues
 *       - in: query
 *         name: includeGlobal
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Inclure les notifications globales
 *     responses:
 *       200:
 *         description: Liste des notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *                 count:
 *                   type: integer
 *                   example: 15
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
router.get('/', (req, res) => notificationController.getUserNotifications(req, res));

/**
 * @swagger
 * /api/notifications/stats:
 *   get:
 *     summary: Récupère les statistiques des notifications
 *     description: Retourne le nombre total, lu et non lu
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques des notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     unread:
 *                       type: integer
 *                       example: 5
 *                     read:
 *                       type: integer
 *                       example: 20
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
router.get('/stats', (req, res) => notificationController.getNotificationStats(req, res));

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Marque une notification comme lue
 *     description: Met à jour le statut de lecture d'une notification spécifique
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la notification
 *     responses:
 *       200:
 *         description: Notification marquée comme lue
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
 *                   example: "Notification marquée comme lue"
 *                 data:
 *                   $ref: '#/components/schemas/Notification'
 *       404:
 *         description: Notification non trouvée
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id/read', (req, res) => notificationController.markAsRead(req, res));

/**
 * @swagger
 * /api/notifications/read-all:
 *   put:
 *     summary: Marque toutes les notifications comme lues
 *     description: Met à jour le statut de lecture de toutes les notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Toutes les notifications marquées comme lues
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
 *                   example: "10 notification(s) marquée(s) comme lue(s)"
 *                 count:
 *                   type: integer
 *                   example: 10
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
router.put('/read-all', (req, res) => notificationController.markAllAsRead(req, res));

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID de la notification
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         type:
 *           type: string
 *           description: Type de notification
 *           enum: [VISITOR_BLACKLISTED, VISITOR_UNBLACKLISTED, UNKNOWN_BLACKLISTED, UNKNOWN_UNBLACKLISTED, BLACKLIST_DETECTED]
 *           example: "VISITOR_BLACKLISTED"
 *         title:
 *           type: string
 *           description: Titre de la notification
 *           example: "🚨 Visiteur blacklisté"
 *         message:
 *           type: string
 *           description: Message de la notification
 *           example: "John Doe a été ajouté à la blacklist"
 *         priority:
 *           type: string
 *           description: Priorité de la notification
 *           enum: [high, medium, low]
 *           example: "high"
 *         entityType:
 *           type: string
 *           description: Type d'entité concernée
 *           example: "VISITOR"
 *         entityId:
 *           type: string
 *           format: uuid
 *           description: ID de l'entité concernée
 *         isRead:
 *           type: boolean
 *           description: Statut de lecture
 *           example: false
 *         readAt:
 *           type: string
 *           format: date-time
 *           description: Date de lecture
 *         userId:
 *           type: string
 *           format: uuid
 *           description: ID de l'utilisateur destinataire
 *         siteId:
 *           type: string
 *           format: uuid
 *           description: ID du site concerné
 *         createdBy:
 *           type: string
 *           format: uuid
 *           description: ID du créateur
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de mise à jour
 *         metadata:
 *           type: object
 *           description: Métadonnées supplémentaires
 *           properties:
 *             isGlobal:
 *               type: boolean
 *               example: true
 *             action:
 *               type: string
 *               example: "visitor_blacklisted"
 *         creator:
 *           $ref: '#/components/schemas/UserBasic'
 *     
 *     UserBasic:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *   
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /notifications/user/all:
 *   get:
 *     summary: Récupère TOUTES les notifications d'un utilisateur (SOS, incidents, indésirables)
 *     description: |
 *       Récupère toutes les notifications d'un utilisateur avec filtrage avancé et statistiques.
 *       
 *       Catégories incluses :
 *       - SOS (alertes, résolutions, général)
 *       - Incidents (création, mise à jour, résolution)
 *       - Indésirables (blacklist, détection)
 *       - Autres notifications
 *       
 *       Filtres disponibles :
 *       - Par type (SOS, incidents, indésirables)
 *       - Par statut de lecture (lu/non lu)
 *       - Par catégorie (personnelle, site, globale)
 *       
 *       Retourne des statistiques détaillées.
 *     tags:
 *       - Notifications
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'utilisateur
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 1
 *           maximum: 100
 *         description: Nombre maximum de notifications par catégorie
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Inclure uniquement les notifications non lues
 *       - in: query
 *         name: includeSOS
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Inclure les notifications SOS
 *       - in: query
 *         name: includeIncidents
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Inclure les notifications d'incidents
 *       - in: query
 *         name: includeUndesirables
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Inclure les notifications d'indésirables
 *       - in: query
 *         name: includePersonal
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Inclure les notifications personnelles
 *       - in: query
 *         name: includeSite
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Inclure les notifications de site
 *       - in: query
 *         name: includeGlobal
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Inclure les notifications globales
 *     responses:
 *       200:
 *         description: Toutes les notifications groupées avec statistiques
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     sos:
 *                       type: array
 *                       description: Notifications SOS (alertes et résolutions)
 *                       items:
 *                         $ref: '#/components/schemas/Notification'
 *                     incidents:
 *                       type: array
 *                       description: Notifications d'incidents
 *                       items:
 *                         $ref: '#/components/schemas/Notification'
 *                     undesirables:
 *                       type: array
 *                       description: Notifications d'indésirables
 *                       items:
 *                         $ref: '#/components/schemas/Notification'
 *                     others:
 *                       type: array
 *                       description: Autres notifications
 *                       items:
 *                         $ref: '#/components/schemas/Notification'
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 45
 *                           description: Nombre total de notifications
 *                         unread:
 *                           type: integer
 *                           example: 12
 *                           description: Nombre de notifications non lues
 *                         read:
 *                           type: integer
 *                           example: 33
 *                           description: Nombre de notifications lues
 *                         byType:
 *                           type: object
 *                           properties:
 *                             sos:
 *                               type: object
 *                               properties:
 *                                 total:
 *                                   type: integer
 *                                   example: 8
 *                                 unread:
 *                                   type: integer
 *                                   example: 3
 *                             incidents:
 *                               type: object
 *                               properties:
 *                                 total:
 *                                   type: integer
 *                                   example: 15
 *                                 unread:
 *                                   type: integer
 *                                   example: 5
 *                             undesirables:
 *                               type: object
 *                               properties:
 *                                 total:
 *                                   type: integer
 *                                   example: 10
 *                                 unread:
 *                                   type: integer
 *                                   example: 2
 *                             others:
 *                               type: object
 *                               properties:
 *                                 total:
 *                                   type: integer
 *                                   example: 12
 *                                 unread:
 *                                   type: integer
 *                                   example: 2
 *                         byCategory:
 *                           type: object
 *                           properties:
 *                             personal:
 *                               type: integer
 *                               example: 5
 *                               description: Notifications personnelles
 *                             site:
 *                               type: integer
 *                               example: 25
 *                               description: Notifications de site
 *                             global:
 *                               type: integer
 *                               example: 15
 *                               description: Notifications globales
 *                         userAccess:
 *                           type: object
 *                           properties:
 *                             sitesAccessible:
 *                               type: integer
 *                               example: 3
 *                               description: Nombre de sites accessibles
 *                             sitesWithNotifications:
 *                               type: integer
 *                               example: 2
 *                               description: Nombre de sites avec notifications
 *                         filtersApplied:
 *                           type: object
 *                           properties:
 *                             unreadOnly:
 *                               type: boolean
 *                               example: true
 *                             includeSOS:
 *                               type: boolean
 *                               example: true
 *                             includeIncidents:
 *                               type: boolean
 *                               example: true
 *                             includeUndesirables:
 *                               type: boolean
 *                               example: true
 *                             includePersonal:
 *                               type: boolean
 *                               example: true
 *                             includeSite:
 *                               type: boolean
 *                               example: true
 *                             includeGlobal:
 *                               type: boolean
 *                               example: true
 *       400:
 *         description: Requête invalide (userId manquant ou paramètres invalides)
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
 *                   example: "userId est requis"
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
router.get('/user/all', notificationController.getAllUserNotifications);

module.exports = router;