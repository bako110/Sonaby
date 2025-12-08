const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class RendezvousService {
  async createRendezvous(rendezvousData) {
    try {
      // Créer le rendez-vous avec les nouveaux champs
      const newRendezvous = await prisma.rendezvous.create({
        data: {
          organizerId: rendezvousData.organizerId,
          siteId: rendezvousData.siteId,
          firstName: rendezvousData.firstName,
          lastName: rendezvousData.lastName,
          personVistedName: rendezvousData.personVistedName,
          office: rendezvousData.office,
          serviceName: rendezvousData.serviceName,
          reason: rendezvousData.reason,
          visitDate: new Date(rendezvousData.visitDate),
          startTime: rendezvousData.startTime ? rendezvousData.startTime : null,
          endTime: rendezvousData.endTime ? rendezvousData.endTime : null,
          status: rendezvousData.status || 'pending',
          notes: rendezvousData.notes || null
        },
        include: {
          organizer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true
            }
          },
          site: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true
            }
          }
        }
      });

      return newRendezvous;
    } catch (error) {
      throw new Error(`Erreur lors de la création du rendez-vous: ${error.message}`);
    }
  }

  async getAllRendezvous(filters = {}) {
    try {
      const { page = 1, limit = 10, search, organizerId, siteId, firstName, lastName, serviceName, status, visitDate, upcoming } = filters;
      const skip = (page - 1) * limit;

      // Construire les conditions de recherche
      const where = {};

      if (organizerId) where.organizerId = organizerId;
      if (siteId) where.siteId = siteId;
      if (firstName) where.firstName = { contains: firstName, mode: 'insensitive' };
      if (lastName) where.lastName = { contains: lastName, mode: 'insensitive' };
      if (serviceName) where.serviceName = { contains: serviceName, mode: 'insensitive' };
      if (status) where.status = status;
      if (visitDate) where.visitDate = new Date(visitDate);

      if (upcoming !== undefined) {
        if (upcoming) {
          where.visitDate = { gte: new Date() };
        } else {
          where.visitDate = { lt: new Date() };
        }
      }

      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { serviceName: { contains: search, mode: 'insensitive' } },
          { office: { contains: search, mode: 'insensitive' } },
          { reason: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [rendezvous, total] = await Promise.all([
        prisma.rendezvous.findMany({
          where,
          include: {
            organizer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true
              }
            },
            site: {
              select: {
                id: true,
                name: true,
                address: true,
                city: true
              }
            }
          },
          orderBy: { visitDate: 'desc', startTime: 'desc' },
          skip,
          take: limit
        }),
        prisma.rendezvous.count({ where })
      ]);

      return {
        data: rendezvous,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des rendez-vous: ${error.message}`);
    }
  }

  async getRendezvousById(id) {
    try {
      const rendezvous = await prisma.rendezvous.findUnique({
        where: { id },
        include: {
          organizer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true
            }
          },
          site: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true
            }
          }
        }
      });

      if (!rendezvous) {
        throw new Error('Rendez-vous non trouvé');
      }

      return rendezvous;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du rendez-vous: ${error.message}`);
    }
  }

  async updateRendezvous(id, updateData) {
    try {
      // Vérifier si le rendez-vous existe
      const existingRendezvous = await this.getRendezvousById(id);

      // Mettre à jour le rendez-vous
      const updatedRendezvous = await prisma.rendezvous.update({
        where: { id },
        data: {
          ...(updateData.siteId && { siteId: updateData.siteId }),
          ...(updateData.firstName && { firstName: updateData.firstName }),
          ...(updateData.lastName && { lastName: updateData.lastName }),
          ...(updateData.office && { office: updateData.office }),
          ...(updateData.serviceName && { serviceName: updateData.serviceName }),
          ...(updateData.reason && { reason: updateData.reason }),
          ...(updateData.visitDate && { visitDate: new Date(updateData.visitDate) }),
          ...(updateData.startTime !== undefined && { startTime: updateData.startTime }),
          ...(updateData.endTime !== undefined && { endTime: updateData.endTime }),
          ...(updateData.status && { status: updateData.status }),
          ...(updateData.notes !== undefined && { notes: updateData.notes })
        },
        include: {
          organizer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true
            }
          },
          site: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true
            }
          }
        }
      });

      return updatedRendezvous;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour du rendez-vous: ${error.message}`);
    }
  }

  async deleteRendezvous(id) {
    try {
      // Vérifier si le rendez-vous existe
      const existingRendezvous = await this.getRendezvousById(id);

      await prisma.rendezvous.delete({
        where: { id }
      });

      return { message: 'Rendez-vous supprimé avec succès' };
    } catch (error) {
      throw new Error(`Erreur lors de la suppression du rendez-vous: ${error.message}`);
    }
  }

  async validateRendezvous(id) {
    try {
      const updatedRendezvous = await prisma.rendezvous.update({
        where: { id },
        data: { status: 'validated' },
        include: {
          organizer: {
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

      return updatedRendezvous;
    } catch (error) {
      throw new Error(`Erreur lors de la validation du rendez-vous: ${error.message}`);
    }
  }

  async cancelRendezvous(id, notes = null) {
    try {
      const updatedRendezvous = await prisma.rendezvous.update({
        where: { id },
        data: { 
          status: 'cancelled',
          notes: notes
        },
        include: {
          organizer: {
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

      return updatedRendezvous;
    } catch (error) {
      throw new Error(`Erreur lors de l'annulation du rendez-vous: ${error.message}`);
    }
  }

  async getRendezvousStats() {
    try {
      const [total, pending, validated, cancelled, today, upcoming] = await Promise.all([
        prisma.rendezvous.count(),
        prisma.rendezvous.count({ where: { status: 'pending' } }),
        prisma.rendezvous.count({ where: { status: 'validated' } }),
        prisma.rendezvous.count({ where: { status: 'cancelled' } }),
        prisma.rendezvous.count({
          where: {
            visitDate: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(23, 59, 59, 999))
            }
          }
        }),
        prisma.rendezvous.count({
          where: {
            visitDate: { gte: new Date() },
            status: { in: ['pending', 'validated'] }
          }
        })
      ]);

      return {
        total,
        pending,
        validated,
        cancelled,
        today,
        upcoming
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  }

async getRendezvousBySite(siteId) {
  if (!siteId) {
    throw new Error("Le siteId doit être fourni");
  }

  try {
    // Vérifier si le site existe
    const siteExists = await prisma.site.findUnique({
      where: { id: siteId },
      select: { id: true }
    });

    if (!siteExists) {
      throw new Error("Le site spécifié n'existe pas");
    }

    // 🔹 Calcul du lundi et dimanche de la semaine
    const today = new Date();
    const currentDay = today.getDay(); // 0 = dimanche, 1 = lundi ...
    const mondayOffset = currentDay === 0 ? 6 : currentDay - 1;
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - mondayOffset);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Récupérer les rendez-vous pour le site et la semaine
    const rendezvousList = await prisma.rendezvous.findMany({
      where: {
        siteId,
        visitDate: {
          gte: weekStart,
          lte: weekEnd
        }
      },
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        site: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            country: true
          }
        }
      },
      orderBy: {
        visitDate: 'asc'
      }
    });

    if (!rendezvousList.length) {
      return {
        success: true,
        total: 0,
        data: [],
        message: "Aucun rendez-vous trouvé pour ce site cette semaine"
      };
    }

    return {
      success: true,
      total: rendezvousList.length,
      data: rendezvousList
    };
  } catch (error) {
    throw new Error(`Erreur lors de la récupération des rendez-vous: ${error.message}`);
  }
}


}

module.exports = new RendezvousService();
