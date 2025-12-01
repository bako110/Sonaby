const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class SOSService {
  async createSOS(sosData, sentBy) {
    try {
      console.log('🔍 DEBUG - sosData:', sosData);
      console.log('🔍 DEBUG - sentBy:', sentBy);
      
      // Vérifier que le checkpoint existe
      const checkpoint = await prisma.checkpoint.findUnique({
        where: { id: sosData.checkpointId },
        include: {
          site: {
            select: {
              id: true,
              name: true,
              address: true,
                    city: true,
                    country: true
            }
          }
        }
      });

      if (!checkpoint) {
        throw new Error('Checkpoint non trouvé');
      }

      // Vérifier s'il y a déjà un SOS actif (non résolu) pour ce checkpoint
      const activeSOS = await prisma.sosAlert.findFirst({
        where: {
          checkpointId: sosData.checkpointId,
          isResolved: false
        }
      });

      if (activeSOS) {
        throw new Error('Un SOS est déjà actif pour ce checkpoint');
      }

      console.log('🔍 DEBUG - About to create SOS with triggeredBy:', sentBy);
      
      const sos = await prisma.sosAlert.create({
        data: {
          checkpointId: sosData.checkpointId,
          message: sosData.message,
          triggeredBy: sentBy,  // Utiliser directement sentBy pour éviter undefined
          isResolved: false
        },
        include: {
          checkpoint: {
            include: {
              site: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                  city: true,
                  country: true
                }
              }
            }
          },
          triggerer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      // Simuler l'envoi de notifications (email/SMS)
      await this.sendNotifications(sos);

      return sos;
    } catch (error) {
      throw new Error(`Erreur lors de la création du SOS: ${error.message}`);
    }
  }

  async createGeneralSOS(sosData, sentBy) {
    try {
      console.log('🔍 DEBUG - sosData (GENERAL):', sosData);
      console.log('🔍 DEBUG - sentBy (GENERAL):', sentBy);
      
      // Vérifier que le checkpoint existe
      const checkpoint = await prisma.checkpoint.findUnique({
        where: { id: sosData.checkpointId },
        include: {
          site: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true,
              country: true
            }
          }
        }
      });

      if (!checkpoint) {
        throw new Error('Checkpoint non trouvé');
      }

      // Récupérer le checkpoint spécifique
      const checkpoints = [checkpoint];

      if (checkpoints.length === 0) {
        throw new Error('Checkpoint non trouvé');
      }

      // Vérifier s'il y a déjà un SOS actif pour ce checkpoint
      const activeSOSCount = await prisma.sosAlert.count({
        where: {
          checkpointId: checkpoint.id,
          isResolved: false
        }
      });

      if (activeSOSCount > 0) {
        throw new Error('Un SOS est déjà actif pour ce checkpoint');
      }

      console.log('🔍 DEBUG - About to create GENERAL SOS with triggeredBy:', sentBy);
      
      // Créer un SOS pour le checkpoint spécifique
      const sosAlert = await prisma.sosAlert.create({
        data: {
          checkpointId: checkpoint.id,
          message: sosData.message || `Alerte générale - ${checkpoint.name}`,
          triggeredBy: sentBy,
          isResolved: false
        },
        include: {
          checkpoint: {
            include: {
              site: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                  city: true,
                  country: true
                }
              }
            }
          },
          triggerer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      return {
        success: true,
        message: 'SOS général créé avec succès',
        data: sosAlert
      };
    } catch (error) {
      throw new Error(`Erreur lors de la création du SOS général: ${error.message}`);
    }
  }

  async deactivateSOS(sosId, resolvedBy) {
    try {
      // Vérifier que le SOS existe
      const sos = await prisma.sosAlert.findUnique({
        where: { id: sosId },
        include: {
          checkpoint: {
            include: {
              site: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                  city: true,
                  country: true
                }
              }
            }
          },
          triggerer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      if (!sos) {
        throw new Error('SOS non trouvé');
      }

      if (sos.isResolved) {
        throw new Error('SOS déjà résolu');
      }

      // Marquer le SOS comme résolu
      const resolvedSos = await prisma.sosAlert.update({
        where: { id: sosId },
        data: {
          isResolved: true,
          resolvedAt: new Date(),
          resolvedBy: resolvedBy
        },
        include: {
          checkpoint: {
            include: {
              site: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                  city: true,
                  country: true
                }
              }
            }
          },
          triggerer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      return resolvedSos;
    } catch (error) {
      throw new Error(`Erreur lors de la résolution du SOS: ${error.message}`);
    }
  }

  async sendNotifications(sos) {
    try {
      // Mock des notifications - à implémenter avec un vrai service
      console.log(`🚨 SOS ALERT 🚨`);
      console.log(`Checkpoint: ${sos.checkpoint.name}`);
      console.log(`Site: ${sos.checkpoint.site.name} (${sos.checkpoint.site.city})`);
      console.log(`Envoyé par: ${sos.triggerer.firstName} ${sos.triggerer.lastName}`);
      console.log(`Message: ${sos.message || 'Aucun message'}`);
      console.log(`Heure: ${sos.triggeredAt}`);
      
      // TODO: Implémenter l'envoi d'emails et SMS
      // await emailService.sendSOSAlert(sos);
      // await smsService.sendSOSAlert(sos);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi des notifications:', error);
      return false;
    }
  }

  async getAllSOS(page = 1, limit = 10, checkpointId = null, active = null) {
    try {
      const skip = (page - 1) * limit;
      
      let whereClause = {};
      
      if (checkpointId) {
        whereClause.checkpointId = checkpointId;
      }

      if (active !== null) {
        // active=true signifie isResolved=false
        whereClause.isResolved = !active;
      }

      const [sosAlerts, total] = await Promise.all([
        prisma.sosAlert.findMany({
          where: whereClause,
          skip,
          take: limit,
          include: {
            checkpoint: {
              include: {
                site: {
                  select: {
                    id: true,
                    name: true,
                    address: true,
                    city: true,
                    country: true
                  }
                }
              }
            },
            triggerer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          },
          orderBy: {
            triggeredAt: 'desc'
          }
        }),
        prisma.sosAlert.count({ where: whereClause })
      ]);

      return {
        sosAlerts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des SOS: ${error.message}`);
    }
  }

  async getSOSById(id) {
    try {
      const sos = await prisma.sosAlert.findUnique({
        where: { id },
        include: {
          checkpoint: {
            include: {
              site: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                  city: true,
                  country: true
                }
              }
            }
          },
          triggerer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true
            }
          }
        }
      });
      
      if (!sos) {
        throw new Error('SOS non trouvé');
      }

      return sos;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du SOS: ${error.message}`);
    }
  }

  async resolveSOS(id, resolvedBy, notes) {
    try {
      const existingSOS = await this.getSOSById(id);
      
      if (existingSOS.isResolved) {
        throw new Error('Ce SOS est déjà résolu');
      }

      const updatedSOS = await prisma.sosAlert.update({
        where: { id },
        data: { 
          isResolved: true,
          resolvedBy,
          resolvedAt: new Date(),
          resolutionNotes: notes
        },
        include: {
          checkpoint: {
            include: {
              site: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                  city: true,
                  country: true
                }
              }
            }
          },
          triggerer: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          resolver: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      return updatedSOS;
    } catch (error) {
      throw new Error(`Erreur lors de la résolution du SOS: ${error.message}`);
    }
  }

  async getActiveSOS() {
    try {
      const activeSOS = await prisma.sosAlert.findMany({
        where: {
          isResolved: false
        },
        include: {
          checkpoint: {
            include: {
              site: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                    city: true,
                    country: true
                }
              }
            }
          },
          triggerer: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: {
          triggeredAt: 'desc'
        }
      });

      return activeSOS;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des SOS actifs: ${error.message}`);
    }
  }

  async getSOSStats() {
    try {
      const stats = await prisma.sosAlert.aggregate({
        _count: {
          id: true
        }
      });

      const activeSOS = await prisma.sosAlert.count({
        where: {
          isResolved: false
        }
      });

      const sosPerCheckpoint = await prisma.sosAlert.groupBy({
        by: ['checkpointId'],
        _count: {
          id: true
        }
      });

      // Statistiques par jour (7 derniers jours)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentSOS = await prisma.sosAlert.findMany({
        where: {
          triggeredAt: {
            gte: sevenDaysAgo
          }
        },
        select: {
          triggeredAt: true
        }
      });

      const sosByDay = {};
      recentSOS.forEach(sos => {
        const day = sos.triggeredAt.toISOString().split('T')[0];
        sosByDay[day] = (sosByDay[day] || 0) + 1;
      });

      return {
        totalSOS: stats._count.id,
        activeSOS,
        resolvedSOS: stats._count.id - activeSOS,
        sosPerCheckpoint,
        sosByDay
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques SOS: ${error.message}`);
    }
  }
}

module.exports = new SOSService();
