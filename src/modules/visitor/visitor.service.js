const { prisma } = require('../../config/prisma');

class VisitorService {
  async getFilteredVisitors(filters = {}) {
    try {
      const {
        search,
        isBlacklisted,
        idType,
        company,
        dateFrom,
        dateTo,
        siteId,
        checkpointId,
        dateCreationDebut,
        dateCreationFin,
        actif,
        avecBadge,
        avecIncidents,
        page = 1,
        limit = 10
      } = filters;

      const skip = (page - 1) * limit;
      
      // Construction de la clause WHERE
      const whereClause = {};

      // Filtres de base
      if (search) {
        whereClause.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { idNumber: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (isBlacklisted !== undefined) {
        whereClause.isBlacklisted = isBlacklisted === 'true';
      }

      if (idType) {
        whereClause.idType = idType;
      }

      if (company) {
        whereClause.company = { contains: company, mode: 'insensitive' };
      }

      // Filtres avancés
      if (dateFrom || dateTo) {
        whereClause.visits = {
          some: {}
        };
        if (dateFrom) {
          whereClause.visits.some.entryTime = {
            ...whereClause.visits.some.entryTime,
            gte: new Date(dateFrom)
          };
        }
        if (dateTo) {
          whereClause.visits.some.entryTime = {
            ...whereClause.visits.some.entryTime,
            lte: new Date(dateTo)
          };
        }
      }

      if (siteId) {
        whereClause.visits = {
          ...whereClause.visits,
          some: {
            checkpoint: {
              siteId: siteId
            }
          }
        };
      }

      if (checkpointId) {
        whereClause.visits = {
          ...whereClause.visits,
          some: {
            checkpointId: checkpointId
          }
        };
      }

      if (dateCreationDebut || dateCreationFin) {
        whereClause.createdAt = {};
        if (dateCreationDebut) {
          whereClause.createdAt.gte = new Date(dateCreationDebut);
        }
        if (dateCreationFin) {
          whereClause.createdAt.lte = new Date(dateCreationFin);
        }
      }

      if (actif !== undefined) {
        if (actif === 'true') {
          // Visiteurs avec des visites actives ou récentes
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          whereClause.visits = {
            ...whereClause.visits,
            some: {
              entryTime: {
                gte: thirtyDaysAgo
              }
            }
          };
        } else if (actif === 'false') {
          // Visiteurs sans visites récentes
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          whereClause.visits = {
            none: {
              entryTime: {
                gte: thirtyDaysAgo
              }
            }
          };
        }
      }

      if (avecBadge !== undefined) {
        if (avecBadge === 'true') {
          whereClause.badgeUrl = { not: null };
        } else if (avecBadge === 'false') {
          whereClause.badgeUrl = null;
        }
      }

      if (avecIncidents !== undefined) {
        if (avecIncidents === 'true') {
          whereClause.incidents = {
            some: {}
          };
        } else if (avecIncidents === 'false') {
          whereClause.incidents = {
            none: {}
          };
        }
      }

      const [visitors, total] = await Promise.all([
        prisma.visitor.findMany({
          where: whereClause,
          skip,
          take: limit,
          include: {
            visits: {
              take: 5,
              orderBy: { entryTime: 'desc' },
              include: {
                checkpoint: {
                  select: {
                    id: true,
                    name: true,
                    site: {
                      select: {
                        id: true,
                        name: true,
                        code: true
                      }
                    }
                  }
                },
                _count: {
                  select: {
                    incidents: true
                  }
                }
              }
            },
            incidents: {
              take: 3,
              orderBy: { createdAt: 'desc' }
            },
            _count: {
              select: {
                visits: true,
                incidents: true
              }
            }
          },
          orderBy: [
            { createdAt: 'desc' },
            { lastName: 'asc' },
            { firstName: 'asc' }
          ]
        }),
        prisma.visitor.count({ where: whereClause })
      ]);

      return {
        visitors,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        },
        filterOptions: await this.getFilterOptions(whereClause)
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des visiteurs filtrés: ${error.message}`);
    }
  }

  async getFilterOptions(currentFilters = {}) {
    try {
      // Récupérer tous les types d'ID uniques
      const idTypes = await prisma.visitor.groupBy({
        by: ['idType'],
        where: {
          ...currentFilters,
          idType: { not: null }
        },
        _count: {
          idType: true
        },
        orderBy: {
          idType: 'asc'
        }
      });

      // Récupérer toutes les entreprises uniques
      const companies = await prisma.visitor.groupBy({
        by: ['company'],
        where: {
          ...currentFilters,
          company: { not: null }
        },
        _count: {
          company: true
        },
        orderBy: {
          company: 'asc'
        }
      });

      // Récupérer tous les sites pour le filtre site
      const sites = await prisma.site.findMany({
        where: currentFilters.siteId ? { id: currentFilters.siteId } : {},
        select: {
          id: true,
          name: true,
          code: true,
          city: true,
          _count: {
            select: {
              checkpoints: {
                where: {
                  visits: {
                    some: {
                      visitor: currentFilters
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });

      // Récupérer tous les checkpoints pour le filtre checkpoint
      const checkpoints = await prisma.checkpoint.findMany({
        where: currentFilters.checkpointId ? { id: currentFilters.checkpointId } : {},
        select: {
          id: true,
          name: true,
          zone: true,
          checkpointType: true,
          site: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          _count: {
            select: {
              visits: {
                where: {
                  visitor: currentFilters
                }
              }
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });

      // Récupérer les statistiques de blacklist
      const blacklistStats = await prisma.visitor.groupBy({
        by: ['isBlacklisted'],
        where: currentFilters,
        _count: {
          isBlacklisted: true
        }
      });

      // Récupérer les statistiques de badges
      const badgeStats = await prisma.visitor.groupBy({
        by: ['badgeUrl'],
        where: {
          ...currentFilters,
          badgeUrl: { not: null }
        },
        _count: {
          badgeUrl: true
        }
      });

      // Récupérer les statistiques d'incidents
      const incidentStats = await prisma.visitor.groupBy({
        by: ['id'],
        where: {
          ...currentFilters,
          incidents: {
            some: {}
          }
        },
        _count: {
          id: true
        }
      });

      const withIncidentsCount = incidentStats.length;
      const withoutIncidentsCount = await prisma.visitor.count({
        where: {
          ...currentFilters,
          incidents: {
            none: {}
          }
        }
      });

      const withBadgeCount = badgeStats.reduce((sum, stat) => sum + stat._count.badgeUrl, 0);
      const withoutBadgeCount = await prisma.visitor.count({
        where: {
          ...currentFilters,
          badgeUrl: null
        }
      });

      return {
        idTypes: idTypes.map(it => ({ value: it.idType, label: it.idType, count: it._count.idType })),
        companies: companies.map(c => ({ value: c.company, label: c.company, count: c._count.company })),
        sites: sites.map(s => ({ 
          value: s.id, 
          label: `${s.name} (${s.code})`, 
          count: s._count.checkpoints, 
          city: s.city 
        })),
        checkpoints: checkpoints.map(cp => ({ 
          value: cp.id, 
          label: `${cp.name} (${cp.zone})`, 
          count: cp._count.visits,
          zone: cp.zone,
          checkpointType: cp.checkpointType,
          site: cp.site
        })),
        blacklistOptions: [
          { value: 'true', label: 'Oui', count: blacklistStats.find(s => s.isBlacklisted === true)?._count.isBlacklisted || 0 },
          { value: 'false', label: 'Non', count: blacklistStats.find(s => s.isBlacklisted === false)?._count.isBlacklisted || 0 }
        ],
        badgeOptions: [
          { value: 'true', label: 'Avec badge', count: withBadgeCount },
          { value: 'false', label: 'Sans badge', count: withoutBadgeCount }
        ],
        incidentOptions: [
          { value: 'true', label: 'Avec incidents', count: withIncidentsCount },
          { value: 'false', label: 'Sans incidents', count: withoutIncidentsCount }
        ]
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des options de filtre: ${error.message}`);
    }
  }
  async createOrFindVisitor(visitorData) {
    try {
        const { idType, idNumber } = visitorData;

        // 1️⃣ Vérifier si un visiteur existe déjà
        const existingVisitor = await prisma.visitor.findFirst({
            where: { idType, idNumber },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                idType: true,
                idNumber: true,
                isBlacklisted: true,
                blacklistReason: true,
                createdAt: true,
            }
        });

        // 👉 Vérifier s’il est indésirable (dans la table NonDesirable)
        let undesirableRecord = null;

        if (existingVisitor) {
            undesirableRecord = await prisma.nonDesirable.findFirst({
                where: { visitorId: existingVisitor.id },
                select: {
                    id: true,
                    reason: true,
                    createdAt: true
                }
            });

            return {
                success: true,
                status: "EXISTING_VISITOR",
                visitor: existingVisitor,
                isBlacklisted: existingVisitor.isBlacklisted,
                isUndesirable: !!undesirableRecord,
                undesirableInfo: undesirableRecord,
                message:
                    existingVisitor.isBlacklisted
                        ? "Visiteur existant et BLACKLISTÉ"
                        : undesirableRecord
                            ? "Visiteur existant et INDÉSIRABLE"
                            : "Visiteur existant"
            };
        }

        // 2️⃣ Si n’existe pas → création
        const newVisitor = await prisma.visitor.create({
            data: {
                ...visitorData,
                isBlacklisted: false,
                blacklistReason: null
            }
        });

        return {
            success: true,
            status: "NEW_VISITOR_CREATED",
            visitor: newVisitor,
            isBlacklisted: false,
            isUndesirable: false,
            message: "Nouveau visiteur créé avec succès"
        };

    } catch (error) {
        console.error("❌ Erreur createOrFindVisitor:", error);
        throw new Error(`Erreur lors de la création ou récupération du visiteur: ${error.message}`);
    }
}


