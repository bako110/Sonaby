const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class SiteService {
  async getFilteredSites(filters = {}) {
    try {
      const {
        search,
        city,
        status,
        activityType,
        manager,
        dateCreationDebut,
        dateCreationFin,
        wheelchairAccessible,
        parkingAvailable,
        securitySystem,
        securityGuard,
        page = 1,
        limit = 10
      } = filters;

      const skip = (page - 1) * limit;
      
      // Construction de la clause WHERE
      const whereClause = {};

      // Filtres de base
      if (search) {
        whereClause.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } },
          { manager: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (city) {
        whereClause.city = { contains: city, mode: 'insensitive' };
      }

      if (status) {
        whereClause.status = status;
      }

      if (activityType) {
        whereClause.activityType = activityType;
      }

      if (manager) {
        whereClause.manager = { contains: manager, mode: 'insensitive' };
      }

      // Filtres avancés
      if (dateCreationDebut || dateCreationFin) {
        whereClause.creationDate = {};
        if (dateCreationDebut) {
          whereClause.creationDate.gte = new Date(dateCreationDebut);
        }
        if (dateCreationFin) {
          whereClause.creationDate.lte = new Date(dateCreationFin);
        }
      }

      if (wheelchairAccessible !== undefined) {
        whereClause.wheelchairAccessible = wheelchairAccessible === 'true';
      }

      if (parkingAvailable !== undefined) {
        whereClause.parkingAvailable = parkingAvailable === 'true';
      }

      if (securitySystem !== undefined) {
        whereClause.securitySystem = securitySystem === 'true';
      }

      if (securityGuard !== undefined) {
        whereClause.securityGuard = securityGuard === 'true';
      }

      const [sites, total] = await Promise.all([
        prisma.site.findMany({
          where: whereClause,
          skip,
          take: limit,
          include: {
            checkpoints: {
              select: {
                id: true,
                name: true,
                status: true,
                checkpointType: true,
                agent: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true
                  }
                },
                sosAlerts: {
                  where: { isResolved: false },
                  select: { id: true }
                }
              }
            },
            assignedUsers: {
              select: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: true
                  }
                }
              }
            },
            _count: {
              select: {
                checkpoints: true,
                assignedUsers: true,
                incidents: true
              }
            }
          },
          orderBy: [
            { creationDate: 'desc' },
            { name: 'asc' }
          ]
        }),
        prisma.site.count({ where: whereClause })
      ]);

      // Récupérer les options pour les filtres automatiques
      const filterOptions = await this.getFilterOptions(whereClause);

      return {
        sites,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        },
        filterOptions
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des sites filtrés: ${error.message}`);
    }
  }

  async getFilterOptions(currentFilters = {}) {
    try {
      // Récupérer toutes les villes uniques
      const cities = await prisma.site.groupBy({
        by: ['city'],
        where: {
          ...currentFilters,
          city: { not: null }
        },
        _count: {
          city: true
        },
        orderBy: {
          city: 'asc'
        }
      });

      // Récupérer tous les managers uniques
      const managers = await prisma.site.groupBy({
        by: ['manager'],
        where: {
          ...currentFilters,
          manager: { not: null }
        },
        _count: {
          manager: true
        },
        orderBy: {
          manager: 'asc'
        }
      });

      // Récupérer tous les types d'activité uniques
      const activityTypes = await prisma.site.groupBy({
        by: ['activityType'],
        where: {
          ...currentFilters,
          activityType: { not: null }
        },
        _count: {
          activityType: true
        },
        orderBy: {
          activityType: 'asc'
        }
      });

      // Récupérer tous les statuts uniques
      const statuses = await prisma.site.groupBy({
        by: ['status'],
        where: {
          ...currentFilters,
          status: { not: null }
        },
        _count: {
          status: true
        },
        orderBy: {
          status: 'asc'
        }
      });

      return {
        cities: cities.map(c => ({ value: c.city, label: c.city, count: c._count.city })),
        managers: managers.map(m => ({ value: m.manager, label: m.manager, count: m._count.manager })),
        activityTypes: activityTypes.map(at => ({ value: at.activityType, label: at.activityType, count: at._count.activityType })),
        statuses: statuses.map(s => ({ value: s.status, label: s.status, count: s._count.status }))
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des options de filtre: ${error.message}`);
    }
  }
  async createSite(siteData) {
    try {
      // Générer un code unique si aucun n'est fourni
      if (!siteData.code) {
        const cityPrefix = siteData.city.substring(0, 3).toUpperCase();
        const existingCodes = await prisma.site.findMany({
          where: {
            code: {
              startsWith: cityPrefix
            }
          },
          select: { code: true }
        });
        
        let counter = 1;
        let newCode;
        do {
          newCode = `${cityPrefix}${counter.toString().padStart(3, '0')}`;
          counter++;
        } while (existingCodes.some(site => site.code === newCode));
        
        siteData.code = newCode;
      } else {
        // Vérifier si le code existe déjà
        const existingSite = await prisma.site.findUnique({
          where: { code: siteData.code }
        });
        
        if (existingSite) {
          throw new Error(`Un site avec le code "${siteData.code}" existe déjà`);
        }
      }

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

  async checkCodeAvailability(code) {
    try {
      const existingSite = await prisma.site.findUnique({
        where: { code }
      });
      return !existingSite;
    } catch (error) {
      throw new Error(`Erreur lors de la vérification du code: ${error.message}`);
    }
  }

  async getAllSites(page = 1, limit = 10, search = null) {
    try {
      const skip = (page - 1) * limit;
      
      const whereClause = search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } }
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
            creationDate: 'desc'
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
            select: {
              id: true,
              name: true,
              description: true,
              sosId: true,
              status: true,
              checkpointType: true,
              agent: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
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
