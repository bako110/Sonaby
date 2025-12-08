const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class IncidentService {
 async createIncident(incidentData, reportedBy) {
  try {
    // 🔹 Vérifications obligatoires
    if (!incidentData.titre || !incidentData.description || !incidentData.siteId || !incidentData.dateIncident) {
      throw new Error('Titre, description, dateIncident et siteId sont requis');
    }

    // 🔹 Vérifier que le site existe
    const site = await prisma.site.findUnique({ where: { id: incidentData.siteId } });
    if (!site) throw new Error('Site non trouvé');

    // 🔹 Récupérer le visitorId si visitId fourni
    let visitorId = null;
    if (incidentData.visitId) {
      const visit = await prisma.visit.findUnique({
        where: { id: incidentData.visitId },
        include: { visitor: true }
      });
      if (!visit) throw new Error('Visite non trouvée');
      if (!visit.visitor) throw new Error('La visite n\'a pas de visiteur associé');
      visitorId = visit.visitor.id;
    }

    // 🔹 Vérifier l'utilisateur rapporteur
    if (!reportedBy) throw new Error('Utilisateur rapporteur requis');
    const reporterExists = await prisma.user.findUnique({ where: { id: reportedBy } });
    if (!reporterExists) throw new Error('Utilisateur rapporteur non trouvé');

    // 🔹 Créer l'incident
    const incident = await prisma.incident.create({
      data: {
        titre: incidentData.titre,
        description: incidentData.description,
        typeIncident: incidentData.typeIncident || 'AUTRE',
        severite: incidentData.severite || 'MOYENNE',
        priorite: incidentData.priorite || 'NORMALE',
        source: incidentData.source || 'AGENT',
        dateIncident: new Date(incidentData.dateIncident), // date + heure complète
        // dateIncident: dateObj,
        siteId: incidentData.siteId,
        visiteurId: visitorId,
        actionsImmediates: incidentData.actionsImmediates || null,
        temoinPresent: incidentData.temoinPresent || false,
        notifierAgents: incidentData.notifierAgents || false,
        reportedBy
      },
      include: {
        site: { select: { id: true, name: true } },
        reporter: { select: { id: true, firstName: true, lastName: true } }
      }
    });

    // 🔹 Notifier les agents si demandé
    if (incidentData.notifierAgents) {
      await this.notifyAgents(incident);
    }

    return { success: true, message: 'Incident créé avec succès', data: incident };

  } catch (error) {
    console.error('Erreur création incident:', error);
    return { success: false, message: `Erreur lors de la création de l'incident: ${error.message}` };
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

  // Méthode privée pour notifier les agents
  async notifyAgents(incident) {
    try {
      // Récupérer les agents du site
      const agents = await prisma.user.findMany({
        where: {
          assignedSites: {
            some: {
              siteId: incident.siteId
            }
          },
          isActive: true
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true
        }
      });

      // Ici vous pourriez intégrer un système de notification
      // Email, SMS, WebSocket, etc.
      console.log(`Notification envoyée à ${agents.length} agents pour l'incident ${incident.id}`);

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



}

module.exports = new IncidentService();
