const notificationService = require('./notification.service');
const { asyncHandler } = require('../../middleware/asyncHandler');

class NotificationController {
  
  /**
   * GET /api/v1/notifications
   * Récupérer les notifications de l'utilisateur avec filtres par site
   */
  getNotifications = asyncHandler(async (req, res) => {
    try {
      const userId = req.user.id;
      const { 
        unread, 
        type, 
        priority, 
        siteId,
        entityType,
        entityId,
        startDate,
        endDate,
        limit = '50',
        page = '1'
      } = req.query;

      const filters = {
        unreadOnly: unread === 'true',
        type: type,
        priority: priority,
        siteId: siteId, // Nouveau : filtre par site
        entityType: entityType,
        entityId: entityId,
        startDate: startDate,
        endDate: endDate,
        limit: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit),
        page: parseInt(page)
      };

      const result = await notificationService.getUserNotifications(userId, filters);
      const unreadCount = await notificationService.getUnreadCount(userId, siteId);

      return res.json({
        success: true,
        data: {
          notifications: result.notifications,
          pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages
          },
          unreadCount: unreadCount,
          filters: filters
        }
      });
      
    } catch (error) {
      console.error('Erreur contrôleur getNotifications:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des notifications'
      });
    }
  });

  /**
   * GET /api/v1/notifications/site/:siteId
   * Récupérer les notifications d'un site (admin seulement)
   */
  getSiteNotifications = asyncHandler(async (req, res) => {
    try {
      const userId = req.user.id;
      const { siteId } = req.params;
      const { 
        type, 
        priority,
        startDate,
        endDate,
        unread,
        userId: filterUserId,
        limit = '50',
        page = '1'
      } = req.query;

      // Vérifier que l'utilisateur a les droits pour voir les notifications du site
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (user.role !== 'ADMIN' && user.role !== 'SITE_MANAGER') {
        return res.status(403).json({
          success: false,
          message: 'Vous n\'avez pas les droits pour accéder aux notifications de ce site'
        });
      }

      const filters = {
        type: type,
        priority: priority,
        startDate: startDate,
        endDate: endDate,
        unreadOnly: unread === 'true',
        userId: filterUserId,
        limit: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit),
        page: parseInt(page)
      };

      const result = await notificationService.getSiteNotifications(siteId, filters);

      return res.json({
        success: true,
        data: {
          notifications: result.notifications,
          pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages
          },
          siteId: siteId
        }
      });
      
    } catch (error) {
      console.error('Erreur contrôleur getSiteNotifications:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des notifications du site'
      });
    }
  });

  /**
   * GET /api/v1/notifications/:id
   * Récupérer une notification spécifique
   */
  getNotificationById = asyncHandler(async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const notification = await notificationService.getNotificationById(id, userId);

      return res.json({
        success: true,
        data: notification
      });
      
    } catch (error) {
      console.error('Erreur contrôleur getNotificationById:', error);
      
      if (error.message === 'Notification non trouvée') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération de la notification'
      });
    }
  });

  /**
   * PATCH /api/v1/notifications/:id/read
   * Marquer une notification comme lue
   */
  markAsRead = asyncHandler(async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const notification = await notificationService.markAsRead(id, userId);

      return res.json({
        success: true,
        data: notification,
        message: 'Notification marquée comme lue'
      });
      
    } catch (error) {
      console.error('Erreur contrôleur markAsRead:', error);
      
      if (error.message.includes('Notification non trouvée') || error.message.includes('record was not found')) {
        return res.status(404).json({
          success: false,
          message: 'Notification non trouvée'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors du marquage de la notification'
      });
    }
  });

  /**
   * POST /api/v1/notifications/read-all
   * Marquer toutes les notifications comme lues (optionnellement pour un site)
   */
  markAllAsRead = asyncHandler(async (req, res) => {
    try {
      const userId = req.user.id;
      const { siteId } = req.body; // Optionnel : marquer seulement pour un site spécifique

      const result = await notificationService.markAllAsRead(userId, siteId);

      return res.json({
        success: true,
        data: result,
        message: result.message
      });
      
    } catch (error) {
      console.error('Erreur contrôleur markAllAsRead:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors du marquage des notifications'
      });
    }
  });

  /**
   * GET /api/v1/notifications/unread/count
   * Récupérer le nombre de notifications non lues (optionnellement pour un site)
   */
  getUnreadCount = asyncHandler(async (req, res) => {
    try {
      const userId = req.user.id;
      const { siteId } = req.query; // Optionnel : compter seulement pour un site

      const count = await notificationService.getUnreadCount(userId, siteId);

      return res.json({
        success: true,
        data: {
          unreadCount: count,
          siteId: siteId || 'all'
        }
      });
      
    } catch (error) {
      console.error('Erreur contrôleur getUnreadCount:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors du comptage des notifications'
      });
    }
  });

  /**
   * DELETE /api/v1/notifications/:id
   * Supprimer une notification
   */
  deleteNotification = asyncHandler(async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const notification = await notificationService.deleteNotification(id, userId);

      return res.json({
        success: true,
        data: notification,
        message: 'Notification supprimée avec succès'
      });
      
    } catch (error) {
      console.error('Erreur contrôleur deleteNotification:', error);
      
      if (error.message.includes('Notification non trouvée') || error.message.includes('record was not found')) {
        return res.status(404).json({
          success: false,
          message: 'Notification non trouvée'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la suppression de la notification'
      });
    }
  });

  /**
   * POST /api/v1/notifications/test
   * Endpoint de test pour créer une notification
   * (À utiliser uniquement en développement)
   */
  createTestNotification = asyncHandler(async (req, res) => {
    try {
      const userId = req.user.id;
      const { siteId } = req.body;
      
      // Données de test
      const testData = {
        type: 'SYSTEM',
        title: 'Notification de test',
        message: 'Ceci est une notification de test générée par le système',
        priority: 'low',
        entityType: 'TEST',
        entityId: null,
        userId: userId,
        siteId: siteId || null,
        createdBy: userId,
        metadata: {
          test: true,
          timestamp: new Date().toISOString(),
          action: 'test_notification'
        }
      };

      const notification = await notificationService.createNotification(testData);

      return res.json({
        success: true,
        data: notification,
        message: 'Notification de test créée avec succès'
      });
      
    } catch (error) {
      console.error('Erreur contrôleur createTestNotification:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la création de la notification de test'
      });
    }
  });
}

module.exports = new NotificationController();