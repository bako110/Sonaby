const { prisma } = require('../../config/prisma');
const blacklistService = require('../blacklist/blacklist.service');

class VisitService {
  async createVisit(visitData) {
    try {
      let visitor = null;
      let isNewVisitor = false;

      // 1. ÉTAPE 1: Résoudre le visiteur (existant ou nouveau)
      if (visitData.visitorId) {
        // Cas 1: ID fourni - chercher le visiteur existant
        visitor = await prisma.visitor.findUnique({
          where: { id: visitData.visitorId }
        });
        
        if (!visitor) {
          throw new Error('Visiteur non trouvé avec cet ID');
        }
      } else if (visitData.visitorData) {
        // Cas 2: Données scannées - workflow complet
        const { idType, idNumber } = visitData.visitorData;
        
        if (!idType || !idNumber) {
          throw new Error('Le type et numéro de pièce d\'identité sont requis');
        }

        // 1.1 Chercher dans la table visitors (visiteur connu)
        visitor = await prisma.visitor.findFirst({
          where: {
            idType: idType,
            idNumber: idNumber
          }
        });

        if (!visitor) {
          // 1.2 Pas trouvé dans visitors - vérifier blacklist_history (indésirable inconnu)
          const blacklistEntry = await prisma.blacklistHistory.findFirst({
            where: {
              idType: idType,
              idNumber: idNumber,
              action: 'added' // Blacklisté
            },
            include: {
              creator: {
                select: {
                  firstName: true,
                  lastName: true,
                  role: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          });

          if (blacklistEntry) {
            // 🚨 PERSONNE BLACKLISTÉE DÉTECTÉE
            return {
              success: false,
              isBlacklisted: true,
              blacklistType: 'INCONNU_BLACKLISTE',
              message: `⚠️ ALERTE SÉCURITÉ: Cette personne est blacklistée`,
              blacklistDetails: {
                reason: blacklistEntry.reason,
                severityLevel: blacklistEntry.severityLevel,
                incidentDate: blacklistEntry.incidentDate,
                incidentLocation: blacklistEntry.incidentLocation,
                blacklistedBy: blacklistEntry.creator,
                blacklistedAt: blacklistEntry.createdAt
              },
              visitorInfo: {
                firstName: blacklistEntry.firstName,
                lastName: blacklistEntry.lastName,
                idType: blacklistEntry.idType,
                idNumber: blacklistEntry.idNumber
              }
            };
          }

          // 1.3 Pas blacklisté - créer le nouveau visiteur
          visitor = await prisma.visitor.create({
            data: visitData.visitorData
          });
          isNewVisitor = true;
        }
      } else {
        throw new Error('Vous devez fournir un visitorId ou les données du visiteur (visitorData)');
      }

      // 2. ÉTAPE 2: Vérifier blacklist pour visiteur existant
      if (!isNewVisitor) {
        const blacklistStatus = await blacklistService.checkVisitorBlacklist(visitor.id);
        
        if (blacklistStatus.isBlacklisted) {
          const blacklistType = blacklistStatus.blacklistType === 'SYSTEM' ? 'SYSTÈME' : 'AGENT';
          const reason = blacklistStatus.blacklistType === 'SYSTEM' 
            ? blacklistStatus.systemBlacklist.reason 
            : blacklistStatus.agentBlacklist.reason;
          
          // 🚨 VISITEUR CONNU MAIS BLACKLISTÉ
          return {
            success: false,
            isBlacklisted: true,
            blacklistType: blacklistType,
            message: `⚠️ ALERTE SÉCURITÉ: Ce visiteur est blacklisté (${blacklistType.toLowerCase()})`,
            blacklistDetails: blacklistStatus,
            visitorInfo: {
              id: visitor.id,
              firstName: visitor.firstName,
              lastName: visitor.lastName,
              company: visitor.company,
              idType: visitor.idType,
              idNumber: visitor.idNumber
            }
          };
        }
      }

      // 3. ÉTAPE 3: Validations avant création de visite
      
      // 3.1 Vérifier que le checkpoint existe
      const checkpoint = await prisma.checkpoint.findUnique({
        where: { id: visitData.checkpointId }
      });

      if (!checkpoint) {
        throw new Error('Checkpoint non trouvé');
      }

      // 3.2 Vérifier que le service existe
      const service = await prisma.service.findUnique({
        where: { id: visitData.serviceId }
      });

      if (!service) {
        throw new Error('Service non trouvé');
      }

      // 3.3 Vérifier les visites de groupe
      if (visitData.isGroup && !visitData.groupCode) {
        throw new Error('Le code de groupe est requis pour une visite de groupe');
      }

      // 3.4 Vérifier s'il y a déjà une visite active
      const activeVisit = await prisma.visit.findFirst({
        where: {
          visitorId: visitor.id,
          exitTime: null
        }
      });

      if (activeVisit) {
        throw new Error('Ce visiteur a déjà une visite en cours');
      }

      // 4. ÉTAPE 4: Créer la visite (tout est OK)
      const { visitorData, ...createData } = visitData;

      const visit = await prisma.visit.create({
        data: {
          ...createData,
          visitorId: visitor.id,
          entryTime: new Date()
        },
        include: {
          visitor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              company: true
            }
          },
          checkpoint: {
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
          service: {
            select: {
              id: true,
              name: true
            }
          },
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      // 5. ÉTAPE 5: Retourner le succès avec toutes les infos
      return {
        success: true,
        isBlacklisted: false,
        message: isNewVisitor 
          ? 'Nouveau visiteur créé et visite enregistrée avec succès' 
          : 'Visite enregistrée avec succès',
        data: {
          visit: visit,
          visitor: {
            id: visitor.id,
            firstName: visitor.firstName,
            lastName: visitor.lastName,
            birthDate: visitor.birthDate,
            birthPlace: visitor.birthPlace,
            sexe: visitor.sexe,
            givingDate: visitor.givingDate,
            expirationDate: visitor.expirationDate,
            phone: visitor.phone,
            idType: visitor.idType,
            idNumber: visitor.idNumber,
            idScanUrl: visitor.idScanUrl,
            photoUrl: visitor.photoUrl,
            isBlacklisted: visitor.isBlacklisted || false,
            blacklistReason: visitor.blacklistReason || '',
            company: visitor.company,
            createdAt: visitor.createdAt,
            updatedAt: visitor.updatedAt
          },
          isNewVisitor: isNewVisitor
        }
      };
    } catch (error) {
      // Si c'est une erreur de blacklist, on la propage
      if (error.message.includes('blacklisté')) {
        throw error;
      }
      throw new Error(`Erreur lors de la création de la visite: ${error.message}`);
    }
  }

  async getAllVisits(page = 1, limit = 10, search = null, visitorId = null, checkpointId = null, serviceId = null, status = 'all') {
    try {
      const skip = (page - 1) * limit;
      
      let whereClause = {};
      
      if (search) {
        whereClause.OR = [
          { reason: { contains: search, mode: 'insensitive' } },
          { personVisited: { contains: search, mode: 'insensitive' } },
          { visitor: { 
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } }
            ]
          }}
        ];
      }

      if (visitorId) {
        whereClause.visitorId = visitorId;
      }

      if (checkpointId) {
        whereClause.checkpointId = checkpointId;
      }

      if (serviceId) {
        whereClause.serviceId = serviceId;
      }

      if (status === 'active') {
        whereClause.exitTime = null;
      } else if (status === 'completed') {
        whereClause.exitTime = { not: null };
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
                company: true
              }
            },
            checkpoint: {
              select: {
                id: true,
                name: true,
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
            service: {
              select: {
                id: true,
                name: true
              }
            },
            creator: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            },
            planned: {
              select: {
                id: true,
                reason: true,
                visitDate: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
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
          pages: Math.ceil(total / limit)
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
              email: true,
              phone: true,
              company: true
            }
          },
          checkpoint: {
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
          service: {
            select: {
              id: true,
              name: true
            }
          },
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          planned: {
            select: {
              id: true,
              reason: true,
              visitDate: true
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

  async checkoutVisit(id, exitTime = null) {
    try {
      const existingVisit = await this.getVisitById(id);
      
      if (existingVisit.exitTime) {
        throw new Error('Cette visite est déjà terminée');
      }

      const updatedVisit = await prisma.visit.update({
        where: { id },
        data: {
          exitTime: exitTime ? new Date(exitTime) : new Date()
        },
        include: {
          visitor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              company: true
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
        }
      });

      return updatedVisit;
    } catch (error) {
      throw new Error(`Erreur lors de la fin de visite: ${error.message}`);
    }
  }

  async deleteVisit(id) {
    try {
      const existingVisit = await this.getVisitById(id);
      
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
      const stats = await prisma.visit.aggregate({
        _count: {
          id: true
        }
      });

      const activeVisits = await prisma.visit.count({
        where: {
          exitTime: null
        }
      });

      const completedVisits = await prisma.visit.count({
        where: {
          exitTime: { not: null }
        }
      });

      const visitsPerService = await prisma.visit.groupBy({
        by: ['serviceId'],
        _count: {
          id: true
        }
      });

      const visitsPerCheckpoint = await prisma.visit.groupBy({
        by: ['checkpointId'],
        _count: {
          id: true
        }
      });

      // Statistiques par jour (7 derniers jours)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentVisits = await prisma.visit.findMany({
        where: {
          createdAt: {
            gte: sevenDaysAgo
          }
        },
        select: {
          createdAt: true
        }
      });

      const visitsByDay = {};
      recentVisits.forEach(visit => {
        const day = visit.createdAt.toISOString().split('T')[0];
        visitsByDay[day] = (visitsByDay[day] || 0) + 1;
      });

      return {
        totalVisits: stats._count.id,
        activeVisits,
        completedVisits,
        visitsPerService,
        visitsPerCheckpoint,
        visitsByDay
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  }

  async getActiveVisits() {
    try {
      const activeVisits = await prisma.visit.findMany({
        where: {
          exitTime: null
        },
        include: {
          visitor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              company: true
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
          startAt: 'desc'
        }
      });

      return activeVisits;
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
}

module.exports = new VisitService();
