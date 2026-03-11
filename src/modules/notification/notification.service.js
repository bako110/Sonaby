// src/services/notification/notification.service.js
const { prisma } = require('../../config/prisma');

class NotificationService {

  static TYPES = {
    // Types pour les indésirables/blacklist
    VISITOR_BLACKLISTED: 'VISITOR_BLACKLISTED',
    VISITOR_UNBLACKLISTED: 'VISITOR_UNBLACKLISTED',
    UNKNOWN_BLACKLISTED: 'UNKNOWN_BLACKLISTED',
    UNKNOWN_UNBLACKLISTED: 'UNKNOWN_UNBLACKLISTED',
    BLACKLIST_DETECTED: 'BLACKLIST_DETECTED',

    // Types pour les SOS
    SOS_ALERT: 'SOS_ALERT',
    SOS_RESOLVED: 'SOS_RESOLVED',
    SOS_GENERAL: 'SOS_GENERAL',

    // Types pour les incidents
    INCIDENT_CREATED: 'INCIDENT_CREATED',
    INCIDENT_UPDATED: 'INCIDENT_UPDATED',
    INCIDENT_RESOLVED: 'INCIDENT_RESOLVED',
    INCIDENT_AGENT_ALERT: 'INCIDENT_AGENT_ALERT',
    INCIDENT_SITE_ALERT: 'INCIDENT_SITE_ALERT',
    INCIDENT_MANAGER_ALERT: 'INCIDENT_MANAGER_ALERT',
  };

  static PRIORITY = {
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
    CRITICAL: 'critical'
  };

  // =============================================
  // ########## MÉTHODES GÉNÉRIQUES ##############
  // =============================================

  /**
   * Crée une notification (méthode générique)
   */
  async createNotification({
    type,
    title,
    message,
    priority = NotificationService.PRIORITY.MEDIUM,
    entityType,
    entityId = null,
    userId = null,
    siteId = null,
    createdBy = null,
    metadata = {}
  }) {
    try {
      // Vérification anti-doublon (pour notifications de site)
      if (siteId && !userId) {
        const existingNotification = await prisma.notification.findFirst({
          where: {
            type: type,
            entityType: entityType,
            entityId: entityId,
            siteId: siteId,
            userId: null, // Important: seulement notifications de site
            isRead: false,
            createdAt: {
              gte: new Date(Date.now() - 5 * 60 * 1000)
            }
          }
        });

        if (existingNotification) {
          return existingNotification;
        }
      }

      const notification = await prisma.notification.create({
        data: {
          type,
          title,
          message,
          priority,
          entityType,
          entityId,
          userId,
          siteId,
          createdBy,
          metadata: metadata
        }
      });

      // Émission WebSocket
      if (siteId) {
        this.emitToSiteWebSocket(siteId, notification);
      } else if (userId) {
        this.emitToUserWebSocket(userId, notification);
      } else {
        this.emitToWebSocket(notification);
      }
      return notification;
    } catch (error) {
      console.error('❌ Erreur création notification:', error);
      throw error;
    }
  }

  /**
   * Crée une notification globale (pour indésirables)
   */
  async createGlobalNotification({
    type = NotificationService.TYPES.VISITOR_BLACKLISTED,
    title,
    message,
    priority = NotificationService.PRIORITY.MEDIUM,
    entityType = 'VISITOR',
    entityId = null,
    createdBy = null,
    metadata = {}
  }) {
    return await this.createNotification({
      type,
      title,
      message,
      priority,
      entityType,
      entityId,
      userId: null,
      siteId: null,
      createdBy,
      metadata: {
        ...metadata,
        isGlobal: true,
        globalCreatedAt: new Date().toISOString()
      }
    });
  }

  // =============================================
  // ########## MÉTHODES POUR LES SOS #############
  // =============================================

