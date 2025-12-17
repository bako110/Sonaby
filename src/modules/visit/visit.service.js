const { prisma } = require('../../config/prisma');

class VisitService {
  async getFilteredVisits(filters = {}) {
    try {
      const {
        search,
        status,
        visitorId,
        checkpointId,
        siteId,
        serviceId,
        dateFrom,
        dateTo,
        dateCreationDebut,
        dateCreationFin,
        withIncidents,
        overdue,
        page = 1,
        limit = 10
      } = filters;

      const skip = (page - 1) * limit;
      
      // Construction de la clause WHERE
      const whereClause = {};

      // Filtres de base
      if (search) {
        whereClause.OR = [
          { entityVisited: { contains: search } },
          { contactPerson: { contains: search } },
          { origin: { contains: search } },
          { reason: { contains: search } },
          { notes: { contains: search } },
          {
            visitor: {
              OR: [
                { firstName: { contains: search } },
                { lastName: { contains: search } },
                { company: { contains: search } },
                { email: { contains: search } }
              ]
            }
          }
        ];
      }

      if (status) {
        whereClause.status = status;
      }

      if (visitorId) {
        whereClause.visitorId = visitorId;
      }

      if (checkpointId) {
        whereClause.checkpointId = checkpointId;
      }

      if (siteId) {
        whereClause.checkpoint = {
          siteId: siteId
        };
      }

      if (serviceId) {
        whereClause.rendezvous = {
          some: {
            serviceId: serviceId
          }
        };
      }

      // Filtres avancés
      if (dateFrom || dateTo) {
        whereClause.entryTime = {};
        if (dateFrom) {
          whereClause.entryTime.gte = new Date(dateFrom);
        }
        if (dateTo) {
          whereClause.entryTime.lte = new Date(dateTo);
        }
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

      if (withIncidents !== undefined) {
        if (withIncidents === 'true') {
          whereClause.incidents = {
            some: {}
          };
        } else if (withIncidents === 'false') {
          whereClause.incidents = {
            none: {}
          };
        }
      }

      if (overdue !== undefined) {
        if (overdue === 'true') {
          const expectedExitTime = new Date();
          expectedExitTime.setHours(expectedExitTime.getHours() - 8); // 8 heures max
          whereClause.entryTime = {
            lt: expectedExitTime
          };
          whereClause.status = 'present';
        }
      }

      const [visits, total] = await Promise.all([
        prisma.visit.findMany({
          where: whereClause,
          skip,
          take: limit,
          include: {
            visitor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
                company: true,
                emergencyContactPhone: true,
                emergencyContactName: true,
                isBlacklisted: true
              }
            },
            checkpoint: {
              select: {
                id: true,
                name: true,
                zone: true,
                checkpointType: true,
                site: {
                  select: {
                    id: true,
                    name: true,
                    code: true,
                    city: true
                  }
                }
              }
            },
            incidents: {
              take: 3,
              orderBy: { createdAt: 'desc' }
            },
            rendezvous: {
              take: 1,
              include: {
                service: {
                  select: {
                    id: true,
                    name: true,
                    type: true
                  }
                }
              }
            },
            _count: {
              select: {
                incidents: true
              }
            }
          },
          orderBy: [
            { entryTime: 'desc' },
            { createdAt: 'desc' }
          ]
        }),
        prisma.visit.count({ where: whereClause })
      ]);

      return {
        visits,
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
      throw new Error(`Erreur lors de la récupération des visites filtrées: ${error.message}`);
    }
  }

