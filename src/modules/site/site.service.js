const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class SiteService {
async getFilteredSites(filters = {}) {
  try {
    const {
      search,
      code,
      city,
      region,
      country,
      status,
      activityType,
      manager,
      creationDateStart,
      creationDateEnd,
      minArea,
      maxArea,
      minEmployeeCount,
      maxEmployeeCount,
      wheelchairAccessible,
      parkingAvailable,
      securitySystem,
      securityGuard,
      page = 1,
      limit = 10,
      sortBy = 'creationDate',
      sortOrder = 'desc'
    } = filters;

    const skip = (page - 1) * limit;
    
    // Construction de la clause WHERE
    const whereClause = {};

    // Recherche globale (search)
    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
        { description: { contains: search } },
        { address: { contains: search } },
        { manager: { contains: search } },
        { city: { contains: search } }
      ];
    }

    // Filtre par code exact
    if (code) {
      whereClause.code = { contains: code };
    }

    // Filtres géographiques
    if (city) whereClause.city = { contains: city };
    if (region) whereClause.region = { contains: region };
    if (country) whereClause.country = { contains: country };

    // Filtres catégoriels
    if (status) whereClause.status = status;
    if (activityType) whereClause.activityType = activityType;
    if (manager) whereClause.manager = { contains: manager };

    // Filtres par plage numérique
    if (minEmployeeCount !== undefined || maxEmployeeCount !== undefined) {
      whereClause.employeeCount = {};
      if (minEmployeeCount !== undefined) whereClause.employeeCount.gte = minEmployeeCount;
      if (maxEmployeeCount !== undefined) whereClause.employeeCount.lte = maxEmployeeCount;
    }

    // Filtres par surface
    if (minArea !== undefined || maxArea !== undefined) {
      whereClause.area = {};
      if (minArea !== undefined) whereClause.area.gte = minArea;
      if (maxArea !== undefined) whereClause.area.lte = maxArea;
    }

    // Filtres par dates
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

    // Gestion du tri
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
      appliedFilters: {
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
    if (filters.city && filters.city.trim() !== '') {
      whereClause.city = { contains: filters.city, mode: 'insensitive' };
    }
    if (filters.status && filters.status.trim() !== '') {
      whereClause.status = filters.status;
    }
    if (filters.activityType && filters.activityType.trim() !== '') {
      whereClause.activityType = filters.activityType;
    }
    if (filters.country && filters.country.trim() !== '') {
      whereClause.country = { contains: filters.country, mode: 'insensitive' };
    }
    if (filters.region && filters.region.trim() !== '') {
      whereClause.region = { contains: filters.region, mode: 'insensitive' };
    }
    
    // Créer les conditions where pour chaque groupBy SÉPARÉMENT
    // Pour éviter les conflits de filtres 'not'
    
    const [cities, countries, regions, activityTypes, statuses] = await Promise.all([
      // Cities - seulement exclure null si pas de filtre city
      prisma.site.groupBy({
        by: ['city'],
        where: filters.city ? whereClause : { ...whereClause, city: { not: null } },
        _count: { city: true },
        orderBy: { city: 'asc' }
      }),
      // Countries - seulement exclure null si pas de filtre country
      prisma.site.groupBy({
        by: ['country'],
        where: filters.country ? whereClause : { ...whereClause, country: { not: null } },
        _count: { country: true },
        orderBy: { country: 'asc' }
      }),
      // Regions - seulement exclure null si pas de filtre region
      prisma.site.groupBy({
        by: ['region'],
        where: filters.region ? whereClause : { ...whereClause, region: { not: null } },
        _count: { region: true },
        orderBy: { region: 'asc' }
      }),
      // ActivityTypes - seulement exclure null si pas de filtre activityType
      prisma.site.groupBy({
        by: ['activityType'],
        where: filters.activityType ? whereClause : { ...whereClause, activityType: { not: null } },
        _count: { activityType: true },
        orderBy: { activityType: 'asc' }
      }),
      // Statuses - seulement exclure null si pas de filtre status
      prisma.site.groupBy({
        by: ['status'],
        where: filters.status ? whereClause : { ...whereClause, status: { not: null } },
        _count: { status: true },
        orderBy: { status: 'asc' }
      })
    ]);

    return {
      success: true,
      data: {
        cities: cities.map(c => ({ 
          value: c.city, 
          label: c.city, 
          count: c._count.city 
        })),
        countries: countries.map(c => ({ 
          value: c.country, 
          label: c.country, 
          count: c._count.country 
        })),
        regions: regions.map(r => ({ 
          value: r.region, 
          label: r.region, 
          count: r._count.region 
        })),
        activityTypes: activityTypes.map(at => ({ 
          value: at.activityType, 
          label: at.activityType, 
          count: at._count.activityType 
        })),
        statuses: statuses.map(s => ({ 
          value: s.status, 
          label: s.status, 
          count: s._count.status 
        }))
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

    // CORRECTION ICI : Sauvegarde le managerId AVANT de le supprimer
    const managerId = siteData.manager;
    const { manager: _, ...siteDataWithoutManager } = siteData;

    // Créer le site et assigner le manager
    const site = await prisma.site.create({
      data: {
        ...siteDataWithoutManager,
        // ⚡ Utiliser managerId au lieu de siteData.manager
        manager: managerUser ? managerUser.id : managerId,
        // Assigner le manager au site via UserSite
        assignedUsers: managerId
          ? {
              create: [{
                userId: managerId
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
    
    // Extraire le manager et managerId des données
    const { manager, managerId, ...dataWithoutManager } = updateData;
    
    let updatePayload = { ...dataWithoutManager };
    let newManagerUserId = null;
    let newManagerName = null;
    
    // 1. DÉTERMINER le nouveau manager
    if (managerId !== undefined) {
      // Si managerId est fourni (UUID)
      if (managerId) {
        const managerUser = await prisma.user.findUnique({
          where: { id: managerId }
        });
        
        if (!managerUser) {
          throw new Error(`L'utilisateur avec l'ID "${managerId}" n'existe pas`);
        }
        
        newManagerUserId = managerUser.id;
        newManagerName = `${managerUser.firstName} ${managerUser.lastName}`;
      } else {
        // managerId = null ou vide
        newManagerUserId = null;
        newManagerName = null;
      }
    } else if (manager !== undefined) {
      // Si manager (nom) est fourni directement
      newManagerName = manager;
      
      // Essayer de trouver l'ID utilisateur correspondant
      if (manager) {
        const managerUser = await prisma.user.findFirst({
          where: {
            OR: [
              { 
                AND: [
                  { firstName: { contains: manager.split(' ')[0], mode: 'insensitive' } },
                  { lastName: { contains: manager.split(' ').slice(1).join(' '), mode: 'insensitive' } }
                ]
              },
              { email: { contains: manager, mode: 'insensitive' } }
            ]
          }
        });
        
        if (managerUser) {
          newManagerUserId = managerUser.id;
        }
      }
    }
    
    // 2. METTRE À JOUR le champ manager (texte)
    if (newManagerName !== undefined) {
      updatePayload.manager = newManagerName;
    }
    
    // 3. GÉRER l'assignedUser dans UserSite
    if (newManagerUserId !== null) {
      // Supprimer l'ancienne assignation
      await prisma.userSite.deleteMany({
        where: { siteId: id }
      });
      
      // Créer la nouvelle assignation
      updatePayload.assignedUsers = {
        create: [{
          userId: newManagerUserId
        }]
      };
    } else if (newManagerName === null || newManagerName === '') {
      // Si le manager est supprimé, supprimer aussi l'assignation
      await prisma.userSite.deleteMany({
        where: { siteId: id }
      });
    }
    
    // 4. METTRE À JOUR le site
    const updatedSite = await prisma.site.update({
      where: { id },
      data: updatePayload,
      include: {
        checkpoints: true,
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
   async  getSitesByAgent(userId) {
  if (!userId) {
    throw new Error("L'identifiant de l'agent est requis");
  }

  try {
    const sites = await prisma.site.findMany({
      where: {
        assignedUsers: {
          some: { userId: userId }
        }
      },
      include: {
        checkpoints: {
          include: {
            agent: true,  // Agent principal du checkpoint
            agentAssignments: {
              include: {
                user: true  // Inclut toutes les infos de l'agent assigné au checkpoint
              }
            },
            visits: { include: { visitor: true } } // Visites avec les visiteurs
          }
        },
        incidents: {
          include: {
            reporter: true,  // Utilisateur qui a reporté
            visiteur: true,  // Visiteur concerné
            site: true       // Site de l'incident
          }
        },
        rendezvous: {
          include: {
            organizer: true, // Organisateur du rendez-vous
            visits: { include: { visitor: true, service: true } }
          }
        },
        assignedUsers: {
          include: {
            user: true // Infos complètes des utilisateurs assignés au site
          }
        }
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