  /**
   * Crée une notification SOS pour TOUT LE SITE
   */
async createSOSNotificationForSite({
    sosId,
    checkpointId,
    checkpointName,
    siteId,
    siteName,
    triggeredBy,
    triggeredById,
    templateTitle = '', // Nouveau paramètre
    message = 'Alerte SOS déclenchée'
  }) {
    
    // Construire le message avec le titre du template s'il est fourni
    let notificationMessage;
    if (templateTitle) {
      notificationMessage = `Alerte "${templateTitle}" déclenchée au checkpoint "${checkpointName}" (${siteName}) par ${triggeredBy}`;
    } else {
      notificationMessage = `Alerte SOS déclenchée au checkpoint "${checkpointName}" (${siteName}) par ${triggeredBy}`;
    }
    
    return await this.createNotification({
      type: NotificationService.TYPES.SOS_ALERT,
      title: `🚨 ALERTE SOS - ${checkpointName}`,
      message: notificationMessage,
      priority: NotificationService.PRIORITY.CRITICAL,
      entityType: 'SOS',
      entityId: sosId,
      userId: null, // IMPORTANT: null pour que ce soit pour tout le site
      siteId: siteId, // Lié au site
      createdBy: triggeredById,
      metadata: {
        sosId: sosId,
        checkpointId: checkpointId,
        checkpointName: checkpointName,
        siteId: siteId,
        siteName: siteName,
        triggeredBy: triggeredBy,
        triggeredById: triggeredById,
        templateTitle: templateTitle, // Ajout du titre du template
        message: message,
        action: 'sos_alert_site'
      }
    });
  }

  /**
   * Crée une notification de résolution SOS pour TOUT LE SITE
   */
  async createSOSResolutionNotificationForSite({
    sosId,
    checkpointId,
    checkpointName,
    siteId,
    siteName,
    resolvedByName,
    resolvedById,
    resolvedAt
  }) {
    return await this.createNotification({
      type: NotificationService.TYPES.SOS_RESOLVED,
      title: `✅ SOS Résolu - ${checkpointName}`,
      message: `L'alerte SOS au checkpoint "${checkpointName}" (${siteName}) a été résolue par ${resolvedByName}`,
      priority: NotificationService.PRIORITY.MEDIUM,
      entityType: 'SOS',
      entityId: sosId,
      userId: null, // IMPORTANT: null pour que ce soit pour tout le site
      siteId: siteId, // Lié au site
      createdBy: resolvedById,
      metadata: {
        sosId: sosId,
        checkpointId: checkpointId,
        checkpointName: checkpointName,
        siteId: siteId,
        siteName: siteName,
        resolvedBy: resolvedByName,
        resolvedById: resolvedById,
        resolvedAt: resolvedAt,
        action: 'sos_resolved_site'
      }
    });
  }

  // =============================================
  // ########## MÉTHODES POUR INDÉSIRABLES ##########
  // =============================================

  async notifyVisitorBlacklisted({ visitor, reporterId, reason, entityId }) {
    const reporter = await this.getUserDetails(reporterId);

    return await this.createGlobalNotification({
      type: NotificationService.TYPES.VISITOR_BLACKLISTED,
      title: '🚨 Visiteur blacklisté',
      message: `${visitor.firstName} ${visitor.lastName} a été ajouté à la blacklist par ${reporter.name}`,
      priority: NotificationService.PRIORITY.HIGH,
      entityType: 'VISITOR',
      entityId: entityId || visitor.id,
      createdBy: reporterId,
      metadata: {
        action: 'visitor_blacklisted',
        visitorId: visitor.id,
        visitorName: `${visitor.firstName} ${visitor.lastName}`,
        reason: reason,
        severityLevel: 2,
        reportedBy: reporter
      }
    });
  }

