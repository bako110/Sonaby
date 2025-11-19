const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class NonDesirableService {
  async createNonDesirable(nonDesirableData, reportedBy) {
    try {
      // Vérifier que le visiteur existe
      const visitor = await prisma.visitor.findUnique({
        where: { id: nonDesirableData.visitorId }
      });

      if (!visitor) {
        throw new Error('Visiteur non trouvé');
      }

      // Vérifier s'il n'est pas déjà marqué comme indésirable
      const existing = await prisma.nonDesirable.findFirst({
        where: { visitorId: nonDesirableData.visitorId }
      });

      if (existing) {
        throw new Error('Ce visiteur est déjà marqué comme indésirable');
      }

      const nonDesirable = await prisma.nonDesirable.create({
        data: {
          ...nonDesirableData,
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
          reporter: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      return nonDesirable;
    } catch (error) {
      throw new Error(`Erreur lors de la création de l'entrée indésirable: ${error.message}`);
    }
  }

  async getAllNonDesirables(page = 1, limit = 10, search = null) {
    try {
      const skip = (page - 1) * limit;
      
      let whereClause = {};
      
      if (search) {
        whereClause.OR = [
          { reason: { contains: search, mode: 'insensitive' } },
          { visitor: { 
            OR: [
              { firstname: { contains: search, mode: 'insensitive' } },
              { lastname: { contains: search, mode: 'insensitive' } }
            ]
          }}
        ];
      }

      const [nonDesirables, total] = await Promise.all([
        prisma.nonDesirable.findMany({
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
        prisma.nonDesirable.count({ where: whereClause })
      ]);

      return {
        nonDesirables,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des indésirables: ${error.message}`);
    }
  }

  async deleteNonDesirable(id) {
    try {
      const existing = await prisma.nonDesirable.findUnique({
        where: { id },
        include: {
          visitor: {
            select: {
              id: true,
              firstname: true,
              lastname: true
            }
          }
        }
      });

      if (!existing) {
        throw new Error('Entrée indésirable non trouvée');
      }
      
      await prisma.nonDesirable.delete({
        where: { id }
      });

      return { 
        message: 'Entrée indésirable supprimée avec succès',
        visitor: existing.visitor
      };
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de l'entrée indésirable: ${error.message}`);
    }
  }
}

module.exports = new NonDesirableService();
