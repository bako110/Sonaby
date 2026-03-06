const { prisma } = require('../../config/prisma');
const notificationService = require('../notification/notification.service');

class SOSService {
  async createSOS(sosData, sentBy) {
    try {

      // 1. Vérifier que le checkpoint existe
      const checkpoint = await prisma.checkpoint.findUnique({
        where: { id: sosData.checkpointId },
        include: {
          site: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true,
              country: true
            }
          }
        }
      });

      if (!checkpoint) {
        throw new Error('Checkpoint non trouvé');
      }

      // 2. Récupérer le template - OBLIGATOIRE
      console.log('🔍 DEBUG - Recherche template ID:', sosData.templateId);
      const template = await prisma.sosTemplate.findUnique({
        where: { 
          id: sosData.templateId
        }
      });

      if (!template) {
        throw new Error(`Template SOS ID ${sosData.templateId} non trouvé`);
      }

      console.log('🔍 DEBUG - Template trouvé:', {
        id: template.id,
        titre: template.titre,
        messagePreview: template.message.substring(0, 50) + '...'
      });

      // 3. Vérifier s'il y a déjà un SOS actif (non résolu) pour ce checkpoint
      const activeSOS = await prisma.sosAlert.findFirst({
        where: {
          checkpointId: sosData.checkpointId,
          isResolved: false
        }
      });

      if (activeSOS) {
        throw new Error('Un SOS est déjà actif pour ce checkpoint');
      }

      console.log('🔍 DEBUG - Création SOS avec template:', template.titre);
      
      // 4. Créer le SOS avec le message du template
      const sos = await prisma.sosAlert.create({
        data: {
          checkpointId: sosData.checkpointId,
          message: template.message,
          triggeredBy: sentBy,
          isResolved: false
        },
        include: {
          checkpoint: {
            include: {
              site: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                  city: true,
                  country: true
                }
              }
            }
          },
          triggerer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      // ============ NOTIFICATION UNIQUE POUR LE SITE ============
      // Construire le nom complet du déclencheur à partir des données déjà récupérées
      const triggeredByName = sos.triggerer ? 
        `${sos.triggerer.firstName} ${sos.triggerer.lastName}` : 
        'Utilisateur inconnu';

      // Appeler la notification avec les vraies données
      await this.createSOSNotificationForSite({
        sosId: sos.id,
        checkpointId: sos.checkpointId,
        checkpointName: sos.checkpoint.name, // Nom du checkpoint depuis la relation
        siteId: sos.checkpoint.site.id, // ID du site depuis la relation
        siteName: sos.checkpoint.site.name, // Nom du site depuis la relation
        triggeredBy: triggeredByName,
        triggeredById: sos.triggeredBy,
        templateTitle: template.titre, // Titre du template
        message: sos.message // Message du SOS (qui vient du template)
      });
      
      // ========================================================

      // 5. Retourner la réponse avec infos du template
      return {
        ...sos,
        templateInfo: {
          id: template.id,
          titre: template.titre,
          usedTemplate: true
        }
      };
      
    } catch (error) {
      console.error('❌ Erreur création SOS:', error);
      throw new Error(`Erreur lors de la création du SOS: ${error.message}`);
    }
  }
