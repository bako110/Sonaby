const { prisma } = require('../../config/prisma');

class VisitService {
  async createVisit(visitData) {
    try {
      const visit = await prisma.visit.create({
        data: {
          visitorId: visitData.visitorId,
          checkpointId: visitData.checkpointId,
          entityVisited: visitData.entityVisited,
          contactPerson: visitData.contactPerson,
          origin: visitData.origin,
          reason: visitData.reason,
          notes: visitData.notes,
          status: visitData.status || 'present',
          entryTime: new Date()
        },
        include: {
          visitor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
              company: true,
              emergencyContactPhone: true,
              emergencyContactName: true
            }
          },
          checkpoint: {
            select: {
              id: true,
              name: true,
              site: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          incidents: {
            select: {
              id: true,
              title: true,
              description: true,
              severityLevel: true,
              isResolved: true,
              createdAt: true
            }
          }
        }
      });

      return {
        success: true,
        message: 'Visite créée avec succès',
        data: visit
      };
    } catch (error) {
      throw new Error(`Erreur lors de la création de la visite: ${error.message}`);
    }
  }

  async getAllVisits(page = 1, limit = 10, search = null, visitorId = null, status = null) {
    try {
      const skip = (page - 1) * limit;
      
      let whereClause = {};
      
      if (search) {
        whereClause.OR = [
          { visitor: { firstName: { contains: search } } },
          { visitor: { lastName: { contains: search } } },
          { entityVisited: { contains: search } },
          { contactPerson: { contains: search } },
          { origin: { contains: search } }
        ];
      }
      
      if (visitorId) {
        whereClause.visitorId = visitorId;
      }
      
      if (status) {
        whereClause.status = status;
      }

      const [visits, total] = await Promise.all([
        prisma.visit.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { entryTime: 'desc' },
          include: {
            visitor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
                company: true
              }
            },
            incidents: {
              select: {
                id: true,
                title: true,
                severityLevel: true,
                isResolved: true
              }
            }
          }
        }),
        prisma.visit.count({ where: whereClause })
      ]);

      return {
        visits,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des visites: ${error.message}`);
    }
  }

  async getVisitById(id) {
    try {
      const visit = await prisma.visit.findUnique({
        where: { id },
        include: {
          visitor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
              company: true,
              emergencyContactPhone: true,
              emergencyContactName: true
            }
          },
          incidents: {
            select: {
              id: true,
              title: true,
              description: true,
              severityLevel: true,
              isResolved: true,
              createdAt: true,
              resolvedAt: true
            }
          }
        }
      });

      if (!visit) {
        throw new Error('Visite non trouvée');
      }

      return visit;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de la visite: ${error.message}`);
    }
  }

  async checkoutVisit(id, endAt) {
    try {
      const visit = await prisma.visit.findUnique({
        where: { id }
      });

      if (!visit) {
        throw new Error('Visite non trouvée');
      }

      if (visit.exitTime) {
        throw new Error('Cette visite est déjà terminée');
      }

      const updatedVisit = await prisma.visit.update({
        where: { id },
        data: {
          exitTime: endAt ? new Date(endAt) : new Date(),
          status: 'left'
        },
        include: {
          visitor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
              company: true
            }
          }
        }
      });

      return updatedVisit;
    } catch (error) {
      throw new Error(`Erreur lors de la terminaison de la visite: ${error.message}`);
    }
  }

  async deleteVisit(id) {
    try {
      const visit = await prisma.visit.findUnique({
        where: { id }
      });

      if (!visit) {
        throw new Error('Visite non trouvée');
      }

      await prisma.visit.delete({
        where: { id }
      });

      return { message: 'Visite supprimée avec succès' };
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de la visite: ${error.message}`);
    }
  }

  async getVisitStats() {
    try {
      const [total, present, left, today] = await Promise.all([
        prisma.visit.count(),
        prisma.visit.count({ where: { status: 'present' } }),
        prisma.visit.count({ where: { status: 'left' } }),
        prisma.visit.count({
          where: {
            entryTime: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        })
      ]);

      return {
        total,
        present,
        left,
        today
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  }

  async getActiveVisits() {
    try {
      const visits = await prisma.visit.findMany({
        where: { status: 'present' },
        orderBy: { entryTime: 'desc' },
        include: {
          visitor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
              company: true
            }
          }
        }
      });

      return visits;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des visites actives: ${error.message}`);
    }
  }

  async incrementVisitorCount(visitorId) {
    try {
      // Cette méthode peut être utilisée pour incrémenter un compteur de visites récurrentes
      // Pour l'instant, on retourne juste le nombre de visites du visiteur
      const visitCount = await prisma.visit.count({
        where: { visitorId }
      });

      return { visitorId, visitCount };
    } catch (error) {
      throw new Error(`Erreur lors de l'incrémentation du compteur de visites: ${error.message}`);
    }
  }
}

module.exports = new VisitService();
