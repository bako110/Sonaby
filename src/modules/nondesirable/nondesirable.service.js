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

createUnknownNonDesirable = async (nonDesirableData, reportedBy) => {
  try {
    const {
      firstName, lastName, idType, idNumber, birthDate, birthPlace, sexe,
      givingDate, expirationDate, phone, email, company, nationality,
      idScanUrl, photoUrl, reason, incidentDate, incidentLocation, severityLevel,
      attachedFileUrl, attachedFileName, attachedFileType, attachedFileSize
    } = nonDesirableData;

    // Fonction pour parser les dates (DD/MM/YYYY ou YYYY-MM-DD)
    const parseDate = (dateString) => {
      if (!dateString) return null;
      if (dateString.includes('/')) {
        const [day, month, year] = dateString.split('/');
        return new Date(year, month - 1, day);
      }
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    };

    // Construire le fullReason JSON
    const fullReason = {
      mainReason: reason,
      personalInfo: { firstName, lastName, birthDate, birthPlace, sexe, nationality },
      identification: { idType, idNumber, idScanUrl, givingDate, expirationDate },
      contact: { phone, email, company },
      incident: { incidentDate, incidentLocation, severityLevel },
      photos: { photoUrl }
    };

    // Transaction pour créer NonDesirable et BlacklistHistory en même temps
    const result = await prisma.$transaction(async (tx) => {
      // 1️⃣ Créer l'entrée NonDesirable
      const nonDesirableEntry = await tx.nonDesirable.create({
        data: {
          visitorId: null,
          reason: JSON.stringify(fullReason),
          reportedBy,
          firstName: firstName || "Inconnu",
          lastName: lastName || "Inconnu",
          birthDate: parseDate(birthDate),
          birthPlace: birthPlace || "",
          sexe: sexe || "",
          nationality: nationality || "",
          phone: phone || "",
          email: email || "",
          company: company || "",
          idType: idType || "",
          idNumber: idNumber || "",
          idScanUrl: idScanUrl || "",
          photoUrl: photoUrl || "",
          givingDate: parseDate(givingDate),
          expirationDate: parseDate(expirationDate),
          incidentDate: parseDate(incidentDate),
          incidentLocation: incidentLocation || "",
          severityLevel: severityLevel || 2,
          attachedFileUrl: attachedFileUrl || "",
          attachedFileName: attachedFileName || "",
          attachedFileType: attachedFileType || "",
          attachedFileSize: attachedFileSize || 0,
          createdBy: reportedBy || "system"
        }
      });

      // 2️⃣ Créer l'historique dans BlacklistHistory
      await tx.blacklistHistory.create({
        data: {
          visitorId: null, // Pas de Visitor lié
          firstName: nonDesirableEntry.firstName,
          lastName: nonDesirableEntry.lastName,
          idType: nonDesirableEntry.idType,
          idNumber: nonDesirableEntry.idNumber,
          phone: nonDesirableEntry.phone,
          email: nonDesirableEntry.email,
          nationality: nonDesirableEntry.nationality,
          birthDate: nonDesirableEntry.birthDate,
          birthPlace: nonDesirableEntry.birthPlace,
          action: 'BLACKLIST',
          reason: reason,
          severityLevel: nonDesirableEntry.severityLevel,
          incidentDate: nonDesirableEntry.incidentDate,
          incidentLocation: nonDesirableEntry.incidentLocation,
          createdBy: reportedBy,
          // Champ optionnel pour relier le NonDesirable à l'historique
          nonDesirableId: nonDesirableEntry.id
        }
      });

      return nonDesirableEntry;
    });

    // Retourner les données pour le frontend
    return {
      id: result.id,
      type: 'unknown',
      visitorId: null,
      reason,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      firstName: result.firstName,
      lastName: result.lastName,
      birthDate: result.birthDate,
      birthPlace: result.birthPlace,
      sexe: result.sexe,
      nationality: result.nationality,
      phone: result.phone,
      email: result.email,
      company: result.company,
      idType: result.idType,
      idNumber: result.idNumber,
      idScanUrl: result.idScanUrl,
      givingDate: result.givingDate,
      expirationDate: result.expirationDate,
      photoUrl: result.photoUrl,
      isBlacklisted: true,
      blacklistReason: reason,
      severityLevel: result.severityLevel,
      incidentDate: result.incidentDate,
      incidentLocation: result.incidentLocation,
      reporter: { id: reportedBy }
    };
  } catch (error) {
    throw new Error(`Erreur lors de la création de l'indésirable inconnu: ${error.message}`);
  }
};


 async removeNonDesirable(visitorId, removedBy, reason) {
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
      // 1️⃣ Mettre à jour le visiteur : désactiver isBlacklisted et supprimer la raison
      await tx.visitor.update({
        where: { id: visitorId },
        data: {
          isBlacklisted: false,
          blacklistReason: null
        }
      });

      // 2️⃣ Créer l'historique dans BlacklistHistory avec la raison fournie
      await tx.blacklistHistory.create({
        data: {
          visitorId: visitorId,
          action: 'UNBLACKLIST',
          reason: reason,       // Utilise la raison envoyée par le frontend
          severityLevel: 1,     // Niveau faible par défaut
          createdBy: removedBy
        }
      });

      // 3️⃣ Supprimer l'entrée NonDesirable
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

  async getAllNonDesirablesKnown(page = 1, limit = 10, search = null) {
  const skip = (page - 1) * limit;

  return await prisma.nonDesirable.findMany({
    where: { visitorId: { not: null } },
    skip,
    take: limit,
    include: {
      visitor: true,
      reporter: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

async getAllNonDesirablesUnknown(page = 1, limit = 10, search = null) {
  const skip = (page - 1) * limit;

  const list = await prisma.nonDesirable.findMany({
    where: { visitorId: null },
    skip,
    take: limit,
    include: { reporter: true },
    orderBy: { createdAt: "desc" },
  });

  return list.map((item) => {
    try {
      const data = JSON.parse(item.reason);

      return {
        id: item.id,
        ...data.personalInfo,
        ...data.contact,
        ...data.identification,
        incidentDate: data.incident?.incidentDate,
        incidentLocation: data.incident?.incidentLocation,
        severityLevel: data.incident?.severityLevel,
        reporter: item.reporter,
      };
    } catch (e) {
      return item;
    }
  });
}


async  getVisitorBlacklistHistory(visitorId) {
  const visitor = await prisma.visitor.findUnique({
    where: { id: visitorId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      isBlacklisted: true,
      blacklistHistory: {
        orderBy: { createdAt: "desc" }, // historique du plus récent au plus ancien
        select: {
          id: true,
          action: true,       // "blacklist" ou "deblacklist"
          reason: true,
          severityLevel: true,
          incidentDate: true,
          incidentLocation: true,
          createdAt: true,
          createdBy: true,
        },
      },
    },
  });

  return visitor;
}


 async removeUnknown(id, reason, reportedBy) {
  console.log('=== REMOVE UNKNOWN SERVICE START ===');
  console.log('Identifiant reçu :', id);
  console.log('Raison :', reason);
  console.log('Reported by :', reportedBy);

  try {
    // 1️⃣ Vérifier si l'indésirable existe
    const entry = await prisma.nonDesirable.findUnique({
      where: { id },
      select: { id: true, firstName: true, lastName: true }
    });

    if (!entry) {
      console.log('Indésirable non trouvé pour id :', id);
      return { message: "Indésirable inconnu non trouvé.", count: 0 };
    }

    console.log('Indésirable trouvé :', entry);

    // 2️⃣ Ajouter une entrée dans BlacklistHistory
    const history = await prisma.blacklistHistory.create({
      data: {
        nonDesirableId: entry.id,
        firstName: entry.firstName,
        lastName: entry.lastName,
        action: "UNBLACKLIST",
        reason: reason || "Suppression automatique",
        severityLevel: 1,
        createdBy: reportedBy || "system"
      }
    });

    console.log('Historique créé :', history);

    // 3️⃣ Supprimer l'indésirable
    await prisma.nonDesirable.delete({ where: { id: entry.id } });
    console.log('Indésirable supprimé avec succès :', entry.id);

    console.log('=== REMOVE UNKNOWN SERVICE FINISH ===');
    return {
      message: `Indésirable supprimé avec succès: ${entry.firstName || ""} ${entry.lastName || ""}`,
      count: 1
    };

  } catch (error) {
    console.error('Erreur dans removeUnknown :', error);
    throw new Error(`Erreur lors de la suppression de l'indésirable inconnu : ${error.message}`);
  }
}

}



module.exports = new NonDesirableService();