  async findByIdentifier(idType, idNumber) {
    try {
      const visitor = await prisma.visitor.findFirst({
        where: {
          idType: idType,
          idNumber: idNumber
        }
      });
      return visitor;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche du visiteur: ${error.message}`);
    }
  }

  async getAllVisitors(page = 1, limit = 10, search = null, company = null) {
    try {
      const skip = (page - 1) * limit;
      
      let whereClause = {};
      
      if (search) {
        whereClause.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (company) {
        whereClause.company = { contains: company, mode: 'insensitive' };
      }

      const [visitors, total] = await Promise.all([
        prisma.visitor.findMany({
          where: whereClause,
          skip,
          take: limit,
          include: {
            _count: {
              select: {
                visits: true
              }
            },
          },
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.visitor.count({ where: whereClause })
      ]);

      return {
        visitors,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des visiteurs: ${error.message}`);
    }
  }

  // async getVisitorsBySite(siteId, page = 1, limit = 10, search = null) {
  //   try {
  //     const skip = (page - 1) * limit;
      
  //     // Récupérer les visiteurs qui ont visité ce site
  //     const visitors = await prisma.visitor.findMany({
  //       where: {
  //         visits: {
  //           some: {
  //             checkpoint: {
  //               siteId: siteId
  //             }
  //           }
  //         },
  //         ...(search && {
  //           OR: [
  //             { firstName: { contains: search, mode: 'insensitive' } },
  //             { lastName: { contains: search, mode: 'insensitive' } },
  //             { email: { contains: search, mode: 'insensitive' } },
  //             { phone: { contains: search, mode: 'insensitive' } },
  //             { company: { contains: search, mode: 'insensitive' } }
  //           ]
  //         })
  //       },
  //       select: {
  //         id: true,
  //         firstName: true,
  //         lastName: true,
  //         email: true,
  //         phone: true,
  //         company: true,
  //         idType: true,
  //         idNumber: true,
  //         isBlacklisted: true,
  //         blacklistReason: true,
  //         createdAt: true,
  //         _count: {
  //           select: {
  //             visits: {
  //               where: {
  //                 checkpoint: {
  //                   siteId: siteId
  //                 }
  //               }
  //             }
  //           }
  //         }
  //       },
  //       distinct: ['id'],
  //       orderBy: {
  //         createdAt: 'desc'
  //       },
  //       skip,
  //       take: limit
  //     });

  //     // Compter le total des visiteurs pour la pagination
  //     const totalVisitors = await prisma.visitor.count({
  //       where: {
  //         visits: {
  //           some: {
  //             checkpoint: {
  //               siteId: siteId
  //             }
  //           }
  //         },
  //         ...(search && {
  //           OR: [
  //             { firstName: { contains: search, mode: 'insensitive' } },
  //             { lastName: { contains: search, mode: 'insensitive' } },
  //             { email: { contains: search, mode: 'insensitive' } },
  //             { phone: { contains: search, mode: 'insensitive' } },
  //             { company: { contains: search, mode: 'insensitive' } }
  //           ]
  //         })
  //       }
  //     });

  //     return {
  //       visitors: visitors.map(visitor => ({
  //         ...visitor,
  //         siteVisitCount: visitor._count.visits
  //       })),
  //       pagination: {
  //         page,
  //         limit,
  //         total: totalVisitors,
  //         totalPages: Math.ceil(totalVisitors / limit)
  //       }
  //     };
  //   } catch (error) {
  //     throw new Error(`Erreur lors de la récupération des visiteurs du site: ${error.message}`);
  //   }
  // }

  async getVisitorById(id) {
    try {
      const visitor = await prisma.visitor.findUnique({
        where: { id },
        include: {
          visits: {
            take: 10,
            orderBy: {
              createdAt: 'desc'
            },
            include: {
              checkpoint: {
                select: {
                  id: true,
                  name: true,
                  site: {
                    select: {
                      id: true,
                      name: true
                    }
                  }
                }
              },
              service: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          blacklistHistory: {
            take: 5,
            orderBy: {
              createdAt: 'desc'
            }
          },
          nonDesirables: {
            take: 5,
            orderBy: {
              createdAt: 'desc'
            },
            include: {
              reporter: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          },
          groupMemberships: {
            take: 5,
            orderBy: {
              createdAt: 'desc'
            },
            include: {
              group: {
                select: {
                  id: true,
                  groupCode: true,
                  reason: true,
                  visitDate: true
                }
              }
            }
          },
          id_types: {
            select: {
              type_name: true
            }
          }
        }
      });
      
      if (!visitor) {
        throw new Error('Visiteur non trouvé');
      }

      return visitor;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du visiteur: ${error.message}`);
    }
  }

  async updateVisitor(id, updateData) {
    try {
      const existingVisitor = await this.getVisitorById(id);
      
      const updatedVisitor = await prisma.visitor.update({
        where: { id },
        data: updateData
      });

      return updatedVisitor;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour du visiteur: ${error.message}`);
    }
  }

  async deleteVisitor(id) {
    try {
      const existingVisitor = await this.getVisitorById(id);
      
      // Vérifier s'il y a des visites associées
      const visitsCount = await prisma.visit.count({
        where: { visitorId: id }
      });

      if (visitsCount > 0) {
        throw new Error('Impossible de supprimer un visiteur qui a des visites associées');
      }

      await prisma.visitor.delete({
        where: { id }
      });

      return { message: 'Visiteur supprimé avec succès' };
    } catch (error) {
      throw new Error(`Erreur lors de la suppression du visiteur: ${error.message}`);
    }
  }

  async checkNonDesirable(id) {
    try {
      const visitor = await this.getVisitorById(id);
      
      const nonDesirable = await prisma.nonDesirable.findFirst({
        where: { visitorId: id },
        include: {
          reporter: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      return {
        visitor: {
          id: visitor.id,
          firstname: visitor.firstname,
          lastname: visitor.lastname
        },
        isNonDesirable: !!nonDesirable,
        nonDesirable: nonDesirable
      };
    } catch (error) {
      throw new Error(`Erreur lors de la vérification du statut indésirable: ${error.message}`);
    }
  }

  async getVisitorStats() {
    try {
      const stats = await prisma.visitor.aggregate({
        _count: {
          id: true
        }
      });

      const companyStats = await prisma.visitor.groupBy({
        by: ['company'],
        _count: {
          id: true
        },
        where: {
          company: {
            not: null
          }
        }
      });

      const blacklistedCount = await prisma.visitor.count({
        where: {
          isBlacklisted: true
        }
      });

      return {
        totalVisitors: stats._count.id,
        blacklistedVisitors: blacklistedCount,
        activeVisitors: stats._count.id - blacklistedCount,
        companiesDistribution: companyStats
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  }

  async getVisitorHistory(id, days = 30) {
    try {
      const visitor = await this.getVisitorById(id);
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const [visits, rendezvous] = await Promise.all([
        prisma.visit.findMany({
          where: {
            visitorId: id,
            createdAt: {
              gte: startDate
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            checkpoint: {
              select: {
                id: true,
                name: true,
                site: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            },
            service: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }),
        prisma.rendezvous.findMany({
          where: {
            visitorId: id,
            createdAt: {
              gte: startDate
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            service: {
              select: {
                id: true,
                name: true
              }
            }
          }
        })
      ]);

      return {
        visitor: {
          id: visitor.id,
          firstName: visitor.firstName,
          lastName: visitor.lastName,
          company: visitor.company
        },
        period: {
          days,
          startDate,
          endDate: new Date()
        },
        history: {
          visits,
          rendezvous
        },
        summary: {
          totalVisits: visits.length,
          totalRendezvous: rendezvous.length
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de l'historique du visiteur: ${error.message}`);
    }
  }
}

module.exports = new VisitorService();
