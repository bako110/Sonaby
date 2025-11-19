const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class VisitService {
  async createVisit(visitData) {
    try {
      // Vérifier que le visiteur existe et n'est pas indésirable
      const visitor = await prisma.visitor.findUnique({
        where: { id: visitData.visitorId },
        include: {
          nonDesirables: true
        }
      });

      if (!visitor) {
        throw new Error('Visiteur non trouvé');
      }

      if (visitor.nonDesirables.length > 0) {
        throw new Error('Ce visiteur est marqué comme indésirable et ne peut pas effectuer de visite');
      }

      // Vérifier que le checkpoint existe
      const checkpoint = await prisma.checkpoint.findUnique({
        where: { id: visitData.checkpointId }
      });

      if (!checkpoint) {
        throw new Error('Checkpoint non trouvé');
      }

      // Vérifier que le service existe
      const service = await prisma.service.findUnique({
        where: { id: visitData.serviceId }
      });

      if (!service) {
        throw new Error('Service non trouvé');
      }

      // Si c'est une visite de groupe, vérifier le représentant
      if (visitData.groupRepresentativeId) {
        const representative = await prisma.visitor.findUnique({
          where: { id: visitData.groupRepresentativeId }
        });

        if (!representative) {
          throw new Error('Représentant de groupe non trouvé');
        }
      }

      // Vérifier s'il y a déjà une visite active pour ce visiteur
      const activeVisit = await prisma.visit.findFirst({
        where: {
          visitorId: visitData.visitorId,
          endAt: null
        }
      });

      if (activeVisit) {
        throw new Error('Ce visiteur a déjà une visite en cours');
      }

      const visit = await prisma.visit.create({
        data: {
          ...visitData,
          startAt: new Date()
        },
        include: {
          visitor: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              company: true
            }
          },
          checkpoint: {
            select: {
              id: true,
              name: true,
              site: {
                select: {
                  id: true,
                  name: true,
                  location: true
                }
              }
            }
          },
          service: {
            select: {
              id: true,
              name: true
            }
          },
          groupRepresentative: {
            select: {
              id: true,
              firstname: true,
              lastname: true
            }
          }
        }
      });

      return visit;
    } catch (error) {
      throw new Error(`Erreur lors de la création de la visite: ${error.message}`);
    }
  }

  async getAllVisits(page = 1, limit = 10, search = null, visitorId = null, checkpointId = null, serviceId = null, status = 'all') {
    try {
      const skip = (page - 1) * limit;
      
      let whereClause = {};
      
      if (search) {
        whereClause.OR = [
          { reason: { contains: search, mode: 'insensitive' } },
          { personVisited: { contains: search, mode: 'insensitive' } },
          { visitor: { 
            OR: [
              { firstname: { contains: search, mode: 'insensitive' } },
              { lastname: { contains: search, mode: 'insensitive' } }
            ]
          }}
        ];
      }

      if (visitorId) {
        whereClause.visitorId = visitorId;
      }

      if (checkpointId) {
        whereClause.checkpointId = checkpointId;
      }

      if (serviceId) {
        whereClause.serviceId = serviceId;
      }

      if (status === 'active') {
        whereClause.endAt = null;
      } else if (status === 'completed') {
        whereClause.endAt = { not: null };
      }

      const [visits, total] = await Promise.all([
        prisma.visit.findMany({
          where: whereClause,
          skip,
          take: limit,
          include: {
            visitor: {
              select: {
                id: true,
                firstname: true,
                lastname: true,
                company: true
              }
            },
            checkpoint: {
              select: {
                id: true,
                name: true,
                site: {
                  select: {
                    id: true,
                    name: true,
                    location: true
                  }
                }
              }
            },
            service: {
              select: {
                id: true,
                name: true
              }
            },
            groupRepresentative: {
              select: {
                id: true,
                firstname: true,
                lastname: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
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
          pages: Math.ceil(total / limit)
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
              firstname: true,
              lastname: true,
              email: true,
              phone: true,
              company: true
            }
          },
          checkpoint: {
            select: {
              id: true,
              name: true,
              site: {
                select: {
                  id: true,
                  name: true,
                  location: true
                }
              }
            }
          },
          service: {
            select: {
              id: true,
              name: true
            }
          },
          groupRepresentative: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              company: true
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

  async checkoutVisit(id, endAt = null) {
    try {
      const existingVisit = await this.getVisitById(id);
      
      if (existingVisit.endAt) {
        throw new Error('Cette visite est déjà terminée');
      }

      const updatedVisit = await prisma.visit.update({
        where: { id },
        data: {
          endAt: endAt ? new Date(endAt) : new Date()
        },
        include: {
          visitor: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              company: true
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
          service: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      return updatedVisit;
    } catch (error) {
      throw new Error(`Erreur lors de la fin de visite: ${error.message}`);
    }
  }

  async deleteVisit(id) {
    try {
      const existingVisit = await this.getVisitById(id);
      
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
      const stats = await prisma.visit.aggregate({
        _count: {
          id: true
        }
      });

      const activeVisits = await prisma.visit.count({
        where: {
          endAt: null
        }
      });

      const completedVisits = await prisma.visit.count({
        where: {
          endAt: { not: null }
        }
      });

      const visitsPerService = await prisma.visit.groupBy({
        by: ['serviceId'],
        _count: {
          id: true
        }
      });

      const visitsPerCheckpoint = await prisma.visit.groupBy({
        by: ['checkpointId'],
        _count: {
          id: true
        }
      });

      // Statistiques par jour (7 derniers jours)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentVisits = await prisma.visit.findMany({
        where: {
          createdAt: {
            gte: sevenDaysAgo
          }
        },
        select: {
          createdAt: true
        }
      });

      const visitsByDay = {};
      recentVisits.forEach(visit => {
        const day = visit.createdAt.toISOString().split('T')[0];
        visitsByDay[day] = (visitsByDay[day] || 0) + 1;
      });

      return {
        totalVisits: stats._count.id,
        activeVisits,
        completedVisits,
        visitsPerService,
        visitsPerCheckpoint,
        visitsByDay
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  }

  async getActiveVisits() {
    try {
      const activeVisits = await prisma.visit.findMany({
        where: {
          endAt: null
        },
        include: {
          visitor: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              company: true
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
          service: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          startAt: 'desc'
        }
      });

      return activeVisits;
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
