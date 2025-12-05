const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

class AgentService {
  async createAgent(agentData) {
    try {
      // Vérifier l'unicité de l'email
      const existingAgent = await prisma.user.findUnique({
        where: { email: agentData.email }
      });

      if (existingAgent) {
        throw new Error('Un agent avec cet email existe déjà');
      }

      // Vérifier l'unicité du matricule
      if (agentData.matricule) {
        const existingMatricule = await prisma.user.findUnique({
          where: { matricule: agentData.matricule }
        });

        if (existingMatricule) {
          throw new Error('Un agent avec ce matricule existe déjà');
        }
      }

      // Si un checkpoint est spécifié, vérifier qu'il existe
      if (agentData.checkpointId) {
        const checkpoint = await prisma.checkpoint.findUnique({
          where: { id: agentData.checkpointId }
        });

        if (!checkpoint) {
          throw new Error('Checkpoint non trouvé');
        }
      }

      // Vérifier que les sites existent
      if (agentData.assignedSites && agentData.assignedSites.length > 0) {
        const sites = await prisma.site.findMany({
          where: { id: { in: agentData.assignedSites } }
        });

        if (sites.length !== agentData.assignedSites.length) {
          throw new Error('Un ou plusieurs sites spécifiés n\'existent pas');
        }
      }

      // Vérifier que les permissions existent
      if (agentData.permissions && agentData.permissions.length > 0) {
        const permissions = await prisma.permission.findMany({
          where: { name: { in: agentData.permissions } }
        });

        if (permissions.length !== agentData.permissions.length) {
          throw new Error('Une ou plusieurs permissions spécifiées n\'existent pas');
        }
      }

      // Hasher le mot de passe
      const passwordHash = await bcrypt.hash(agentData.password, 12);

      // Extraire les données pour les relations
      const { assignedSites, permissions, password, checkpointId, ...userData } = agentData;

      // Créer l'agent avec les relations
      const agent = await prisma.user.create({
        data: {
          ...userData,
          passwordHash,
          assignedSites: assignedSites && assignedSites.length > 0 ? {
            create: assignedSites.map(siteId => ({ siteId }))
          } : undefined,
          assignedCheckpoints: checkpointId ? {
            connect: { id: checkpointId }
          } : undefined,
          permissions: permissions && permissions.length > 0 ? {
            create: await Promise.all(
              permissions.map(async (permName) => {
                const perm = await prisma.permission.findUnique({
                  where: { name: permName }
                });
                return { permissionId: perm.id };
              })
            )
          } : undefined
        },
        select: {
          id: true,
          matricule: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          phone: true,
          isActive: true,
          createdAt: true,
          assignedSites: {
            select: {
              site: {
                select: {
                  id: true,
                  name: true,
                  city: true
                }
              }
            }
          },
          assignedCheckpoints: {
            select: {
              id: true,
              name: true,
              site: {
                select: {
                  id: true,
                  name: true,
                  city: true
                }
              }
            }
          },
          permissions: {
            select: {
              permission: {
                select: {
                  id: true,
                  name: true,
                  description: true
                }
              }
            }
          }
        }
      });

      return agent;
    } catch (error) {
      throw new Error(`Erreur lors de la création de l'agent: ${error.message}`);
    }
  }

