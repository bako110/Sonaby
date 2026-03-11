// src/controllers/notificationController.js
const notificationService = require('./notification.service');

class NotificationController {
  
  /**
   * Récupère les notifications de l'utilisateur
   */
  async getUserNotifications(req, res) {
    try {
      const userId = req.user.userId;
      const { 
        limit = 50,
        unreadOnly = false,
        includeGlobal = true
      } = req.query;

      const result = await notificationService.getUserNotifications(userId, {
        limit: parseInt(limit),
        unreadOnly: unreadOnly === 'true',
        includeGlobal: includeGlobal !== 'false'
      });

      return res.status(200).json(result);
    } catch (error) {
      console.error('❌ Erreur controller - récupération notifications:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Erreur lors de la récupération des notifications'
      });
    }
  }

  /**
   * Marque une notification comme lue
   */
  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const result = await notificationService.markAsRead(id, userId);

      return res.status(200).json(result);
    } catch (error) {
      console.error('❌ Erreur controller - marquer notification:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Erreur lors du marquage de la notification'
      });
    }
  }

  /**
   * Marque toutes les notifications comme lues
   */
  async markAllAsRead(req, res) {
    try {
      // const userId = req.user.userId;

      const result = await notificationService.markAllAsRead();

      return res.status(200).json(result);
    } catch (error) {
      console.error('❌ Erreur controller - marquer toutes notifications:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Erreur lors du marquage de toutes les notifications'
      });
    }
  }

  /**
   * Récupère les statistiques des notifications
   */
  async getNotificationStats(req, res) {
    try {
      const userId = req.user.userId;

      const result = await notificationService.getNotificationStats(userId);

      return res.status(200).json(result);
    } catch (error) {
      console.error('❌ Erreur controller - statistiques notifications:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Erreur lors de la récupération des statistiques'
      });
    }
  }

 /**
 * @desc Récupère toutes les notifications non lues d'un utilisateur
 */
async getAllUserNotifications(req, res) {
  try {
    const { userId, limit } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId est requis'
      });
    }

    const result = await notificationService.getAllUserNotifications(
      userId,
      parseInt(limit) || 50
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error('❌ Erreur controller getAllUserNotifications:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}
}

module.exports = new NotificationController();