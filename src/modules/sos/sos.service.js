const { prisma } = require('../../config/prisma');
const notificationService = require('../notification/notification.service');

class SOSService {
  async createSOS(sosData, sentBy) {
    try {
      console.log('🔍 DEBUG - sosData:', sosData);
      console.log('🔍 DEBUG - sentBy:', sentBy);
      
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
          },
          agentAssignments: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  role: true
                }
              }
            }
          }
        }
      });

      if (!checkpoint) {
        throw new Error('Checkpoint non trouvé');
      }

      // Vérifier s'il y a déjà un SOS actif (non résolu) pour ce checkpoint
      const activeSOS = await prisma.sosAlert.findFirst({
        where: {
          checkpointId: sosData.checkpointId,
          isResolved: false
        }
      });

      if (activeSOS) {
        throw new Error('Un SOS est déjà actif pour ce checkpoint');
      }

      console.log('🔍 DEBUG - About to create SOS with triggeredBy:', sentBy);
      
      const sos = await prisma.sosAlert.create({
        data: {
          checkpointId: sosData.checkpointId,
          message: sosData.message,
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
              },
              agentAssignments: {
                include: {
                  user: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      email: true
                    }
                  }
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

      // ============ AJOUT DES NOTIFICATIONS ============
      await this.sendSOSNotifications(sos, sentBy);
      // ================================================

      return sos;
    } catch (error) {
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
          },
          agentAssignments: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  role: true
                }
              }
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
              },
              agentAssignments: {
                include: {
                  user: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      email: true
                    }
                  }
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

      // ============ AJOUT DES NOTIFICATIONS ============
      await this.sendSOSNotifications(sosAlert, sentBy);
      // ================================================

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

      // ============ AJOUT NOTIFICATION RÉSOLUTION ============
      await this.sendSOSResolutionNotification(resolvedSos, resolvedBy);
      // ======================================================

      return resolvedSos;
    } catch (error) {
      throw new Error(`Erreur lors de la résolution du SOS: ${error.message}`);
    }
  }

  // ============ NOUVELLES MÉTHODES DE NOTIFICATION ============
  
  /**
   * Envoyer les notifications pour un nouveau SOS (SIMPLIFIÉ avec le nouveau service)
   */
  async sendSOSNotifications(sos, triggeredById) {
    try {
      console.log('🔔 Début envoi notifications SOS');
      
      // Récupérer les détails complets du SOS avec les relations
      const sosWithDetails = await prisma.sosAlert.findUnique({
        where: { id: sos.id },
        include: {
          checkpoint: {
            include: {
              site: true,
              agentAssignments: {
                include: {
                  user: true
                }
              }
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

      // 1. Notification à l'utilisateur qui a déclenché l'alerte
      // Utilise la protection anti-doublon intégrée dans notificationService
      await notificationService.createSOSNotification({
        sosId: sos.id,
        checkpointId: checkpoint.id,
        checkpointName: checkpoint.name,
        siteId: site.id,
        siteName: site.name,
        triggeredBy: `${triggerer.firstName} ${triggerer.lastName}`,
        triggeredById: triggeredById,
        message: sos.message || 'Alerte SOS déclenchée'
      }, triggeredById);

      // 2. Notifier les users assignés au checkpoint via agentAssignments
      const assignedUsers = checkpoint.agentAssignments?.map(assignment => assignment.user) || [];
      
      if (assignedUsers.length > 0) {
        console.log(`🔔 Notifying ${assignedUsers.length} assigned users`);
        
        for (const user of assignedUsers) {
          // Ne pas notifier l'user qui a déclenché l'alerte
          if (user.id !== triggeredById) {
            // La protection anti-doublon est déjà intégrée dans createNotification
            await notificationService.createNotification({
              type: 'SOS',
              title: `🚨 Alerte SOS - ${checkpoint.name}`,
              message: `Alerte SOS déclenchée par ${triggerer.firstName} ${triggerer.lastName} au checkpoint "${checkpoint.name}" (${site.name})`,
              priority: 'high',
              entityType: 'SOS',
              entityId: sos.id,
              userId: user.id,
              siteId: site.id,
              createdBy: triggeredById,
              metadata: {
                sosId: sos.id,
                checkpointId: checkpoint.id,
                checkpointName: checkpoint.name,
                siteId: site.id,
                siteName: site.name,
                triggeredBy: `${triggerer.firstName} ${triggerer.lastName}`,
                triggeredById: triggeredById,
                action: 'alert' // Important pour la détection des doublons
              }
            });
          }
        }
      }

      // 3. Notifier les administrateurs (utilise la protection anti-doublon intégrée)
      try {
        await notificationService.notifyByRole('ADMIN', {
          type: 'SOS',
          title: `🚨 ALERTE CRITIQUE - SOS`,
          message: `Alerte SOS déclenchée au checkpoint "${checkpoint.name}" (${site.name}) par ${triggerer.firstName} ${triggerer.lastName}`,
          priority: 'high',
          entityType: 'SOS',
          entityId: sos.id,
          siteId: site.id,
          createdBy: triggeredById,
          metadata: {
            sosId: sos.id,
            checkpointId: checkpoint.id,
            checkpointName: checkpoint.name,
            siteId: site.id,
            siteName: site.name,
            triggeredBy: `${triggerer.firstName} ${triggerer.lastName}`,
            triggeredById: triggeredById,
            action: 'admin_alert' // Important pour la détection des doublons
          }
        });
      } catch (error) {
        console.error('❌ Erreur notification admins:', error);
      }

      // 4. Notifier le manager du site (s'il existe)
      if (site.manager) {
        // Rechercher l'utilisateur par email du manager
        const managerUser = await prisma.user.findFirst({
          where: {
            email: site.managerEmail || undefined
          }
        });

        if (managerUser) {
          // Utilise la protection anti-doublon intégrée
          await notificationService.notifyUser(managerUser.id, {
            type: 'SOS',
            title: `🏢 Alerte SOS sur votre site`,
            message: `Alerte SOS déclenchée au checkpoint "${checkpoint.name}" sur le site "${site.name}"`,
            priority: 'high',
            entityType: 'SOS',
            entityId: sos.id,
            siteId: site.id,
            createdBy: triggeredById,
            metadata: {
              sosId: sos.id,
              checkpointName: checkpoint.name,
              siteName: site.name,
              action: 'site_manager_alert' // Important pour la détection des doublons
            }
          });
        }
      }

      console.log('✅ Notifications SOS envoyées avec succès (protection anti-doublons intégrée)');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi des notifications SOS:', error);
      // Ne pas bloquer le processus principal en cas d'erreur de notification
    }
  }

  /**
   * Envoyer une notification de résolution SOS (SIMPLIFIÉ avec le nouveau service)
   */
  async sendSOSResolutionNotification(resolvedSOS, resolvedById) {
    try {
      console.log('🔔 Envoi notification résolution SOS');
      
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

      // Notification à la personne qui a déclenché l'alerte
      if (resolvedSOS.triggeredBy && resolvedSOS.triggeredBy !== resolvedById) {
        // Utilise la protection anti-doublon intégrée dans notificationService
        await notificationService.createSOSResolutionNotification({
          sosId: resolvedSOS.id,
          checkpointId: resolvedSOS.checkpointId,
          checkpointName: resolvedSOS.checkpoint.name,
          siteId: resolvedSOS.checkpoint.siteId,
          resolvedByName: `${resolver.firstName} ${resolver.lastName}`,
          resolvedById: resolvedById,
          resolvedAt: new Date().toISOString()
        }, resolvedSOS.triggeredBy);
      }

      // Notification à tous les users impliqués via agentAssignments
      const checkpoint = await prisma.checkpoint.findUnique({
        where: { id: resolvedSOS.checkpointId },
        include: {
          agentAssignments: {
            include: {
              user: true
            }
          }
        }
      });

      if (checkpoint && checkpoint.agentAssignments) {
        const assignedUsers = checkpoint.agentAssignments.map(assignment => assignment.user);
        
        for (const user of assignedUsers) {
          // Ne pas notifier le résolveur
          if (user.id !== resolvedById) {
            // La protection anti-doublon est déjà intégrée dans createNotification
            await notificationService.createNotification({
              type: 'SOS',
              title: `✅ Alerte SOS résolue`,
              message: `L'alerte SOS au checkpoint "${resolvedSOS.checkpoint.name}" a été résolue par ${resolver.firstName} ${resolver.lastName}`,
              priority: 'medium',
              entityType: 'SOS',
              entityId: resolvedSOS.id,
              userId: user.id,
              siteId: resolvedSOS.checkpoint.siteId,
              createdBy: resolvedById,
              metadata: {
                sosId: resolvedSOS.id,
                checkpointName: resolvedSOS.checkpoint.name,
                resolvedBy: `${resolver.firstName} ${resolver.lastName}`,
                action: 'agent_resolved' // Important pour la détection des doublons
              }
            });
          }
        }
      }

      console.log('✅ Notification résolution SOS envoyée (protection anti-doublons intégrée)');
      
    } catch (error) {
      console.error('❌ Erreur notification résolution SOS:', error);
    }
  }

  // ============ MÉTHODES EXISTANTES ============

  async sendNotifications(sos) {
    try {
      console.log(`🚨 SOS ALERT 🚨`);
      console.log(`Checkpoint: ${sos.checkpoint.name}`);
      console.log(`Site: ${sos.checkpoint.site.name} (${sos.checkpoint.site.city})`);
      console.log(`Envoyé par: ${sos.triggerer.firstName} ${sos.triggerer.lastName}`);
      console.log(`Message: ${sos.message || 'Aucun message'}`);
      console.log(`Heure: ${sos.triggeredAt}`);
      
      // Cette méthode est maintenant obsolète, gardée pour compatibilité
      // Utiliser sendSOSNotifications à la place
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi des notifications:', error);
      return false;
    }
  }

  async getAllSOS(page = 1, limit = 10, checkpointId = null, active = null) {
    try {
      const skip = (page - 1) * limit;
      
      let whereClause = {};
      
      if (checkpointId) {
        whereClause.checkpointId = checkpointId;
      }

      if (active !== null) {
        // active=true signifie isResolved=false
        whereClause.isResolved = !active;
      }

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
            }
          },
          orderBy: {
            triggeredAt: 'desc'
          }
        }),
        prisma.sosAlert.count({ where: whereClause })
      ]);

      return {
        sosAlerts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des SOS: ${error.message}`);
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
}

module.exports = new SOSService();