  async notifyVisitorUnblacklisted({ visitor, removerId, reason, entityId }) {
    const remover = await this.getUserDetails(removerId);

    return await this.createGlobalNotification({
      type: NotificationService.TYPES.VISITOR_UNBLACKLISTED,
      title: '✅ Visiteur retiré',
      message: `${visitor.firstName} ${visitor.lastName} a été retiré de la blacklist par ${remover.name}`,
      priority: NotificationService.PRIORITY.MEDIUM,
      entityType: 'VISITOR',
      entityId: entityId || visitor.id,
      createdBy: removerId,
      metadata: {
        action: 'visitor_unblacklisted',
        visitorId: visitor.id,
        visitorName: `${visitor.firstName} ${visitor.lastName}`,
        reason: reason,
        removedBy: remover
      }
    });
  }

  async notifyUnknownBlacklisted({ firstName, lastName, reporterId, reason, severityLevel = 2, entityId }) {
    const reporter = await this.getUserDetails(reporterId);
    const personName = `${firstName} ${lastName}`.trim() || 'Personne inconnue';

    return await this.createGlobalNotification({
      type: NotificationService.TYPES.UNKNOWN_BLACKLISTED,
      title: '🚨 Nouveau profil indésirable',
      message: `${personName} a été ajouté à la blacklist par ${reporter.name}`,
      priority: NotificationService.PRIORITY.HIGH,
      entityType: 'UNKNOWN_VISITOR',
      entityId: entityId,
      createdBy: reporterId,
      metadata: {
        action: 'unknown_blacklisted',
        personName: personName,
        firstName: firstName,
        lastName: lastName,
        reason: reason,
        severityLevel: severityLevel,
        reportedBy: reporter
      }
    });
  }

  async notifyUnknownUnblacklisted({ firstName, lastName, removerId, reason, entityId }) {
    const remover = await this.getUserDetails(removerId);
    const personName = `${firstName} ${lastName}`.trim() || 'Personne inconnue';

    return await this.createGlobalNotification({
      type: NotificationService.TYPES.UNKNOWN_UNBLACKLISTED,
      title: '✅ Profil indésirable supprimé',
      message: `${personName} a été retiré de la blacklist par ${remover.name}`,
      priority: NotificationService.PRIORITY.MEDIUM,
      entityType: 'UNKNOWN_VISITOR',
      entityId: entityId,
      createdBy: removerId,
      metadata: {
        action: 'unknown_unblacklisted',
        personName: personName,
        firstName: firstName,
        lastName: lastName,
        reason: reason,
        removedBy: remover
      }
    });
  }

  async notifyBlacklistDetected({ blacklistedEntry, detectedBy }) {
    const personName = blacklistedEntry.visitor
      ? `${blacklistedEntry.visitor.firstName} ${blacklistedEntry.visitor.lastName}`
      : `${blacklistedEntry.firstName} ${blacklistedEntry.lastName}`;

    const detector = await this.getUserDetails(detectedBy);

    return await this.createGlobalNotification({
      type: NotificationService.TYPES.BLACKLIST_DETECTED,
      title: '🚨 Visiteur blacklisté détecté',
      message: `Le visiteur "${personName}" a été détecté lors d'une vérification`,
      priority: NotificationService.PRIORITY.HIGH,
      entityType: 'BLACKLIST',
      entityId: blacklistedEntry.id,
      createdBy: detectedBy || 'system',
      metadata: {
        action: 'blacklist_detected',
        nonDesirableId: blacklistedEntry.id,
        personName: personName,
        reason: blacklistedEntry.reason,
        matchType: blacklistedEntry.visitor ? 'known' : 'unknown',
        detectedBy: detector
      }
    });
  }

  // =============================================
  // ########## MÉTHODES POUR LES INCIDENTS ########
  // =============================================

