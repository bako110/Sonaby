const { prisma } = require('../../config/prisma');
const fs = require('fs');
const path = require('path');
const uploadService = require('../upload');

class VisitorService {
  async getFilteredVisitors(filters = {}) {
    try {
      const {
        search,
        idType,
        idNumber,
        company,
        isBlacklisted,
        sexe,
        givingDateStart,
        givingDateEnd,
        expirationDateStart,
        expirationDateEnd,
        birthDateStart,
        birthDateEnd,
        dateCreationDebut,
        dateCreationFin,
        dateUpdateDebut,
        dateUpdateFin,
        siteId,
        checkpointId,
        actif,
        avecBadge,
        avecIncidents,
        avecVisites,
        visiteSiteId,
        visiteCheckpointId,
        residence,
        birthPlace,
        emergencyContactName,
        emergencyContactPhone,
        email,
        phone,
        page = 1,
        limit = 10,
      } = filters;

      const skip = (page - 1) * limit;
      
      const whereClause = {};

      // 1. Filtre par recherche générale
      if (search && search.trim() !== '') {
        whereClause.OR = [
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { idNumber: { contains: search } },
          { company: { contains: search } },
          { email: { contains: search } },
          { phone: { contains: search } }
        ];
      }

      // 2. Filtres simples
      if (idType && idType.trim() !== '') {
        whereClause.idType = idType;
      }

      if (idNumber && idNumber.trim() !== '') {
        whereClause.idNumber = { contains: idNumber };
      }

      if (company && company.trim() !== '') {
        whereClause.company = { contains: company };
      }

      if (isBlacklisted !== undefined) {
        whereClause.isBlacklisted = isBlacklisted === 'true';
      }

      if (sexe && sexe.trim() !== '') {
        whereClause.sexe = sexe;
      }

      if (residence && residence.trim() !== '') {
        whereClause.residence = { contains: residence };
      }

      if (birthPlace && birthPlace.trim() !== '') {
        whereClause.birthPlace = { contains: birthPlace };
      }

      if (emergencyContactName && emergencyContactName.trim() !== '') {
        whereClause.emergencyContactName = { contains: emergencyContactName };
      }

      if (emergencyContactPhone && emergencyContactPhone.trim() !== '') {
        whereClause.emergencyContactPhone = { contains: emergencyContactPhone };
      }

      if (email && email.trim() !== '') {
        whereClause.email = { contains: email };
      }

      if (phone && phone.trim() !== '') {
        whereClause.phone = { contains: phone };
      }

      // 3. Filtres de date (identité)
      if (givingDateStart || givingDateEnd) {
        whereClause.givingDate = {};
        if (givingDateStart) whereClause.givingDate.gte = givingDateStart;
        if (givingDateEnd) whereClause.givingDate.lte = givingDateEnd;
      }

      if (expirationDateStart || expirationDateEnd) {
        whereClause.expirationDate = {};
        if (expirationDateStart) whereClause.expirationDate.gte = expirationDateStart;
        if (expirationDateEnd) whereClause.expirationDate.lte = expirationDateEnd;
      }

      if (birthDateStart || birthDateEnd) {
        whereClause.birthDate = {};
        if (birthDateStart) whereClause.birthDate.gte = birthDateStart;
        if (birthDateEnd) whereClause.birthDate.lte = birthDateEnd;
      }

      // 4. Filtres de date (création/mise à jour)
      if (dateCreationDebut || dateCreationFin) {
        whereClause.createdAt = {};
        if (dateCreationDebut) {
          const start = new Date(dateCreationDebut);
          start.setHours(0, 0, 0, 0);
          whereClause.createdAt.gte = start;
        }
        if (dateCreationFin) {
          const end = new Date(dateCreationFin);
          end.setHours(23, 59, 59, 999);
          whereClause.createdAt.lte = end;
        }
      }

      if (dateUpdateDebut || dateUpdateFin) {
        whereClause.updatedAt = {};
        if (dateUpdateDebut) {
          const start = new Date(dateUpdateDebut);
          start.setHours(0, 0, 0, 0);
          whereClause.updatedAt.gte = start;
        }
        if (dateUpdateFin) {
          const end = new Date(dateUpdateFin);
          end.setHours(23, 59, 59, 999);
          whereClause.updatedAt.lte = end;
        }
      }

      // 5. Filtres relationnels (visites)
      if (siteId || checkpointId || actif || avecVisites || visiteSiteId || visiteCheckpointId) {
        whereClause.visits = { some: {} };
        
        if (siteId) {
          whereClause.visits.some.checkpoint = { siteId: siteId };
        }
        
        if (checkpointId) {
          whereClause.visits.some.checkpointId = checkpointId;
        }
        
        if (visiteSiteId) {
          whereClause.visits.some.checkpoint = {
            ...whereClause.visits.some.checkpoint,
            siteId: visiteSiteId
          };
        }
        
        if (visiteCheckpointId) {
          whereClause.visits.some.checkpointId = visiteCheckpointId;
        }
        
        if (actif === 'true') {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          whereClause.visits.some.entryTime = {
            ...whereClause.visits.some.entryTime,
            gte: thirtyDaysAgo
          };
        } else if (actif === 'false') {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          whereClause.visits = {
            none: { entryTime: { gte: thirtyDaysAgo } }
          };
        }
        
        if (avecVisites === 'false') {
          whereClause.visits = { none: {} };
        }
      }

      // 6. Filtre avec/sans badge
      if (avecBadge !== undefined) {
        if (avecBadge === 'true') {
          whereClause.photoUrl = { not: null };
        } else if (avecBadge === 'false') {
          whereClause.photoUrl = null;
        }
      }

      // 7. Filtre avec/sans incidents
      if (avecIncidents !== undefined) {
        if (avecIncidents === 'true') {
          whereClause.incidents = { some: {} };
        } else if (avecIncidents === 'false') {
          whereClause.incidents = { none: {} };
        }
      }

      const [visitors, total] = await Promise.all([
        prisma.visitor.findMany({
          where: whereClause,
          skip,
          take: limit,
          include: {
            visits: {
              take: 5,
              orderBy: { entryTime: 'desc' },
              include: {
                checkpoint: {
                  select: {
                    id: true,
                    name: true,
                    site: {
                      select: {
                        id: true,
                        name: true,
                        code: true
                      }
                    }
                  }
                },
                _count: { select: { incidents: true } }
              }
            },
            incidents: {
              take: 3,
              orderBy: { createdAt: 'desc' },
              select: {
                id: true,
                titre: true,
                description: true,
                typeIncident: true,
                severite: true,
                priorite: true,
                source: true,
                dateIncident: true,
                siteId: true,
                visiteurId: true,
                actionsImmediates: true,
                temoinPresent: true,
                notifierAgents: true,
                isResolved: true,
                resolvedAt: true,
                resolutionNotes: true,
                reportedBy: true,
                createdAt: true,
                updatedAt: true
              }
            },
            _count: {
              select: {
                visits: true,
                incidents: true
              }
            }
          },
          orderBy: [
            { createdAt: 'desc' },
            { lastName: 'asc' },
            { firstName: 'asc' }
          ]
        }),
        prisma.visitor.count({ where: whereClause })
      ]);

      return {
        visitors,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        },
        filterOptions: await this.getFilterOptions(whereClause)
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des visiteurs filtrés: ${error.message}`);
    }
  }

  async getFilterOptions(currentFilters = {}) {
    try {
      const idTypes = await prisma.visitor.groupBy({
        by: ['idType'],
        where: { ...currentFilters, idType: { not: null, not: '' } },
        _count: { idType: true },
        orderBy: { idType: 'asc' }
      });

      const companies = await prisma.visitor.groupBy({
        by: ['company'],
        where: { ...currentFilters, company: { not: null, not: '' } },
        _count: { company: true },
        orderBy: { company: 'asc' }
      });

      const sites = await prisma.site.findMany({
        where: currentFilters.siteId ? { id: currentFilters.siteId } : {},
        select: {
          id: true,
          name: true,
          code: true,
          city: true,
          _count: {
            select: {
              checkpoints: {
                where: {
                  visits: { some: { visitor: currentFilters } }
                }
              }
            }
          }
        },
        orderBy: { name: 'asc' }
      });

      const checkpoints = await prisma.checkpoint.findMany({
        where: currentFilters.checkpointId ? { id: currentFilters.checkpointId } : {},
        select: {
          id: true,
          name: true,
          zone: true,
          checkpointType: true,
          site: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          _count: {
            select: {
              visits: { where: { visitor: currentFilters } }
            }
          }
        },
        orderBy: { name: 'asc' }
      });

      const blacklistStats = await prisma.visitor.groupBy({
        by: ['isBlacklisted'],
        where: currentFilters,
        _count: { isBlacklisted: true }
      });

      const photoStats = await prisma.visitor.groupBy({
        by: ['photoUrl'],
        where: { ...currentFilters, photoUrl: { not: null, not: '' } },
        _count: { photoUrl: true }
      });

      const incidentStats = await prisma.visitor.groupBy({
        by: ['id'],
        where: { ...currentFilters, incidents: { some: {} } },
        _count: { id: true }
      });

      const withIncidentsCount = incidentStats.length;
      const withoutIncidentsCount = await prisma.visitor.count({
        where: { ...currentFilters, incidents: { none: {} } }
      });

      const withPhotoCount = photoStats.reduce((sum, stat) => sum + stat._count.photoUrl, 0);
      const withoutPhotoCount = await prisma.visitor.count({
        where: { ...currentFilters, photoUrl: null }
      });

      return {
        idTypes: idTypes.map(it => ({ value: it.idType, label: it.idType, count: it._count.idType })),
        companies: companies.map(c => ({ value: c.company, label: c.company, count: c._count.company })),
        sites: sites.map(s => ({ 
          value: s.id, 
          label: `${s.name} (${s.code})`, 
          count: s._count.checkpoints, 
          city: s.city 
        })),
        checkpoints: checkpoints.map(cp => ({ 
          value: cp.id, 
          label: `${cp.name} (${cp.zone})`, 
          count: cp._count.visits,
          zone: cp.zone,
          checkpointType: cp.checkpointType,
          site: cp.site
        })),
        blacklistOptions: [
          { 
            value: 'true', 
            label: 'Oui', 
            count: blacklistStats.find(s => s.isBlacklisted === true)?._count.isBlacklisted || 0 
          },
          { 
            value: 'false', 
            label: 'Non', 
            count: blacklistStats.find(s => s.isBlacklisted === false)?._count.isBlacklisted || 0 
          }
        ],
        photoOptions: [
          { value: 'true', label: 'Avec photo', count: withPhotoCount },
          { value: 'false', label: 'Sans photo', count: withoutPhotoCount }
        ],
        incidentOptions: [
          { value: 'true', label: 'Avec incidents', count: withIncidentsCount },
          { value: 'false', label: 'Sans incidents', count: withoutIncidentsCount }
        ]
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des options de filtre: ${error.message}`);
    }
  }

  async createOrFindVisitor(visitorData) {
    try {
      const { idType, idNumber, photoUrl, idScanUrl, ...rest } = visitorData;

      console.log('🔍 Recherche visiteur existant:', { idType, idNumber });

      const existingVisitor = await prisma.visitor.findFirst({
        where: { idType, idNumber },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          idType: true,
          idNumber: true,
          photoUrl: true,
          idScanUrl: true,
          isBlacklisted: true,
          blacklistReason: true,
          createdAt: true,
          birthDate: true,
          birthPlace: true,
          residence: true,
          sexe: true,
          givingDate: true,
          expirationDate: true,
          phone: true,
          email: true,
          company: true,
          emergencyContactPhone: true,
          emergencyContactName: true
        }
      });

      let undesirableRecord = null;

      if (existingVisitor) {
        console.log('✅ Visiteur existant trouvé:', existingVisitor.id);

        undesirableRecord = await prisma.nonDesirable.findFirst({
          where: { visitorId: existingVisitor.id },
          select: { id: true, reason: true, createdAt: true }
        });

        const updateData = {};
        const fieldsToUpdate = [
          'firstName', 'lastName', 'birthDate', 'birthPlace', 'residence',
          'sexe', 'givingDate', 'expirationDate', 'phone', 'email',
          'company', 'emergencyContactPhone', 'emergencyContactName'
        ];

        fieldsToUpdate.forEach(field => {
          if (rest[field] !== undefined && rest[field] !== existingVisitor[field] && rest[field] !== null) {
            updateData[field] = rest[field];
          }
        });

        if (photoUrl && photoUrl !== existingVisitor.photoUrl) updateData.photoUrl = photoUrl;
        if (idScanUrl && idScanUrl !== existingVisitor.idScanUrl) updateData.idScanUrl = idScanUrl;

        if (Object.keys(updateData).length > 0) {
          console.log('🔄 Mise à jour des données visiteur:', updateData);
          await prisma.visitor.update({
            where: { id: existingVisitor.id },
            data: updateData
          });
          Object.assign(existingVisitor, updateData);
        }

        return {
          success: true,
          status: "EXISTING_VISITOR",
          visitor: existingVisitor,
          isBlacklisted: existingVisitor.isBlacklisted,
          isUndesirable: !!undesirableRecord,
          undesirableInfo: undesirableRecord,
          message: existingVisitor.isBlacklisted
            ? "Visiteur existant et BLACKLISTÉ"
            : undesirableRecord
              ? "Visiteur existant et INDÉSIRABLE"
              : "Visiteur existant"
        };
      }

      console.log('🆕 Création nouveau visiteur...');

      const newVisitor = await prisma.visitor.create({
        data: {
          ...rest,
          idType,
          idNumber,
          photoUrl: photoUrl || null,
          idScanUrl: idScanUrl || null,
          isBlacklisted: visitorData.isBlacklisted || false,
          blacklistReason: visitorData.blacklistReason || null
        }
      });

      console.log('✅ Nouveau visiteur créé:', newVisitor.id);

      return {
        success: true,
        status: "NEW_VISITOR_CREATED",
        visitor: newVisitor,
        isBlacklisted: false,
        isUndesirable: false,
        message: "Nouveau visiteur créé avec succès"
      };

    } catch (error) {
      console.error("❌ Erreur createOrFindVisitor:", error);

      if (error.code === 'P2002') {
        throw new Error(`Un visiteu avec ce type et numéro d'identité existe déjà.`);
      }
      if (error.code === 'P2003' || error.code === 'P2025') {
        throw new Error(`Données invalides pour la création du visiteur: ${error.message}`);
      }

      throw new Error(`Erreur lors de la création ou récupération du visiteur: ${error.message}`);
    }
  }

  deleteOldFile(fileUrl) {
    try {
      if (fileUrl && fileUrl.startsWith('/uploads/visitors/')) {
        const filePath = path.join(__dirname, '../../../', fileUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`🗑️ Fichier supprimé: ${filePath}`);
        }
      }
    } catch (error) {
      console.error(`⚠️ Erreur suppression fichier ${fileUrl}:`, error);
    }
  }

  async deleteVisitorFiles(visitorId) {
    try {
      const visitor = await prisma.visitor.findUnique({
        where: { id: visitorId },
        select: { photoUrl: true, idScanUrl: true }
      });

      if (visitor) {
        if (visitor.photoUrl) this.deleteOldFile(visitor.photoUrl);
        if (visitor.idScanUrl) this.deleteOldFile(visitor.idScanUrl);
      }
    } catch (error) {
      console.error(`❌ Erreur suppression fichiers visiteur ${visitorId}:`, error);
    }
  }

  async getAllVisitors(page = 1, limit = 10, search = null, company = null) {
    try {
      const skip = (page - 1) * limit;

      let whereClause = {};

      if (search) {
        const searchLower = search.toLowerCase();
        whereClause.OR = [
          { firstName: { contains: searchLower } },
          { lastName: { contains: searchLower } },
          { email: { contains: searchLower } },
          { phone: { contains: searchLower } }
        ];
      }

      if (company) {
        const companyLower = company.toLowerCase();
        whereClause.company = { contains: companyLower };
      }

      const [visitors, total] = await Promise.all([
        prisma.visitor.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.visitor.count({ where: whereClause })
      ]);

      return {
        visitors,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('❌ Erreur getAllVisitors:', error);
      throw new Error(`Erreur lors de la récupération des visiteurs: ${error.message}`);
    }
  }

  async getWeekPlanning(siteId) {
    try {
      const site = await prisma.site.findUnique({
        where: { id: siteId },
        select: { id: true, name: true }
      });

      if (!site) {
        throw new Error(`Site avec ID ${siteId} non trouvé`);
      }

      console.log(`📅 Récupération planning pour site: ${site.name} (${siteId})`);

      const today = new Date();
      const currentDay = today.getDay();
      
      const mondayOffset = currentDay === 0 ? 6 : currentDay - 1;
      const weekMonday = new Date(today);
      weekMonday.setDate(today.getDate() - mondayOffset);
      weekMonday.setHours(0, 0, 0, 0);
      
      const weekSunday = new Date(weekMonday);
      weekSunday.setDate(weekMonday.getDate() + 6);
      weekSunday.setHours(23, 59, 59, 999);

      const startDate = weekMonday;
      const endDate = weekSunday;

      console.log(`📅 Période: ${startDate.toISOString().split('T')[0]} → ${endDate.toISOString().split('T')[0]}`);

      const checkpoints = await prisma.checkpoint.findMany({
        where: { siteId: siteId, active: true },
        select: { id: true, name: true, siteId: true }
      });
      
      const checkpointIds = checkpoints.map(cp => cp.id);
      console.log(`🔍 ${checkpoints.length} checkpoint(s) trouvé(s) pour le site ${site.name}`);

      const emptyResponse = {
        weekPeriod: { start: startDate, end: endDate, siteId: siteId, siteName: site.name },
        stats: { totalVisits: 0, totalVisitors: 0, daysWithVisits: 0, averageVisitsPerDay: 0, totalCheckpoints: checkpoints.length },
        checkpoints: checkpoints.map(cp => ({ id: cp.id, name: cp.name, visitsCount: 0 })),
        planning: {},
        visitors: [],
        visits: []
      };

      if (checkpointIds.length === 0) {
        console.log(`⚠️ Aucun checkpoint actif trouvé pour le site ${site.name}`);
        return emptyResponse;
      }

      const visits = await prisma.visit.findMany({
        where: {
          checkpointId: { in: checkpointIds },
          entryTime: { gte: startDate, lte: endDate },
          status: { not: 'CANCELLED' }
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
              photoUrl: true,
              isBlacklisted: true
            }
          },
          creator: {
            select: { id: true, firstName: true, lastName: true, role: true }
          },
          checkpoint: { select: { id: true, name: true, siteId: true } },
          service: { select: { id: true, name: true } },
          visitStatus: { select: { status_name: true } }
        },
        orderBy: { entryTime: "asc" }
      });

      console.log(`📊 ${visits.length} visite(s) trouvée(s) pour la période`);

      const uniqueVisitorsMap = new Map();
      const checkpointStats = new Map();
      
      checkpoints.forEach(cp => {
        checkpointStats.set(cp.id, { id: cp.id, name: cp.name, visitsCount: 0 });
      });

      visits.forEach(visit => {
        if (checkpointStats.has(visit.checkpointId)) {
          checkpointStats.get(visit.checkpointId).visitsCount++;
        }

        if (visit.visitor && !uniqueVisitorsMap.has(visit.visitor.id)) {
          uniqueVisitorsMap.set(visit.visitor.id, {
            ...visit.visitor,
            visitsCount: 0,
            lastVisit: visit.entryTime
          });
        }
        
        if (visit.visitor) {
          const visitor = uniqueVisitorsMap.get(visit.visitor.id);
          visitor.visitsCount++;
          if (visit.entryTime > visitor.lastVisit) {
            visitor.lastVisit = visit.entryTime;
          }
        }
      });

      const uniqueVisitors = Array.from(uniqueVisitorsMap.values());
      const checkpointStatsArray = Array.from(checkpointStats.values());

      const visitsByDay = {};
      const daysWithVisits = new Set();

      visits.forEach(visit => {
        const dayKey = visit.entryTime.toISOString().split('T')[0];
        daysWithVisits.add(dayKey);
        
        if (!visitsByDay[dayKey]) {
          visitsByDay[dayKey] = [];
        }

        visitsByDay[dayKey].push({
          id: visit.id,
          visitDate: visit.entryTime,
          exitDate: visit.exitTime,
          purpose: visit.purpose,
          status: visit.status,
          visitorId: visit.visitorId,
          agentId: visit.createdBy,
          checkpointId: visit.checkpointId,
          checkpointName: visit.checkpoint?.name,
          service: visit.service?.name,
          visitStatus: visit.visitStatus?.name,
          visitor: {
            id: visit.visitor?.id,
            firstName: visit.visitor?.firstName,
            lastName: visit.visitor?.lastName,
            phone: visit.visitor?.phone,
            company: visit.visitor?.company,
            isBlacklisted: visit.visitor?.isBlacklisted
          },
          agent: visit.creator ? {
            id: visit.creator.id,
            firstName: visit.creator.firstName,
            lastName: visit.creator.lastName,
            role: visit.creator.role
          } : null
        });
      });

      const daysWithVisitsCount = daysWithVisits.size;

      const stats = {
        totalVisits: visits.length,
        totalVisitors: uniqueVisitors.length,
        daysWithVisits: daysWithVisitsCount,
        averageVisitsPerDay: visits.length > 0 ? (visits.length / daysWithVisitsCount).toFixed(1) : 0,
        totalCheckpoints: checkpoints.length,
        activeCheckpoints: checkpointStatsArray.filter(cp => cp.visitsCount > 0).length,
        blacklistedVisitors: uniqueVisitors.filter(v => v.isBlacklisted).length
      };

      return {
        weekPeriod: {
          start: startDate,
          end: endDate,
          siteId: siteId,
          siteName: site.name,
          periodLabel: `Semaine du ${startDate.toLocaleDateString('fr-FR')} au ${endDate.toLocaleDateString('fr-FR')}`
        },
        stats,
        checkpoints: checkpointStatsArray,
        planning: visitsByDay,
        visitors: uniqueVisitors.sort((a, b) => b.visitsCount - a.visitsCount),
        visits: visits.map(v => ({
          id: v.id,
          entryTime: v.entryTime,
          exitTime: v.exitTime,
          purpose: v.purpose,
          status: v.status,
          visitorName: v.visitor ? `${v.visitor.firstName} ${v.visitor.lastName}` : 'Visiteur inconnu',
          company: v.visitor?.company,
          checkpoint: v.checkpoint?.name,
          agent: v.creator ? `${v.creator.firstName} ${v.creator.lastName}` : null
        }))
      };

    } catch (error) {
      console.error('❌ Erreur getWeekPlanning:', error);
      
      if (error.message.includes('non trouvé')) {
        throw new Error(`Site non trouvé: ${error.message}`);
      }
      
      if (error.code === 'P2025') {
        throw new Error(`Erreur de relation dans la base de données: ${error.message}`);
      }
      
      throw new Error(`Erreur lors de la récupération du planning: ${error.message}`);
    }
  }

  // ✅ CORRIGÉ : getVisitorById avec responsibleGroups (maintenant ça fonctionne)
  async getVisitorById(id) {
    try {
      const visitor = await prisma.visitor.findUnique({
        where: { id },
        include: {
          visits: {
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
              checkpoint: {
                select: {
                  id: true,
                  name: true,
                  site: { select: { id: true, name: true } }
                }
              },
              service: { select: { id: true, name: true } }
            }
          },
          blacklistHistory: {
            take: 5,
            orderBy: { createdAt: 'desc' }
          },
          nonDesirables: {
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
              reporter: {
                select: { id: true, firstName: true, lastName: true, email: true }
              }
            }
          },
          // ✅ AJOUTÉ : responsibleGroups (maintenant supporté grâce à ON DELETE CASCADE)
          responsibleGroups: {
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              expectedCount: true,
              createdAt: true,
              otherVisitors: true
            }
          },
          incidents: {
            take: 5,
            orderBy: { createdAt: 'desc' }
          },
          id_types: true
        }
      });
      
      if (!visitor) {
        throw new Error('Visiteur non trouvé');
      }

      return visitor;
    } catch (error) {
      console.error('❌ Erreur getVisitorById:', error);
      throw new Error(`Erreur lors de la récupération du visiteur: ${error.message}`);
    }
  }

  async updateVisitor(id, updateData) {
    try {
      const existingVisitor = await this.getVisitorById(id);
      
      const updatedVisitor = await prisma.visitor.update({
        where: { id },
        data: updateData
      });

      return updatedVisitor;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour du visiteur: ${error.message}`);
    }
  }

  // ✅ CORRIGÉ : deleteVisitor avec gestion des groupes
  async deleteVisitor(id) {
    try {
      // ✅ Récupère le visiteur avec ses groupes
      const existingVisitor = await this.getVisitorById(id);
      
      if (!existingVisitor) {
        throw new Error('Visiteur non trouvé');
      }
      
      // Vérifie s'il y a des visites associées
      const visitsCount = await prisma.visit.count({
        where: { visitorId: id }
      });

      if (visitsCount > 0) {
        throw new Error('Impossible de supprimer un visiteur qui a des visites associées');
      }

      console.log(`🗑️ Suppression du visiteur ${id}`);
      console.log(`📋 Groupes responsables à supprimer automatiquement: ${existingVisitor.responsibleGroups?.length || 0}`);

      // Supprime les fichiers
      await this.deleteVisitorFiles(id);

      // ✅ Supprime le visiteur (les groupes responsables seront supprimés automatiquement via ON DELETE CASCADE)
      await prisma.visitor.delete({
        where: { id }
      });

      return { 
        success: true,
        message: 'Visiteur supprimé avec succès. Les groupes dont il était responsable ont été supprimés automatiquement.'
      };
      
    } catch (error) {
      console.error('❌ Erreur deleteVisitor:', error);
      return {
        success: false,
        message: `Erreur lors de la suppression du visiteur: ${error.message}`
      };
    }
  }

  async checkNonDesirable(id) {
    try {
      const visitor = await this.getVisitorById(id);
      
      const nonDesirable = await prisma.nonDesirable.findFirst({
        where: { visitorId: id },
        include: {
          reporter: {
            select: { id: true, firstName: true, lastName: true }
          }
        }
      });

      return {
        visitor: {
          id: visitor.id,
          firstname: visitor.firstName,
          lastname: visitor.lastName
        },
        isNonDesirable: !!nonDesirable,
        nonDesirable: nonDesirable
      };
    } catch (error) {
      throw new Error(`Erreur lors de la vérification du statut indésirable: ${error.message}`);
    }
  }

  async getVisitorStats() {
    try {
      const stats = await prisma.visitor.aggregate({
        _count: { id: true }
      });

      const companyStats = await prisma.visitor.groupBy({
        by: ['company'],
        _count: { id: true },
        where: { company: { not: null } }
      });

      const blacklistedCount = await prisma.visitor.count({
        where: { isBlacklisted: true }
      });

      return {
        totalVisitors: stats._count.id,
        blacklistedVisitors: blacklistedCount,
        activeVisitors: stats._count.id - blacklistedCount,
        companiesDistribution: companyStats
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  }

  async getVisitorHistory(id, days = 30) {
    try {
      const visitor = await this.getVisitorById(id);
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const [visits, rendezvous] = await Promise.all([
        prisma.visit.findMany({
          where: {
            visitorId: id,
            createdAt: { gte: startDate }
          },
          orderBy: { createdAt: 'desc' },
          include: {
            checkpoint: {
              select: {
                id: true,
                name: true,
                site: { select: { id: true, name: true } }
              }
            },
            service: { select: { id: true, name: true } }
          }
        }),
        prisma.rendezvous.findMany({
          where: {
            visitorId: id,
            createdAt: { gte: startDate }
          },
          orderBy: { createdAt: 'desc' },
          include: {
            service: { select: { id: true, name: true } }
          }
        })
      ]);

      return {
        visitor: {
          id: visitor.id,
          firstName: visitor.firstName,
          lastName: visitor.lastName,
          company: visitor.company
        },
        period: { days, startDate, endDate: new Date() },
        history: { visits, rendezvous },
        summary: {
          totalVisits: visits.length,
          totalRendezvous: rendezvous.length
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de l'historique du visiteur: ${error.message}`);
    }
  }
}

module.exports = new VisitorService();