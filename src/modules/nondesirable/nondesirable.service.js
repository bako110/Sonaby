// src/services/nonDesirable/nonDesirable.service.js
const { prisma } = require('../../config/prisma');
const uploadService = require('../upload');
const globalNotificationService = require('../notification/notification.service');

class NonDesirableService {
  
  // 1️⃣ Création d'un "indésirable" connu avec notification globale
  async createNonDesirable(nonDesirableData, reportedBy) {
    try {
      const { visitorId, reason } = nonDesirableData;
      if (!reportedBy) {
        throw new Error('Utilisateur non authentifié');
      }

      // Vérifications en dehors de la transaction
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

      // Transaction avec timeout augmenté
      const result = await prisma.$transaction(async (tx) => {
        // 1. Mettre à jour le visiteur
        await tx.visitor.update({
          where: { id: visitorId },
          data: {
            isBlacklisted: true,
            blacklistReason: reason
          }
        });

        // 2. Créer l'historique
        await tx.blacklistHistory.create({
          data: {
            visitorId: visitorId,
            action: 'BLACKLIST',
            reason: reason,
            severityLevel: 2,
            createdBy: reportedBy
          }
        });

        // 3. Créer l'entrée indésirable
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
      }, {
        maxWait: 20000, // Augmenter à 20 secondes
        timeout: 30000  // Augmenter à 30 secondes
      });

      // ============ NOTIFICATION GLOBALE ============
      try {
        await globalNotificationService.notifyVisitorBlacklisted({
          visitor,
          reporterId: reportedBy,
          reason,
          entityId: result.id
        });
      } catch (notificationError) {
        console.error('Erreur lors de l\'envoi des notifications:', notificationError);
        // Ne pas bloquer le processus principal
      }
      // ======================================

      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Erreur complète createNonDesirable:', error);
      
      // Message d'erreur plus clair
      let errorMessage = `Erreur lors de la création de l'entrée indésirable: ${error.message}`;
      if (error.message.includes('timeout') || error.message.includes('Transaction already closed')) {
        errorMessage = 'La création a pris trop de temps. Veuillez réessayer ou contacter l\'administrateur.';
      }
      
      throw new Error(errorMessage);
    }
  }

  // 2️⃣ Suppression d'un "indésirable connu" avec notification globale
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

      // ============ NOTIFICATION GLOBALE ============
      try {
        await globalNotificationService.notifyVisitorUnblacklisted({
          visitor,
          removerId: removedBy,
          reason,
          entityId: visitorId
        });
      } catch (notificationError) {
        console.error('Erreur lors de l\'envoi des notifications:', notificationError);
      }
      // ======================================

