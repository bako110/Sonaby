const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const notificationService = require('../notification/notification.service');

class IncidentService {
  async createIncident(incidentData, reportedBy) {
    try {
      // 🔹 Vérifications obligatoires
      if (!incidentData.titre || !incidentData.description || !incidentData.siteId || !incidentData.dateIncident) {
        throw new Error('Titre, description, dateIncident et siteId sont requis');
      }

      // 🔹 Vérifier que le site existe
      const site = await prisma.site.findUnique({
        where: { id: incidentData.siteId },
        select: {
          id: true,
          name: true,
          address: true,
          city: true,
          managerEmail: true,
          manager: true,
          managerPhone: true,
        }
      });

      if (!site) throw new Error('Site non trouvé');

      // 🔹 Récupérer les agents assignés au site via UserSite
      const assignedAgents = await prisma.userSite.findMany({
        where: { siteId: incidentData.siteId },
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
      });

      // 🔹 Récupérer le visitorId si visitId fourni
      let visitorId = null;
      let visitorDetails = null;
      if (incidentData.visitId) {
        const visit = await prisma.visit.findUnique({
          where: { id: incidentData.visitId },
          include: { visitor: true }
        });
        if (!visit) throw new Error('Visite non trouvée');
        if (!visit.visitor) throw new Error('La visite n\'a pas de visiteur associé');
        visitorId = visit.visitor.id;
        visitorDetails = visit.visitor;
      }

      // 🔹 Vérifier l'utilisateur rapporteur
      if (!reportedBy) throw new Error('Utilisateur rapporteur requis');
      const reporter = await prisma.user.findUnique({
        where: { id: reportedBy },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true
        }
      });
      if (!reporter) throw new Error('Utilisateur rapporteur non trouvé');

      // 🔹 Créer l'incident
      const incident = await prisma.incident.create({
        data: {
          titre: incidentData.titre,
          description: incidentData.description,
          typeIncident: incidentData.typeIncident || 'AUTRE',
          severite: incidentData.severite || 'MOYENNE',
          priorite: incidentData.priorite || 'NORMALE',
          source: incidentData.source || 'AGENT',
          dateIncident: new Date(incidentData.dateIncident),
          siteId: incidentData.siteId,
          visiteurId: visitorId,
          actionsImmediates: incidentData.actionsImmediates || null,
          temoinPresent: incidentData.temoinPresent || false,
          notifierAgents: incidentData.notifierAgents || false,
          reportedBy
        },
        include: {
          site: { select: { id: true, name: true, address: true, city: true } },
          reporter: { select: { id: true, firstName: true, lastName: true, email: true } },
          visiteur: { select: { id: true, firstName: true, lastName: true, phone: true } }
        }
      });

      // 🔹 Envoyer les notifications d'incident
      await this.sendIncidentNotifications(incident, site, reporter, assignedAgents.map(a => a.user), visitorDetails);

      // 🔹 Notifier les agents si demandé (ancienne méthode gardée pour compatibilité)
      if (incidentData.notifierAgents) {
        await this.notifyAgents(incident);
      }

      return {
        success: true,
        message: 'Incident créé avec succès',
        data: incident
      };

    } catch (error) {
      console.error('Erreur création incident:', error);
      return {
        success: false,
        message: `Erreur lors de la création de l'incident: ${error.message}`
      };
    }
  }

  /**
   * Envoyer les notifications pour un nouvel incident
   */
  async sendIncidentNotifications(incident, site, reporter, assignedUsers = [], visitor = null) {
    try {
      // Récupérer les administrateurs
      const admins = await prisma.user.findMany({
        where: {
          role: 'ADMIN',
          isActive: true
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      });

      // 1. Notification au rapporteur
      await notificationService.createIncidentCreatedNotification({
        incidentId: incident.id,
        incidentTitle: incident.titre,
        siteId: site.id,
        siteName: site.name,
        reporterId: reporter.id,
        reporterName: `${reporter.firstName} ${reporter.lastName}`,
        severity: incident.severite,
        priority: incident.priorite,
        visitorInvolved: visitor ? `${visitor.firstName} ${visitor.lastName}` : null
      });

      // 2. Notification aux agents assignés au site
      if (assignedUsers.length > 0) {
        const agentIds = assignedUsers
          .filter(agent => agent.id !== reporter.id)
          .map(agent => agent.id);

        if (agentIds.length > 0) {
          await notificationService.createIncidentAgentAlertNotification({
            incidentId: incident.id,
            incidentTitle: incident.titre,
            siteId: site.id,
            siteName: site.name,
            severity: incident.severite,
            reporterName: `${reporter.firstName} ${reporter.lastName}`
          });
        }
      }

      // 3. Notification aux administrateurs
      if (admins.length > 0) {
        const adminIds = admins
          .filter(admin => admin.id !== reporter.id)
          .map(admin => admin.id);

        if (adminIds.length > 0) {
          for (const admin of admins) {
            await notificationService.createIncidentCreatedNotification({
              incidentId: incident.id,
              incidentTitle: incident.titre,
              siteId: site.id,
              siteName: site.name,
              reporterId: admin.id,
              reporterName: `${admin.firstName} ${admin.lastName}`,
              severity: incident.severite,
              priority: incident.priorite,
              visitorInvolved: visitor ? `${visitor.firstName} ${visitor.lastName}` : null
            });
          }
        }
      }

      // 4. Notification au manager du site (si email de manager existe)
      if (site.managerEmail) {
        // Rechercher l'utilisateur par email du manager
        const managerUser = await prisma.user.findFirst({
          where: {
            email: site.managerEmail
          }
        });

        if (managerUser && managerUser.id !== reporter.id) {
          await notificationService.createIncidentManagerAlertNotification({
            incidentId: incident.id,
            incidentTitle: incident.titre,
            siteId: site.id,
            siteName: site.name,
            severity: incident.severite,
            reporterName: `${reporter.firstName} ${reporter.lastName}`,
            managerName: site.manager || 'Manager'
          });
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi des notifications incident:', error);
      // Ne pas bloquer la création de l'incident
    }
  }

  /**
   * Envoyer notification de mise à jour d'incident
   */
  async sendIncidentUpdateNotification(incident, updatedById) {
    try {
      const updater = await prisma.user.findUnique({
        where: { id: updatedById },
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      });

      if (!updater) {
        console.error('❌ Utilisateur metteur à jour non trouvé');
        return;
      }

      // Notification au rapporteur original
      if (incident.reportedBy && incident.reportedBy !== updatedById) {
        await notificationService.createIncidentUpdatedNotification({
          incidentId: incident.id,
          incidentTitle: incident.titre,
          siteId: incident.siteId,
          updatedById: updatedById,
          updatedByName: `${updater.firstName} ${updater.lastName}`
        });
      }
    } catch (error) {
      console.error('❌ Erreur notification mise à jour incident:', error);
    }
  }

  /**
   * Envoyer notification de résolution d'incident
   */
  async sendIncidentResolutionNotification(incident, resolvedById) {
    try {
      // Récupérer le résolveur
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

      // Récupérer les détails du site avec les agents
      const siteDetails = await prisma.site.findUnique({
        where: { id: incident.siteId },
        select: {
          id: true,
          name: true,
          managerEmail: true,
          manager: true
        }
      });

      // Récupérer les agents assignés au site
      const assignedAgents = await prisma.userSite.findMany({
        where: { siteId: incident.siteId },
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
      });

      // 1. Notification au rapporteur original
      if (incident.reportedBy && incident.reportedBy !== resolvedById) {
        await notificationService.createIncidentResolvedNotification({
          incidentId: incident.id,
          incidentTitle: incident.titre,
          siteId: incident.siteId,
          siteName: siteDetails.name,
          resolvedById: resolvedById,
          resolvedByName: `${resolver.firstName} ${resolver.lastName}`
        });
      }

      // 2. Notification aux agents assignés
      if (assignedAgents.length > 0) {
        const agentIds = assignedAgents
          .map(assignment => assignment.user.id)
          .filter(agentId => agentId !== resolvedById && agentId !== incident.reportedBy);

        if (agentIds.length > 0) {
          await notificationService.createIncidentResolvedNotification({
            incidentId: incident.id,
            incidentTitle: incident.titre,
            siteId: incident.siteId,
            siteName: siteDetails.name,
            resolvedById: resolvedById,
            resolvedByName: `${resolver.firstName} ${resolver.lastName}`
          });
        }
      }

      // 3. Notification au manager du site (si email de manager existe)
      if (siteDetails?.managerEmail) {
        const managerUser = await prisma.user.findFirst({
          where: {
            email: siteDetails.managerEmail
          }
        });

        if (managerUser && managerUser.id !== resolvedById) {
          await notificationService.createIncidentResolvedNotification({
            incidentId: incident.id,
            incidentTitle: incident.titre,
            siteId: incident.siteId,
            siteName: siteDetails.name,
            resolvedById: resolvedById,
            resolvedByName: `${resolver.firstName} ${resolver.lastName}`
          });
        }
      }
    } catch (error) {
      console.error('❌ Erreur notification résolution incident:', error);
    }
  }

  async getIncidents(filters = {}) {
    try {
      const where = {};

      // Filtrer par site
      if (filters.siteId) {
        where.siteId = filters.siteId;
      }

      // Filtrer par statut de résolution
      if (filters.isResolved !== undefined) {
        where.isResolved = filters.isResolved;
      }

      // Filtrer par sévérité
      if (filters.severite) {
        where.severite = filters.severite;
      }

      // Filtrer par date
      if (filters.dateDebut) {
        where.dateIncident = {
          ...where.dateIncident,
          gte: new Date(filters.dateDebut)
        };
      }

      if (filters.dateFin) {
        where.dateIncident = {
          ...where.dateIncident,
          lte: new Date(filters.dateFin)
        };
      }

      const incidents = await prisma.incident.findMany({
        where,
        include: {
          site: {
            select: { id: true, name: true }
          },
          visiteur: {
            select: { id: true, firstName: true, lastName: true, phone: true }
          },
          reporter: {
            select: { id: true, firstName: true, lastName: true }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return {
        success: true,
        data: incidents,
        total: incidents.length
      };

    } catch (error) {
      console.error('Erreur lors de la récupération des incidents:', error);
      throw new Error(`Erreur lors de la récupération des incidents: ${error.message}`);
    }
  }

  async getIncidentById(id) {
    try {
      const incident = await prisma.incident.findUnique({
        where: { id },
        include: {
          site: {
            select: { id: true, name: true, address: true }
          },
          visiteur: {
            select: { id: true, firstName: true, lastName: true, phone: true, email: true }
          },
          reporter: {
            select: { id: true, firstName: true, lastName: true, email: true }
          }
        }
      });

      if (!incident) {
        throw new Error('Incident non trouvé');
      }

      return {
        success: true,
        data: incident
      };

    } catch (error) {
      console.error('Erreur lors de la récupération de l\'incident:', error);
      throw new Error(`Erreur lors de la récupération de l'incident: ${error.message}`);
    }
  }

  async getIncidentsByVisitor(visitorId, filters = {}) {
    try {
      // Construire la clause where - utiliser visiteurId directement
      const where = {
        visiteurId: visitorId
      };

      // Appliquer les filtres supplémentaires
      if (filters.siteId) {
        where.siteId = filters.siteId;
      }

      if (filters.isResolved !== undefined) {
        where.isResolved = filters.isResolved;
      }

      if (filters.severite) {
        where.severite = filters.severite;
      }

      // Filtrer par date
      if (filters.dateDebut) {
        where.dateIncident = {
          ...where.dateIncident,
          gte: new Date(filters.dateDebut)
        };
      }

      if (filters.dateFin) {
        where.dateIncident = {
          ...where.dateIncident,
          lte: new Date(filters.dateFin)
        };
      }

      const incidents = await prisma.incident.findMany({
        where,
        include: {
          site: {
            select: { id: true, name: true }
          },
          reporter: {
            select: { id: true, firstName: true, lastName: true }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return {
        success: true,
        message: `${incidents.length} incident(s) trouvé(s) pour ce visiteur`,
        data: incidents,
        total: incidents.length
      };

    } catch (error) {
      console.error('Erreur lors de la récupération des incidents du visiteur:', error);
      throw new Error(`Erreur lors de la récupération des incidents du visiteur: ${error.message}`);
    }
  }

  async updateIncident(id, updateData, updatedBy) {
    try {
      // Vérifier que l'incident existe
      const existingIncident = await prisma.incident.findUnique({
        where: { id }
      });

      if (!existingIncident) {
        throw new Error('Incident non trouvé');
      }

      // Préparer les données de mise à jour
      const updateFields = {
        ...updateData,
        updatedAt: new Date()
      };

      // Ne pas permettre la modification de certains champs critiques
      delete updateFields.reportedBy;
      delete updateFields.createdAt;

      // Gérer les relations Prisma (siteId et visitId doivent être transformés en connect)
      if (updateFields.siteId) {
        // Vérifier que le site existe
        const siteExists = await prisma.site.findUnique({
          where: { id: updateFields.siteId }
        });
        if (!siteExists) {
          throw new Error('Site non trouvé');
        }
        updateFields.site = { connect: { id: updateFields.siteId } };
        delete updateFields.siteId;
      }

      if (updateFields.visitId !== undefined) {
        if (updateFields.visitId === '' || updateFields.visitId === null) {
          // Déconnecter le visiteur si visitId est vide ou null
          updateFields.visiteur = { disconnect: true };
        } else {
          // Récupérer le visiteur à partir de la visite
          const visit = await prisma.visit.findUnique({
            where: { id: updateFields.visitId },
            select: { 
              id: true, 
              visitorId: true,
              visitor: {
                select: { id: true, firstName: true, lastName: true }
              }
            }
          });
          
          if (!visit) {
            throw new Error(`Visite avec l'ID ${updateFields.visitId} non trouvée`);
          }
          
          if (!visit.visitorId) {
            throw new Error('Cette visite n\'a pas de visiteur associé');
          }
          
          // Vérifier que le visiteur existe toujours en base
          const visitorExists = await prisma.visitor.findUnique({
            where: { id: visit.visitorId },
            select: { id: true }
          });
          
          if (!visitorExists) {
            // Le visiteur a été supprimé, on déconnecte la relation
            updateFields.visiteur = { disconnect: true };
          } else {
            // Connecter le visiteur (pas la visite)
            updateFields.visiteur = { connect: { id: visit.visitorId } };
          }
        }
        delete updateFields.visitId;
      }

      const incident = await prisma.incident.update({
        where: { id },
        data: updateFields,
        include: {
          site: {
            select: { id: true, name: true }
          },
          visiteur: {
            select: { id: true, firstName: true, lastName: true }
          },
          reporter: {
            select: { id: true, firstName: true, lastName: true }
          }
        }
      });

      // Envoyer une notification de mise à jour si les changements sont significatifs
      if (updateData.severite || updateData.priorite) {
        await this.sendIncidentUpdateNotification(incident, updatedBy);
      }

      return {
        success: true,
        message: 'Incident mis à jour avec succès',
        data: incident
      };

    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'incident:', error);
      throw new Error(`Erreur lors de la mise à jour de l'incident: ${error.message}`);
    }
  }

  async resolveIncident(id, resolutionData, resolvedBy) {
    try {
      const incident = await prisma.incident.update({
        where: { id },
        data: {
          isResolved: true,
          resolvedAt: new Date(),
          resolutionNotes: resolutionData.resolutionNotes || null,
          resolvedBy: resolvedBy
        },
        include: {
          site: {
            select: { id: true, name: true }
          },
          reporter: {
            select: { id: true, firstName: true, lastName: true }
          }
        }
      });

      // Envoyer la notification de résolution
      await this.sendIncidentResolutionNotification(incident, resolvedBy);

      return {
        success: true,
        message: 'Incident résolu avec succès',
        data: incident
      };

    } catch (error) {
      console.error('Erreur lors de la résolution de l\'incident:', error);
      throw new Error(`Erreur lors de la résolution de l'incident: ${error.message}`);
    }
  }

  async deleteIncident(id) {
    try {
      const incident = await prisma.incident.delete({
        where: { id }
      });

      return {
        success: true,
        message: 'Incident supprimé avec succès',
        data: incident
      };

    } catch (error) {
      console.error('Erreur lors de la suppression de l\'incident:', error);
      throw new Error(`Erreur lors de la suppression de l'incident: ${error.message}`);
    }
  }

  async getIncidentStatistics(filters = {}) {
    try {
      const where = {};

      // Appliquer les filtres
      if (filters.siteId) {
        where.siteId = filters.siteId;
      }

      if (filters.dateDebut) {
        where.dateIncident = {
          ...where.dateIncident,
          gte: new Date(filters.dateDebut)
        };
      }

      if (filters.dateFin) {
        where.dateIncident = {
          ...where.dateIncident,
          lte: new Date(filters.dateFin)
        };
      }

      // Statistiques générales
      const [
        totalIncidents,
        resolvedIncidents,
        pendingIncidents,
        incidentsBySeverity,
        incidentsByType,
        incidentsByPriority
      ] = await Promise.all([
        // Total des incidents
        prisma.incident.count({ where }),

        // Incidents résolus
        prisma.incident.count({
          where: { ...where, isResolved: true }
        }),

        // Incidents en attente
        prisma.incident.count({
          where: { ...where, isResolved: false }
        }),

        // Incidents par sévérité
        prisma.incident.groupBy({
          by: ['severite'],
          where,
          _count: { id: true }
        }),

        // Incidents par type
        prisma.incident.groupBy({
          by: ['typeIncident'],
          where,
          _count: { id: true }
        }),

        // Incidents par priorité
        prisma.incident.groupBy({
          by: ['priorite'],
          where,
          _count: { id: true }
        })
      ]);

      return {
        success: true,
        data: {
          total: totalIncidents,
          resolved: resolvedIncidents,
          pending: pendingIncidents,
          resolutionRate: totalIncidents > 0 ? Math.round((resolvedIncidents / totalIncidents) * 100) : 0,
          bySeverity: incidentsBySeverity.map(item => ({
            severite: item.severite,
            count: item._count.id
          })),
          byType: incidentsByType.map(item => ({
            type: item.typeIncident,
            count: item._count.id
          })),
          byPriority: incidentsByPriority.map(item => ({
            priorite: item.priorite,
            count: item._count.id
          }))
        }
      };

    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  }

  // Méthode privée pour notifier les agents (version simplifiée)
  async notifyAgents(incident) {
    try {
      // Récupérer les agents du site via UserSite
      const userSites = await prisma.userSite.findMany({
        where: { siteId: incident.siteId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      const agents = userSites.map(us => us.user);

      // Ici vous pourriez intégrer un système de notification
      // Email, SMS, WebSocket, etc.
      // Pour l'instant, on simule la notification
      return {
        notifiedAgents: agents.length,
        message: 'Agents notifiés avec succès'
      };

    } catch (error) {
      console.error('Erreur lors de la notification des agents:', error);
      // Ne pas bloquer la création de l'incident si la notification échoue
      return {
        notifiedAgents: 0,
        error: error.message
      };
    }
  }

  async getWeeklyIncidentsBySite(siteId) {
    try {
      const now = new Date();

      // 🔹 Calcul du début de la semaine (Lundi 00:00 UTC)
      const day = now.getUTCDay(); // 0 = dimanche, 1 = lundi, ...
      const diffToMonday = day === 0 ? -6 : 1 - day; // Décalage vers lundi
      const startOfWeek = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + diffToMonday,
        0, 0, 0, 0
      ));

      // 🔹 Calcul de la fin de la semaine (Dimanche 23:59:59.999 UTC)
      const endOfWeek = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + diffToMonday + 6,
        23, 59, 59, 999
      ));

      // 🔹 Récupérer tous les incidents du site dans la semaine
      const incidents = await prisma.incident.findMany({
        where: {
          siteId,
          dateIncident: {
            gte: startOfWeek,
            lte: endOfWeek
          }
        },
        include: {
          site: true,
          reporter: true,
          visiteur: true
        },
        orderBy: { dateIncident: 'desc' }
      });

      return {
        success: true,
        message: `${incidents.length} incident(s) cette semaine`,
        data: incidents
      };

    } catch (error) {
      console.error("❌ Erreur getWeeklyIncidentsBySite:", error);
      return {
        success: false,
        message: "Impossible de récupérer les incidents de la semaine.",
        error: error.message
      };
    }
  }

  async getWeeklyIncidentsByCheckpoint(checkpointId) {
  try {
    // Vérifier si le checkpoint existe et récupérer son site
    const checkpoint = await prisma.checkpoint.findUnique({
      where: { id: checkpointId },
      include: {
        site: {
          select: {
            id: true,
            name: true
          }
        },
        agent: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!checkpoint) {
      throw new Error('Checkpoint non trouvé');
    }

    // Calculer le début (lundi) et la fin (dimanche) de la semaine actuelle
    const today = new Date();

    // Début de semaine (lundi)
    const startOfWeek = new Date(today);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    // Fin de semaine (dimanche)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Récupérer les incidents du site du checkpoint pour cette semaine
    const incidents = await prisma.incident.findMany({
      where: {
        siteId: checkpoint.siteId,
        dateIncident: {
          gte: startOfWeek,
          lte: endOfWeek
        }
      },
      include: {
        reporter: {
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
            name: true,
            code: true
          }
        },
        visiteur: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            idNumber: true,
            idType: true,
            company: true,
            phone: true,
            email: true
          }
        }
      },
      orderBy: {
        dateIncident: 'desc'
      }
    });

    // Transformer les incidents pour inclure les noms complets
    const incidentsWithDetails = incidents.map(incident => ({
      id: incident.id,
      titre: incident.titre,
      description: incident.description,
      typeIncident: incident.typeIncident,
      severite: incident.severite,
      priorite: incident.priorite,
      source: incident.source,
      dateIncident: incident.dateIncident,
      actionsImmediates: incident.actionsImmediates,
      temoinPresent: incident.temoinPresent,
      notifierAgents: incident.notifierAgents,
      isResolved: incident.isResolved,
      resolvedAt: incident.resolvedAt,
      resolutionNotes: incident.resolutionNotes,
      createdAt: incident.createdAt,
      updatedAt: incident.updatedAt,

      // Informations du reporter
      reporter: incident.reporter ? {
        id: incident.reporter.id,
        fullName: `${incident.reporter.firstName} ${incident.reporter.lastName}`,
        firstName: incident.reporter.firstName,
        lastName: incident.reporter.lastName,
        email: incident.reporter.email
      } : null,

      // Informations du site
      site: incident.site ? {
        id: incident.site.id,
        name: incident.site.name,
        code: incident.site.code
      } : null,

      // Informations du visiteur (si applicable)
      visiteur: incident.visiteur ? {
        id: incident.visiteur.id,
        fullName: `${incident.visiteur.firstName} ${incident.visiteur.lastName}`,
        firstName: incident.visiteur.firstName,
        lastName: incident.visiteur.lastName,
        idNumber: incident.visiteur.idNumber,
        idType: incident.visiteur.idType,
        company: incident.visiteur.company,
        phone: incident.visiteur.phone,
        email: incident.visiteur.email
      } : null
    }));

    return {
      success: true,
      message: `${incidents.length} incident(s) trouvé(s) pour la semaine`,
      checkpointInfo: {
        id: checkpoint.id,
        name: checkpoint.name,
        site: {
          id: checkpoint.site.id,
          name: checkpoint.site.name
        },
        agent: checkpoint.agent ? {
          id: checkpoint.agent.id,
          fullName: `${checkpoint.agent.firstName} ${checkpoint.agent.lastName}`
        } : null
      },
      periode: {
        debut: startOfWeek,
        fin: endOfWeek
      },
      data: incidentsWithDetails
    };

  } catch (error) {
    console.error('Erreur dans getWeeklyIncidentsByCheckpoint:', error);
    return {
      success: false,
      message: `Erreur: ${error.message}`,
      data: []
    };
  }
}

}

module.exports = new IncidentService();
