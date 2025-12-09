const { prisma } = require('../../config/prisma');

class NotificationService {
  
  /**
   * Vérifier si une notification identique existe déjà
   */
  async checkDuplicateNotification(userId, entityType, entityId, action, timeWindowMinutes = 5) {
    try {
      // Version corrigée pour Prisma 5.x
      const existingNotification = await prisma.notification.findFirst({
        where: {
          userId: userId,
          entityType: entityType,
          entityId: entityId,
          // Recherche dans metadata JSON
          metadata: {
            path: ['action'],
            equals: action
          },
          // Vérifier dans la fenêtre de temps spécifiée
          createdAt: {
            gte: new Date(Date.now() - timeWindowMinutes * 60 * 1000)
          }
        }
      });
      
      return existingNotification !== null;
    } catch (error) {
      console.error('Erreur vérification doublon notification:', error);
      return false;
    }
  }

  /**
   * Créer une nouvelle notification avec protection anti-doublons
   */
  async createNotification(data) {
    try {
      // CORRECTION IMPORTANTE : Vérifier que createdBy existe
      let createdByUserId = data.createdBy;
      
      if (createdByUserId && createdByUserId !== 'system') {
        const creatorExists = await prisma.user.findUnique({
          where: { id: createdByUserId },
          select: { id: true }
        });

        if (!creatorExists) {
          console.error(`❌ Utilisateur createdBy non trouvé: ${createdByUserId}`);
          // Si createdBy n'existe pas, utiliser userId ou système
          createdByUserId = data.userId || 'system';
        }
      } else if (!createdByUserId) {
        // Si aucun createdBy fourni, utiliser userId ou système
        createdByUserId = data.userId || 'system';
      }

      // Vérifier si c'est une notification avec metadata et action (pour les SOS, incidents, etc.)
      if (data.metadata && data.metadata.action) {
        const hasDuplicate = await this.checkDuplicateNotification(
          data.userId,
          data.entityType,
          data.entityId,
          data.metadata.action,
          5 // Fenêtre de 5 minutes par défaut
        );
        
        if (hasDuplicate) {
          console.log(`⚠️ Notification doublon évitée: ${data.entityType} ${data.entityId} action: ${data.metadata.action} pour userId: ${data.userId}`);
          return null; // Ne pas créer de doublon
        }
      }

      const notification = await prisma.notification.create({
        data: {
          type: data.type,
          title: data.title,
          message: data.message,
          priority: data.priority || 'medium',
          entityType: data.entityType,
          entityId: data.entityId,
          userId: data.userId,
          siteId: data.siteId,
          createdBy: createdByUserId, // Maintenant validé
          metadata: data.metadata || {},
          isRead: false
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true
            }
          },
          site: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      console.log(`✅ Notification créée: ${notification.type} - ${notification.title}`);
      return notification;
    } catch (error) {
      console.error('Erreur création notification:', error);
      // Ne pas jeter l'erreur pour ne pas bloquer le flux principal
      console.log('Notification data qui a échoué:', JSON.stringify(data, null, 2));
      return null;
    }
  }

  /**
   * Notifier un utilisateur spécifique avec protection anti-doublons
   */
  async notifyUser(userId, notificationData) {
    try {
      // Vérifier que l'utilisateur existe
      const userExists = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true }
      });

      if (!userExists) {
        console.error(`❌ Utilisateur non trouvé pour notification: ${userId}`);
        return null;
      }

      // Vérifier les doublons avant de créer
      if (notificationData.metadata && notificationData.metadata.action) {
        const hasDuplicate = await this.checkDuplicateNotification(
          userId,
          notificationData.entityType,
          notificationData.entityId,
          notificationData.metadata.action,
          5
        );
        
        if (hasDuplicate) {
          console.log(`⚠️ Notification utilisateur doublon évitée pour userId: ${userId}`);
          return null;
        }
      }
      