      return result;
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de l'indésirable: ${error.message}`);
    }
  }

  // 3️⃣ Création d'un "indésirable inconnu" avec notification globale
 async createUnknownNonDesirable({ validatedData, reportedBy, file = {} }) {
    try {
      console.log('Données reçues dans le service:', { validatedData, reportedBy, file });

      const {
        firstName, lastName, idType, idNumber, birthDate, birthPlace, sexe,
        givingDate, expirationDate, phone, email, company, nationality,
        reason, incidentDate, incidentLocation, severityLevel
      } = validatedData;

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

      // Gestion des fichiers uploadés
      let photoUrl = validatedData.photoUrl || '';
      let attachedFileUrl = '';
      let attachedFileName = '';
      let attachedFileType = '';
      let attachedFileSize = 0;

      if (file.photo?.[0]) {
        photoUrl = uploadService.getPublicUrl(file.photo[0]);
        console.log('Image uploadée comme photo:', photoUrl);
      }

      if (file.idScanUrl?.[0]) {
        attachedFileUrl = uploadService.getPublicUrl(file.idScanUrl[0]);
        attachedFileName = files.idScanUrl[0].originalname;
        attachedFileType = files.idScanUrl[0].mimetype;
        attachedFileSize = files.idScanUrl[0].size;
        console.log('Document uploadé:', attachedFileName);
      }

      const fullReason = {
        mainReason: reason,
        personalInfo: { firstName, lastName, birthDate, birthPlace, sexe, nationality },
        identification: { idType, idNumber, givingDate, expirationDate },
        contact: { phone, email, company },
        incident: { incidentDate, incidentLocation, severityLevel },
        photos: { photoUrl },
        document: { attachedFileUrl, attachedFileName, attachedFileType, attachedFileSize }
      };

      // Solution 1: Augmenter le timeout de la transaction
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
            reason,
            severityLevel: nonDesirableEntry.severityLevel,
            incidentDate: nonDesirableEntry.incidentDate,
            incidentLocation: nonDesirableEntry.incidentLocation,
            createdBy: reportedBy,
            nonDesirableId: nonDesirableEntry.id
          }
        });

        return nonDesirableEntry;
      }, {
        maxWait: 20000, // Augmenter à 20 secondes
        timeout: 30000  // Augmenter à 30 secondes
      });

      // ============ NOTIFICATION GLOBALE ============
      try {
        await globalNotificationService.notifyUnknownBlacklisted({
          firstName,
          lastName,
          reporterId: reportedBy,
          reason,
          severityLevel: severityLevel || 2,
          entityId: result.id
        });
      } catch (notificationError) {
        console.error('Erreur lors de la création de la notification:', notificationError);
        // Ne pas bloquer le processus principal
      }
      // ======================================

      // Récupérer le reporter pour la réponse (en dehors de la transaction)
      let reporter = null;
      try {
        reporter = await prisma.user.findUnique({
          where: { id: reportedBy },
          select: { firstName: true, lastName: true, email: true }
        });
      } catch (userError) {
        console.warn('Erreur récupération reporter:', userError);
      }

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
          reporter: { 
            id: reportedBy,
            name: reporter ? `${reporter.firstName} ${reporter.lastName}` : 'Utilisateur',
            email: reporter?.email || null
          }
        }
      };
    } catch (error) {
      console.error('Erreur complète dans le service:', error);
      
      // Message d'erreur plus clair
      let errorMessage = `Erreur lors de la création de l'indésirable inconnu: ${error.message}`;
      if (error.message.includes('timeout') || error.message.includes('Transaction already closed')) {
        errorMessage = 'La création a pris trop de temps. Veuillez réessayer avec moins de données ou contacter l\'administrateur.';
      }
      
      throw new Error(errorMessage);
    }
  }

  // 4️⃣ Suppression d'un "indésirable inconnu" avec notification globale
  // 4️⃣ Suppression d'un "indésirable inconnu" avec notification globale
