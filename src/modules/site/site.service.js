const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class SiteService {
async getFilteredSites(filters = {}) {
  try {
    const {
      search,
      code,                    // NOUVEAU
      city,
      region,
      country,
      status,
      activityType,
      manager,
      creationDateStart,       // Renommé pour correspondre au frontend
      creationDateEnd,         // Renommé pour correspondre au frontend
      minArea,                 // NOUVEAU
      maxArea,                 // NOUVEAU
      minEmployeeCount,
      maxEmployeeCount,
      wheelchairAccessible,
      parkingAvailable,
      securitySystem,
      securityGuard,
      page = 1,
      limit = 10,
      sortBy = 'creationDate',  // NOUVEAU
      sortOrder = 'desc'        // NOUVEAU
    } = filters;

    const skip = (page - 1) * limit;
    
    // Construction de la clause WHERE
    const whereClause = {};

    // Recherche globale (search)
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { manager: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } }  // Ajouté
      ];
    }

    // Filtre par code exact (NOUVEAU)
    if (code) {
      whereClause.code = { contains: code, mode: 'insensitive' };
    }

    // Filtres géographiques
    if (city) whereClause.city = { contains: city, mode: 'insensitive' };
    if (region) whereClause.region = { contains: region, mode: 'insensitive' };
    if (country) whereClause.country = { contains: country, mode: 'insensitive' };

    // Filtres catégoriels
    if (status) whereClause.status = status;
    if (activityType) whereClause.activityType = activityType;
    if (manager) whereClause.manager = { contains: manager, mode: 'insensitive' };

    // Filtres par plage numérique
    if (minEmployeeCount !== undefined || maxEmployeeCount !== undefined) {
      whereClause.employeeCount = {};
      if (minEmployeeCount !== undefined) whereClause.employeeCount.gte = minEmployeeCount;
      if (maxEmployeeCount !== undefined) whereClause.employeeCount.lte = maxEmployeeCount;
    }

    // Filtres par surface (NOUVEAU)
    if (minArea !== undefined || maxArea !== undefined) {
      whereClause.area = {};
      if (minArea !== undefined) whereClause.area.gte = minArea;
      if (maxArea !== undefined) whereClause.area.lte = maxArea;
    }

    // Filtres par dates (renommés)
    if (creationDateStart || creationDateEnd) {
      whereClause.creationDate = {};
      if (creationDateStart) whereClause.creationDate.gte = new Date(creationDateStart);
      if (creationDateEnd) whereClause.creationDate.lte = new Date(creationDateEnd);
    }

    // Filtres booléens
    const booleanFilters = [
      'wheelchairAccessible',
      'parkingAvailable', 
      'securitySystem',
      'securityGuard'
    ];
    
    booleanFilters.forEach(filter => {
      if (filters[filter] !== undefined) {
        whereClause[filter] = filters[filter];
      }
    });

    // Gestion du tri (NOUVEAU)
    const orderBy = {};
    const validSortFields = ['name', 'city', 'creationDate', 'employeeCount', 'area', 'code'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'creationDate';
    
    orderBy[sortField] = sortOrder;

    // REQUÊTE PRISMA
    const [sites, total] = await Promise.all([
      prisma.site.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy,
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
        }
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
      filterOptions: filterOptions.data,
      appliedFilters: { // NOUVEAU: pour debug frontend
        ...filters,
        sortBy,
        sortOrder
      }
    };
  } catch (error) {
    throw new Error(`Erreur lors de la récupération des sites filtrés: ${error.message}`);
  }
}

  // services/site.service.js

  async getFilterOptionsSimple(filters = {}) {
  try {
    // Construction du where pour les pré-filtres
    const whereClause = {};
    
    // Appliquer les pré-filtres s'ils sont fournis
    if (filters.city) whereClause.city = { contains: filters.city, mode: 'insensitive' };
    if (filters.status) whereClause.status = filters.status;
    if (filters.activityType) whereClause.activityType = filters.activityType;
    if (filters.country) whereClause.country = { contains: filters.country, mode: 'insensitive' };
    if (filters.region) whereClause.region = { contains: filters.region, mode: 'insensitive' };
    
    const [cities, countries, regions, activityTypes, statuses] = await Promise.all([
      prisma.site.groupBy({
        by: ['city'],
        where: { ...whereClause, city: { not: null } },
        _count: { city: true },
        orderBy: { city: 'asc' }
      }),
      prisma.site.groupBy({
        by: ['country'],
        where: { ...whereClause, country: { not: null } },
        _count: { country: true },
        orderBy: { country: 'asc' }
      }),
      prisma.site.groupBy({
        by: ['region'],
        where: { ...whereClause, region: { not: null } },
        _count: { region: true },
        orderBy: { region: 'asc' }
      }),
      prisma.site.groupBy({
        by: ['activityType'],
        where: { ...whereClause, activityType: { not: null } },
        _count: { activityType: true },
        orderBy: { activityType: 'asc' }
      }),
      prisma.site.groupBy({
        by: ['status'],
        where: { ...whereClause, status: { not: null } },
        _count: { status: true },
        orderBy: { status: 'asc' }
      })
    ]);

    return {
      success: true,
      data: {
        cities: cities.map(c => ({ value: c.city, label: c.city, count: c._count.city })),
        countries: countries.map(c => ({ value: c.country, label: c.country, count: c._count.country })),
        regions: regions.map(r => ({ value: r.region, label: r.region, count: r._count.region })),
        activityTypes: activityTypes.map(at => ({ value: at.activityType, label: at.activityType, count: at._count.activityType })),
        statuses: statuses.map(s => ({ value: s.status, label: s.status, count: s._count.status }))
      }
    };
  } catch (error) {
    console.error('Erreur dans getFilterOptionsSimple:', error);
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
    // Créer le site et assigner le manager
    const site = await prisma.site.create({
      data: {
        ...siteDataWithoutManager,
        // ⚡ Stocker l'ID du manager directement au lieu du nom
        manager: managerUser ? managerUser.id : siteData.manager,
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
    // Récupérer tous les sites assignés à l'agent avec leurs relations
    const sites = await prisma.site.findMany({
      where: {
        assignedUsers: {
          some: { userId }
        }
      },
      include: {
        checkpoints: {
          include: {
            agent: true,
            visits: { include: { visitor: true } }
          }
        },
        incidents: {
          include: { reporter: true, site: true, visiteur: true }
        },
        rendezvous: {
          include: { organizer: true, visits: true }
        },
        assignedUsers: { include: { user: true } }
      },
      orderBy: { creationDate: 'desc' }
    });

    return sites;
  } catch (error) {
    console.error(error);
    throw new Error(`Erreur lors de la récupération des sites de l'agent: ${error.message}`);
  }
}


}

module.exports = new SiteService();