  /**
   * Crée une notification pour la création d'un incident
   */
  async createIncidentCreatedNotification({
    incidentId,
    incidentTitle,
    siteId,
    siteName,
    reporterId,
    reporterName,
    severity,
    priority,
    visitorInvolved = null
  }) {
    return await this.createNotification({
      type: NotificationService.TYPES.INCIDENT_CREATED,
      title: `📋 Incident créé - ${incidentTitle}`,
      message: `Un incident "${incidentTitle}" (${severity}) a été signalé sur ${siteName}`,
      priority: severity === 'CRITIQUE' || severity === 'HAUTE' ? 'high' : 'medium',
      entityType: 'INCIDENT',
      entityId: incidentId,
      userId: reporterId,
      siteId: siteId,
      createdBy: reporterId,
      metadata: {
        incidentId: incidentId,
        incidentTitle: incidentTitle,
        severity: severity,
        priority: priority,
        siteId: siteId,
        siteName: siteName,
        reporterName: reporterName,
        visitorInvolved: visitorInvolved,
        action: 'incident_created'
      }
    });
  }

  /**
   * Crée une notification pour la mise à jour d'un incident
   */
  async createIncidentUpdatedNotification({
    incidentId,
    incidentTitle,
    siteId,
    updatedById,
    updatedByName
  }) {
    return await this.createNotification({
      type: NotificationService.TYPES.INCIDENT_UPDATED,
      title: `✏️ Incident mis à jour - ${incidentTitle}`,
      message: `L'incident "${incidentTitle}" a été mis à jour par ${updatedByName}`,
      priority: 'medium',
      entityType: 'INCIDENT',
      entityId: incidentId,
      userId: null,
      siteId: siteId,
      createdBy: updatedById,
      metadata: {
        incidentId: incidentId,
        incidentTitle: incidentTitle,
        updatedByName: updatedByName,
        action: 'incident_updated'
      }
    });
  }

  /**
   * Crée une notification pour la résolution d'un incident
   */
  async createIncidentResolvedNotification({
    incidentId,
    incidentTitle,
    siteId,
    siteName,
    resolvedById,
    resolvedByName
  }) {
    return await this.createNotification({
      type: NotificationService.TYPES.INCIDENT_RESOLVED,
      title: `✅ Incident résolu - ${incidentTitle}`,
      message: `L'incident "${incidentTitle}" sur ${siteName} a été résolu par ${resolvedByName}`,
      priority: 'medium',
      entityType: 'INCIDENT',
      entityId: incidentId,
      userId: null,
      siteId: siteId,
      createdBy: resolvedById,
      metadata: {
        incidentId: incidentId,
        incidentTitle: incidentTitle,
        resolvedByName: resolvedByName,
        siteName: siteName,
        action: 'incident_resolved'
      }
    });
  }

  /**
   * Crée une notification d'alerte pour les agents du site
   */
  async createIncidentAgentAlertNotification({
    incidentId,
    incidentTitle,
    siteId,
    siteName,
    severity,
    reporterName
  }) {
    return await this.createNotification({
      type: NotificationService.TYPES.INCIDENT_AGENT_ALERT,
      title: `🚨 Nouvel incident sur votre site`,
      message: `Un incident "${incidentTitle}" (${severity}) a été signalé sur ${siteName} par ${reporterName}`,
      priority: severity === 'CRITIQUE' ? 'high' : 'medium',
      entityType: 'INCIDENT',
      entityId: incidentId,
      userId: null, // Pour tous les agents du site
      siteId: siteId,
      createdBy: null,
      metadata: {
        incidentId: incidentId,
        incidentTitle: incidentTitle,
        severity: severity,
        siteName: siteName,
        reporterName: reporterName,
        action: 'incident_agent_alert'
      }
    });
  }

  /**
   * Crée une notification d'alerte pour le manager du site
   */
  async createIncidentManagerAlertNotification({
    incidentId,
    incidentTitle,
    siteId,
    siteName,
    severity,
    reporterName,
    managerName
  }) {
    return await this.createNotification({
      type: NotificationService.TYPES.INCIDENT_MANAGER_ALERT,
      title: `🏢 Incident sur votre site`,
      message: `Un incident "${incidentTitle}" (${severity}) a été signalé sur ${siteName} par ${reporterName}`,
      priority: severity === 'CRITIQUE' ? 'high' : 'medium',
      entityType: 'INCIDENT',
      entityId: incidentId,
      userId: null, // À remplir avec l'ID du manager
      siteId: siteId,
      createdBy: null,
      metadata: {
        incidentId: incidentId,
        incidentTitle: incidentTitle,
        severity: severity,
        siteName: siteName,
        managerName: managerName,
        reporterName: reporterName,
        action: 'incident_manager_alert'
      }
    });
  }

