const { prisma } = require('../../config/prisma');

class BlacklistService {
  /**
   * Vérifier si un visiteur est blacklisté (système OU agent)
   */
  async checkVisitorBlacklist(visitorId) {
    try {
      const visitor = await prisma.visitor.findUnique({
        where: { id: visitorId },
        include: {
          blacklistHistory: {
            where: {
              action: 'BLACKLIST'
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 1,
            include: {
              creator: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  role: true
                }
              }
            }
          }
        }
      });

      if (!visitor) {
        throw new Error('Visiteur non trouvé');
      }

      const isSystemBlacklisted = visitor.isBlacklisted === true;
      const hasAgentBlacklist = visitor.blacklistHistory.length > 0;

      return {
        visitor: {
          id: visitor.id,
          firstName: visitor.firstName,
          lastName: visitor.lastName,
          phone: visitor.phone,
          email: visitor.email,
          company: visitor.company
        },
        isBlacklisted: isSystemBlacklisted || hasAgentBlacklist,
        blacklistType: isSystemBlacklisted ? 'SYSTEM' : hasAgentBlacklist ? 'AGENT' : 'NONE',
        systemBlacklist: {
          isActive: isSystemBlacklisted,
          reason: visitor.blacklistReason
        },
        agentBlacklist: hasAgentBlacklist ? {
          isActive: true,
          reason: visitor.blacklistHistory[0].reason,
          createdBy: visitor.blacklistHistory[0].creator,
          createdAt: visitor.blacklistHistory[0].createdAt,
          severityLevel: visitor.blacklistHistory[0].severityLevel
        } : {
          isActive: false
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de la vérification de la blacklist: ${error.message}`);
    }
  }

  /**
   * Ajouter un visiteur à la blacklist par un agent
   */
  async addToBlacklistByAgent(visitorId, blacklistData, agentId) {
    try {
      const { reason, severityLevel = 1, incidentDate, incidentLocation } = blacklistData;

      // Vérifier que le visiteur existe
      const visitor = await prisma.visitor.findUnique({
        where: { id: visitorId }
      });

      if (!visitor) {
        throw new Error('Visiteur non trouvé');
      }

      // Vérifier s'il n'y a pas déjà une blacklist agent active
      const existingBlacklist = await prisma.blacklistHistory.findFirst({
        where: {
          visitorId,
          action: 'BLACKLIST'
        }
      });

      if (existingBlacklist) {
        throw new Error('Ce visiteur est déjà blacklisté par un agent');
      }

      // Créer l'entrée de blacklist
      const blacklistEntry = await prisma.blacklistHistory.create({
        data: {
          visitorId,
          firstName: visitor.firstName,
          lastName: visitor.lastName,
          idType: visitor.idType,
          idNumber: visitor.idNumber,
          phone: visitor.phone,
          email: visitor.email,
          action: 'BLACKLIST',
          reason,
          severityLevel,
          incidentDate: incidentDate ? new Date(incidentDate) : null,
          incidentLocation,
          createdBy: agentId
        },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true
            }
          }
        }
      });

      return {
        success: true,
        message: 'Visiteur ajouté à la blacklist avec succès',
        blacklistEntry
      };
    } catch (error) {
      throw new Error(`Erreur lors de l'ajout à la blacklist: ${error.message}`);
    }
  }

  /**
   * Retirer un visiteur de la blacklist agent (seuls les agents peuvent le faire)
   */
  async removeFromBlacklistByAgent(visitorId, reason, agentId) {
    try {
      // Vérifier que le visiteur existe
      const visitor = await prisma.visitor.findUnique({
        where: { id: visitorId }
      });

      if (!visitor) {
        throw new Error('Visiteur non trouvé');
      }

      // Vérifier s'il y a une blacklist agent active
      const existingBlacklist = await prisma.blacklistHistory.findFirst({
        where: {
          visitorId,
          action: 'BLACKLIST'
        }
      });

      if (!existingBlacklist) {
        throw new Error('Ce visiteur n\'est pas blacklisté par un agent');
      }

      // Créer l'entrée de déblocage
      const unblacklistEntry = await prisma.blacklistHistory.create({
        data: {
          visitorId,
          firstName: visitor.firstName,
          lastName: visitor.lastName,
          idType: visitor.idType,
          idNumber: visitor.idNumber,
          phone: visitor.phone,
          email: visitor.email,
          action: 'UNBLACKLIST',
          reason,
          createdBy: agentId
        },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true
            }
          }
        }
      });