async removeUnknown(id, reason, reportedBy) {
    try {
      const entry = await prisma.nonDesirable.findUnique({
        where: { id },
        select: { 
          id: true, 
          firstName: true, 
          lastName: true,
          reporter: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      if (!entry) {
        return {
          success: true,
          message: "Indésirable inconnu non trouvé.",
          count: 0
        };
      }

      // Créer l'historique avant de supprimer
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

      // Supprimer en utilisant l'ID original (pas entry.id)
      await prisma.nonDesirable.delete({ where: { id } });

      // ============ NOTIFICATION GLOBALE ============
      try {
        await globalNotificationService.notifyUnknownUnblacklisted({
          firstName: entry.firstName || '',
          lastName: entry.lastName || '',
          removerId: reportedBy || 'system',
          reason: reason || "Suppression automatique",
          entityId: id
        });
      } catch (notificationError) {
        console.error('Erreur lors de l\'envoi des notifications:', notificationError);
      }
      // ======================================

      return {
        success: true,
        message: `Indésirable supprimé avec succès: ${entry.firstName || ""} ${entry.lastName || ""}`,
        count: 1
      };
    } catch (error) {
      // Gestion d'erreur améliorée
      console.error('Erreur détaillée suppression indésirable:', error);
      
      // Vérifier si c'est une erreur "record not found"
      if (error.code === 'P2025' || error.message.includes('Record to delete does not exist')) {
        return {
          success: true,
          message: "Indésirable inconnu non trouvé ou déjà supprimé.",
          count: 0
        };
      }
      
      throw new Error(`Erreur lors de la suppression de l'indésirable inconnu: ${error.message}`);
    }
  }

  // 5️⃣ Suppression d'une entrée "indésirable" (ancienne méthode - gardée pour compatibilité)
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
          },
          reporter: {
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

      // Utiliser la nouvelle méthode de notification si c'est un inconnu
      if (!existing.visitorId && existing.firstName && existing.lastName) {
        try {
          await globalNotificationService.notifyUnknownUnblacklisted({
            firstName: existing.firstName,
            lastName: existing.lastName,
            removerId: 'system',
            reason: 'Suppression directe',
            entityId: id
          });
        } catch (notificationError) {
          console.error('Erreur notification:', notificationError);
        }
      }

      return {
        success: true,
        message: 'Entrée indésirable supprimée avec succès',
        visitor: existing.visitor
      };
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de l'entrée indésirable: ${error.message}`);
    }
  }

  // 6️⃣ Récupération de tous les "indésirables" (avec pagination et recherche)
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

  // 7️⃣ Récupération des "indésirables connus" (avec pagination et recherche)
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

  // 8️⃣ Récupération des "indésirables inconnus" (avec pagination et recherche)
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

  // 9️⃣ Récupération de l'historique de blacklist d'un visiteur
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

  // 🔟 Récupérer un indésirable inconnu par ID
  async getUnknownById(id) {
    const entry = await prisma.nonDesirable.findUnique({ where: { id } });
    if (!entry || entry.visitorId) return null; // exclure les connus
    try {
      return { ...entry, type: 'unknown', reason: JSON.parse(entry.reason) };
    } catch {
      return { ...entry, type: 'unknown', reason: entry.reason }; // fallback si JSON invalide
    }
  }

  // 🔟+1 Détection automatique d'un visiteur blacklisté
  async detectBlacklistedVisitor(visitorData, userId) {
    try {
      // Rechercher dans la base de données par différents critères
      const existingBlacklisted = await prisma.nonDesirable.findFirst({
        where: {
          OR: [
            { 
              visitor: {
                idNumber: visitorData.idNumber,
                isBlacklisted: true
              }
            },
            {
              idNumber: visitorData.idNumber
            }
          ]
        },
        include: {
          visitor: true
        }
      });

      if (existingBlacklisted) {
        const personName = existingBlacklisted.visitor 
          ? `${existingBlacklisted.visitor.firstName} ${existingBlacklisted.visitor.lastName}`
          : `${existingBlacklisted.firstName} ${existingBlacklisted.lastName}`;

        // Créer une notification globale pour la détection
        try {
          await globalNotificationService.createGlobalNotification({
            type: 'BLACKLIST_DETECTED',
            title: '🚨 Visiteur blacklisté détecté',
            message: `Le visiteur "${personName}" a été détecté lors d'une vérification`,
            priority: 'high',
            entityType: 'BLACKLIST',
            entityId: existingBlacklisted.id,
            createdBy: userId || 'system',
            metadata: {
              action: 'blacklist_detected',
              nonDesirableId: existingBlacklisted.id,
              personName: personName,
              reason: existingBlacklisted.reason,
              matchType: existingBlacklisted.visitor ? 'known' : 'unknown',
              detectedBy: userId
            }
          });
        } catch (notificationError) {
          console.error('Erreur notification détection:', notificationError);
        }

        return {
          detected: true,
          blacklistedEntry: existingBlacklisted,
          message: 'Visiteur détecté dans la liste des indésirables'
        };
      }

      return {
        detected: false,
        message: 'Visiteur non trouvé dans la liste des indésirables'
      };
    } catch (error) {
      console.error('Erreur lors de la détection du visiteur blacklisté:', error);
      return {
        detected: false,
        error: error.message
      };
    }
  }
}

module.exports = new NonDesirableService();