  // =============================================
  // ########## MÉTHODES UTILITAIRES ##############
  // =============================================

  async getUserDetails(userId) {
    if (!userId || userId === 'system') {
      return {
        id: 'system',
        name: 'Système',
        email: null
      };
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      });

      return user ? {
        id: user.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Utilisateur',
        email: user.email
      } : {
        id: userId,
        name: 'Utilisateur',
        email: null
      };
    } catch (error) {
      console.error('❌ Erreur récupération utilisateur:', error);
      return {
        id: userId,
        name: 'Utilisateur',
        email: null
      };
    }
  }

  /**
   * Émission WebSocket pour un site
   */
  emitToSiteWebSocket(siteId, notification) {
    try {
      if (typeof io !== 'undefined' && io) {
        io.to(`site:${siteId}`).emit('site-notification', {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          priority: notification.priority,
          entityType: notification.entityType,
          entityId: notification.entityId,
          siteId: notification.siteId,
          metadata: notification.metadata,
          createdAt: notification.createdAt
        });
      }
    } catch (error) {
      console.warn(`⚠️ Erreur WebSocket site ${siteId}:`, error.message);
    }
  }

  emitToUserWebSocket(userId, notification) {
    try {
      if (typeof io !== 'undefined' && io) {
        io.to(`user:${userId}`).emit('notification', {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          priority: notification.priority,
          entityType: notification.entityType,
          entityId: notification.entityId,
          siteId: notification.siteId,
          metadata: notification.metadata,
          createdAt: notification.createdAt,
          isRead: notification.isRead
        });
      }
    } catch (error) {
      console.warn(`⚠️ Erreur WebSocket user ${userId}:`, error.message);
    }
  }

  emitToWebSocket(notification) {
    try {
      if (typeof io !== 'undefined' && io) {
        io.emit('global-notification', {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          priority: notification.priority,
          entityType: notification.entityType,
          entityId: notification.entityId,
          metadata: notification.metadata,
          createdAt: notification.createdAt
        });
      }
    } catch (error) {
      console.warn('⚠️ Erreur WebSocket globale:', error.message);
    }
  }

  // =============================================
  // ########## MÉTHODES DE GESTION ###############
  // =============================================

  async getUserNotifications(userId, options = {}) {
    try {
      const {
        limit = 50,
        siteId = null,
        unreadOnly = false,
        includeGlobal = true
      } = options;

      const whereConditions = [
        { userId } // notifications personnelles
      ];

      // Notifications de site
      if (siteId) {
        whereConditions.push({
          siteId,
          userId: null
        });
      }

      // Notifications globales (JSON MySQL)
      if (includeGlobal) {
        whereConditions.push({
          userId: null,
          siteId: null,
          metadata: {
            path: '$.isGlobal',
            equals: true
          }
        });
      }

      const whereClause = {
        OR: whereConditions,
        ...(unreadOnly && {
          OR: [
            { isRead: false },
            { isRead: null }
          ]
        })
      };

      const notifications = await prisma.notification.findMany({
        where: whereClause,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      return {
        success: true,
        data: notifications,
        count: notifications.length
      };
    } catch (error) {
      console.error('❌ Erreur récupération notifications:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async markAsRead(notificationId, userId) {
    try {
      const notification = await prisma.notification.findFirst({
        where: {
          id: notificationId,
          OR: [
            // Notification personnelle
            {
              userId: userId
            },
            // Notification globale
            {
              userId: null,
              siteId: null,
              metadata: {
                path: '$.isGlobal',
                equals: true
              }
            },
            // Notification de site
            {
              userId: null,
              siteId: { not: null }
            }
          ]
        }
      });

      if (!notification) {
        throw new Error('Notification non trouvée ou non autorisée');
      }

      const updatedNotification = await prisma.notification.update({
        where: { id: notificationId },
        data: {
          isRead: true,
          readAt: new Date()
        }
      });

      return {
        success: true,
        message: 'Notification marquée comme lue',
        data: updatedNotification
      };
    } catch (error) {
      console.error('❌ Erreur marquage notification:', error);
      throw error;
    }
  }

  async markAllAsRead(userId = null) {
    try {
      let whereClause = { isRead: false };

      if (userId) {
        whereClause = {
          OR: [
            { userId: userId, isRead: false },
            {
              AND: [
                { userId: null },
                { siteId: null },
                { metadata: { equals: { isGlobal: true } } },
                { isRead: false }
              ]
            },
            // Permet de marquer les notifications de site
            {
              AND: [
                { userId: null },
                { siteId: { not: null } },
                { isRead: false }
              ]
            }
          ]
        };
      }

      const result = await prisma.notification.updateMany({
        where: whereClause,
        data: {
          isRead: true,
          readAt: new Date()
        }
      });

      return {
        success: true,
        message: `${result.count} notification(s) marquée(s) comme lue(s)`,
        count: result.count
      };
    } catch (error) {
      console.error('❌ Erreur marquage toutes notifications:', error);
      throw error;
    }
  }

  async getNotificationStats(userId) {
    try {
      const unreadCount = await prisma.notification.count({
        where: {
          OR: [
            { userId: userId, isRead: false },
            {
              AND: [
                { userId: null },
                { siteId: null },
                { metadata: { equals: { isGlobal: true } } },
                { isRead: false }
              ]
            },
            // Compte les notifications de site non lues
            {
              AND: [
                { userId: null },
                { siteId: { not: null } },
                { isRead: false }
              ]
            }
          ]
        }
      });

      const totalCount = await prisma.notification.count({
        where: {
          OR: [
            { userId: userId },
            {
              AND: [
                { userId: null },
                { siteId: null },
                { metadata: { equals: { isGlobal: true } } }
              ]
            },
            // Compte les notifications de site
            {
              AND: [
                { userId: null },
                { siteId: { not: null } }
              ]
            }
          ]
        }
      });

      return {
        success: true,
        data: {
          total: totalCount,
          unread: unreadCount,
          read: totalCount - unreadCount
        }
      };
    } catch (error) {
      console.error('❌ Erreur statistiques notifications:', error);
      throw error;
    }
  }

/**
 * Récupère toutes les notifications d'un utilisateur, lues et non lues, avec catégorisation et statistiques
 * @param {string} userId - ID de l'utilisateur
 * @param {number} limit - Nombre maximum de notifications non lues à retourner
 * @returns {Object} - Toutes les notifications groupées et catégorisées
 */
async getAllUserNotifications(userId, limit = 50) {
  try {
    if (!userId) {
      throw new Error('Le userId est requis');
    }

    // 1️⃣ Récupérer les sites accessibles par l'utilisateur
    const userSites = await prisma.userSite.findMany({
      where: { userId },
      select: { siteId: true }
    });
    const siteIds = userSites.map(us => us.siteId);

    // 2️⃣ Récupérer TOUTES les notifications possibles
    const allPossibleNotifications = await prisma.notification.findMany({
      where: {
        OR: [
          // Notifications personnelles
          { userId: userId },
          // Notifications de site
          ...(siteIds.length > 0 ? [{
            userId: null,
            siteId: { in: siteIds }
          }] : []),
          // Notifications globales (userId null, siteId null)
          { userId: null, siteId: null }
        ]
      },
      take: 300,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        site: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // 3️⃣ Filtrer côté serveur pour n'inclure que les notifications accessibles
    const accessibleNotifications = allPossibleNotifications.filter(notification => {
      // Si c'est une notification personnelle
      if (notification.userId === userId) {
        return true;
      }

      // Si c'est une notification de site
      if (notification.userId === null && notification.siteId) {
        return siteIds.includes(notification.siteId);
      }

      // Si c'est une notification globale (userId null, siteId null)
      if (notification.userId === null && notification.siteId === null) {
        try {
          let metadata = notification.metadata;
          if (metadata && typeof metadata === 'object') {
            return metadata.isGlobal === true;
          }
          return false;
        } catch (error) {
          return false;
        }
      }

      return false;
    });

    // 4️⃣ Définir les types de notifications
    const sosTypes = [
      NotificationService.TYPES.SOS_ALERT,
      NotificationService.TYPES.SOS_RESOLVED,
      NotificationService.TYPES.SOS_GENERAL
    ];

    const incidentTypes = [
      NotificationService.TYPES.INCIDENT_CREATED,
      NotificationService.TYPES.INCIDENT_UPDATED,
      NotificationService.TYPES.INCIDENT_RESOLVED,
      NotificationService.TYPES.INCIDENT_AGENT_ALERT,
      NotificationService.TYPES.INCIDENT_SITE_ALERT,
      NotificationService.TYPES.INCIDENT_MANAGER_ALERT
    ];

    const undesirableTypes = [
      NotificationService.TYPES.VISITOR_BLACKLISTED,
      NotificationService.TYPES.VISITOR_UNBLACKLISTED,
      NotificationService.TYPES.UNKNOWN_BLACKLISTED,
      NotificationService.TYPES.UNKNOWN_UNBLACKLISTED,
      NotificationService.TYPES.BLACKLIST_DETECTED
    ];

    // 5️⃣ Séparer les notifications lues et non lues
    const unreadNotifications = accessibleNotifications.filter(n => !n.isRead);
    const readNotifications = accessibleNotifications.filter(n => n.isRead);

    // 6️⃣ Catégoriser les notifications
    const categorizeNotifications = (notifications) => {
      const result = {
        sos: [],
        incidents: [],
        undesirables: [],
        others: []
      };

      notifications.forEach(notification => {
        if (sosTypes.includes(notification.type)) {
          result.sos.push(notification);
        } else if (incidentTypes.includes(notification.type)) {
          result.incidents.push(notification);
        } else if (undesirableTypes.includes(notification.type)) {
          result.undesirables.push(notification);
        } else {
          result.others.push(notification);
        }
      });

      return result;
    };

    const categorizedUnread = categorizeNotifications(unreadNotifications);
    const categorizedAll = categorizeNotifications(accessibleNotifications);

    // 7️⃣ Appliquer la limite globale aux notifications non lues
    const allUnread = [
      ...categorizedUnread.sos,
      ...categorizedUnread.incidents,
      ...categorizedUnread.undesirables,
      ...categorizedUnread.others
    ];

    const limitedUnread = allUnread.slice(0, limit);
    const limitedUnreadCategorized = categorizeNotifications(limitedUnread);

    // 8️⃣ Calculer les statistiques
    const totalAll = accessibleNotifications.length;
    const totalUnread = unreadNotifications.length;

    // 9️⃣ Retourner la réponse
    return {
      success: true,
      count: totalUnread,
      data: limitedUnreadCategorized,
      statistics: {
        total: totalAll,
        unread: totalUnread,
        read: totalAll - totalUnread,
        byType: {
          sos: {
            total: categorizedAll.sos.length,
            unread: categorizedUnread.sos.length
          },
          incidents: {
            total: categorizedAll.incidents.length,
            unread: categorizedUnread.incidents.length
          },
          undesirables: {
            total: categorizedAll.undesirables.length,
            unread: categorizedUnread.undesirables.length
          },
          others: {
            total: categorizedAll.others.length,
            unread: categorizedUnread.others.length
          }
        }
      }
    };

  } catch (error) {
    console.error('❌ Erreur récupération toutes les notifications:', error);
    throw new Error(`Erreur lors de la récupération des notifications: ${error.message}`);
  }
}

}

module.exports = new NotificationService();