  async getAllAgents(page = 1, limit = 10, search = null, checkpointId = null) {
    try {
      const skip = (page - 1) * limit;
      
      let whereClause = {};
      
      if (search) {
        whereClause.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (checkpointId) {
        whereClause.assignedCheckpoints = {
          some: {
            id: checkpointId
          }
        };
      }

      // Filtrer uniquement les agents de contrôle
      whereClause.role = 'AGENT_CONTROLE';

      const [agents, total] = await Promise.all([
        prisma.user.findMany({
          where: whereClause,
          skip,
          take: limit,
          select: {
            id: true,
            matricule: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            phone: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            assignedCheckpoints: {
              select: {
                id: true,
                name: true,
                site: {
                  select: {
                    id: true,
                    name: true,
                    city: true
                  }
                }
              }
            },
            assignedSites: {
              select: {
                site: {
                  select: {
                    id: true,
                    name: true,
                    city: true
                  }
                }
              }
            },
            permissions: {
              select: {
                permission: {
                  select: {
                    id: true,
                    name: true,
                    description: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.user.count({ where: whereClause })
      ]);

      return {
        agents,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des agents: ${error.message}`);
    }
  }

  async getAgentById(id) {
    try {
      const agent = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          matricule: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          phone: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          assignedCheckpoints: {
            select: {
              id: true,
              name: true,
              site: {
                select: {
                  id: true,
                  name: true,
                  city: true
                }
              }
            }
          },
          assignedSites: {
            select: {
              site: {
                select: {
                  id: true,
                  name: true,
                  city: true
                }
              }
            }
          },
          permissions: {
            select: {
              permission: {
                select: {
                  id: true,
                  name: true,
                  description: true
                }
              }
            }
          }
        }
      });
      
      if (!agent) {
        throw new Error('Agent non trouvé');
      }

      return agent;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de l'agent: ${error.message}`);
    }
  }

  async updateAgent(id, updateData) {
    try {
      const existingAgent = await this.getAgentById(id);
      
      // Si on change l'email, vérifier l'unicité
      if (updateData.email && updateData.email !== existingAgent.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email: updateData.email }
        });

        if (emailExists) {
          throw new Error('Un agent avec cet email existe déjà');
        }
      }

      // Si on change le matricule, vérifier l'unicité
      if (updateData.matricule && updateData.matricule !== existingAgent.matricule) {
        const matriculeExists = await prisma.user.findUnique({
          where: { matricule: updateData.matricule }
        });

        if (matriculeExists) {
          throw new Error('Un agent avec ce matricule existe déjà');
        }
      }

      // Si on change le checkpoint, vérifier qu'il existe
      if ('checkpointId' in updateData) {
        if (updateData.checkpointId) {
          const checkpoint = await prisma.checkpoint.findUnique({
            where: { id: updateData.checkpointId }
          });

          if (!checkpoint) {
            throw new Error('Checkpoint non trouvé');
          }
        }
      }

      // Vérifier que les sites existent
      if (updateData.assignedSites && updateData.assignedSites.length > 0) {
        const sites = await prisma.site.findMany({
          where: { id: { in: updateData.assignedSites } }
        });

        if (sites.length !== updateData.assignedSites.length) {
          throw new Error('Un ou plusieurs sites spécifiés n\'existent pas');
        }
      }

      // Vérifier que les permissions existent
      if (updateData.permissions && updateData.permissions.length > 0) {
        const permissions = await prisma.permission.findMany({
          where: { name: { in: updateData.permissions } }
        });

        if (permissions.length !== updateData.permissions.length) {
          throw new Error('Une ou plusieurs permissions spécifiées n\'existent pas');
        }
      }

      // Si on change le mot de passe, le hasher
      if (updateData.password) {
        updateData.passwordHash = await bcrypt.hash(updateData.password, 12);
        delete updateData.password;
      }

      // Extraire les données pour les relations
      const { assignedSites, permissions, checkpointId, ...userData } = updateData;

      // Mettre à jour l'agent
      const updatedAgent = await prisma.user.update({
        where: { id },
        data: {
          ...userData,
          assignedSites: assignedSites ? {
            deleteMany: {},
            create: assignedSites.map(siteId => ({ siteId }))
          } : undefined,
          assignedCheckpoints: 'checkpointId' in updateData ? {
            set: checkpointId ? [{ id: checkpointId }] : []
          } : undefined,
          permissions: permissions ? {
            deleteMany: {},
            create: await Promise.all(
              permissions.map(async (permName) => {
                const perm = await prisma.permission.findUnique({
                  where: { name: permName }
                });
                return { permissionId: perm.id };
              })
            )
          } : undefined
        },
        select: {
          id: true,
          matricule: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          phone: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          assignedCheckpoints: {
            select: {
              id: true,
              name: true,
              site: {
                select: {
                  id: true,
                  name: true,
                  city: true
                }
              }
            }
          },
          assignedSites: {
            select: {
              site: {
                select: {
                  id: true,
                  name: true,
                  city: true
                }
              }
            }
          },
          permissions: {
            select: {
              permission: {
                select: {
                  id: true,
                  name: true,
                  description: true
                }
              }
            }
          }
        }
      });

      return updatedAgent;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour de l'agent: ${error.message}`);
    }
  }

  async deleteAgent(id) {
    try {
      const existingAgent = await this.getAgentById(id);
      
      await prisma.user.delete({
        where: { id }
      });

      return { message: 'Agent supprimé avec succès' };
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de l'agent: ${error.message}`);
    }
  }

  async assignToCheckpoint(agentId, checkpointId) {
    try {
      console.log('🔗 [DEBUG] Assignation agent au checkpoint:', { agentId, checkpointId });

      // Vérifier que l'agent existe (utiliser User avec rôle AGENT_CONTROLE)
      const agent = await prisma.user.findFirst({
        where: { 
          id: agentId,
          role: 'AGENT_CONTROLE'
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          assignedCheckpoints: {
            select: { id: true }
          }
        }
      });
      
      if (!agent) {
        throw new Error('Agent non trouvé');
      }
      
      // Vérifier que le checkpoint existe
      const checkpoint = await prisma.checkpoint.findUnique({
        where: { id: checkpointId },
        select: {
          id: true,
          name: true,
          description: true,
          agentId: true,
          site: {
            select: {
              id: true,
              name: true,
              location: true
            }
          }
        }
      });

      if (!checkpoint) {
        throw new Error('Checkpoint non trouvé');
      }

      // Vérifier si l'agent est déjà assigné à ce checkpoint
      const alreadyAssigned = agent.assignedCheckpoints.some(cp => cp.id === checkpointId);
      if (alreadyAssigned) {
        console.log('ℹ️ [DEBUG] Agent déjà assigné à ce checkpoint');
        return {
          id: checkpoint.id,
          name: checkpoint.name,
          description: checkpoint.description,
          agent: {
            id: agent.id,
            firstName: agent.firstName,
            lastName: agent.lastName,
            email: agent.email,
            phone: agent.phone
          },
          site: checkpoint.site
        };
      }

      // Si le checkpoint a déjà un agent, le libérer d'abord
      // if (checkpoint.agentId && checkpoint.agentId !== agentId) {
      //   await prisma.user.update({
      //     where: { id: checkpoint.agentId },
      //     data: {
      //       assignedCheckpoints: {
      //         disconnect: { id: checkpointId }
      //       }
      //     }
      //   });
      //   console.log('🔄 [DEBUG] Ancien agent libéré du checkpoint');
      // }

      // 1. Assigner l'agent au checkpoint (mettre à jour le checkpoint)
      const updatedCheckpoint = await prisma.checkpoint.update({
        where: { id: checkpointId },
        data: { 
          agent: {
            connect: {
              id: agentId
            }
          }
        },
        select: {
          id: true,
          name: true,
          description: true,
          agent: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          site: {
            select: {
              id: true,
              name: true,
              location: true
            }
          }
        }
      });

      // 2. Ajouter le checkpoint dans assignedCheckpoints de l'agent (sans effacer les autres)
      await prisma.user.update({
        where: { id: agentId },
        data: {
          assignedCheckpoints: {
            connect: { id: checkpointId } // Ajoute seulement, n'écrase pas
          }
        }
      });

      console.log('✅ [DEBUG] Agent assigné au checkpoint ET checkpoint ajouté dans assignedCheckpoints');

      return updatedCheckpoint;
    } catch (error) {
      console.error('❌ [ERROR] Erreur lors de l\'assignation:', error.message);
      throw new Error(`Erreur lors de l'assignation de l'agent: ${error.message}`);
    }
  }

  async getAgentStats() {
    try {
      const stats = await prisma.user.aggregate({
        where: {
          role: 'AGENT_CONTROLE'
        },
        _count: {
          id: true
        }
      });

      const assignedAgents = await prisma.checkpoint.count({
        where: {
          agent: {
            is: {
              role: 'AGENT_CONTROLE'
            }
          }
        }
      });

      const checkpointStats = await prisma.checkpoint.groupBy({
        by: ['agentId'],
        _count: {
          id: true
        },
        where: {
          agentId: {
            not: null
          }
        }
      });

      return {
        totalAgents: stats._count.id,
        assignedAgents,
        unassignedAgents: stats._count.id - assignedAgents,
        checkpointsWithAgents: checkpointStats.length
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  }

  async getControlAgentsBySite  (siteId) {
    return await prisma.user.findMany({
        where: {
            role: 'AGENT_CONTROLE',
            assignedSites: {
                some: { siteId }
            }
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
        }
    });
};
}

module.exports = new AgentService();