async createSOS(sosData, sentBy) {
    try {
      console.log('🔍 DEBUG - sosData:', sosData);
      console.log('🔍 DEBUG - sentBy:', sentBy);
      console.log('🔍 DEBUG - TemplateId reçu:', sosData.templateId);
      
      // 1. Vérifier que le checkpoint existe
      const checkpoint = await prisma.checkpoint.findUnique({
        where: { id: sosData.checkpointId },
        include: {
          site: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true,
              country: true
            }
          }
        }
      });

      if (!checkpoint) {
        throw new Error('Checkpoint non trouvé');
      }

      // 2. Récupérer le template - OBLIGATOIRE
      console.log('🔍 DEBUG - Recherche template ID:', sosData.templateId);
      const template = await prisma.sosTemplate.findUnique({
        where: { 
          id: sosData.templateId
        }
      });

      if (!template) {
        throw new Error(`Template SOS ID ${sosData.templateId} non trouvé`);
      }

      console.log('🔍 DEBUG - Template trouvé:', {
        id: template.id,
        titre: template.titre,
        messagePreview: template.message.substring(0, 50) + '...'
      });

      // 3. Vérifier s'il y a déjà un SOS actif (non résolu) pour ce checkpoint
      const activeSOS = await prisma.sosAlert.findFirst({
        where: {
          checkpointId: sosData.checkpointId,
          isResolved: false
        }
      });

      if (activeSOS) {
        throw new Error('Un SOS est déjà actif pour ce checkpoint');
      }

      console.log('🔍 DEBUG - Création SOS avec template:', template.titre);
      
      // 4. Créer le SOS avec le message du template
      const sos = await prisma.sosAlert.create({
        data: {
          checkpointId: sosData.checkpointId,
          message: template.message,
          triggeredBy: sentBy,
          isResolved: false
        },
        include: {
          checkpoint: {
            include: {
              site: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                  city: true,
                  country: true
                }
              }
            }
          },
          triggerer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      console.log('🔍 DEBUG - SOS créé avec succès:', sos.id);

      // ============ NOTIFICATION UNIQUE POUR LE SITE ============
      try {
        // Construire le nom complet du déclencheur
        const triggeredByName = sos.triggerer ? 
          `${sos.triggerer.firstName} ${sos.triggerer.lastName}` : 
          'Utilisateur inconnu';

        // Utiliser le service de notification importé
        let notificationTitle, notificationMessage;
        
        if (template.titre) {
          notificationTitle = `🚨 ${template.titre} - ${sos.checkpoint.name}`;
          notificationMessage = `Alerte "${template.titre}" déclenchée au checkpoint "${sos.checkpoint.name}" (${sos.checkpoint.site.name}) par ${triggeredByName}`;
        } else {
          notificationTitle = `🚨 ALERTE SOS - ${sos.checkpoint.name}`;
          notificationMessage = `Alerte SOS déclenchée au checkpoint "${sos.checkpoint.name}" (${sos.checkpoint.site.name}) par ${triggeredByName}`;
        }

        await notificationService.createNotification({
          type: 'SOS_ALERT',
          title: notificationTitle,
          message: notificationMessage,
          priority: 'CRITICAL',
          entityType: 'SOS',
          entityId: sos.id,
          userId: null, // Pour tout le site
          siteId: sos.checkpoint.site.id,
          createdBy: sos.triggeredBy,
          metadata: {
            sosId: sos.id,
            checkpointId: sos.checkpointId,
            checkpointName: sos.checkpoint.name,
            siteId: sos.checkpoint.site.id,
            siteName: sos.checkpoint.site.name,
            triggeredBy: triggeredByName,
            triggeredById: sos.triggeredBy,
            templateTitle: template.titre,
            message: sos.message,
            action: 'sos_alert_site',
            timestamp: new Date().toISOString()
          }
        });

        console.log('✅ Notification envoyée avec succès');
      } catch (notificationError) {
        console.error('⚠️ Erreur lors de l\'envoi de la notification:', notificationError.message);
        // Continuer même si la notification échoue
        console.log('ℹ️ Le SOS a été créé, mais la notification a échoué');
      }
      // ========================================================

      // 5. Retourner la réponse avec infos du template
      return {
        ...sos,
        templateInfo: {
          id: template.id,
          titre: template.titre,
          usedTemplate: true
        }
      };
      
    } catch (error) {
      console.error('❌ Erreur création SOS:', error);
      throw new Error(`Erreur lors de la création du SOS: ${error.message}`);
    }
  }

  
  async createGeneralSOS(sosData, sentBy) {
    try {
      console.log('🔍 DEBUG - sosData (GENERAL):', sosData);
      console.log('🔍 DEBUG - sentBy (GENERAL):', sentBy);
      
      // Vérifier que le checkpoint existe
      const checkpoint = await prisma.checkpoint.findUnique({
        where: { id: sosData.checkpointId },
        include: {
          site: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true,
              country: true
            }
          }
        }
      });

      if (!checkpoint) {
        throw new Error('Checkpoint non trouvé');
      }

      console.log('🔍 DEBUG - About to create GENERAL SOS with triggeredBy:', sentBy);
      
      // Créer un SOS automatique avec message prédéfini
      const sosAlert = await prisma.sosAlert.create({
        data: {
          checkpointId: checkpoint.id,
          message: `ALERTE GÉNÉRALE - ${checkpoint.name}`,
          triggeredBy: sentBy,
          isResolved: false
        },
        include: {
          checkpoint: {
            include: {
              site: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                  city: true,
                  country: true
                }
              }
            }
          },
          triggerer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      // ============ NOTIFICATION UNIQUE POUR LE SITE ============
      await this.sendSOSNotificationForSite(sosAlert);
      // ========================================================

      return {
        success: true,
        message: 'SOS général déclenché automatiquement',
        data: sosAlert
      };
    } catch (error) {
      throw new Error(`Erreur lors de la création du SOS général: ${error.message}`);
    }
  }

  async deactivateSOS(sosId, resolvedBy) {
    try {
      // Vérifier que le SOS existe
      const sos = await prisma.sosAlert.findUnique({
        where: { id: sosId },
        include: {
          checkpoint: {
            include: {
              site: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                  city: true,
                  country: true
                }
              }
            }
          },
          triggerer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      if (!sos) {
        throw new Error('SOS non trouvé');
      }

      if (sos.isResolved) {
        throw new Error('SOS déjà résolu');
      }

      // Marquer le SOS comme résolu
      const resolvedSos = await prisma.sosAlert.update({
        where: { id: sosId },
        data: {
          isResolved: true,
          resolvedAt: new Date(),
          resolvedBy: resolvedBy
        },
        include: {
          checkpoint: {
            include: {
              site: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                  city: true,
                  country: true
                }
              }
            }
          },
          triggerer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      // ============ NOTIFICATION RÉSOLUTION POUR LE SITE ============
      await this.sendSOSResolutionNotificationForSite(resolvedSos, resolvedBy);
      // =============================================================

      return resolvedSos;
    } catch (error) {
      throw new Error(`Erreur lors de la résolution du SOS: ${error.message}`);
    }
  }

  // ============ MÉTHODES DE NOTIFICATION SIMPLIFIÉES ============
  
  /**
   * Envoyer une notification SOS pour TOUT LE SITE
   */
  async sendSOSNotificationForSite(sos) {
    try {
      console.log('🔔 Envoi notification SOS pour le site');
      
      // Récupérer les détails complets du SOS avec les relations
      const sosWithDetails = await prisma.sosAlert.findUnique({
        where: { id: sos.id },
        include: {
          checkpoint: {
            include: {
              site: true
            }
          },
          triggerer: true
        }
      });

      if (!sosWithDetails) {
        console.error('❌ SOS non trouvé pour notifications');
        return;
      }

      const checkpoint = sosWithDetails.checkpoint;
      const site = checkpoint.site;
      const triggerer = sosWithDetails.triggerer;

      // UNE SEULE notification pour tout le site
      await notificationService.createSOSNotificationForSite({
        sosId: sos.id,
        checkpointId: checkpoint.id,
        checkpointName: checkpoint.name,
        siteId: site.id,
        siteName: site.name,
        triggeredBy: `${triggerer.firstName} ${triggerer.lastName}`,
        triggeredById: sos.triggeredBy,
        message: sos.message || 'Alerte SOS déclenchée'
      });

      console.log('✅ Notification SOS envoyée pour tout le site');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de la notification SOS:', error);
    }
  }

  /**
   * Envoyer une notification de résolution SOS pour TOUT LE SITE
   */
  async sendSOSResolutionNotificationForSite(resolvedSOS, resolvedById) {
    try {
      console.log('🔔 Envoi notification résolution SOS pour le site');
      
      // Récupérer les détails du résolveur
      const resolver = await prisma.user.findUnique({
        where: { id: resolvedById },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      });

      if (!resolver) {
        console.error('❌ Utilisateur résolveur non trouvé');
        return;
      }

      const checkpoint = resolvedSOS.checkpoint;
      const site = checkpoint.site;

      // UNE SEULE notification pour tout le site
      await notificationService.createSOSResolutionNotificationForSite({
        sosId: resolvedSOS.id,
        checkpointId: checkpoint.id,
        checkpointName: checkpoint.name,
        siteId: site.id,
        siteName: site.name,
        resolvedByName: `${resolver.firstName} ${resolver.lastName}`,
        resolvedById: resolvedById,
        resolvedAt: new Date().toISOString()
      });

      console.log('✅ Notification résolution SOS envoyée pour tout le site');
      
    } catch (error) {
      console.error('❌ Erreur notification résolution SOS:', error);
    }
  }

  // ============ MÉTHODES EXISTANTES (GARDÉES POUR COMPATIBILITÉ) ============

  /**
   * Méthode obsolète - gardée pour compatibilité
   */
  async sendNotifications(sos) {
    try {
      console.log(`🚨 SOS ALERT 🚨`);
      console.log(`Checkpoint: ${sos.checkpoint.name}`);
      console.log(`Site: ${sos.checkpoint.site.name} (${sos.checkpoint.site.city})`);
      console.log(`Envoyé par: ${sos.triggerer.firstName} ${sos.triggerer.lastName}`);
      console.log(`Message: ${sos.message || 'Aucun message'}`);
      console.log(`Heure: ${sos.triggeredAt}`);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi des notifications:', error);
      return false;
    }
  }

  async getAllSOS(filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        statut,
        priorite,
        typeIncident,
        checkpointId,
        agentId,
        userId,
        dateDebut,
        dateFin,
        searchTerm,
        isResolved,
        sortBy = 'triggeredAt',
        sortOrder = 'desc'
      } = filters;

      const skip = (page - 1) * limit;
      
      let whereClause = {};
      
      // Filtre par checkpoint
      if (checkpointId) {
        whereClause.checkpointId = checkpointId;
      }

      // Filtre par statut résolu/non résolu
      if (isResolved !== undefined && isResolved !== null) {
        whereClause.isResolved = isResolved;
      }

      // Filtre par agent (celui qui a déclenché le SOS)
      if (agentId) {
        whereClause.triggeredBy = agentId;
      }

      // Construire les conditions OR pour userId et searchTerm
      const orConditions = [];

      // Filtre par userId (soit déclencheur soit résolveur)
      if (userId) {
        orConditions.push(
          { triggeredBy: userId },
          { resolvedBy: userId }
        );
      }

      // Recherche textuelle (dans le message et nom du checkpoint)
      if (searchTerm) {
        orConditions.push(
          { message: { contains: searchTerm } },
          {
            checkpoint: {
              name: { contains: searchTerm }
            }
          },
          {
            checkpoint: {
              site: {
                name: { contains: searchTerm }
              }
            }
          }
        );
      }

      // Appliquer les conditions OR si elles existent
      if (orConditions.length > 0) {
        whereClause.OR = orConditions;
      }

      // Filtres par date (plage)
      if (dateDebut || dateFin) {
        whereClause.triggeredAt = {};
        if (dateDebut) {
          whereClause.triggeredAt.gte = new Date(dateDebut);
        }
        if (dateFin) {
          whereClause.triggeredAt.lte = new Date(dateFin);
        }
      }

      // Filtres par statut, priorité, type s'ils sont ajoutés au schéma Prisma
      if (statut) {
        whereClause.statut = statut;
      }
      if (priorite) {
        whereClause.priorite = priorite;
      }
      if (typeIncident) {
        whereClause.typeIncident = typeIncident;
      }

      // Gestion du tri
      const orderBy = {};
      const validSortFields = ['triggeredAt', 'isResolved', 'message'];
      const sortField = validSortFields.includes(sortBy) ? sortBy : 'triggeredAt';
      orderBy[sortField] = sortOrder === 'asc' ? 'asc' : 'desc';

      const [sosAlerts, total] = await Promise.all([
        prisma.sosAlert.findMany({
          where: whereClause,
          skip,
          take: limit,
          include: {
            checkpoint: {
              include: {
                site: {
                  select: {
                    id: true,
                    name: true,
                    address: true,
                    city: true,
                    country: true
                  }
                }
              }
            },
            triggerer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            },
            resolver:{
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          },
          orderBy
        }),
        prisma.sosAlert.count({ where: whereClause })
      ]);

      return {
        sosAlerts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        },
        appliedFilters: filters
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des SOS filtrés: ${error.message}`);
    }
  }

  async getSOSById(id) {
    try {
      const sos = await prisma.sosAlert.findUnique({
        where: { id },
        include: {
          checkpoint: {
            include: {
              site: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                  city: true,
                  country: true
                }
              }
            }
          },
          triggerer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true
            }
          }
        }
      });
      
      if (!sos) {
        throw new Error('SOS non trouvé');
      }

      return sos;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du SOS: ${error.message}`);
    }
  }

  async resolveSOS(id, resolvedBy, notes) {
    try {
      const existingSOS = await this.getSOSById(id);
      
      if (existingSOS.isResolved) {
        throw new Error('Ce SOS est déjà résolu');
      }

      const updatedSOS = await prisma.sosAlert.update({
        where: { id },
        data: { 
          isResolved: true,
          resolvedBy,
          resolvedAt: new Date(),
          resolutionNotes: notes
        },
        include: {
          checkpoint: {
            include: {
              site: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                  city: true,
                  country: true
                }
              }
            }
          },
          triggerer: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          resolver: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      // Notification de résolution
      await this.sendSOSResolutionNotificationForSite(updatedSOS, resolvedBy);

      return updatedSOS;
    } catch (error) {
      throw new Error(`Erreur lors de la résolution du SOS: ${error.message}`);
    }
  }

  async getActiveSOS() {
    try {
      const activeSOS = await prisma.sosAlert.findMany({
        where: {
          isResolved: false
        },
        include: {
          checkpoint: {
            include: {
              site: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                  city: true,
                  country: true
                }
              }
            }
          },
          triggerer: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: {
          triggeredAt: 'desc'
        }
      });

      return activeSOS;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des SOS actifs: ${error.message}`);
    }
  }

  async getSOSStats() {
    try {
      const stats = await prisma.sosAlert.aggregate({
        _count: {
          id: true
        }
      });

      const activeSOS = await prisma.sosAlert.count({
        where: {
          isResolved: false
        }
      });

      const sosPerCheckpoint = await prisma.sosAlert.groupBy({
        by: ['checkpointId'],
        _count: {
          id: true
        }
      });

      // Statistiques par jour (7 derniers jours)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentSOS = await prisma.sosAlert.findMany({
        where: {
          triggeredAt: {
            gte: sevenDaysAgo
          }
        },
        select: {
          triggeredAt: true
        }
      });

      const sosByDay = {};
      recentSOS.forEach(sos => {
        const day = sos.triggeredAt.toISOString().split('T')[0];
        sosByDay[day] = (sosByDay[day] || 0) + 1;
      });

      return {
        totalSOS: stats._count.id,
        activeSOS,
        resolvedSOS: stats._count.id - activeSOS,
        sosPerCheckpoint,
        sosByDay
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques SOS: ${error.message}`);
    }
  }


  // ============ MÉTHODES OBSOLÈTES (À SUPPRIMER ÉVENTUELLEMENT) ============

  /**
   * @deprecated Utiliser sendSOSNotificationForSite à la place
   */
  async sendSOSNotifications(sos, triggeredById) {
    console.warn('⚠️ Méthode sendSOSNotifications est obsolète, utiliser sendSOSNotificationForSite');
    return this.sendSOSNotificationForSite(sos);
  }

  /**
   * @deprecated Utiliser sendSOSResolutionNotificationForSite à la place
   */
  async sendSOSResolutionNotification(resolvedSOS, resolvedById) {
    console.warn('⚠️ Méthode sendSOSResolutionNotification est obsolète, utiliser sendSOSResolutionNotificationForSite');
    return this.sendSOSResolutionNotificationForSite(resolvedSOS, resolvedById);
  }

  // Créer un template SOS
  async createTemplate(titre, message) {
    try {
      const template = await prisma.sosTemplate.create({
        data: { titre, message }
      });
      return template;
    } catch (error) {
      throw new Error(`Erreur création template: ${error.message}`);
    }
  }

  // Récupérer tous les templates
  async getAllTemplates() {
    try {
      return await prisma.sosTemplate.findMany({
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      throw new Error(`Erreur récupération templates: ${error.message}`);
    }
  }

  // Récupérer un template par ID
  async getTemplateById(id) {
    try {
      const template = await prisma.sosTemplate.findUnique({
        where: { id: parseInt(id) }
      });
      
      if (!template) throw new Error('Template non trouvé');
      return template;
    } catch (error) {
      throw new Error(`Erreur récupération template: ${error.message}`);
    }
  }

  // Mettre à jour un template
  async updateTemplate(id, titre, message) {
    try {
      return await prisma.sosTemplate.update({
        where: { id: parseInt(id) },
        data: { titre, message }
      });
    } catch (error) {
      if (error.code === 'P2025') throw new Error('Template non trouvé');
      throw new Error(`Erreur mise à jour template: ${error.message}`);
    }
  }

  // Supprimer un template
  async deleteTemplate(id) {
    try {
      return await prisma.sosTemplate.delete({
        where: { id: parseInt(id) }
      });
    } catch (error) {
      if (error.code === 'P2025') throw new Error('Template non trouvé');
      throw new Error(`Erreur suppression template: ${error.message}`);
    }
  }
}

module.exports = new SOSService();