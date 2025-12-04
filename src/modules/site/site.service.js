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
      const filterOptions = await this.getFilterOptionsSimple();

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

  // services/site.service.js

  async getFilterOptionsSimple() {
    try {
      console.log('DEBUG - Début récupération des options de filtre');
      
      // Récupérer toutes les villes uniques
      const cities = await prisma.site.groupBy({
        by: ['city'],
        where: { city: { not: null } },
        _count: { city: true },
        orderBy: { city: 'asc' }
      });
      console.log('DEBUG - Cities récupérées:', cities);

      const managers = await prisma.site.groupBy({
        by: ['manager'],
        where: { manager: { not: null } },
        _count: { manager: true },
        orderBy: { manager: 'asc' }
      });
      console.log('DEBUG - Managers récupérés:', managers);

      const activityTypes = await prisma.site.groupBy({
        by: ['activityType'],
        where: { activityType: { not: null } },
        _count: { activityType: true },
        orderBy: { activityType: 'asc' }
      });
      console.log('DEBUG - ActivityTypes récupérés:', activityTypes);

      const statuses = await prisma.site.groupBy({
        by: ['status'],
        where: { status: { not: null } },
        _count: { status: true },
        orderBy: { status: 'asc' }
      });
      console.log('DEBUG - Statuses récupérés:', statuses);

      const result = {
        success: true,
        data: {
          cities: cities.map(c => ({ value: c.city, label: c.city, count: c._count.city })),
          managers: managers.map(m => ({ value: m.manager, label: m.manager, count: m._count.manager })),
          activityTypes: activityTypes.map(at => ({ value: at.activityType, label: at.activityType, count: at._count.activityType })),
          statuses: statuses.map(s => ({ value: s.status, label: s.status, count: s._count.status }))
        }
      };
      
      console.log('DEBUG - Résultat final:', result);
      return result;
    } catch (error) {
      console.log('DEBUG - Erreur:', error);
      return {
        success: false,
        message: `Erreur: ${error.message}`
      };
    }
  }

  async createSite(siteData) {
  try {
    // Vérifier que le code est fourni
    if (!siteData.code) {
      throw new Error("Le code du site doit être fourni");
    }

    // Vérifier si le code existe déjà
    const existingSite = await prisma.site.findUnique({
      where: { code: siteData.code }
    });
    if (existingSite) {
      throw new Error(`Un site avec le code "${siteData.code}" existe déjà`);
    }

    // Vérifier si le manager existe
    let managerUser = null;
    if (siteData.manager) {
      managerUser = await prisma.user.findUnique({
        where: { id: siteData.manager }
      });
      if (!managerUser) {
        throw new Error(`L'utilisateur manager avec l'ID "${siteData.manager}" n'existe pas`);
      }
    }

    // Extraire manager de siteData pour éviter de le mettre dans la table Site
    const { manager, ...siteDataWithoutManager } = siteData;

    // Créer le site et assigner le manager
    const site = await prisma.site.create({
      data: {
        ...siteDataWithoutManager,
        // Le champ manager dans Site est de type String (nom), pas une relation
        // Donc on le garde comme chaîne, pas comme ID
        manager: managerUser ? `${managerUser.firstName} ${managerUser.lastName}` : siteData.manager,
        // Assigner le manager au site via UserSite
        assignedUsers: manager
          ? {
              create: [{
                userId: manager
              }]
            }
          : undefined
      },
      include: {
        assignedUsers: {
          include: {
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
        }
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

  // Récupérer tous les sites assignés à un agent spécifique
async getSitesByAgent(userId) {
    if (!userId) {
        throw new Error("L'identifiant de l'agent est requis");
    }

    try {
        const sites = await prisma.site.findMany({
            where: {
                assignedUsers: {
                    some: {
                        userId: userId
                    }
                }
            },
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
            },
            orderBy: {
                creationDate: 'desc'
            }
        });

        return sites;
    } catch (error) {
        console.error(error);
        throw new Error(`Erreur lors de la récupération des sites de l'agent: ${error.message}`);
    }
}

}

module.exports = new SiteService();
