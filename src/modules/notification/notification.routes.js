const express = require('express');
const { authenticateToken } = require('../../middleware/authMiddleware');
const notificationController = require('./notification.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Gestion des notifications utilisateur
 */

/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     summary: Récupérer les notifications de l'utilisateur
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: siteId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrer par site spécifique
 *       - in: query
 *         name: unread
 *         schema:
 *           type: boolean
 *         description: Filtrer uniquement les notifications non lues
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [SOS, INCIDENT, BLACKLIST, VISIT, RENDEZVOUS, SYSTEM, ALERT]
 *         description: Filtrer par type de notification
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *         description: Filtrer par priorité
 *       - in: query
 *         name: entityType
 *         schema:
 *           type: string
 *         description: Filtrer par type d'entité (SOS, INCIDENT, etc.)
 *       - in: query
 *         name: entityId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrer par ID d'entité spécifique
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Date de début pour filtrer
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Date de fin pour filtrer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Nombre maximum de notifications à retourner
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page pour la pagination
 *     responses:
 *       200:
 *         description: Liste des notifications récupérée avec succès
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
 *                     notifications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Notification'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                     unreadCount:
 *                       type: integer
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/', authenticateToken, notificationController.getNotifications);

/**
 * @swagger
 * /api/v1/notifications/site/{siteId}:
 *   get:
 *     summary: Récupérer les notifications d'un site (Admin/Site Manager)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: siteId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du site
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filtrer par type de notification
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *         description: Filtrer par priorité
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrer par utilisateur
 *       - in: query
 *         name: unread
 *         schema:
 *           type: boolean
 *         description: Filtrer uniquement les notifications non lues
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Nombre maximum de notifications
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *     responses:
 *       200:
 *         description: Notifications du site récupérées avec succès
 *       403:
 *         description: Accès non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/site/:siteId', authenticateToken, notificationController.getSiteNotifications);

/**
 * @swagger
 * /api/v1/notifications/{id}:
 *   get:
 *     summary: Récupérer une notification spécifique
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
 *         description: Notification récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Notification'
 *       404:
 *         description: Notification non trouvée
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id', authenticateToken, notificationController.getNotificationById);

/**
 * @swagger
 * /api/v1/notifications/{id}/read:
 *   patch:
 *     summary: Marquer une notification comme lue
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
 *       404:
 *         description: Notification non trouvée
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.patch('/:id/read', authenticateToken, notificationController.markAsRead);

/**
 * @swagger
 * /api/v1/notifications/read-all:
 *   post:
 *     summary: Marquer toutes les notifications comme lues
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               siteId:
 *                 type: string
 *                 format: uuid
 *                 description: ID du site (optionnel - marquer seulement les notifications de ce site)
 *     responses:
 *       200:
 *         description: Toutes les notifications marquées comme lues
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.post('/read-all', authenticateToken, notificationController.markAllAsRead);

/**
 * @swagger
 * /api/v1/notifications/unread/count:
 *   get:
 *     summary: Récupérer le nombre de notifications non lues
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: siteId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du site (optionnel - compter seulement les notifications de ce site)
 *     responses:
 *       200:
 *         description: Nombre de notifications non lues
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
 *                     unreadCount:
 *                       type: integer
 *                     siteId:
 *                       type: string
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/unread/count', authenticateToken, notificationController.getUnreadCount);

/**
 * @swagger
 * /api/v1/notifications/{id}:
 *   delete:
 *     summary: Supprimer une notification
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
 *         description: Notification supprimée avec succès
 *       404:
 *         description: Notification non trouvée
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id', authenticateToken, notificationController.deleteNotification);

/**
 * @swagger
 * /api/v1/notifications/test:
 *   post:
 *     summary: Créer une notification de test (développement uniquement)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               siteId:
 *                 type: string
 *                 format: uuid
 *                 description: ID du site pour la notification de test
 *     responses:
 *       200:
 *         description: Notification de test créée
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.post('/test', authenticateToken, notificationController.createTestNotification);

module.exports = router;