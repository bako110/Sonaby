const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class VisitorService {
  async createVisitor(visitorData) {
    try {
      // Si un fichier est spécifié, vérifier qu'il existe
      if (visitorData.fileId) {
        const file = await prisma.file.findUnique({
          where: { id: visitorData.fileId }
        });

        if (!file) {
          throw new Error('Fichier non trouvé');
        }
      }

      const visitor = await prisma.visitor.create({
        data: visitorData,
        include: {
          file: {
            select: {
              id: true,
              originalName: true,
              mimeType: true,
              size: true
            }
          }
        }
      });
      return visitor;
    } catch (error) {
      throw new Error(`Erreur lors de la création du visiteur: ${error.message}`);
    }
  }

  async getAllVisitors(page = 1, limit = 10, search = null, company = null) {
    try {
      const skip = (page - 1) * limit;
      
      let whereClause = {};
      
      if (search) {
        whereClause.OR = [
          { firstname: { contains: search, mode: 'insensitive' } },
          { lastname: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (company) {
        whereClause.company = { contains: company, mode: 'insensitive' };
      }

      const [visitors, total] = await Promise.all([
        prisma.visitor.findMany({
          where: whereClause,
          skip,
          take: limit,
          include: {
            file: {
              select: {
                id: true,
                originalName: true,
                mimeType: true,
                size: true
              }
            },
            _count: {
              select: {
                visits: true,
                appointments: true,
                incidents: true,
                nonDesirables: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.visitor.count({ where: whereClause })
      ]);

      return {
        visitors,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des visiteurs: ${error.message}`);
    }
  }

  async getVisitorById(id) {
    try {
      const visitor = await prisma.visitor.findUnique({
        where: { id },
        include: {
          file: {
            select: {
              id: true,
              originalName: true,
              mimeType: true,
              size: true,
              path: true
            }
          },
          visits: {
            take: 10,
            orderBy: {
              createdAt: 'desc'
            },
            include: {
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
          },
          appointments: {
            take: 10,
            orderBy: {
              createdAt: 'desc'
            },
            include: {
              service: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          incidents: {
            take: 5,
            orderBy: {
              createdAt: 'desc'
            },
            include: {
              service: {
                select: {
                  id: true,
                  name: true
                }
              },
              reporter: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          },
          nonDesirables: {
            orderBy: {
              createdAt: 'desc'
            },
            include: {
              reporter: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      });
      
      if (!visitor) {
        throw new Error('Visiteur non trouvé');
      }

      return visitor;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du visiteur: ${error.message}`);
    }
  }

  async updateVisitor(id, updateData) {
    try {
      const existingVisitor = await this.getVisitorById(id);
      
      // Si on change le fichier, vérifier qu'il existe
      if (updateData.fileId) {
        const file = await prisma.file.findUnique({
          where: { id: updateData.fileId }
        });

        if (!file) {
          throw new Error('Fichier non trouvé');
        }
      }

      const updatedVisitor = await prisma.visitor.update({
        where: { id },
        data: updateData,
        include: {
          file: {
            select: {
              id: true,
              originalName: true,
              mimeType: true,
              size: true
            }
          }
        }
      });

      return updatedVisitor;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour du visiteur: ${error.message}`);
    }
  }

  async deleteVisitor(id) {
    try {
      const existingVisitor = await this.getVisitorById(id);
      
      // Vérifier s'il y a des visites associées
      const visitsCount = await prisma.visit.count({
        where: { visitorId: id }
      });

      if (visitsCount > 0) {
        throw new Error('Impossible de supprimer un visiteur qui a des visites associées');
      }

      await prisma.visitor.delete({
        where: { id }
      });

      return { message: 'Visiteur supprimé avec succès' };
    } catch (error) {
      throw new Error(`Erreur lors de la suppression du visiteur: ${error.message}`);
    }
  }

  async checkNonDesirable(id) {
    try {
      const visitor = await this.getVisitorById(id);
      
      const nonDesirable = await prisma.nonDesirable.findFirst({
        where: { visitorId: id },
        include: {
          reporter: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      return {
        visitor: {
          id: visitor.id,
          firstname: visitor.firstname,
          lastname: visitor.lastname
        },
        isNonDesirable: !!nonDesirable,
        nonDesirable: nonDesirable
      };
    } catch (error) {
      throw new Error(`Erreur lors de la vérification du statut indésirable: ${error.message}`);
    }
  }

  async getVisitorStats() {
    try {
      const stats = await prisma.visitor.aggregate({
        _count: {
          id: true
        }
      });

      const companyStats = await prisma.visitor.groupBy({
        by: ['company'],
        _count: {
          id: true
        },
        where: {
          company: {
            not: null
          }
        }
      });

      const nonDesirablesCount = await prisma.nonDesirable.count();

      const visitorsWithFiles = await prisma.visitor.count({
        where: {
          fileId: {
            not: null
          }
        }
      });

      return {
        totalVisitors: stats._count.id,
        visitorsWithFiles,
        visitorsWithoutFiles: stats._count.id - visitorsWithFiles,
        nonDesirablesCount,
        companiesDistribution: companyStats
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  }

  async getVisitorHistory(id, days = 30) {
    try {
      const visitor = await this.getVisitorById(id);
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const [visits, appointments, incidents] = await Promise.all([
        prisma.visit.findMany({
          where: {
            visitorId: id,
            createdAt: {
              gte: startDate
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          include: {
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
        }),
        prisma.appointment.findMany({
          where: {
            visitorId: id,
            createdAt: {
              gte: startDate
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            service: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }),
        prisma.incident.findMany({
          where: {
            visitorId: id,
            createdAt: {
              gte: startDate
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            service: {
              select: {
                id: true,
                name: true
              }
            },
            reporter: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        })
      ]);

      return {
        visitor: {
          id: visitor.id,
          firstname: visitor.firstname,
          lastname: visitor.lastname,
          company: visitor.company
        },
        period: {
          days,
          startDate,
          endDate: new Date()
        },
        history: {
          visits,
          appointments,
          incidents
        },
        summary: {
          totalVisits: visits.length,
          totalAppointments: appointments.length,
          totalIncidents: incidents.length
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de l'historique du visiteur: ${error.message}`);
    }
  }
}

module.exports = new VisitorService();
