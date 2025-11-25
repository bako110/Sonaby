const { prisma } = require('../../config/prisma');

class NonDesirableService {
  async createNonDesirable(nonDesirableData, reportedBy) {
    try {
      const { visitorId, reason } = nonDesirableData;
      
      // Vérifier que reportedBy est fourni
      if (!reportedBy) {
        throw new Error('Utilisateur non authentifié');
      }
      
      // Vérifier que le visiteur existe
      const visitor = await prisma.visitor.findUnique({
        where: { id: visitorId }
      });

      if (!visitor) {
        throw new Error('Visiteur non trouvé');
      }

      // Vérifier s'il n'est pas déjà marqué comme indésirable
      const existing = await prisma.nonDesirable.findFirst({
        where: { visitorId }
      });

      if (existing) {
        throw new Error('Ce visiteur est déjà marqué comme indésirable');
      }

      // Transaction pour tout faire en une fois
      const result = await prisma.$transaction(async (tx) => {
        // 1. Mettre à jour le visiteur : activer isBlacklisted et ajouter la raison
        await tx.visitor.update({
          where: { id: visitorId },
          data: {
            isBlacklisted: true,
            blacklistReason: reason
          }
        });

        // 2. Créer l'historique dans BlacklistHistory
        await tx.blacklistHistory.create({
          data: {
            visitorId: visitorId,
            action: 'added',
            reason: reason,
            severityLevel: 2, // Niveau moyen par défaut
            createdBy: reportedBy
          }
        });

        // 3. Créer l'entrée dans NonDesirable
        const nonDesirable = await tx.nonDesirable.create({
          data: {
            visitorId,
            reason,
            reportedBy
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
                idType: true,
                idNumber: true,
                isBlacklisted: true,
                blacklistReason: true
              }
            },
            reporter: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        });

        return nonDesirable;
      });

      return result;
    } catch (error) {
      throw new Error(`Erreur lors de la création de l'entrée indésirable: ${error.message}`);
    }
  }

  async getAllNonDesirables(page = 1, limit = 10, search = null) {
    try {
      const skip = (page - 1) * limit;
      
      // Récupérer tous les nonDesirables avec leurs relations
      const nonDesirables = await prisma.nonDesirable.findMany({
        skip,
        take: limit,
        include: {
          visitor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              birthDate: true,
              birthPlace: true,
              sexe: true,
              givingDate: true,
              expirationDate: true,
              phone: true,
              email: true,
              company: true,
              idType: true,
              idNumber: true,
              idScanUrl: true,
              photoUrl: true,
              isBlacklisted: true,
              blacklistReason: true,
              createdAt: true
            }
          },
          reporter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Pour chaque nonDesirable, récupérer les infos complètes
      const enrichedNonDesirables = await Promise.all(
        nonDesirables.map(async (nd) => {
          // Si c'est un visiteur existant, retourner les données du visiteur
          if (nd.visitor) {
            return {
              id: nd.id,
              type: 'visitor', // Visiteur existant
              visitorId: nd.visitorId,
              reason: nd.reason,
              createdAt: nd.createdAt,
              updatedAt: nd.updatedAt,
              // Informations complètes du visiteur
              firstName: nd.visitor.firstName,
              lastName: nd.visitor.lastName,
              birthDate: nd.visitor.birthDate,
              birthPlace: nd.visitor.birthPlace,
              sexe: nd.visitor.sexe,
              givingDate: nd.visitor.givingDate,
              expirationDate: nd.visitor.expirationDate,
              phone: nd.visitor.phone,
              email: nd.visitor.email,
              company: nd.visitor.company,
              idType: nd.visitor.idType,
              idNumber: nd.visitor.idNumber,
              idScanUrl: nd.visitor.idScanUrl,
              photoUrl: nd.visitor.photoUrl,
              isBlacklisted: nd.visitor.isBlacklisted,
              blacklistReason: nd.visitor.blacklistReason,
              reporter: nd.reporter
            };
          } else {
            // Si c'est un indésirable inconnu, récupérer depuis blacklist_history
            const blacklistEntry = await prisma.blacklistHistory.findFirst({
              where: {
                visitorId: null,
                action: 'added',
                createdBy: nd.reportedBy,
                reason: nd.reason,
                createdAt: {
                  gte: new Date(nd.createdAt.getTime() - 5000), // 5 secondes de tolérance
                  lte: new Date(nd.createdAt.getTime() + 5000)
                }
              },
              include: {
                creator: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true
                  }
                }
              }
            });

            if (blacklistEntry) {
              return {
                id: nd.id,
                type: 'unknown', // Indésirable inconnu
                visitorId: null,
                reason: nd.reason,
                createdAt: nd.createdAt,
                updatedAt: nd.updatedAt,
                // Informations de l'indésirable inconnu depuis blacklist_history
                firstName: blacklistEntry.firstName,
                lastName: blacklistEntry.lastName,
                birthDate: blacklistEntry.birthDate,
                birthPlace: blacklistEntry.birthPlace,
                phone: blacklistEntry.phone,
                email: blacklistEntry.email,
                nationality: blacklistEntry.nationality,
                idType: blacklistEntry.idType,
                idNumber: blacklistEntry.idNumber,
                severityLevel: blacklistEntry.severityLevel,
                incidentDate: blacklistEntry.incidentDate,
                incidentLocation: blacklistEntry.incidentLocation,
                isBlacklisted: true, // Toujours true pour un indésirable
                blacklistReason: blacklistEntry.reason,
                reporter: blacklistEntry.creator
              };
            } else {
              // Fallback si pas trouvé dans blacklist_history
              return {
                id: nd.id,
                type: 'unknown',
                visitorId: null,
                reason: nd.reason,
                createdAt: nd.createdAt,
                updatedAt: nd.updatedAt,
                firstName: 'Inconnu',
                lastName: 'Inconnu',
                isBlacklisted: true,
                blacklistReason: nd.reason,
                reporter: nd.reporter
              };
            }
          }
        })
      );

      // Filtrer par recherche si nécessaire
      let filteredResults = enrichedNonDesirables;
      if (search) {
        const searchLower = search.toLowerCase();
        filteredResults = enrichedNonDesirables.filter(item => 
          item.firstName?.toLowerCase().includes(searchLower) ||
          item.lastName?.toLowerCase().includes(searchLower) ||
          item.company?.toLowerCase().includes(searchLower) ||
          item.reason?.toLowerCase().includes(searchLower) ||
          item.idNumber?.toLowerCase().includes(searchLower)
        );
      }

      const total = await prisma.nonDesirable.count();

      return {
        nonDesirables: filteredResults,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des indésirables: ${error.message}`);
    }
  }

  async removeNonDesirable(visitorId, removedBy) {
    try {
      // Vérifier que le visiteur existe et est bien blacklisté
      const visitor = await prisma.visitor.findUnique({
        where: { id: visitorId }
      });

      if (!visitor) {
        throw new Error('Visiteur non trouvé');
      }

      if (!visitor.isBlacklisted) {
        throw new Error('Ce visiteur n\'est pas blacklisté');
      }

      // Transaction pour tout faire en une fois
      const result = await prisma.$transaction(async (tx) => {
        // 1. Mettre à jour le visiteur : désactiver isBlacklisted et supprimer la raison
        await tx.visitor.update({
          where: { id: visitorId },
          data: {
            isBlacklisted: false,
            blacklistReason: null
          }
        });

        // 2. Créer l'historique de déblacklistage
        await tx.blacklistHistory.create({
          data: {
            visitorId: visitorId,
            action: 'removed',
            reason: 'Retiré de la liste des indésirables',
            severityLevel: 1,
            createdBy: removedBy
          }
        });

        // 3. Supprimer l'entrée NonDesirable
        const deleted = await tx.nonDesirable.deleteMany({
          where: { visitorId }
        });

        return { success: true, deletedCount: deleted.count };
      });

      return result;
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de l'indésirable: ${error.message}`);
    }
  }

  async createUnknownNonDesirable(nonDesirableData, reportedBy) {
    try {
      // Vérifier que reportedBy est fourni
      if (!reportedBy) {
        throw new Error('Utilisateur non authentifié');
      }

      const {
        firstName, lastName, idType, idNumber, birthDate, birthPlace, sexe,
        givingDate, expirationDate, phone, email, company, nationality,
        idScanUrl, photoUrl, reason, incidentDate, incidentLocation, severityLevel
      } = nonDesirableData;

      // Vérifier si un indésirable avec ces identifiants existe déjà
      const existing = await prisma.blacklistHistory.findFirst({
        where: {
          idType: idType,
          idNumber: idNumber,
          action: 'added'
        }
      });

      if (existing) {
        throw new Error('Une personne avec ces identifiants est déjà dans la liste des indésirables');
      }

      // Fonction pour parser les dates en format DD/MM/YYYY ou YYYY-MM-DD
      const parseDate = (dateString) => {
        if (!dateString) return null;
        
        // Format DD/MM/YYYY
        if (dateString.includes('/')) {
          const [day, month, year] = dateString.split('/');
          return new Date(year, month - 1, day); // month - 1 car les mois commencent à 0
        }
        
        // Format YYYY-MM-DD ou autres formats standards
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? null : date;
      };

      // Transaction pour créer dans les deux tables
      const result = await prisma.$transaction(async (tx) => {
        // 1. Créer l'entrée dans BlacklistHistory (sans visiteur)
        const blacklistEntry = await tx.blacklistHistory.create({
          data: {
            // Pas de visitorId car c'est un inconnu
            firstName,
            lastName,
            idType,
            idNumber,
            phone,
            email,
            nationality,
            birthDate: parseDate(birthDate),
            birthPlace,
            action: 'added',
            reason,
            severityLevel: severityLevel || 2,
            incidentDate: parseDate(incidentDate),
            incidentLocation,
            createdBy: reportedBy
          },
          include: {
            creator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        });

        // 2. Créer aussi l'entrée dans NonDesirable (même si pas de visiteur)
        const nonDesirableEntry = await tx.nonDesirable.create({
          data: {
            // Pas de visitorId car c'est un inconnu - on utilise NULL
            visitorId: null,
            reason,
            reportedBy
          }
        });

        return { blacklistEntry, nonDesirableEntry };
      });

      const { blacklistEntry } = result;

      // Fonction pour formater les dates au format DD/MM/YYYY
      const formatDate = (date) => {
        if (!date) return null;
        const d = new Date(date);
        if (isNaN(d.getTime())) return null;
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
      };

      return {
        id: blacklistEntry.id,
        firstName: blacklistEntry.firstName,
        lastName: blacklistEntry.lastName,
        birthDate: formatDate(blacklistEntry.birthDate) || birthDate,
        birthPlace: blacklistEntry.birthPlace,
        sexe: sexe || null,
        givingDate: givingDate || null,
        expirationDate: expirationDate || null,
        phone: blacklistEntry.phone,
        idType: blacklistEntry.idType,
        idNumber: blacklistEntry.idNumber,
        idScanUrl: idScanUrl || null,
        photoUrl: photoUrl || null,
        isBlacklisted: true, // Toujours true pour un indésirable
        blacklistReason: blacklistEntry.reason,
        company: company || null,
        email: blacklistEntry.email,
        nationality: blacklistEntry.nationality,
        reason: blacklistEntry.reason,
        severityLevel: blacklistEntry.severityLevel,
        incidentDate: formatDate(blacklistEntry.incidentDate) || incidentDate,
        incidentLocation: blacklistEntry.incidentLocation,
        createdAt: blacklistEntry.createdAt,
        updatedAt: blacklistEntry.updatedAt,
        reporter: blacklistEntry.creator
      };
    } catch (error) {
      throw new Error(`Erreur lors de la création de l'indésirable inconnu: ${error.message}`);
    }
  }

  async deleteNonDesirable(id) {
    try {
      const existing = await prisma.nonDesirable.findUnique({
        where: { id },
        include: {
          visitor: {
            select: {
              id: true,
              firstname: true,
              lastname: true
            }
          }
        }
      });

      if (!existing) {
        throw new Error('Entrée indésirable non trouvée');
      }
      
      await prisma.nonDesirable.delete({
        where: { id }
      });

      return { 
        message: 'Entrée indésirable supprimée avec succès',
        visitor: existing.visitor
      };
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de l'entrée indésirable: ${error.message}`);
    }
  }
}

module.exports = new NonDesirableService();
