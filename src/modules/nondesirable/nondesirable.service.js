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
            action: 'BLACKLIST',
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
      
      const nonDesirables = await prisma.nonDesirable.findMany({
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
              isBlacklisted: true,
              blacklistReason: true,
              photoUrl: true
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

      // Enrichir les données pour le format de réponse attendu
      const enrichedNonDesirables = nonDesirables.map(nd => {
        if (nd.visitor) {
          // Si c'est un visiteur connu
          return {
            id: nd.id,
            type: 'visitor',
            visitorId: nd.visitor.id,
            reason: nd.reason,
            createdAt: nd.createdAt,
            updatedAt: nd.updatedAt,
            // Informations du visiteur
            firstName: nd.visitor.firstname,
            lastName: nd.visitor.lastname,
            phone: nd.visitor.phone,
            email: nd.visitor.email,
            company: nd.visitor.company,
            isBlacklisted: nd.visitor.isBlacklisted,
            blacklistReason: nd.visitor.blacklistReason,
            photoUrl: nd.visitor.photoUrl,
            reporter: nd.reporter
          };
        } else {
          // Si c'est un indésirable inconnu (avec JSON dans reason)
          try {
            const reasonData = JSON.parse(nd.reason);
            return {
              id: nd.id,
              type: 'unknown',
              visitorId: null,
              reason: reasonData.mainReason,
              createdAt: nd.createdAt,
              updatedAt: nd.updatedAt,
              // Informations de l'indésirable inconnu
              firstName: reasonData.personalInfo?.firstName,
              lastName: reasonData.personalInfo?.lastName,
              birthDate: reasonData.personalInfo?.birthDate,
              birthPlace: reasonData.personalInfo?.birthPlace,
              sexe: reasonData.personalInfo?.sexe,
              nationality: reasonData.personalInfo?.nationality,
              phone: reasonData.contact?.phone,
              email: reasonData.contact?.email,
              company: reasonData.contact?.company,
              idType: reasonData.identification?.idType,
              idNumber: reasonData.identification?.idNumber,
              idScanUrl: reasonData.identification?.idScanUrl,
              givingDate: reasonData.identification?.givingDate,
              expirationDate: reasonData.identification?.expirationDate,
              photoUrl: reasonData.photos?.photoUrl,
              isBlacklisted: true,
              blacklistReason: reasonData.mainReason,
              severityLevel: reasonData.incident?.severityLevel,
              incidentDate: reasonData.incident?.incidentDate,
              incidentLocation: reasonData.incident?.incidentLocation,
              reporter: nd.reporter
            };
          } catch (e) {
            // Fallback si le JSON est invalide
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
      });

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

  async createUnknownNonDesirable(nonDesirableData, reportedBy) {
    try {
      const {
        firstName, lastName, idType, idNumber, birthDate, birthPlace, sexe,
        givingDate, expirationDate, phone, email, company, nationality,
        idScanUrl, photoUrl, reason, incidentDate, incidentLocation, severityLevel
      } = nonDesirableData;

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

      // Construire un reason structuré avec toutes les informations
      const fullReason = {
        mainReason: reason,
        personalInfo: {
          firstName,
          lastName,
          birthDate,
          birthPlace,
          sexe,
          nationality
        },
        identification: {
          idType,
          idNumber,
          idScanUrl,
          givingDate,
          expirationDate
        },
        contact: {
          phone,
          email,
          company
        },
        incident: {
          incidentDate,
          incidentLocation,
          severityLevel
        },
        photos: {
          photoUrl
        }
      };

      // Créer directement dans NonDesirable (plus simple, pas de contraintes)
      const nonDesirableEntry = await prisma.nonDesirable.create({
        data: {
          // Pas de visitorId car c'est un inconnu - on utilise NULL
          visitorId: null,
          reason: JSON.stringify(fullReason),
          reportedBy
        }
      });

      // Retourner les données formatées pour le frontend
      return {
        id: nonDesirableEntry.id,
        type: 'unknown',
        visitorId: null,
        reason: reason,
        createdAt: nonDesirableEntry.createdAt,
        updatedAt: nonDesirableEntry.updatedAt,
        firstName,
        lastName,
        birthDate,
        birthPlace,
        sexe,
        nationality,
        phone,
        email,
        company,
        idType,
        idNumber,
        idScanUrl,
        givingDate,
        expirationDate,
        photoUrl,
        isBlacklisted: true,
        blacklistReason: reason,
        severityLevel: severityLevel || 2,
        incidentDate,
        incidentLocation,
        reporter: {
          id: reportedBy,
          // Note: Vous pourriez vouloir récupérer les infos complètes du reporter ici
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de la création de l'indésirable inconnu: ${error.message}`);
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

        // 2. Supprimer l'entrée NonDesirable
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
