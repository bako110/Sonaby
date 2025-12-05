const { prisma } = require('../../config/prisma');
 // En haut du fichier, importez le service d'upload
const uploadService = require('../upload'); // Adaptez le chemin

class NonDesirableService {
  // 1️⃣ Création d'un "indésirable" connu
  async createNonDesirable(nonDesirableData, reportedBy) {
    try {
      const { visitorId, reason } = nonDesirableData;
      if (!reportedBy) {
        throw new Error('Utilisateur non authentifié');
      }

      const visitor = await prisma.visitor.findUnique({
        where: { id: visitorId }
      });
      if (!visitor) {
        throw new Error('Visiteur non trouvé');
      }

      const existing = await prisma.nonDesirable.findFirst({
        where: { visitorId }
      });
      if (existing) {
        throw new Error('Ce visiteur est déjà marqué comme indésirable');
      }

      const result = await prisma.$transaction(async (tx) => {
        await tx.visitor.update({
          where: { id: visitorId },
          data: {
            isBlacklisted: true,
            blacklistReason: reason
          }
        });

        await tx.blacklistHistory.create({
          data: {
            visitorId: visitorId,
            action: 'BLACKLIST',
            reason: reason,
            severityLevel: 2,
            createdBy: reportedBy
          }
        });

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

      return {
        success: true,
        data: result
      };
    } catch (error) {
      throw new Error(`Erreur lors de la création de l'entrée indésirable: ${error.message}`);
    }
  }

  // 2️⃣ Récupération de tous les "indésirables" (avec pagination et recherche)
  async getAllNonDesirables(page = 1, limit = 10, search = null) {
    try {
      const skip = (page - 1) * limit;

      // 1️⃣ Récupérer les données paginées
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

      // 2️⃣ Enrichir les données
      const enrichedNonDesirables = nonDesirables.map(nd => {
        if (nd.visitor) {
          return {
            id: nd.id,
            type: 'visitor',
            visitorId: nd.visitor.id,
            reason: nd.reason,
            createdAt: nd.createdAt,
            updatedAt: nd.updatedAt,
            firstName: nd.visitor.firstName || "Inconnu",
            lastName: nd.visitor.lastName || "Inconnu",
            phone: nd.visitor.phone || null,
            email: nd.visitor.email || null,
            company: nd.visitor.company || null,
            isBlacklisted: nd.visitor.isBlacklisted,
            blacklistReason: nd.visitor.blacklistReason,
            photoUrl: nd.visitor.photoUrl || null,
            reporter: nd.reporter || null
          };
        } else {
          try {
            const reasonData = typeof nd.reason === 'string' ? JSON.parse(nd.reason) : {};
            return {
              id: nd.id,
              type: 'unknown',
              visitorId: null,
              reason: reasonData.mainReason || nd.reason,
              createdAt: nd.createdAt,
              updatedAt: nd.updatedAt,
              firstName: reasonData.personalInfo?.firstName || "Inconnu",
              lastName: reasonData.personalInfo?.lastName || "Inconnu",
              birthDate: reasonData.personalInfo?.birthDate || null,
              birthPlace: reasonData.personalInfo?.birthPlace || null,
              sexe: reasonData.personalInfo?.sexe || null,
              nationality: reasonData.personalInfo?.nationality || null,
              phone: reasonData.contact?.phone || null,
              email: reasonData.contact?.email || null,
              company: reasonData.contact?.company || null,
              idType: reasonData.identification?.idType || null,
              idNumber: reasonData.identification?.idNumber || null,
              idScanUrl: reasonData.identification?.idScanUrl || null,
              givingDate: reasonData.identification?.givingDate || null,
              expirationDate: reasonData.identification?.expirationDate || null,
              photoUrl: reasonData.photos?.photoUrl || null,
              isBlacklisted: true,
              blacklistReason: reasonData.mainReason || nd.reason,
              severityLevel: reasonData.incident?.severityLevel || null,
              incidentDate: reasonData.incident?.incidentDate || null,
              incidentLocation: reasonData.incident?.incidentLocation || null,
              reporter: nd.reporter || null
            };
          } catch (e) {
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
              reporter: nd.reporter || null
            };
          }
        }
      });

      // 3️⃣ Filtrer par recherche si nécessaire
      let filteredResults = enrichedNonDesirables;
      if (search) {
        const searchLower = search.toLowerCase();
        filteredResults = enrichedNonDesirables.filter(item =>
          (item.firstName?.toLowerCase() || "").includes(searchLower) ||
          (item.lastName?.toLowerCase() || "").includes(searchLower) ||
          (item.company?.toLowerCase() || "").includes(searchLower) ||
          (item.reason?.toLowerCase() || "").includes(searchLower) ||
          (item.idNumber?.toLowerCase() || "").includes(searchLower)
        );
      }

      // 4️⃣ Calculer le total en tenant compte du filtre
      let total;
      if (search) {
        const allNonDesirables = await prisma.nonDesirable.findMany({
          include: {
            visitor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                company: true,
                blacklistReason: true,
                idNumber: true
              }
            },
            reporter: true
          }
        });

        const allEnriched = allNonDesirables.map(nd => {
          if (nd.visitor) {
            return {
              firstName: nd.visitor.firstName || "Inconnu",
              lastName: nd.visitor.lastName || "Inconnu",
              company: nd.visitor.company || null,
              reason: nd.reason,
              idNumber: nd.visitor.idNumber || null
            };
          } else {
            try {
              const reasonData = typeof nd.reason === 'string' ? JSON.parse(nd.reason) : {};
              return {
                firstName: reasonData.personalInfo?.firstName || "Inconnu",
                lastName: reasonData.personalInfo?.lastName || "Inconnu",
                company: reasonData.contact?.company || null,
                reason: reasonData.mainReason || nd.reason,
                idNumber: reasonData.identification?.idNumber || null
              };
            } catch (e) {
              return {
                firstName: 'Inconnu',
                lastName: 'Inconnu',
                company: null,
                reason: nd.reason,
                idNumber: null
              };
            }
          }
        });

        const allFiltered = allEnriched.filter(item =>
          (item.firstName?.toLowerCase() || "").includes(searchLower) ||
          (item.lastName?.toLowerCase() || "").includes(searchLower) ||
          (item.company?.toLowerCase() || "").includes(searchLower) ||
          (item.reason?.toLowerCase() || "").includes(searchLower) ||
          (item.idNumber?.toLowerCase() || "").includes(searchLower)
        );

        total = allFiltered.length;
      } else {
        total = await prisma.nonDesirable.count();
      }

      // 5️⃣ Retourner la réponse avec la pagination correcte
      return {
        success: true,
        data: filteredResults,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des indésirables: ${error.message}`);
    }
  }

  // 3️⃣ Récupération des "indésirables connus" (avec pagination et recherche)
  async getAllNonDesirablesKnown(page = 1, limit = 10, search = null) {
    try {
      const skip = (page - 1) * limit;
      const whereClause = {
        visitorId: { not: null }
      };

      if (search) {
        whereClause.OR = [
          { visitor: { firstName: { contains: search, mode: 'insensitive' } } },
          { visitor: { lastName: { contains: search, mode: 'insensitive' } } },
          { visitor: { company: { contains: search, mode: 'insensitive' } } },
          { reason: { contains: search, mode: 'insensitive' } },
          { visitor: { idNumber: { contains: search, mode: 'insensitive' } } }
        ];
      }

      const [list, total] = await Promise.all([
        prisma.nonDesirable.findMany({
          where: whereClause,
          skip,
          take: limit,
          include: {
            visitor: true,
            reporter: true,
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.nonDesirable.count({ where: whereClause })
      ]);

      return {
        success: true,
        data: list,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des indésirables connus: ${error.message}`);
    }
  }

  // 4️⃣ Récupération des "indésirables inconnus" (avec pagination et recherche)
  async getAllNonDesirablesUnknown(page = 1, limit = 10, search = null) {
    try {
      const skip = (page - 1) * limit;
      let whereClause = { visitorId: null };

      // 1️⃣ Filtrer par recherche si nécessaire
      if (search) {
        const allUnknown = await prisma.nonDesirable.findMany({
          where: { visitorId: null }
        });

        const searchLower = search.toLowerCase();
        const filteredIds = allUnknown.filter(item => {
          try {
            const reasonData = typeof item.reason === 'string' ? JSON.parse(item.reason) : {};
            return (
              (reasonData.personalInfo?.firstName?.toLowerCase() || "").includes(searchLower) ||
              (reasonData.personalInfo?.lastName?.toLowerCase() || "").includes(searchLower) ||
              (reasonData.contact?.company?.toLowerCase() || "").includes(searchLower) ||
              (reasonData.mainReason?.toLowerCase() || "").includes(searchLower) ||
              (reasonData.identification?.idNumber?.toLowerCase() || "").includes(searchLower)
            );
          } catch (e) {
            return false;
          }
        }).map(item => item.id);

        if (filteredIds.length > 0) {
          whereClause.id = { in: filteredIds };
        } else {
          return {
            success: true,
            data: [],
            pagination: {
              page: Number(page),
              limit: Number(limit),
              total: 0,
              pages: 0
            }
          };
        }
      }

      // 2️⃣ Récupérer les données paginées et le total
      const [list, total] = await Promise.all([
        prisma.nonDesirable.findMany({
          where: whereClause,
          skip,
          take: limit,
          include: { reporter: true },
          orderBy: { createdAt: "desc" },
        }),
        prisma.nonDesirable.count({ where: whereClause })
      ]);

      // 3️⃣ Enrichir les données en toute sécurité
      const enrichedList = list.map((item) => {
        try {
          const reasonData = typeof item.reason === 'string' ? JSON.parse(item.reason) : {};
          const personalInfo = reasonData.personalInfo || {};
          const contact = reasonData.contact || {};
          const identification = reasonData.identification || {};
          const incident = reasonData.incident || {};
          const photos = reasonData.photos || {};

          return {
            id: item.id,
            type: 'unknown',
            visitorId: null,
            reason: reasonData.mainReason || item.reason,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            firstName: personalInfo.firstName || "Inconnu",
            lastName: personalInfo.lastName || "Inconnu",
            birthDate: personalInfo.birthDate || null,
            birthPlace: personalInfo.birthPlace || null,
            sexe: personalInfo.sexe || null,
            nationality: personalInfo.nationality || null,
            phone: contact.phone || null,
            email: contact.email || null,
            company: contact.company || null,
            idType: identification.idType || null,
            idNumber: identification.idNumber || null,
            idScanUrl: identification.idScanUrl || null,
            givingDate: identification.givingDate || null,
            expirationDate: identification.expirationDate || null,
            photoUrl: photos.photoUrl || null,
            isBlacklisted: true,
            blacklistReason: reasonData.mainReason || item.reason,
            severityLevel: incident.severityLevel || null,
            incidentDate: incident.incidentDate || null,
            incidentLocation: incident.incidentLocation || null,
            reporter: item.reporter || null,
          };
        } catch (e) {
          return {
            id: item.id,
            type: 'unknown',
            visitorId: null,
            reason: item.reason,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            firstName: "Inconnu",
            lastName: "Inconnu",
            isBlacklisted: true,
            blacklistReason: item.reason,
            reporter: item.reporter || null,
          };
        }
      });

      // 4️⃣ Retourner la réponse
      return {
        success: true,
        data: enrichedList,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error("Erreur dans getAllNonDesirablesUnknown:", error);
      throw new Error(`Erreur lors de la récupération des indésirables inconnus: ${error.message}`);
    }
  }



// Dans la classe NonDesirableService, remplacez la fonction createUnknownNonDesirable par :

// nondesirable.service.js - Fonction corrigée
async createUnknownNonDesirable({ validatedData, reportedBy, file = null }) {
  try {
    console.log('Données reçues dans le service:', { validatedData, reportedBy, file: file ? 'présent' : 'absent' });

    // Extraire les données validées
    const {
      firstName, lastName, idType, idNumber, birthDate, birthPlace, sexe,
      givingDate, expirationDate, phone, email, company, nationality,
      reason, incidentDate, incidentLocation, severityLevel
    } = validatedData;

    // Vérifier les données requises
    if (!firstName || !lastName || !reason) {
      throw new Error('Prénom, nom et raison sont requis');
    }

    const parseDate = (dateString) => {
      if (!dateString) return null;
      if (dateString.includes('/')) {
        const [day, month, year] = dateString.split('/');
        return new Date(year, month - 1, day);
      }
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    };

    // Variables pour les fichiers
    let photoUrl = validatedData.photoUrl || '';
    let attachedFileUrl = '';
    let attachedFileName = '';
    let attachedFileType = '';
    let attachedFileSize = 0;

    // Traiter le fichier uploadé
    if (file) {
      try {
        // Déterminer si c'est une image ou un PDF
        if (file.mimetype.startsWith('image/')) {
          // C'est une image → photoUrl
          const baseUrl = '/uploads/non-desirables/photos/';
          photoUrl = baseUrl + file.filename;
          console.log('Image uploadée comme photo:', photoUrl);
        } else if (file.mimetype === 'application/pdf') {
          // C'est un PDF → attachedFile
          const baseUrl = '/uploads/non-desirables/documents/';
          attachedFileUrl = baseUrl + file.filename;
          attachedFileName = file.originalname;
          attachedFileType = file.mimetype;
          attachedFileSize = file.size;
          console.log('PDF uploadé comme document:', attachedFileName);
        }
      } catch (uploadError) {
        console.error('Erreur traitement fichier:', uploadError);
        // Continuer sans le fichier
      }
    }

    const fullReason = {
      mainReason: reason,
      personalInfo: { firstName, lastName, birthDate, birthPlace, sexe, nationality },
      identification: { idType, idNumber, givingDate, expirationDate },
      contact: { phone, email, company },
      incident: { incidentDate, incidentLocation, severityLevel },
      photos: { photoUrl }
    };

    const result = await prisma.$transaction(async (tx) => {
      const nonDesirableEntry = await tx.nonDesirable.create({
        data: {
          visitorId: null,
          reason: JSON.stringify(fullReason),
          reportedBy,
          firstName: firstName || "Inconnu",
          lastName: lastName || "Inconnu",
          birthDate: parseDate(birthDate),
          birthPlace: birthPlace || "",
          sexe: sexe || "M",
          nationality: nationality || "",
          phone: phone || "",
          email: email || "",
          company: company || "",
          idType: idType || "",
          idNumber: idNumber || "",
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

      await tx.blacklistHistory.create({
        data: {
          visitorId: null,
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
          nonDesirableId: nonDesirableEntry.id
        }
      });

      return nonDesirableEntry;
    });

    return {
      success: true,
      data: {
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
        photoUrl: result.photoUrl,
        givingDate: result.givingDate,
        expirationDate: result.expirationDate,
        isBlacklisted: true,
        blacklistReason: reason,
        severityLevel: result.severityLevel,
        incidentDate: result.incidentDate,
        incidentLocation: result.incidentLocation,
        attachedFileUrl: result.attachedFileUrl,
        attachedFileName: result.attachedFileName,
        reporter: { id: reportedBy }
      }
    };
  } catch (error) {
    console.error('Erreur complète dans le service:', error);
    throw new Error(`Erreur lors de la création de l'indésirable inconnu: ${error.message}`);
  }
}
  // 6️⃣ Suppression d'un "indésirable connu"
  async removeNonDesirable(visitorId, removedBy, reason) {
    try {
      const visitor = await prisma.visitor.findUnique({
        where: { id: visitorId }
      });
      if (!visitor) {
        throw new Error('Visiteur non trouvé');
      }
      if (!visitor.isBlacklisted) {
        throw new Error('Ce visiteur n\'est pas blacklisté');
      }

      const result = await prisma.$transaction(async (tx) => {
        await tx.visitor.update({
          where: { id: visitorId },
          data: {
            isBlacklisted: false,
            blacklistReason: null
          }
        });

        await tx.blacklistHistory.create({
          data: {
            visitorId: visitorId,
            action: 'UNBLACKLIST',
            reason: reason,
            severityLevel: 1,
            createdBy: removedBy
          }
        });

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

  // 7️⃣ Suppression d'une entrée "indésirable"
  async deleteNonDesirable(id) {
    try {
      const existing = await prisma.nonDesirable.findUnique({
        where: { id },
        include: {
          visitor: {
            select: {
              id: true,
              firstName: true,
              lastName: true
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
        success: true,
        message: 'Entrée indésirable supprimée avec succès',
        visitor: existing.visitor
      };
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de l'entrée indésirable: ${error.message}`);
    }
  }

  // 8️⃣ Récupération de l'historique de blacklist d'un visiteur
  async getVisitorBlacklistHistory(visitorId) {
    try {
      const visitor = await prisma.visitor.findUnique({
        where: { id: visitorId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          isBlacklisted: true,
          blacklistHistory: {
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              action: true,
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

      return {
        success: true,
        data: visitor
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de l'historique: ${error.message}`);
    }
  }

  // 9️⃣ Suppression d'un "indésirable inconnu"
  async removeUnknown(id, reason, reportedBy) {
    try {
      const entry = await prisma.nonDesirable.findUnique({
        where: { id },
        select: { id: true, firstName: true, lastName: true }
      });

      if (!entry) {
        return {
          success: true,
          message: "Indésirable inconnu non trouvé.",
          count: 0
        };
      }

      await prisma.blacklistHistory.create({
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

      await prisma.nonDesirable.delete({ where: { id: entry.id } });

      return {
        success: true,
        message: `Indésirable supprimé avec succès: ${entry.firstName || ""} ${entry.lastName || ""}`,
        count: 1
      };
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de l'indésirable inconnu: ${error.message}`);
    }
  }

  // Récupérer un indésirable inconnu par ID
async getUnknownById(id) {
  const entry = await prisma.nonDesirable.findUnique({ where: { id } });
  if (!entry || entry.visitorId) return null; // exclure les connus
  try {
    return { ...entry, type: 'unknown', reason: JSON.parse(entry.reason) };
  } catch {
    return { ...entry, type: 'unknown', reason: entry.reason }; // fallback si JSON invalide
  }
}


}

module.exports = new NonDesirableService();
