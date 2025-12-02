const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class IncidentService {
  async createIncident(incidentData, reportedBy) {
    try {
      // Vérifications des données requises
      if (!incidentData.titre || !incidentData.description || !incidentData.siteId) {
        throw new Error('Titre, description et siteId sont requis');
      }

      // Vérifier que le site existe
      const site = await prisma.site.findUnique({
        where: { id: incidentData.siteId }
      });

      if (!site) {
        throw new Error('Site non trouvé');
      }

      // Vérifier la visite si fournie et récupérer le visiteur
      let visitorId = null;
      if (incidentData.visitId && incidentData.visitId !== '') {
        console.log('DEBUG - Recherche de la visite:', incidentData.visitId);
        
        const visit = await prisma.visit.findUnique({
          where: { id: incidentData.visitId },
          include: {
            visitor: true
          }
        });

        console.log('DEBUG - Visit trouvée:', visit);

        if (!visit) {
          throw new Error('Visite non trouvée');
        }
        
        if (!visit.visitor) {
          console.log('DEBUG - La visite n\'a pas de visiteur associé');
          throw new Error('La visite n\'a pas de visiteur associé');
        }
        
        // Récupérer l'ID du visiteur depuis la visite
        visitorId = visit.visitor.id;
        console.log('DEBUG - VisitorId récupéré:', visitorId);
      }

      // Vérifier que l'utilisateur qui rapporte existe
      if (!reportedBy) {
        throw new Error('L\'utilisateur qui rapporte l\'incident est requis');
      }

      const reporterExists = await prisma.user.findUnique({
        where: { id: reportedBy }
      });

      if (!reporterExists) {
        throw new Error('Utilisateur rapporteur non trouvé');
      }

      // Préparer les données de l'incident
      const incident = await prisma.incident.create({
        data: {
          titre: incidentData.titre,
          description: incidentData.description,
          typeIncident: incidentData.typeIncident || 'AUTRE',
          severite: incidentData.severite || 'MOYENNE',
          priorite: incidentData.priorite || 'NORMALE',
          source: incidentData.source || 'AGENT',
          dateIncident: new Date(incidentData.dateIncident),
          heureIncident: new Date(incidentData.heureIncident),
          siteId: incidentData.siteId,
          visiteurId: visitorId, // Utiliser le visiteurId récupéré de la visite
          actionsImmediates: incidentData.actionsImmediates || null,
          temoinPresent: incidentData.temoinPresent || false,
          notifierAgents: incidentData.notifierAgents || false,
          reportedBy: reportedBy
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

      // Notifier les agents si demandé
      if (incidentData.notifierAgents) {
        await this.notifyAgents(incident);
      }

      return {
        success: true,
        message: 'Incident créé avec succès',
        data: incident
      };

    } catch (error) {
      console.error('Erreur lors de la création de l\'incident:', error);
      throw new Error(`Erreur lors de la création de l'incident: ${error.message}`);
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
}

module.exports = new IncidentService();
