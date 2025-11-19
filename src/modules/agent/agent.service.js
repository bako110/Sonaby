const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

class AgentService {
  async createAgent(agentData) {
    try {
      // Vérifier l'unicité de l'email
      const existingAgent = await prisma.agentControle.findUnique({
        where: { email: agentData.email }
      });

      if (existingAgent) {
        throw new Error('Un agent avec cet email existe déjà');
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

      // Hasher le mot de passe
      const passwordHash = await bcrypt.hash(agentData.password, 12);

      const agent = await prisma.agentControle.create({
        data: {
          ...agentData,
          passwordHash,
          password: undefined // Supprimer le mot de passe en clair
        },
        include: {
          checkpoint: {
            include: {
              site: {
                select: {
                  id: true,
                  name: true,
                  location: true
                }
              }
            }
          }
        }
      });

      // Supprimer le hash du mot de passe de la réponse
      const { passwordHash: _, ...agentWithoutPassword } = agent;
      return agentWithoutPassword;
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
          { firstname: { contains: search, mode: 'insensitive' } },
          { lastname: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (checkpointId) {
        whereClause.checkpointId = checkpointId;
      }

      const [agents, total] = await Promise.all([
        prisma.agentControle.findMany({
          where: whereClause,
          skip,
          take: limit,
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            checkpointId: true,
            createdAt: true,
            updatedAt: true,
            checkpoint: {
              include: {
                site: {
                  select: {
                    id: true,
                    name: true,
                    location: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.agentControle.count({ where: whereClause })
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
      const agent = await prisma.agentControle.findUnique({
        where: { id },
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
          checkpointId: true,
          createdAt: true,
          updatedAt: true,
          checkpoint: {
            include: {
              site: {
                select: {
                  id: true,
                  name: true,
                  location: true
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
        const emailExists = await prisma.agentControle.findUnique({
          where: { email: updateData.email }
        });

        if (emailExists) {
          throw new Error('Un agent avec cet email existe déjà');
        }
      }

      // Si on change le checkpoint, vérifier qu'il existe
      if (updateData.checkpointId) {
        const checkpoint = await prisma.checkpoint.findUnique({
          where: { id: updateData.checkpointId }
        });

        if (!checkpoint) {
          throw new Error('Checkpoint non trouvé');
        }
      }

      // Si on change le mot de passe, le hasher
      if (updateData.password) {
        updateData.passwordHash = await bcrypt.hash(updateData.password, 12);
        delete updateData.password;
      }

      const updatedAgent = await prisma.agentControle.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
          checkpointId: true,
          createdAt: true,
          updatedAt: true,
          checkpoint: {
            include: {
              site: {
                select: {
                  id: true,
                  name: true,
                  location: true
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
      
      await prisma.agentControle.delete({
        where: { id }
      });

      return { message: 'Agent supprimé avec succès' };
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de l'agent: ${error.message}`);
    }
  }

  async assignToCheckpoint(agentId, checkpointId) {
    try {
      // Vérifier que l'agent existe
      const agent = await this.getAgentById(agentId);
      
      // Vérifier que le checkpoint existe
      const checkpoint = await prisma.checkpoint.findUnique({
        where: { id: checkpointId },
        include: {
          site: true
        }
      });

      if (!checkpoint) {
        throw new Error('Checkpoint non trouvé');
      }

      // Assigner l'agent au checkpoint
      const updatedAgent = await prisma.agentControle.update({
        where: { id: agentId },
        data: { checkpointId },
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
          checkpointId: true,
          createdAt: true,
          updatedAt: true,
          checkpoint: {
            include: {
              site: {
                select: {
                  id: true,
                  name: true,
                  location: true
                }
              }
            }
          }
        }
      });

      return updatedAgent;
    } catch (error) {
      throw new Error(`Erreur lors de l'assignation de l'agent: ${error.message}`);
    }
  }

  async getAgentStats() {
    try {
      const stats = await prisma.agentControle.aggregate({
        _count: {
          id: true
        }
      });

      const assignedAgents = await prisma.agentControle.count({
        where: {
          checkpointId: {
            not: null
          }
        }
      });

      const checkpointStats = await prisma.agentControle.groupBy({
        by: ['checkpointId'],
        _count: {
          id: true
        },
        where: {
          checkpointId: {
            not: null
          }
        }
      });

      return {
        totalAgents: stats._count.id,
        assignedAgents,
        unassignedAgents: stats._count.id - assignedAgents,
        agentsPerCheckpoint: checkpointStats
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  }
}

module.exports = new AgentService();
