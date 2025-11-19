const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class SiteService {
  async createSite(siteData) {
    try {
      const site = await prisma.site.create({
        data: siteData,
        include: {
          checkpoints: true
        }
      });
      return site;
    } catch (error) {
      throw new Error(`Erreur lors de la création du site: ${error.message}`);
    }
  }

  async getAllSites(page = 1, limit = 10, search = null) {
    try {
      const skip = (page - 1) * limit;
      
      const whereClause = search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } }
        ]
      } : {};

      const [sites, total] = await Promise.all([
        prisma.site.findMany({
          where: whereClause,
          skip,
          take: limit,
          include: {
            checkpoints: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.site.count({ where: whereClause })
      ]);

      return {
        sites,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des sites: ${error.message}`);
    }
  }

  async getSiteById(id) {
    try {
      const site = await prisma.site.findUnique({
        where: { id },
        include: {
          checkpoints: {
            include: {
              agents: {
                select: {
                  id: true,
                  firstname: true,
                  lastname: true,
                  email: true
                }
              }
            }
          }
        }
      });
      
      if (!site) {
        throw new Error('Site non trouvé');
      }

      return site;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du site: ${error.message}`);
    }
  }

  async updateSite(id, updateData) {
    try {
      const existingSite = await this.getSiteById(id);
      
      const updatedSite = await prisma.site.update({
        where: { id },
        data: updateData,
        include: {
          checkpoints: true
        }
      });

      return updatedSite;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour du site: ${error.message}`);
    }
  }

  async deleteSite(id) {
    try {
      const existingSite = await this.getSiteById(id);
      
      // Vérifier s'il y a des checkpoints associés
      const checkpointsCount = await prisma.checkpoint.count({
        where: { siteId: id }
      });

      if (checkpointsCount > 0) {
        throw new Error('Impossible de supprimer un site qui contient des checkpoints');
      }

      await prisma.site.delete({
        where: { id }
      });

      return { message: 'Site supprimé avec succès' };
    } catch (error) {
      throw new Error(`Erreur lors de la suppression du site: ${error.message}`);
    }
  }

  async getSiteStats() {
    try {
      const stats = await prisma.site.aggregate({
        _count: {
          id: true
        }
      });

      const checkpointsStats = await prisma.checkpoint.groupBy({
        by: ['siteId'],
        _count: {
          id: true
        }
      });

      return {
        totalSites: stats._count.id,
        checkpointsPerSite: checkpointsStats
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  }
}

module.exports = new SiteService();
