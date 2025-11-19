const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class IncidentService {
  async createIncident(incidentData, reportedBy) {
    try {
      // Vérifier que le visiteur existe
      const visitor = await prisma.visitor.findUnique({
        where: { id: incidentData.visitorId }
      });

      if (!visitor) {
        throw new Error('Visiteur non trouvé');
      }

      // Vérifier que le service existe
      const service = await prisma.service.findUnique({
        where: { id: incidentData.serviceId }
      });

      if (!service) {
        throw new Error('Service non trouvé');
      }

      const incident = await prisma.incident.create({
        data: {
          ...incidentData,
          reportedBy
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
      });

      // Vérifier si le visiteur doit être marqué comme indésirable
      await this.checkAndMarkNonDesirable(incidentData.visitorId, reportedBy);

      return incident;
    } catch (error) {
      throw new Error(`Erreur lors de la création de l'incident: ${error.message}`);
    }
  }

  async checkAndMarkNonDesirable(visitorId, reportedBy, threshold = 3) {
    try {
      // Compter les incidents du visiteur
      const incidentCount = await prisma.incident.count({
        where: { visitorId }
      });

      // Si le seuil est atteint, marquer comme indésirable
      if (incidentCount >= threshold) {
        const existingNonDesirable = await prisma.nonDesirable.findFirst({
          where: { visitorId }
        });

        if (!existingNonDesirable) {
          await prisma.nonDesirable.create({
            data: {
              visitorId,
              reason: `Marqué automatiquement après ${incidentCount} incidents`,
              reportedBy
            }
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut indésirable:', error);
    }
  }

  async getAllIncidents(page = 1, limit = 10, search = null, visitorId = null, serviceId = null) {
    try {
      const skip = (page - 1) * limit;
      
      let whereClause = {};
      
      if (search) {
        whereClause.OR = [
          { reason: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
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

      if (serviceId) {
        whereClause.serviceId = serviceId;
      }

      const [incidents, total] = await Promise.all([
        prisma.incident.findMany({
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
          },
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.incident.count({ where: whereClause })
      ]);

      return {
        incidents,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des incidents: ${error.message}`);
    }
  }

  async getIncidentById(id) {
    try {
      const incident = await prisma.incident.findUnique({
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
              lastName: true,
              email: true
            }
          }
        }
      });
      
      if (!incident) {
        throw new Error('Incident non trouvé');
      }

      return incident;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de l'incident: ${error.message}`);
    }
  }

  async deleteIncident(id) {
    try {
      const existingIncident = await this.getIncidentById(id);
      
      await prisma.incident.delete({
        where: { id }
      });

      return { message: 'Incident supprimé avec succès' };
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de l'incident: ${error.message}`);
    }
  }
}

module.exports = new IncidentService();