  async getFilterOptions(currentFilters = {}) {
    try {
      // Récupérer tous les statuts uniques
      const statuses = await prisma.visit.groupBy({
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

      // Récupérer toutes les origines uniques
      const origins = await prisma.visit.groupBy({
        by: ['origin'],
        where: {
          ...currentFilters,
          origin: { not: null }
        },
        _count: {
          origin: true
        },
        orderBy: {
          origin: 'asc'
        }
      });

      // Récupérer tous les types de raisons uniques
      const reasons = await prisma.visit.groupBy({
        by: ['reason'],
        where: {
          ...currentFilters,
          reason: { not: null }
        },
        _count: {
          reason: true
        },
        orderBy: {
          reason: 'asc'
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
                    some: currentFilters
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

      // Récupérer tous les services pour le filtre service
      const services = await prisma.service.findMany({
        where: currentFilters.serviceId ? { id: currentFilters.serviceId } : {},
        select: {
          id: true,
          name: true,
          type: true,
          _count: {
            select: {
              rendezvous: {
                where: {
                  visit: {
                    some: currentFilters
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
              visits: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });

      return {
        statuses: statuses.map(s => ({ value: s.status, label: s.status, count: s._count.status })),
        origins: origins.map(o => ({ value: o.origin, label: o.origin, count: o._count.origin })),
        reasons: reasons.map(r => ({ value: r.reason, label: r.reason, count: r._count.reason })),
        sites: sites.map(s => ({ 
          value: s.id, 
          label: `${s.name} (${s.code})`, 
          count: s._count.checkpoints, 
          city: s.city 
        })),
        services: services.map(srv => ({ 
          value: srv.id, 
          label: `${srv.name} (${srv.type})`, 
          count: srv._count.rendezvous,
          type: srv.type
        })),
        checkpoints: checkpoints.map(cp => ({ 
          value: cp.id, 
          label: `${cp.name} (${cp.zone})`, 
          count: cp._count.visits,
          zone: cp.zone,
          checkpointType: cp.checkpointType,
          site: cp.site
        }))
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des options de filtre: ${error.message}`);
    }
  }
  async createVisit(visitData) {
    try {
      const visit = await prisma.visit.create({
        data: {
          visitorId: visitData.visitorId,
          checkpointId: visitData.checkpointId,
          entityVisited: visitData.entityVisited,
          contactPerson: visitData.contactPerson,
          origin: visitData.origin,
          reason: visitData.reason,
          notes: visitData.notes,
          status: visitData.status || 'present',
          entryTime: new Date()
        },
        include: {
          visitor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
              company: true,
              emergencyContactPhone: true,
              emergencyContactName: true
            }
          },
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
          incidents: {
            select: {
              id: true,
              title: true,
              description: true,
              severityLevel: true,
              isResolved: true,
              createdAt: true
            }
          }
        }
      });

      return {
        success: true,
        message: 'Visite créée avec succès',
        data: visit
      };
    } catch (error) {
      throw new Error(`Erreur lors de la création de la visite: ${error.message}`);
    }
  }

  async getAllVisits(page = 1, limit = 10, search = null, visitorId = null, status = null) {
    try {
      const skip = (page - 1) * limit;
      
      let whereClause = {};
      
      if (search) {
        whereClause.OR = [
          { visitor: { firstName: { contains: search } } },
          { visitor: { lastName: { contains: search } } },
          { entityVisited: { contains: search } },
          { contactPerson: { contains: search } },
          { origin: { contains: search } }
        ];
      }
      
      if (visitorId) {
        whereClause.visitorId = visitorId;
      }
      
      if (status) {
        whereClause.status = status;
      }

      const [visits, total] = await Promise.all([
        prisma.visit.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { entryTime: 'desc' },
          include: {
            visitor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
                company: true
              }
            },
            incidents: {
              select: {
                id: true,
                title: true,
                severityLevel: true,
                isResolved: true
              }
            }
          }
        }),
        prisma.visit.count({ where: whereClause })
      ]);

      return {
        visits,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des visites: ${error.message}`);
    }
  }

  async getVisitById(id) {
    try {
      const visit = await prisma.visit.findUnique({
        where: { id },
        include: {
          visitor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
              company: true,
              emergencyContactPhone: true,
              emergencyContactName: true
            }
          },
          incidents: {
            select: {
              id: true,
              title: true,
              description: true,
              severityLevel: true,
              isResolved: true,
              createdAt: true,
              resolvedAt: true
            }
          }
        }
      });

      if (!visit) {
        throw new Error('Visite non trouvée');
      }

      return visit;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de la visite: ${error.message}`);
    }
  }

  async checkoutVisit(id, endAt) {
    try {
      const visit = await prisma.visit.findUnique({
        where: { id }
      });

      if (!visit) {
        throw new Error('Visite non trouvée');
      }

      if (visit.exitTime) {
        throw new Error('Cette visite est déjà terminée');
      }

      const updatedVisit = await prisma.visit.update({
        where: { id },
        data: {
          exitTime: endAt ? new Date(endAt) : new Date(),
          status: 'left'
        },
        include: {
          visitor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
              company: true
            }
          }
        }
      });

      return updatedVisit;
    } catch (error) {
      throw new Error(`Erreur lors de la terminaison de la visite: ${error.message}`);
    }
  }

  async deleteVisit(id) {
    try {
      const visit = await prisma.visit.findUnique({
        where: { id }
      });

      if (!visit) {
        throw new Error('Visite non trouvée');
      }

      await prisma.visit.delete({
        where: { id }
      });

      return { message: 'Visite supprimée avec succès' };
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de la visite: ${error.message}`);
    }
  }

  async getVisitStats() {
    try {
      const [total, present, left, today] = await Promise.all([
        prisma.visit.count(),
        prisma.visit.count({ where: { status: 'present' } }),
        prisma.visit.count({ where: { status: 'left' } }),
        prisma.visit.count({
          where: {
            entryTime: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        })
      ]);

      return {
        total,
        present,
        left,
        today
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  }

  async getActiveVisits() {
    try {
      const visits = await prisma.visit.findMany({
        where: { status: 'present' },
        orderBy: { entryTime: 'desc' },
        include: {
          visitor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
              company: true
            }
          }
        }
      });

      return visits;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des visites actives: ${error.message}`);
    }
  }

  async incrementVisitorCount(visitorId) {
    try {
      // Cette méthode peut être utilisée pour incrémenter un compteur de visites récurrentes
      // Pour l'instant, on retourne juste le nombre de visites du visiteur
      const visitCount = await prisma.visit.count({
        where: { visitorId }
      });

      return { visitorId, visitCount };
    } catch (error) {
      throw new Error(`Erreur lors de l'incrémentation du compteur de visites: ${error.message}`);
    }
  }

  async getVisitorsByCheckpointByDay(checkpointId, date) {
    try {
      // Convertir la date en début et fin de journée
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      // Récupérer les visites pour ce checkpoint à cette date
      const visits = await prisma.visit.findMany({
        where: {
          checkpointId: checkpointId,
          entryTime: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          visitor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              company: true,
              idType: true,
              idNumber: true,
              isBlacklisted: true,
              blacklistReason: true,
              createdAt: true
            }
          },
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
        },
        orderBy: {
          entryTime: 'desc'
        }
      });

      // Compter les statistiques
      const stats = {
        totalVisitors: visits.length,
        blacklistedCount: visits.filter(v => v.visitor.isBlacklisted).length,
        uniqueCompanies: [...new Set(visits.map(v => v.visitor.company).filter(Boolean))].length,
        visitsByHour: {}
      };

      // Compter les visites par heure
      visits.forEach(visit => {
        const hour = new Date(visit.entryTime).getHours();
        stats.visitsByHour[hour] = (stats.visitsByHour[hour] || 0) + 1;
      });

      return {
        date: date,
        checkpoint: {
          id: checkpointId,
          // S'il y a des visites, prendre le checkpoint de la première visite
          ...((visits[0] && visits[0].checkpoint) || {})
        },
        visitors: visits.map(visit => ({
          id: visit.visitor.id,
          firstName: visit.visitor.firstName,
          lastName: visit.visitor.lastName,
          email: visit.visitor.email,
          phone: visit.visitor.phone,
          company: visit.visitor.company,
          idType: visit.visitor.idType,
          idNumber: visit.visitor.idNumber,
          isBlacklisted: visit.visitor.isBlacklisted,
          blacklistReason: visit.visitor.blacklistReason,
          visitInfo: {
            visitId: visit.id,
            entryTime: visit.entryTime,
            exitTime: visit.exitTime,
            status: visit.status,
            reason: visit.reason,
            entityVisited: visit.entityVisited,
            contactPerson: visit.contactPerson,
            service: visit.service
          }
        })),
        stats
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des visiteurs du checkpoint: ${error.message}`);
    }
  }

  async getFinishedVisitsByCheckpoint(checkpointId) {
        try {
            return await prisma.visit.findMany({
                where: {
                    checkpointId: checkpointId,
                    exitTime: {
                        not: null        // visite terminée
                    }
                },
                include: {
                    visitor: true,
                    checkpoint: true,
                },
                orderBy: {
                    exitTime: "desc"
                }
            });
        } catch (error) {
            console.error("❌ Erreur getFinishedVisitsByCheckpoint:", error);
            throw new Error("Impossible de récupérer les visites terminées.");
        }
    }
}

module.exports = new VisitService();
