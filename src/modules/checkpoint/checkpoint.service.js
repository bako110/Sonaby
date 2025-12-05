const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class CheckpointService {
  async getFilteredCheckpoints(filters = {}) {
    try {
      const {
        search,
        siteId,
        name,
        zone,
        checkpointType,
        status,
        priority,
        agentId,
        dateCreationStart,
        dateCreationEnd,
        hasAgent,
        inAlert,
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
          { description: { contains: search, mode: 'insensitive' } },
          { sosId: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (name) {
        whereClause.name = { contains: name, mode: 'insensitive' };
      }

      if (siteId) {
        whereClause.siteId = siteId;
      }

      if (zone) {
        whereClause.zone = { contains: zone, mode: 'insensitive' };
      }

      if (checkpointType) {
        whereClause.checkpointType = checkpointType;
      }

      if (status) {
        whereClause.status = status;
      }

      if (priority) {
        whereClause.priority = priority;
      }

      if (agentId) {
        whereClause.agentId = agentId;
      }

      // Filtres avancés
      if (dateCreationStart || dateCreationEnd) {
        whereClause.createdAt = {};
        if (dateCreationStart) {
          whereClause.createdAt.gte = new Date(dateCreationStart);
        }
        if (dateCreationEnd) {
          whereClause.createdAt.lte = new Date(dateCreationEnd);
        }
      }

      if (hasAgent !== undefined) {
        if (hasAgent === true) {
          whereClause.agentId = { not: null };
        } else if (hasAgent === false) {
          whereClause.agentId = null;
        }
      }

      if (inAlert !== undefined) {
        if (inAlert === true) {
          // Vérifier s'il y a des SOS actifs pour ce checkpoint
          const checkpointsWithActiveSOS = await prisma.checkpoint.findMany({
            where: {
              sosAlerts: {
                some: {
                  isResolved: false
                }
              }
            },
            select: { id: true }
          });
          whereClause.id = {
            in: checkpointsWithActiveSOS.map(cp => cp.id)
          };
        } else if (inAlert === false) {
          // Checkpoints sans SOS actif
          const checkpointsWithActiveSOS = await prisma.checkpoint.findMany({
            where: {
              sosAlerts: {
                some: {
                  isResolved: false
                }
              }
            },
            select: { id: true }
          });
          whereClause.id = {
            not: checkpointsWithActiveSOS.map(cp => cp.id)
          };
        }
      }

      const [checkpoints, total] = await Promise.all([
        prisma.checkpoint.findMany({
          where: whereClause,
          skip,
          take: limit,
          include: {
            site: {
              select: {
                id: true,
                name: true,
                code: true,
                city: true
              }
            },
            agent: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            },
            sosAlerts: {
              where: { isResolved: false },
              select: {
                id: true,
                message: true,
                createdAt: true
              }
            },
            _count: {
              select: {
                visits: true,
                sosAlerts: {
                  where: { isResolved: false }
                }
              }
            }
          },
          orderBy: [
            { createdAt: 'desc' },
            { name: 'asc' }
          ]
        }),
        prisma.checkpoint.count({ where: whereClause })
      ]);

      return {
        checkpoints,
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
      throw new Error(`Erreur lors de la récupération des checkpoints filtrés: ${error.message}`);
    }
  }

  async getFilterOptions(currentFilters = {}) {
    try {
      // Récupérer toutes les zones uniques
      const zones = await prisma.checkpoint.groupBy({
        by: ['zone'],
        where: {
          zone: { not: null }
        },
        _count: {
          zone: true
        },
        orderBy: {
          zone: 'asc'
        }
      });

      // Récupérer tous les types de checkpoint uniques
      const checkpointTypes = await prisma.checkpoint.groupBy({
        by: ['checkpointType'],
        where: {
          checkpointType: { not: null }
        },
        _count: {
          checkpointType: true
        },
        orderBy: {
          checkpointType: 'asc'
        }
      });

      // Récupérer tous les statuts uniques
      const statuses = await prisma.checkpoint.groupBy({
        by: ['status'],
        where: {
          status: { not: null }
        },
        _count: {
          status: true
        },
        orderBy: {
          status: 'asc'
        }
      });

      // Récupérer toutes les priorités uniques
      const priorities = await prisma.checkpoint.groupBy({
        by: ['priority'],
        where: {
          priority: { not: null }
        },
        _count: {
          priority: true
        },
        orderBy: {
          priority: 'asc'
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
              checkpoints: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });

      // Récupérer tous les agents pour le filtre agent
      const agents = await prisma.user.findMany({
        where: {
          role: { in: ['AGENT', 'AGENT_GESTION'] },
          ...(currentFilters.agentId && { id: currentFilters.agentId })
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          _count: {
            select: {
              checkpointsAssigned: true
            }
          }
        },
        orderBy: {
          lastName: 'asc',
          firstName: 'asc'
        }
      });

      return {
        zones: zones.map(z => ({ value: z.zone, label: z.zone, count: z._count.zone })),
        checkpointTypes: checkpointTypes.map(ct => ({ value: ct.checkpointType, label: ct.checkpointType, count: ct._count.checkpointType })),
        statuses: statuses.map(s => ({ value: s.status, label: s.status, count: s._count.status })),
        priorities: priorities.map(p => ({ value: p.priority, label: p.priority, count: p._count.priority })),
        sites: sites.map(s => ({ value: s.id, label: `${s.name} (${s.code})`, count: s._count.checkpoints, city: s.city })),
        agents: agents.map(a => ({ value: a.id, label: `${a.firstName} ${a.lastName}`, count: a._count.checkpointsAssigned, email: a.email }))
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des options de filtre: ${error.message}`);
    }
  }
  async createCheckpoint(checkpointData) {
    try {
      // Vérifier que le site existe
      const site = await prisma.site.findUnique({
        where: { id: checkpointData.siteId }
      });

      if (!site) {
        throw new Error('Site non trouvé');
      }

      // Vérifier l'unicité de l'identifiant SOS
      if (checkpointData.sosId) {
        const existingSOS = await prisma.checkpoint.findFirst({
          where: { sosId: checkpointData.sosId }
        });

        if (existingSOS) {
          throw new Error('Cet identifiant SOS est déjà utilisé');
        }
      }

      // Préparer les données pour la création (sans agentId)
      const createData = {
        name: checkpointData.name,
        description: checkpointData.description || null,
        siteId: checkpointData.siteId,
        zone: checkpointData.zone || null,
        building: checkpointData.building || null,
        floor: checkpointData.floor || null,
        coordinatesLatitude: checkpointData.coordinatesLatitude || null,
        coordinatesLongitude: checkpointData.coordinatesLongitude || null,
        sosId: checkpointData.sosId,
        // Ne pas inclure agentId - utiliser agentAssignments à la place
        checkpointType: checkpointData.checkpointType,
        status: checkpointData.status,
        priority: checkpointData.priority,
        controlFrequency: checkpointData.controlFrequency,
        equipment: checkpointData.equipment || [],
        devicesId: checkpointData.devicesId || [],
        specialInstructions: checkpointData.specialInstructions || null,
        active: checkpointData.active
      };

      const checkpoint = await prisma.checkpoint.create({
        data: createData,
        include: {
          site: true,
          agentAssignments: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            },
            where: {
              endDate: null
            }
          }
        }
      });
      
      return checkpoint;
    } catch (error) {
      throw new Error(`Erreur lors de la création du checkpoint: ${error.message}`);
    }
  }

  async getAllCheckpoints(page = 1, limit = 10, search = null, siteId = null) {
    try {
      const skip = (page - 1) * limit;
      
      let whereClause = {};
      
      if (search) {
        whereClause.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { sosId: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (siteId) {
        whereClause.siteId = siteId;
      }

      const [checkpoints, total] = await Promise.all([
        prisma.checkpoint.findMany({
          where: whereClause,
          skip,
          take: limit,
          include: {
            site: {
              select: {
                id: true,
                name: true,
                address: true,
                city: true,
                country: true
              }
            },
            // Utiliser agentAssignments au lieu du champ agent
            agentAssignments: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true
                  }
                }
              },
              where: {
                endDate: null // Seulement les affectations actives
              }
            },
            _count: {
              select: {
                visits: true,
                sosAlerts: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.checkpoint.count({ where: whereClause })
      ]);

      return {
        checkpoints,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des checkpoints: ${error.message}`);
    }
  }

  async getCheckpointById(id) {
    try {
      const checkpoint = await prisma.checkpoint.findUnique({
        where: { id },
        include: {
          site: true,
          // Utiliser agentAssignments au lieu du champ agent
          agentAssignments: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  createdAt: true
                }
              }
            },
            where: {
              endDate: null // Seulement les affectations actives
            }
          },
          visits: {
            take: 10,
            orderBy: {
              createdAt: 'desc'
            },
            include: {
              visitor: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      });
      
      if (!checkpoint) {
        throw new Error('Checkpoint non trouvé');
      }
      
      return checkpoint;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du checkpoint: ${error.message}`);
    }
  }

  async updateCheckpoint(id, updateData) {
    try {
      const existingCheckpoint = await this.getCheckpointById(id);
      
      // Extraire la configuration SOS si présente
      const { sosConfiguration, ...otherUpdateData } = updateData;
      
      // Si on change l'identifiant SOS, vérifier l'unicité
      if (sosConfiguration?.sosId && sosConfiguration.sosId !== existingCheckpoint.sosId) {
        const existingSOS = await prisma.checkpoint.findFirst({
          where: { sosId: sosConfiguration.sosId }
        });

        if (existingSOS) {
          throw new Error('Cet identifiant SOS est déjà utilisé');
        }
      }

      // Si on change le site, vérifier qu'il existe
      if (otherUpdateData.siteId) {
        const site = await prisma.site.findUnique({
          where: { id: otherUpdateData.siteId }
        });

        if (!site) {
          throw new Error('Site non trouvé');
        }
      }

      // Préparer les données de mise à jour (sans agentId)
      const finalUpdateData = {
        ...otherUpdateData,
        ...(sosConfiguration && {
          sosId: sosConfiguration.sosId,
          sosConfiguration: JSON.stringify(sosConfiguration)
        })
      };

      const updatedCheckpoint = await prisma.checkpoint.update({
        where: { id },
        data: finalUpdateData,
        include: {
          site: true,
          agentAssignments: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            },
            where: {
              endDate: null
            }
          }
        }
      });

      return updatedCheckpoint;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour du checkpoint: ${error.message}`);
    }
  }

  async deleteCheckpoint(id) {
    try {
      const existingCheckpoint = await this.getCheckpointById(id);
      
      // Vérifier s'il y a des visites associées
      const visitsCount = await prisma.visit.count({
        where: { checkpointId: id }
      });

      if (visitsCount > 0) {
        throw new Error('Impossible de supprimer un checkpoint qui a des visites associées');
      }

      await prisma.checkpoint.delete({
        where: { id }
      });

      return { message: 'Checkpoint supprimé avec succès' };
    } catch (error) {
      throw new Error(`Erreur lors de la suppression du checkpoint: ${error.message}`);
    }
  }

  async assignAgent(checkpointId, agentId) {
  try {
    // Vérifier que le checkpoint existe
    const checkpoint = await prisma.checkpoint.findUnique({
      where: { id: checkpointId }
    });
    if (!checkpoint) throw new Error('Checkpoint non trouvé');

    // Vérifier que l'agent existe (rôle AGENT_CONTROLE)
    const agent = await prisma.user.findFirst({
      where: { id: agentId, role: 'AGENT_CONTROLE' }
    });
    if (!agent) throw new Error('Agent non trouvé');

    // Mettre à jour le checkpoint et le user dans une transaction
    const [updatedCheckpoint] = await prisma.$transaction([
      // 1️⃣ Mettre à jour le checkpoint
      prisma.checkpoint.update({
        where: { id: checkpointId },
        data: { agentId: agentId }
      }),
      // 2️⃣ Ajouter le checkpoint à l’agent
      prisma.user.update({
        where: { id: agentId },
        data: {
          assignedCheckpoints: {
            connect: { id: checkpointId } // ajoute le checkpoint à la liste
          }
        }
      })
    ]);

    // Récupérer le checkpoint mis à jour avec les infos de l’agent
    const checkpointWithAgent = await prisma.checkpoint.findUnique({
  where: { id: checkpointId },
  include: {
    agentAssignments: {
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      },
      where: {
        endDate: null // seulement les affectations actives
      }
    },
    site: true
  }
});


    return checkpointWithAgent;
  } catch (error) {
    throw new Error(`Erreur lors de l'assignation de l'agent: ${error.message}`);
  }
}

  async getCheckpointAgents(checkpointId) {
    try {
      // Vérifier que le checkpoint existe
      const checkpoint = await prisma.checkpoint.findUnique({
        where: { id: checkpointId }
      });

      if (!checkpoint) {
        throw new Error('Checkpoint non trouvé');
      }

      // Récupérer tous les agents assignés à ce checkpoint
      const agents = await prisma.agentCheckpointAssignment.findMany({
        where: {
          checkpointId: checkpointId,
          endDate: null // Seulement les affectations actives
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              createdAt: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Extraire seulement les informations des agents
      const agentList = agents.map(assignment => ({
        assignmentId: assignment.id,
        assignedAt: assignment.createdAt,
        agent: assignment.user
      }));

      return {
        checkpointId,
        checkpointName: checkpoint.name,
        agents: agentList,
        totalAgents: agentList.length
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des agents du checkpoint: ${error.message}`);
    }
  }

  async sendSOS(checkpointId, userId, message = null) {
    try {
      // Vérifier que le checkpoint existe
      const checkpoint = await this.getCheckpointById(checkpointId);
      
      // Vérifier s'il y a déjà un SOS actif pour ce checkpoint
      const activeSOS = await prisma.sOS.findFirst({
        where: {
          checkpointId,
          isActive: true
        }
      });

      if (activeSOS) {
        throw new Error('Un SOS est déjà actif pour ce checkpoint');
      }

      // Créer le SOS
      const sos = await prisma.sOS.create({
        data: {
          checkpointId,
          sentBy: userId,
          message,
          isActive: true
        },
        include: {
          checkpoint: {
            include: {
              site: true
            }
          },
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      // TODO: Implémenter les notifications (email/SMS)
      console.log(`SOS envoyé pour le checkpoint ${checkpoint.name} par ${sos.sender.firstName} ${sos.sender.lastName}`);

      return sos;
    } catch (error) {
      throw new Error(`Erreur lors de l'envoi du SOS: ${error.message}`);
    }
  }

  async getCheckpointStats() {
    try {
      const stats = await prisma.checkpoint.aggregate({
        _count: {
          id: true
        }
      });

      const siteStats = await prisma.checkpoint.groupBy({
        by: ['siteId'],
        _count: {
          id: true
        }
      });

      const agentStats = await prisma.agentControle.aggregate({
        _count: {
          checkpointId: true
        },
        where: {
          checkpointId: {
            not: null
          }
        }
      });

      return {
        totalCheckpoints: stats._count.id,
        checkpointsPerSite: siteStats,
        assignedAgents: agentStats._count.checkpointId
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  }
}

module.exports = new CheckpointService();