      return await this.createNotification({
        ...notificationData,
        userId: userId
      });
    } catch (error) {
      console.error('Erreur notifyUser:', error);
      return null;
    }
  }

  /**
   * Notifier tous les utilisateurs d'un site avec protection anti-doublons
   */
  async notifySite(siteId, notificationData) {
    try {
      // Récupérer les utilisateurs assignés à ce site
      const userSites = await prisma.userSite.findMany({
        where: { siteId: siteId },
        include: {
          user: true
        }
      });

      const notifications = [];
      for (const userSite of userSites) {
        try {
          // Vérifier les doublons pour chaque utilisateur
          if (notificationData.metadata && notificationData.metadata.action) {
            const hasDuplicate = await this.checkDuplicateNotification(
              userSite.user.id,
              notificationData.entityType,
              notificationData.entityId,
              notificationData.metadata.action,
              5
            );
            
            if (hasDuplicate) {
              console.log(`⚠️ Notification site doublon évitée pour userId: ${userSite.user.id}`);
              continue; // Passer à l'utilisateur suivant
            }
          }

          const notification = await this.createNotification({
            ...notificationData,
            userId: userSite.user.id,
            siteId: siteId
          });
          
          if (notification) {
            notifications.push(notification);
          }
        } catch (userError) {
          console.error(`Erreur pour user ${userSite.user.id}:`, userError);
          continue;
        }
      }

      return notifications;
    } catch (error) {
      console.error('Erreur notification site:', error);
      return []; // Retourner un tableau vide au lieu de jeter une erreur
    }
  }

  /**
   * Notifier par rôle avec protection anti-doublons
   */
  async notifyByRole(role, notificationData) {
    try {
      const users = await prisma.user.findMany({
        where: {
          role: role,
          isActive: true
        },
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      });

      const notifications = [];
      for (const user of users) {
        try {
          // Vérifier les doublons pour chaque utilisateur
          if (notificationData.metadata && notificationData.metadata.action) {
            const hasDuplicate = await this.checkDuplicateNotification(
              user.id,
              notificationData.entityType,
              notificationData.entityId,
              notificationData.metadata.action,
              5
            );
            
            if (hasDuplicate) {
              console.log(`⚠️ Notification rôle doublon évitée pour userId: ${user.id}`);
              continue; // Passer à l'utilisateur suivant
            }
          }

          const notification = await this.createNotification({
            ...notificationData,
            userId: user.id
          });
          
          if (notification) {
            notifications.push(notification);
          }
        } catch (userError) {
          console.error(`Erreur pour user ${user.id}:`, userError);
          continue;
        }
      }

      return notifications;
    } catch (error) {
      console.error('Erreur notification rôle:', error);
      return []; // Retourner un tableau vide au lieu de jeter une erreur
    }
  }

  /**
   * Créer une notification SOS avec protection anti-doublons
   */
  async createSOSNotification(sosData, userId) {
    try {
      // Vérifier que userId existe
      const userExists = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true }
      });

      if (!userExists) {
        console.error(`❌ Utilisateur SOS non trouvé: ${userId}`);
        return null;
      }

      return await this.createNotification({
        type: 'SOS',
        title: `🚨 Alerte SOS - ${sosData.checkpointName || 'Checkpoint'}`,
        message: `Alerte SOS déclenchée: ${sosData.message || 'Aucun message supplémentaire'}`,
        priority: 'high',
        entityType: 'SOS',
        entityId: sosData.sosId,
        userId: userId,
        siteId: sosData.siteId,
        createdBy: sosData.triggeredById || userId,
        metadata: {
          sosId: sosData.sosId,
          checkpointId: sosData.checkpointId,
          checkpointName: sosData.checkpointName,
          siteId: sosData.siteId,
          siteName: sosData.siteName,
          triggeredBy: sosData.triggeredBy,
          triggeredById: sosData.triggeredById,
          action: 'sos_alert'
        }
      });
    } catch (error) {
      console.error('Erreur création notification SOS:', error);
      return null;
    }
  }

  /**
   * Créer une notification de résolution SOS avec protection anti-doublons
   */
  async createSOSResolutionNotification(resolutionData, userId) {
    try {
      return await this.createNotification({
        type: 'SOS',
        title: `✅ Alerte SOS résolue`,
        message: `L'alerte SOS a été résolue par ${resolutionData.resolvedByName}`,
        priority: 'medium',
        entityType: 'SOS',
        entityId: resolutionData.sosId,
        userId: userId,
        siteId: resolutionData.siteId,
        createdBy: resolutionData.resolvedById,
        metadata: {
          sosId: resolutionData.sosId,
          checkpointId: resolutionData.checkpointId,
          checkpointName: resolutionData.checkpointName,
          resolvedBy: resolutionData.resolvedByName,
          resolvedById: resolutionData.resolvedById,
          resolvedAt: resolutionData.resolvedAt,
          action: 'sos_resolved'
        }
      });
    } catch (error) {
      console.error('Erreur création notification résolution SOS:', error);
      return null;
    }
  }

  // ============ NOUVELLES MÉTHODES POUR FILTRER PAR SITE ============

  /**
   * Récupérer les notifications d'un utilisateur pour un site spécifique
   */
  async getUserNotifications(userId, filters = {}) {
    try {
      // Construction de la clause WHERE
      const where = {
        userId: userId,
        ...(filters.siteId && { siteId: filters.siteId })
      };
      
      // Filtres additionnels
      if (filters.unreadOnly) {
        where.isRead = false;
      }
      
      if (filters.type) {
        where.type = filters.type;
      }
      
      if (filters.priority) {
        where.priority = filters.priority;
      }
      
      if (filters.entityType) {
        where.entityType = filters.entityType;
      }
      
      if (filters.entityId) {
        where.entityId = filters.entityId;
      }
      
      if (filters.startDate && filters.endDate) {
        where.createdAt = {
          gte: new Date(filters.startDate),
          lte: new Date(filters.endDate)
        };
      } else if (filters.startDate) {
        where.createdAt = {
          gte: new Date(filters.startDate)
        };
      } else if (filters.endDate) {
        where.createdAt = {
          lte: new Date(filters.endDate)
        };
      }

      // Récupérer le total pour la pagination
      const total = await prisma.notification.count({ where });

      const notifications = await prisma.notification.findMany({
        where,
        include: {
          site: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: filters.limit || 50,
        skip: filters.skip || 0
      });

      return {
        notifications,
        total,
        page: filters.page || 1,
        limit: filters.limit || 50,
        totalPages: Math.ceil(total / (filters.limit || 50))
      };
    } catch (error) {
      console.error('Erreur récupération notifications:', error);
      throw new Error('Erreur lors de la récupération des notifications');
    }
  }

  /**
   * Récupérer les notifications d'un site (pour les administrateurs)
   */
  async getSiteNotifications(siteId, filters = {}) {
    try {
      const where = {
        siteId: siteId
      };
      
      // Filtres
      if (filters.type) {
        where.type = filters.type;
      }
      
      if (filters.priority) {
        where.priority = filters.priority;
      }
      
      if (filters.startDate && filters.endDate) {
        where.createdAt = {
          gte: new Date(filters.startDate),
          lte: new Date(filters.endDate)
        };
      }
      
      if (filters.unreadOnly) {
        where.isRead = false;
      }
      
      if (filters.userId) {
        where.userId = filters.userId;
      }

      // Récupérer le total pour la pagination
      const total = await prisma.notification.count({ where });

      const notifications = await prisma.notification.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true
            }
          },
          site: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: filters.limit || 50,
        skip: filters.skip || 0
      });

      return {
        notifications,
        total,
        page: filters.page || 1,
        limit: filters.limit || 50,
        totalPages: Math.ceil(total / (filters.limit || 50))
      };
    } catch (error) {
      console.error('Erreur récupération notifications site:', error);
      throw new Error('Erreur lors de la récupération des notifications du site');
    }
  }

  /**
   * Récupérer une notification par ID avec vérification de permission
   */
  async getNotificationById(id, userId) {
    try {
      const notification = await prisma.notification.findFirst({
        where: {
          id: id,
          userId: userId // Sécurité : l'utilisateur ne peut voir que ses notifications
        },
        include: {
          site: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      if (!notification) {
        throw new Error('Notification non trouvée');
      }

      return notification;
    } catch (error) {
      console.error('Erreur récupération notification:', error);
      throw error;
    }
  }

  /**
   * Marquer une notification comme lue avec vérification de permission
   */
  async markAsRead(id, userId) {
    try {
      const notification = await prisma.notification.update({
        where: {
          id: id,
          userId: userId // Sécurité : seul l'utilisateur peut marquer ses notifications
        },
        data: {
          isRead: true,
          readAt: new Date(),
          updatedAt: new Date()
        },
        include: {
          site: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      return notification;
    } catch (error) {
      console.error('Erreur marquage notification:', error);
      throw new Error('Erreur lors du marquage de la notification');
    }
  }

  /**
   * Marquer toutes les notifications comme lues pour un utilisateur et un site
   */
  async markAllAsRead(userId, siteId = null) {
    try {
      const where = {
        userId: userId,
        isRead: false
      };
      
      // Si un siteId est fourni, marquer seulement les notifications de ce site
      if (siteId) {
        where.siteId = siteId;
      }

      const result = await prisma.notification.updateMany({
        where,
        data: {
          isRead: true,
          readAt: new Date(),
          updatedAt: new Date()
        }
      });

      return {
        count: result.count,
        message: `${result.count} notifications marquées comme lues${siteId ? ' pour ce site' : ''}`
      };
    } catch (error) {
      console.error('Erreur marquage toutes notifications:', error);
      throw new Error('Erreur lors du marquage des notifications');
    }
  }

  /**
   * Compter les notifications non lues pour un utilisateur et un site
   */
  async getUnreadCount(userId, siteId = null) {
    try {
      const where = {
        userId: userId,
        isRead: false
      };
      
      // Si un siteId est fourni, compter seulement les notifications de ce site
      if (siteId) {
        where.siteId = siteId;
      }

      const count = await prisma.notification.count({
        where
      });

      return count;
    } catch (error) {
      console.error('Erreur comptage notifications:', error);
      throw new Error('Erreur lors du comptage des notifications');
    }
  }

  /**
   * Supprimer une notification avec vérification de permission
   */
  async deleteNotification(id, userId) {
    try {
      const notification = await prisma.notification.delete({
        where: {
          id: id,
          userId: userId // Sécurité : seul l'utilisateur peut supprimer ses notifications
        }
      });

      return notification;
    } catch (error) {
      console.error('Erreur suppression notification:', error);
      throw new Error('Erreur lors de la suppression de la notification');
    }
  }

  /**
   * Méthode utilitaire pour nettoyer les vieilles notifications
   */
  async cleanupOldNotifications(daysToKeep = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await prisma.notification.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate
          }
        }
      });

      console.log(`🗑️ ${result.count} vieilles notifications nettoyées (avant ${cutoffDate.toISOString()})`);
      return result;
    } catch (error) {
      console.error('Erreur nettoyage notifications:', error);
      return { count: 0 };
    }
  }
}

module.exports = new NotificationService();