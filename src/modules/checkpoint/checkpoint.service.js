const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class CheckpointService {
  async createCheckpoint(checkpointData) {
    try {
      // Vérifier que le site existe
      const site = await prisma.site.findUnique({
        where: { id: checkpointData.siteId }
      });

      if (!site) {
        throw new Error('Site non trouvé');
      }

      // Extraire la configuration SOS
      const { sosConfiguration, ...checkpointFields } = checkpointData;
      
      // Vérifier l'unicité de l'identifiant SOS si fourni
      if (sosConfiguration?.sosId) {
        const existingSOS = await prisma.checkpoint.findFirst({
          where: { sosId: sosConfiguration.sosId }
        });

        if (existingSOS) {
          throw new Error('Cet identifiant SOS est déjà utilisé');
        }
      }

      // Si un agent est assigné, récupérer ses infos pour les champs dénormalisés
      let agentInfo = {};
      if (checkpointData.agentId) {
        const agent = await prisma.user.findUnique({
          where: { id: checkpointData.agentId }
        });
        
        if (!agent) {
           throw new Error('Agent non trouvé');
        }

        // Remplir les champs dénormalisés
        agentInfo = {
          agentName: `${agent.firstName} ${agent.lastName}`,
          agentEmail: agent.email,
          agentPhone: agent.phone,
          assignmentDate: new Date()
        };
      }

      // Préparer les données pour la création
      const createData = {
        ...checkpointFields,
        ...agentInfo,
        sosId: sosConfiguration?.sosId || null,
        sosConfiguration: sosConfiguration ? JSON.stringify(sosConfiguration) : null
      };

      const checkpoint = await prisma.checkpoint.create({
        data: createData,
        include: {
          site: true,
          agent: { // Changé de 'agents' à 'agent'
            select: {
              id: true,
              firstName: true, // Changé de 'firstname' à 'firstName' pour correspondre au modèle User
              lastName: true,  // Changé de 'lastname' à 'lastName' pour correspondre au modèle User
              email: true
            }
          }
        }
      });
      
      // Parser la configuration SOS pour le retour
      if (checkpoint.sosConfiguration) {
        try {
          checkpoint.sosConfiguration = JSON.parse(checkpoint.sosConfiguration);
        } catch (e) {
          checkpoint.sosConfiguration = null;
        }
      }
      
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
            agent: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
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

      // Parser la configuration SOS pour tous les checkpoints
      const checkpointsWithParsedSOS = checkpoints.map(checkpoint => {
        if (checkpoint.sosConfiguration) {
          try {
            checkpoint.sosConfiguration = JSON.parse(checkpoint.sosConfiguration);
          } catch (e) {
            checkpoint.sosConfiguration = null;
          }
        }
        return checkpoint;
      });

      return {
        checkpoints: checkpointsWithParsedSOS,
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
          agent: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              createdAt: true
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
      
      // Parser la configuration SOS
      if (checkpoint.sosConfiguration) {
        try {
          checkpoint.sosConfiguration = JSON.parse(checkpoint.sosConfiguration);
        } catch (e) {
          checkpoint.sosConfiguration = null;
        }
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

      // Préparer les données de mise à jour
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
          agent: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      // Parser la configuration SOS pour le retour
      if (updatedCheckpoint.sosConfiguration) {
        try {
          updatedCheckpoint.sosConfiguration = JSON.parse(updatedCheckpoint.sosConfiguration);
        } catch (e) {
          updatedCheckpoint.sosConfiguration = null;
        }
      }

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
      const checkpoint = await this.getCheckpointById(checkpointId);
      
      // Vérifier que l'agent existe
      const agent = await prisma.agentControle.findUnique({
        where: { id: agentId }
      });

      if (!agent) {
        throw new Error('Agent non trouvé');
      }

      // Assigner l'agent au checkpoint
      const updatedAgent = await prisma.agentControle.update({
        where: { id: agentId },
        data: { checkpointId },
        include: {
          checkpoint: {
            include: {
              site: true
            }
          }
        }
      });

      return updatedAgent;
    } catch (error) {
      throw new Error(`Erreur lors de l'assignation de l'agent: ${error.message}`);
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
