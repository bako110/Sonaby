const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class ServiceService {
  async createService(serviceData) {
    try {
      const service = await prisma.service.create({
        data: serviceData
      });
      return service;
    } catch (error) {
      throw new Error(`Erreur lors de la création du service: ${error.message}`);
    }
  }

  async getAllServices(page = 1, limit = 10, search = null) {
    try {
      const skip = (page - 1) * limit;
      
      const whereClause = search ? {
        name: { contains: search, mode: 'insensitive' }
      } : {};

      const [services, total] = await Promise.all([
        prisma.service.findMany({
          where: whereClause,
          skip,
          take: limit,
          include: {
            _count: {
              select: {
                visits: true,
                appointments: true,
                incidents: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.service.count({ where: whereClause })
      ]);

      return {
        services,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des services: ${error.message}`);
    }
  }

  async getServiceById(id) {
    try {
      const service = await prisma.service.findUnique({
        where: { id },
        include: {
          visits: {
            take: 10,
            orderBy: {
              createdAt: 'desc'
            },
            include: {
              visitor: {
                select: {
                  id: true,
                  firstname: true,
                  lastname: true
                }
              },
              checkpoint: {
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
              visitor: {
                select: {
                  id: true,
                  firstname: true,
                  lastname: true
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
              visitor: {
                select: {
                  id: true,
                  firstname: true,
                  lastname: true
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
          _count: {
            select: {
              visits: true,
              appointments: true,
              incidents: true
            }
          }
        }
      });
      
      if (!service) {
        throw new Error('Service non trouvé');
      }

      return service;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du service: ${error.message}`);
    }
  }

  async updateService(id, updateData) {
    try {
      const existingService = await this.getServiceById(id);
      
      const updatedService = await prisma.service.update({
        where: { id },
        data: updateData
      });

      return updatedService;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour du service: ${error.message}`);
    }
  }

  async deleteService(id) {
    try {
      const existingService = await this.getServiceById(id);
      
      // Vérifier s'il y a des visites associées
      const visitsCount = await prisma.visit.count({
        where: { serviceId: id }
      });

      if (visitsCount > 0) {
        throw new Error('Impossible de supprimer un service qui a des visites associées');
      }

      // Vérifier s'il y a des rendez-vous associés
      const appointmentsCount = await prisma.appointment.count({
        where: { serviceId: id }
      });

      if (appointmentsCount > 0) {
        throw new Error('Impossible de supprimer un service qui a des rendez-vous associés');
      }

      await prisma.service.delete({
        where: { id }
      });

      return { message: 'Service supprimé avec succès' };
    } catch (error) {
      throw new Error(`Erreur lors de la suppression du service: ${error.message}`);
    }
  }

  async getServiceStats() {
    try {
      const stats = await prisma.service.aggregate({
        _count: {
          id: true
        }
      });

      const visitsStats = await prisma.visit.groupBy({
        by: ['serviceId'],
        _count: {
          id: true
        }
      });

      const appointmentsStats = await prisma.appointment.groupBy({
        by: ['serviceId'],
        _count: {
          id: true
        }
      });

      const incidentsStats = await prisma.incident.groupBy({
        by: ['serviceId'],
        _count: {
          id: true
        }
      });

      return {
        totalServices: stats._count.id,
        visitsPerService: visitsStats,
        appointmentsPerService: appointmentsStats,
        incidentsPerService: incidentsStats
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  }

  async getServiceActivity(id, days = 30) {
    try {
      const service = await this.getServiceById(id);
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const [visits, appointments, incidents] = await Promise.all([
        prisma.visit.findMany({
          where: {
            serviceId: id,
            createdAt: {
              gte: startDate
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            visitor: {
              select: {
                id: true,
                firstname: true,
                lastname: true
              }
            },
            checkpoint: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }),
        prisma.appointment.findMany({
          where: {
            serviceId: id,
            createdAt: {
              gte: startDate
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            visitor: {
              select: {
                id: true,
                firstname: true,
                lastname: true
              }
            }
          }
        }),
        prisma.incident.findMany({
          where: {
            serviceId: id,
            createdAt: {
              gte: startDate
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            visitor: {
              select: {
                id: true,
                firstname: true,
                lastname: true
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
        service: {
          id: service.id,
          name: service.name
        },
        period: {
          days,
          startDate,
          endDate: new Date()
        },
        activity: {
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
      throw new Error(`Erreur lors de la récupération de l'activité du service: ${error.message}`);
    }
  }
}

module.exports = new ServiceService();
