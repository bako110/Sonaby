const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class CheckpointService {
  constructor() {
    this.siteRepository = prisma.site;
    this.checkpointRepository = prisma.checkpoint;
    this.agentRepository = prisma.user;
  }

  async getFilteredCheckpoints(filters = {}) {
    try {
      const {
        search,
        name, // <-- Filtre par nom exact
        siteId,
        zone,
        checkpointType,
        status,
        priority,
        agentId,
        agentName, // <-- Nouveau : filtre par nom d'agent
        dateCreationStart,
        dateCreationEnd,
        hasAgent,
        inAlert,
        page = 1,
        limit = 10,
      } = filters;

      const skip = (page - 1) * limit;

      // Construction de la clause WHERE
  // Construction de la clause WHERE
const whereClause = {};

// 1. Filtre par recherche générale
if (search && search.trim() !== '') {
  whereClause.OR = [
    { name: { contains: search } },
    { description: { contains: search } },
    { sosId: { contains: search } },
  ];
}

// 2. Filtre par nom (SANS mode)
if (name && name.trim() !== '') {
  whereClause.name = { contains: name, mode: "insensitive" }; // ✅ AJOUT: mode insensitive
}

// 3. Filtres simples
if (siteId && siteId.trim() !== '') {
  whereClause.siteId = siteId;
}

if (zone && zone.trim() !== "") {
  whereClause.zone = { contains: zone };
}

if (checkpointType && checkpointType.trim() !== '') {
  whereClause.checkpointType = checkpointType;
}

if (status && status.trim() !== '') {
  whereClause.status = status;
}

if (priority && priority.trim() !== '') {
  whereClause.priority = priority;
}

// 4. Filtres de date
if (dateCreationStart || dateCreationEnd) {
  whereClause.createdAt = {};
  
  if (dateCreationStart) {
    const start = new Date(dateCreationStart);
    start.setHours(0, 0, 0, 0);
    whereClause.createdAt.gte = start;
  }
  
  if (dateCreationEnd) {
    const end = new Date(dateCreationEnd);
    end.setHours(23, 59, 59, 999);
    whereClause.createdAt.lte = end;
  }
}

// 5. FILTRE PAR AGENT ID
if (agentId && agentId.trim() !== '') {
  whereClause.agentAssignments = {
    some: {
      userId: agentId,
      endDate: null,
    },
  };
}

// 6. FILTRE PAR NOM D'AGENT
if (agentName && agentName.trim() !== '') {
  // D'abord, trouver les IDs des agents dont le nom correspond
  const agents = await prisma.user.findMany({
    where: {
      OR: [
        { firstName: { contains: agentName, mode: "insensitive" } },
        { lastName: { contains: agentName, mode: "insensitive" } },
      ],
      role: { in: ["AGENT", "AGENT_SECURITY", "AGENT_GESTION"] },
    },
    select: { id: true },
  });

  if (agents.length > 0) {
    whereClause.agentAssignments = {
      some: {
        userId: { in: agents.map((a) => a.id) },
        endDate: null,
      },
    };
  } else {
    whereClause.id = { in: [] };
  }
}

// 7. Filtre avec/sans agent
if (hasAgent !== undefined) {
  if (hasAgent === true) {
    whereClause.agentAssignments = {
      some: {
        endDate: null,
      },
    };
  } else if (hasAgent === false) {
    whereClause.OR = [
      { agentAssignments: { none: {} } },
      { 
        agentAssignments: { 
          every: { 
            OR: [
              { endDate: { not: null } },
              { endDate: null, userId: null }
            ]
          }
        }
      }
    ];
  }
}

// 8. Filtre en alerte (SOS non résolus)
if (inAlert !== undefined) {
  if (inAlert === true) {
    whereClause.sosAlerts = {
      some: {
        isResolved: false
      }
    };
  } else if (inAlert === false) {
    whereClause.sosAlerts = {
      none: {
        isResolved: false
      }
    };
  }
}

      // 6. Modifier l'include pour récupérer les agents
      const [checkpoints, total] = await Promise.all([
        prisma.checkpoint.findMany({
          where: whereClause,
          skip: skip,
          take: limit,
          include: {
            site: {
              select: {
                id: true,
                name: true,
                code: true,
                city: true,
              },
            },
            agentAssignments: {
              // <-- CHANGÉ : agent -> agentAssignments
              where: {
                endDate: null, // Seulement les assignations actives
              },
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
            sosAlerts: {
              where: {
                isResolved: false,
              },
              select: {
                id: true,
                message: true,
                triggeredAt: true,
                isResolved: true,
                resolvedAt: true,
              },
            },
            _count: {
              select: {
                visits: true,
                sosAlerts: {
                  where: {
                    isResolved: false,
                  },
                },
              },
            },
          },
          orderBy: [{ createdAt: "desc" }, { name: "asc" }],
        }),
        prisma.checkpoint.count({
          where: whereClause,
        }),
      ]);

      // 7. Formater la réponse pour inclure l'agent actuel
      const formattedCheckpoints = checkpoints.map((checkpoint) => {
        const activeAssignment = checkpoint.agentAssignments.find(
          (a) => a.endDate === null
        );

        return {
          ...checkpoint,
          agentId: activeAssignment?.userId || null,
          agentName: activeAssignment
            ? `${activeAssignment.user.firstName} ${activeAssignment.user.lastName}`
            : null,
          agentAssignments: undefined, // Optionnel : enlever si tu veux garder la liste
        };
      });

      return {
        checkpoints: formattedCheckpoints,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
        filterOptions: await this.getFilterOptions(whereClause),
      };
    } catch (error) {
      throw new Error(
        `Erreur lors de la récupération des checkpoints filtrés: ${error.message}`
      );
    }
  }

  // async getFilterOptions(currentFilters = {}) {
  //   try {
  //     // Récupérer toutes les zones uniques
  //     const zones = await prisma.checkpoint.groupBy({
  //       by: ["zone"],
  //       where: {
  //         zone: { not: null },
  //       },
  //       _count: {
  //         zone: true,
  //       },
  //       orderBy: {
  //         zone: "asc",
  //       },
  //     });

  //     // Récupérer tous les types de checkpoint uniques
  //     const checkpointTypes = await prisma.checkpoint.groupBy({
  //       by: ["checkpointType"],
  //       where: {
  //         checkpointType: { not: null },
  //       },
  //       _count: {
  //         checkpointType: true,
  //       },
  //       orderBy: {
  //         checkpointType: "asc",
  //       },
  //     });

  //     // Récupérer tous les statuts uniques
  //     const statuses = await prisma.checkpoint.groupBy({
  //       by: ["status"],
  //       where: {
  //         status: { not: null },
  //       },
  //       _count: {
  //         status: true,
  //       },
  //       orderBy: {
  //         status: "asc",
  //       },
  //     });

  //     // Récupérer toutes les priorités uniques
  //     const priorities = await prisma.checkpoint.groupBy({
  //       by: ["priority"],
  //       where: {
  //         priority: { not: null },
  //       },
  //       _count: {
  //         priority: true,
  //       },
  //       orderBy: {
  //         priority: "asc",
  //       },
  //     });

  //     // Récupérer tous les sites pour le filtre site
  //     const sites = await prisma.site.findMany({
  //       where: currentFilters.siteId ? { id: currentFilters.siteId } : {},
  //       select: {
  //         id: true,
  //         name: true,
  //         code: true,
  //         city: true,
  //         _count: {
  //           select: {
  //             checkpoints: true,
  //           },
  //         },
  //       },
  //       orderBy: {
  //         name: "asc",
  //       },
  //     });

  //     // Récupérer tous les agents pour le filtre agent
  //     const agents = await prisma.user.findMany({
  //       where: {
  //         role: { in: ["AGENT", "AGENT_GESTION"] },
  //         ...(currentFilters.agentId && { id: currentFilters.agentId }),
  //       },
  //       select: {
  //         id: true,
  //         firstName: true,
  //         lastName: true,
  //         email: true,
  //         _count: {
  //           select: {
  //             checkpointsAssigned: true,
  //           },
  //         },
  //       },
  //       orderBy: {
  //         lastName: "asc",
  //         firstName: "asc",
  //       },
  //     });

  //     return {
  //       zones: zones.map((z) => ({
  //         value: z.zone,
  //         label: z.zone,
  //         count: z._count.zone,
  //       })),
  //       checkpointTypes: checkpointTypes.map((ct) => ({
  //         value: ct.checkpointType,
  //         label: ct.checkpointType,
  //         count: ct._count.checkpointType,
  //       })),
  //       statuses: statuses.map((s) => ({
  //         value: s.status,
  //         label: s.status,
  //         count: s._count.status,
  //       })),
  //       priorities: priorities.map((p) => ({
  //         value: p.priority,
  //         label: p.priority,
  //         count: p._count.priority,
  //       })),
  //       sites: sites.map((s) => ({
  //         value: s.id,
  //         label: `${s.name} (${s.code})`,
  //         count: s._count.checkpoints,
  //         city: s.city,
  //       })),
  //       agents: agents.map((a) => ({
  //         value: a.id,
  //         label: `${a.firstName} ${a.lastName}`,
  //         count: a._count.checkpointsAssigned,
  //         email: a.email,
  //       })),
  //     };
  //   } catch (error) {
  //     throw new Error(
  //       `Erreur lors de la récupération des options de filtre: ${error.message}`
  //     );
  //   }
  // }
  async createCheckpoint(checkpointData) {
    try {
      // Vérifier que le site existe
      const site = await prisma.site.findUnique({
        where: { id: checkpointData.siteId },
      });

      if (!site) {
        throw new Error("Site non trouvé");
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
    sosId: checkpointData.sosId || null, // nullable
    agentId: checkpointData.agentId || null, // Ajout de agentId nullable
    checkpointType: checkpointData.checkpointType,
    status: checkpointData.status,
    priority: checkpointData.priority,
    controlFrequency: checkpointData.controlFrequency,
    equipment: checkpointData.equipment || [],
    devicesId: checkpointData.devicesId || [],
    specialInstructions: checkpointData.specialInstructions || null,
    active: checkpointData.active,
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
                  email: true,
                },
              },
            },
            where: {
              endDate: null,
            },
          },
        },
      });

      return checkpoint;
    } catch (error) {
      throw new Error(
        `Erreur lors de la création du checkpoint: ${error.message}`
      );
    }
  }

  async getAllCheckpoints(page = 1, limit = 10, search = null, siteId = null) {
    try {
      const skip = (page - 1) * limit;

      let whereClause = {};

      if (search) {
        whereClause.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { sosId: { contains: search, mode: "insensitive" } },
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
                country: true,
              },
            },
            // Utiliser agentAssignments au lieu du champ agent
            agentAssignments: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
              where: {
                endDate: null, // Seulement les affectations actives
              },
            },
            _count: {
              select: {
                visits: true,
                sosAlerts: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        }),
        prisma.checkpoint.count({ where: whereClause }),
      ]);

      return {
        checkpoints,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error(
        `Erreur lors de la récupération des checkpoints: ${error.message}`
      );
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
                  createdAt: true,
                },
              },
            },
            where: {
              endDate: null, // Seulement les affectations actives
            },
          },
          visits: {
            take: 10,
            orderBy: {
              createdAt: "desc",
            },
            include: {
              visitor: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      if (!checkpoint) {
        throw new Error("Checkpoint non trouvé");
      }

      return checkpoint;
    } catch (error) {
      throw new Error(
        `Erreur lors de la récupération du checkpoint: ${error.message}`
      );
    }
  }

  async updateCheckpoint(id, updateData) {
    try {
      const existingCheckpoint = await this.getCheckpointById(id);

      // Extraire la configuration SOS si présente
      const { sosConfiguration, ...otherUpdateData } = updateData;

      // Si on change l'identifiant SOS, vérifier l'unicité
      if (
        sosConfiguration?.sosId &&
        sosConfiguration.sosId !== existingCheckpoint.sosId
      ) {
        const existingSOS = await prisma.checkpoint.findFirst({
          where: { sosId: sosConfiguration.sosId },
        });

        if (existingSOS) {
          throw new Error("Cet identifiant SOS est déjà utilisé");
        }
      }

      // Si on change le site, vérifier qu'il existe
      if (otherUpdateData.siteId) {
        const site = await prisma.site.findUnique({
          where: { id: otherUpdateData.siteId },
        });

        if (!site) {
          throw new Error("Site non trouvé");
        }
      }

      // Préparer les données de mise à jour (sans agentId)
      const finalUpdateData = {
        ...otherUpdateData,
        ...(sosConfiguration && {
          sosId: sosConfiguration.sosId || null, // Rendre sosId nullable
          sosConfiguration: JSON.stringify(sosConfiguration),
        }),
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
                  email: true,
                },
              },
            },
            where: {
              endDate: null,
            },
          },
        },
      });

      return updatedCheckpoint;
    } catch (error) {
      throw new Error(
        `Erreur lors de la mise à jour du checkpoint: ${error.message}`
      );
    }
  }

  async deleteCheckpoint(id) {
    try {
      const existingCheckpoint = await this.getCheckpointById(id);

      // Vérifier s'il y a des visites associées
      const visitsCount = await prisma.visit.count({
        where: { checkpointId: id },
      });

      if (visitsCount > 0) {
        throw new Error(
          "Impossible de supprimer un checkpoint qui a des visites associées"
        );
      }

      await prisma.checkpoint.delete({
        where: { id },
      });

      return { message: "Checkpoint supprimé avec succès" };
    } catch (error) {
      throw new Error(
        `Erreur lors de la suppression du checkpoint: ${error.message}`
      );
    }
  }

  async assignAgent(checkpointId, agentId) {
    try {
      // Vérifier que le checkpoint existe
      const checkpoint = await prisma.checkpoint.findUnique({
        where: { id: checkpointId },
      });
      if (!checkpoint) throw new Error("Checkpoint non trouvé");

      // Vérifier que l'agent existe (rôle AGENT_CONTROLE)
      const agent = await prisma.user.findFirst({
        where: { id: agentId, role: "AGENT_CONTROLE" },
      });
      if (!agent) throw new Error("Agent non trouvé");

      // Transaction : update checkpoint + update user + créer AgentCheckpointAssignment
      await prisma.$transaction([
        // 1️⃣ Mettre à jour le checkpoint
        prisma.checkpoint.update({
          where: { id: checkpointId },
          data: { agentId: agentId },
        }),

        // 2️⃣ Ajouter le checkpoint à l’agent (relation many-to-many)
        prisma.user.update({
          where: { id: agentId },
          data: {
            assignedCheckpoints: {
              connect: { id: checkpointId },
            },
          },
        }),

        // 3️⃣ Créer l'affectation active
        prisma.agentCheckpointAssignment.create({
          data: {
            checkpointId: checkpointId,
            userId: agentId,
            startDate: new Date(),
            endDate: null,
          },
        }),
      ]);

      // Récupérer le checkpoint mis à jour avec l’agent
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
                  phone: true,
                },
              },
            },
            where: { endDate: null },
          },
          site: true,
        },
      });

      return checkpointWithAgent;
    } catch (error) {
      throw new Error(
        `Erreur lors de l'assignation de l'agent: ${error.message}`
      );
    }
  }

 async unassignAgent(checkpointId, agentId) {
    try {
        // Vérifier que le checkpoint existe
        const checkpoint = await prisma.checkpoint.findUnique({
            where: { id: checkpointId },
            select: {
                id: true,
                agentId: true,  // Récupérer l'agent assigné direct
                name: true
            }
        });
        if (!checkpoint) throw new Error("Checkpoint non trouvé");

        // Vérifier que l'agent existe (rôle AGENT_CONTROLE)
        const agent = await prisma.user.findFirst({
            where: {
                id: agentId,
                role: "AGENT_CONTROLE"
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                // Vérifier s'il a ce checkpoint dans assignedCheckpoints
                assignedCheckpoints: {
                    where: { id: checkpointId },
                    select: { id: true }
                }
            }
        });
        if (!agent) throw new Error("Agent non trouvé");
        // Vérifier s'il y a une assignation directe
        const hasDirectAssignment = checkpoint.agentId === agentId;
        const hasManyToManyAssignment = agent.assignedCheckpoints.length > 0;

        if (!hasDirectAssignment && !hasManyToManyAssignment) {
            console.warn(`⚠️ L'agent ${agentId} n'est pas assigné au checkpoint ${checkpointId}`);
        }

        // Préparer les opérations de transaction
        const transactionOperations = [];

        // 1️⃣ Mettre le checkpoint.agentId à null si c'est cet agent
        if (hasDirectAssignment) {
            transactionOperations.push(
                prisma.checkpoint.update({
                    where: { id: checkpointId },
                    data: { agentId: null },
                })
            );
        }

        // 2️⃣ Retirer le checkpoint de l’agent (relation many-to-many assignedCheckpoints)
        if (hasManyToManyAssignment) {
            transactionOperations.push(
                prisma.user.update({
                    where: { id: agentId },
                    data: {
                        assignedCheckpoints: {
                            disconnect: { id: checkpointId },
                        },
                    },
                })
            );
        }

        // 3️⃣ SUPPRIMER l’affectation dans AgentCheckpointAssignment
        transactionOperations.push(
            prisma.agentCheckpointAssignment.deleteMany({
                where: {
                    checkpointId: checkpointId,
                    userId: agentId
                },
            })
        );
        // Exécuter toutes les opérations en transaction
        await prisma.$transaction(transactionOperations);
        // Récupérer le checkpoint mis à jour
        const updatedCheckpoint = await prisma.checkpoint.findUnique({
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
                                phone: true,
                            },
                        },
                    },
                },
                site: {
                    select: {
                        id: true,
                        name: true,
                        city: true
                    }
                },
                // Agent assigné direct
                agent: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                // Relations disponibles pour Checkpoint
                sosAlerts: true,
                visits: true
            },
        });

        return {
            success: true,
            message: "Agent désaffecté avec succès",
            checkpoint: updatedCheckpoint,
            removedAssignments: {
                direct: hasDirectAssignment,
                manyToMany: hasManyToManyAssignment
            }
        };

    } catch (error) {
        console.error("❌ Erreur lors de la désaffectation:", error);
        throw new Error(
            `Erreur lors de la désaffectation de l'agent: ${error.message}`
        );
    }
}


  async getCheckpointAgents(checkpointId) {
    try {
      // Vérifier que le checkpoint existe
      const checkpoint = await prisma.checkpoint.findUnique({
        where: { id: checkpointId },
      });

      if (!checkpoint) {
        throw new Error("Checkpoint non trouvé");
      }

      // Récupérer tous les agents assignés à ce checkpoint
      const agents = await prisma.agentCheckpointAssignment.findMany({
        where: {
          checkpointId: checkpointId,
          endDate: null, // Seulement les affectations actives
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Extraire seulement les informations des agents
      const agentList = agents.map((assignment) => ({
        assignmentId: assignment.id,
        assignedAt: assignment.createdAt,
        agent: assignment.user,
      }));

      return {
        checkpointId,
        checkpointName: checkpoint.name,
        agents: agentList,
        totalAgents: agentList.length,
      };
    } catch (error) {
      throw new Error(
        `Erreur lors de la récupération des agents du checkpoint: ${error.message}`
      );
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
          isActive: true,
        },
      });

      if (activeSOS) {
        throw new Error("Un SOS est déjà actif pour ce checkpoint");
      }

      // Créer le SOS
      const sos = await prisma.sOS.create({
        data: {
          checkpointId,
          sentBy: userId,
          message,
          isActive: true,
        },
        include: {
          checkpoint: {
            include: {
              site: true,
            },
          },
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // TODO: Implémenter les notifications (email/SMS)
      return sos;
    } catch (error) {
      throw new Error(`Erreur lors de l'envoi du SOS: ${error.message}`);
    }
  }

  async getCheckpointStats() {
    try {
      const stats = await prisma.checkpoint.aggregate({
        _count: {
          id: true,
        },
      });

      const siteStats = await prisma.checkpoint.groupBy({
        by: ["siteId"],
        _count: {
          id: true,
        },
      });

      const agentStats = await prisma.agentControle.aggregate({
        _count: {
          checkpointId: true,
        },
        where: {
          checkpointId: {
            not: null,
          },
        },
      });

      return {
        totalCheckpoints: stats._count.id,
        checkpointsPerSite: siteStats,
        assignedAgents: agentStats._count.checkpointId,
      };
    } catch (error) {
      throw new Error(
        `Erreur lors de la récupération des statistiques: ${error.message}`
      );
    }
  }

  async getCheckpointsWithFilters(filters) {
    const whereConditions = {};

    // 1. Filtre de recherche texte
    if (filters.search) {
      whereConditions.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
        // Si tu as un champ SOS ID
        // { sosId: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    // 2. Filtres simples
    if (filters.siteId) whereConditions.siteId = filters.siteId;
    if (filters.zone) whereConditions.zone = filters.zone;
    if (filters.checkpointType) whereConditions.type = filters.checkpointType;
    if (filters.status) whereConditions.status = filters.status;
    if (filters.priority) whereConditions.priority = filters.priority;
    if (filters.agentId) whereConditions.agentId = filters.agentId;

    // 3. Filtre avec/sans agent
    if (filters.avecAgent === "true") {
      whereConditions.agentId = { not: null };
    } else if (filters.avecAgent === "false") {
      whereConditions.agentId = null;
    }

    // 4. Filtre en alerte (ajuste selon ton modèle)
    if (filters.enAlerte === "true") {
      whereConditions.isAlert = true;
    } else if (filters.enAlerte === "false") {
      whereConditions.isAlert = false;
    }

    // 5. Filtres de date
    if (filters.dateCreationDebut || filters.dateCreationFin) {
      whereConditions.createdAt = {};

      if (filters.dateCreationDebut) {
        const debut = new Date(filters.dateCreationDebut);
        debut.setHours(0, 0, 0, 0);
        whereConditions.createdAt.gte = debut;
      }

      if (filters.dateCreationFin) {
        const fin = new Date(filters.dateCreationFin);
        fin.setHours(23, 59, 59, 999);
        whereConditions.createdAt.lte = fin;
      }
    }

    // 6. Pagination
    const skip = (filters.page - 1) * filters.limit;

    // 7. Exécution de la requête
    const [checkpoints, total] = await this.checkpointRepository.findAndCount({
      where: whereConditions,
      skip,
      take: filters.limit,
      order: { createdAt: "DESC" },
      relations: ["site", "agent"], // Ajuste selon tes relations
    });

    // 8. Récupération des options de filtre dynamiques
    const filterOptions = await this.getDynamicFilterOptions(whereConditions);

    return {
      success: true,
      message: "Checkpoints filtrés récupérés avec succès",
      data: checkpoints.map((checkpoint) => ({
        id: checkpoint.id,
        name: checkpoint.name,
        description: checkpoint.description,
        siteId: checkpoint.siteId,
        siteName: checkpoint.site?.name,
        zone: checkpoint.zone,
        type: checkpoint.type,
        status: checkpoint.status,
        priority: checkpoint.priority,
        agentId: checkpoint.agentId,
        agentName: checkpoint.agent?.name,
        createdAt: checkpoint.createdAt,
        updatedAt: checkpoint.updatedAt,
        isAlert: checkpoint.isAlert,
      })),
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
        hasNext: filters.page < Math.ceil(total / filters.limit),
        hasPrev: filters.page > 1,
      },
      filterOptions,
      filters: filters,
    };
  }

  async getFilterOptions(preFilters) {
    try {
      // Récupérer toutes les zones uniques
      const zones = await prisma.checkpoint.groupBy({
        by: ["zone"],
        _count: {
          zone: true,
        },
        orderBy: {
          zone: "asc",
        },
      });

      // Récupérer tous les types de checkpoint uniques
      const checkpointTypes = await prisma.checkpoint.groupBy({
        by: ["checkpointType"],
        _count: {
          checkpointType: true,
        },
        orderBy: {
          checkpointType: "asc",
        },
      });

      // Récupérer tous les statuts uniques
      const statuses = await prisma.checkpoint.groupBy({
        by: ["status"],
        _count: {
          status: true,
        },
        orderBy: {
          status: "asc",
        },
      });

      // Récupérer toutes les priorités uniques
      const priorities = await prisma.checkpoint.groupBy({
        by: ["priority"],
        _count: {
          priority: true,
        },
        orderBy: {
          priority: "asc",
        },
      });

      // Récupérer tous les sites pour le filtre site
      const sites = await prisma.site.findMany({
        select: {
          id: true,
          name: true,
          code: true,
          city: true,
          _count: {
            select: {
              checkpoints: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });

      // Récupérer tous les agents pour le filtre agent
      const agents = await prisma.user.findMany({
        where: {
          role: { in: ["AGENT_CONTROLE", "AGENT_GESTION"] },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          _count: {
            select: {
              agentAssignments: {
                where: {
                  endDate: null,
                },
              },
            },
          },
        },
        orderBy: [
          { lastName: "asc" },
          { firstName: "asc" }
        ],
      });

      return {
        zones: zones.map((z) => ({
          value: z.zone,
          label: z.zone,
          count: z._count.zone,
        })),
        checkpointTypes: checkpointTypes.map((ct) => ({
          value: ct.checkpointType,
          label: ct.checkpointType,
          count: ct._count.checkpointType,
        })),
        statuses: statuses.map((s) => ({
          value: s.status,
          label: s.status,
          count: s._count.status,
        })),
        priorities: priorities.map((p) => ({
          value: p.priority,
          label: p.priority,
          count: p._count.priority,
        })),
        sites: sites.map((s) => ({
          value: s.id,
          label: `${s.name} (${s.code})`,
          count: s._count.checkpoints,
          city: s.city,
        })),
        agents: agents.map((a) => ({
          value: a.id,
          label: `${a.firstName} ${a.lastName}`,
          count: a._count.agentAssignments,
          email: a.email,
        })),
      };
    } catch (error) {
      console.error("Error getting filter options:", error);
      // Retourner des valeurs par défaut en cas d'erreur
      return {
        zones: [],
        checkpointTypes: [],
        statuses: [],
        priorities: [],
        sites: [],
        agents: [],
      };
    }
  }
}

module.exports = new CheckpointService();