      return {
        success: true,
        message: 'Visiteur retiré de la blacklist avec succès',
        unblacklistEntry
      };
    } catch (error) {
      throw new Error(`Erreur lors du retrait de la blacklist: ${error.message}`);
    }
  }

  /**
   * Obtenir l'historique complet des blacklists d'un visiteur
   */
  async getVisitorBlacklistHistory(visitorId) {
    try {
      const visitor = await prisma.visitor.findUnique({
        where: { id: visitorId },
        include: {
          blacklistHistory: {
            orderBy: {
              createdAt: 'desc'
            },
            include: {
              creator: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  role: true
                }
              }
            }
          }
        }
      });

      if (!visitor) {
        throw new Error('Visiteur non trouvé');
      }

      return {
        visitor: {
          id: visitor.id,
          firstName: visitor.firstName,
          lastName: visitor.lastName,
          phone: visitor.phone,
          email: visitor.email,
          company: visitor.company,
          isSystemBlacklisted: visitor.isBlacklisted,
          systemBlacklistReason: visitor.blacklistReason
        },
        history: visitor.blacklistHistory
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de l'historique: ${error.message}`);
    }
  }

  /**
   * Lister tous les visiteurs blacklistés (système + agent)
   */
  async getAllBlacklistedVisitors(page = 1, limit = 10, type = 'ALL') {
    try {
      const skip = (page - 1) * limit;
      let whereClause = {};

      if (type === 'SYSTEM') {
        whereClause.isBlacklisted = true;
      } else if (type === 'AGENT') {
        whereClause.blacklistHistory = {
          some: {
            action: 'BLACKLIST'
          }
        };
      } else {
        // ALL - système OU agent
        whereClause.OR = [
          { isBlacklisted: true },
          {
            blacklistHistory: {
              some: {
                action: 'BLACKLIST'
              }
            }
          }
        ];
      }

      const [visitors, total] = await Promise.all([
        prisma.visitor.findMany({
          where: whereClause,
          skip,
          take: limit,
          include: {
            blacklistHistory: {
              where: {
                action: 'BLACKLIST'
              },
              orderBy: {
                createdAt: 'desc'
              },
              take: 1,
              include: {
                creator: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    role: true
                  }
                }
              }
            }
          },
          orderBy: {
            updatedAt: 'desc'
          }
        }),
        prisma.visitor.count({ where: whereClause })
      ]);

      const formattedVisitors = visitors.map(visitor => ({
        id: visitor.id,
        firstName: visitor.firstName,
        lastName: visitor.lastName,
        phone: visitor.phone,
        email: visitor.email,
        company: visitor.company,
        blacklistType: visitor.isBlacklisted ? 'SYSTEM' : 'AGENT',
        systemBlacklist: {
          isActive: visitor.isBlacklisted,
          reason: visitor.blacklistReason
        },
        agentBlacklist: visitor.blacklistHistory.length > 0 ? {
          isActive: true,
          reason: visitor.blacklistHistory[0].reason,
          createdBy: visitor.blacklistHistory[0].creator,
          createdAt: visitor.blacklistHistory[0].createdAt,
          severityLevel: visitor.blacklistHistory[0].severityLevel
        } : {
          isActive: false
        }
      }));

      return {
        visitors: formattedVisitors,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des visiteurs blacklistés: ${error.message}`);
    }
  }
}

module.exports = new BlacklistService();
