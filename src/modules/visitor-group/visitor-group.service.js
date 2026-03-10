const { prisma } = require('../../config/prisma');

class VisitorGroupService {

  /**
   * Créer un groupe de visiteurs
   * - Responsable existant
   * - Autres visiteurs : liste de noms complets
   */
  async createVisitorGroup(data) {
    const { visitorId, otherVisitors = [] } = data;

    try {
      // 1️⃣ Vérifier que le responsable existe
      const responsible = await prisma.visitor.findUnique({
        where: { id: visitorId },
        select: { id: true, firstName: true, lastName: true }
      });

      if (!responsible) {
        throw new Error('Visiteur responsable non trouvé');
      }

      // 2️⃣ Calcul du nombre total de visiteurs
      const expectedCount = 1 + otherVisitors.length;

      // 3️⃣ Créer le groupe
      const visitorGroup = await prisma.visitorGroup.create({
        data: {
          responsibleVisitorId: visitorId,
          otherVisitors,   // array de noms complets ["Bako Robert", "Amidoi Sanour", ...]
          expectedCount
        },
        include: {
          responsibleVisitor: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      return visitorGroup;

    } catch (error) {
      throw new Error(
        `Erreur lors de la création du groupe : ${error.message}`
      );
    }
  }

  /**
   * Récupérer un groupe par ID
   */
  async getVisitorGroupById(groupId) {
    try {
      const visitorGroup = await prisma.visitorGroup.findUnique({
        where: { id: groupId },
        include: {
          responsibleVisitor: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      if (!visitorGroup) {
        throw new Error('Groupe de visiteurs non trouvé');
      }

      return visitorGroup;

    } catch (error) {
      throw new Error(
        `Erreur lors de la récupération du groupe : ${error.message}`
      );
    }
  }

  /**
   * Liste paginée des groupes avec filtre sur le nom du responsable
   */
  async getFilteredVisitorGroups({ search, checkpointId, page = 1, limit = 10 }) {
    try {
      const skip = (page - 1) * limit;

      const where = {};
      
      // Filtre par recherche textuelle
      if (search) {
        where.responsibleVisitor = {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } }
          ]
        };
      }
      
      // Filtre par checkpoint (groupes de la semaine)
      if (checkpointId) {
        // Calculer le début (lundi) et la fin (dimanche) de la semaine actuelle
        const today = new Date();
        const startOfWeek = new Date(today);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        where.createdAt = {
          gte: startOfWeek,
          lte: endOfWeek
        };
      }

      const [total, visitorGroups] = await Promise.all([
        prisma.visitorGroup.count({ where }),
        prisma.visitorGroup.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            responsibleVisitor: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        })
      ]);

      // Calculer la période si filtrage par checkpoint
      let periode = null;
      if (checkpointId) {
        const today = new Date();
        const startOfWeek = new Date(today);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        periode = {
          debut: startOfWeek.toISOString(),
          fin: endOfWeek.toISOString()
        };
      }

      return {
        visitorGroups,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        },
        periode
      };

    } catch (error) {
      throw new Error(
        `Erreur lors de la récupération des groupes : ${error.message}`
      );
    }
  }
}

module.exports = new VisitorGroupService();
