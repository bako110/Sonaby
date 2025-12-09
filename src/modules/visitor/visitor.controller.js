const visitorService = require('./visitor.service');
const { createVisitorWithTransform, updateVisitorSchema, visitorIdSchema, visitorQuerySchema, weekPlanningSchema,visitorFilterSchema } = require('./visitor.schema');
const { asyncHandler } = require('../../middleware/asyncHandler');
const path = require('path');
const fs = require('fs');

class VisitorController {
    getFilteredVisitors = asyncHandler(async (req, res) => {
  try {
    // Vérifier les permissions
    if (!['ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE', 'CHEF_SERVICE'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes pour filtrer les visiteurs.'
      });
    }

    // Valider les filtres avec le nouveau schéma
    const validatedFilters = visitorFilterSchema.parse(req.query);
    
    // Mapping des noms de paramètres pour le service
    const filtersForService = {
      // Filtres de base
      search: validatedFilters.search || undefined,
      idType: validatedFilters.idType || undefined,
      idNumber: validatedFilters.idNumber || undefined,
      company: validatedFilters.company || undefined,
      isBlacklisted: validatedFilters.isBlacklisted || undefined,
      sexe: validatedFilters.sexe || undefined,
      
      // Filtres dates d'identité
      givingDateStart: validatedFilters.givingDateStart || undefined,
      givingDateEnd: validatedFilters.givingDateEnd || undefined,
      expirationDateStart: validatedFilters.expirationDateStart || undefined,
      expirationDateEnd: validatedFilters.expirationDateEnd || undefined,
      birthDateStart: validatedFilters.birthDateStart || undefined,
      birthDateEnd: validatedFilters.birthDateEnd || undefined,
      
      // Filtres dates création/mise à jour
      dateCreationDebut: validatedFilters.dateCreationDebut || undefined,
      dateCreationFin: validatedFilters.dateCreationFin || undefined,
      dateUpdateDebut: validatedFilters.dateUpdateDebut || undefined,
      dateUpdateFin: validatedFilters.dateUpdateFin || undefined,
      
      // Filtres relationnels
      siteId: validatedFilters.siteId || undefined,
      checkpointId: validatedFilters.checkpointId || undefined,
      actif: validatedFilters.actif || undefined,
      avecBadge: validatedFilters.avecBadge || undefined,
      avecIncidents: validatedFilters.avecIncidents || undefined,
      avecVisites: validatedFilters.avecVisites || undefined,
      visiteSiteId: validatedFilters.visiteSiteId || undefined,
      visiteCheckpointId: validatedFilters.visiteCheckpointId || undefined,
      
      // Filtres démographiques
      residence: validatedFilters.residence || undefined,
      birthPlace: validatedFilters.birthPlace || undefined,
      emergencyContactName: validatedFilters.emergencyContactName || undefined,
      emergencyContactPhone: validatedFilters.emergencyContactPhone || undefined,
      email: validatedFilters.email || undefined,
      phone: validatedFilters.phone || undefined,
      
      // Pagination
      page: validatedFilters.page || 1,
      limit: validatedFilters.limit || 10
    };

    // Nettoyer les valeurs undefined
    Object.keys(filtersForService).forEach(key => {
      if (filtersForService[key] === undefined) {
        delete filtersForService[key];
      }
    });

    console.log('=== DEBUG: Filtres envoyés au service ===');
    console.log(filtersForService);

    const result = await visitorService.getFilteredVisitors(filtersForService);
    
    // Vérifier que result n'est pas undefined
    if (!result) {
      return res.status(500).json({
        success: false,
        message: 'Erreur interne : le service n\'a retourné aucun résultat'
      });
    }
    
    // S'assurer que visitors est toujours un tableau
    const visitors = Array.isArray(result.visitors) ? result.visitors : [];
    
    // S'assurer que pagination existe
    const pagination = result.pagination || {
      page: filtersForService.page || 1,
      limit: filtersForService.limit || 10,
      total: visitors.length,
      totalPages: Math.ceil(visitors.length / (filtersForService.limit || 10)),
      hasNext: false,
      hasPrev: false
    };
    
    // S'assurer que filterOptions existe
    const filterOptions = result.filterOptions || {};

    res.status(200).json({
      success: true,
      message: `${visitors.length} visiteur(s) trouvé(s)`,
      data: visitors,
      pagination,
      filterOptions,
      filters: filtersForService
    });

  } catch (error) {
    console.error('Error in getFilteredVisitors:', error);
    
    // CORRECTION : Gestion sécurisée de l'erreur Zod
    if (error.name === 'ZodError') {
      const errorDetails = Array.isArray(error.errors) 
        ? error.errors.map(err => ({
            field: Array.isArray(err.path) ? err.path.join('.') : String(err.path),
            message: err.message || 'Erreur de validation'
          }))
        : [{ field: 'unknown', message: 'Erreur de validation Zod' }];
      
      return res.status(400).json({
        success: false,
        message: 'Données de filtrage invalides',
        errors: errorDetails
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des visiteurs filtrés',
      error: error.message
    });
  }
});
    getFilterOptions = asyncHandler(async (req, res) => {
        try {
            const { page, limit, ...currentFilters } = req.query;
            
            const filterOptions = await visitorService.getFilterOptions(currentFilters);
            
            res.status(200).json({
                success: true,
                message: 'Options de filtre récupérées avec succès',
                data: filterOptions
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    });

   createVisitor = asyncHandler(async (req, res) => {
    // 🔹 Vérifier les permissions
    if (!['ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE', 'CHEF_SERVICE'].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: 'Accès refusé. Permissions insuffisantes pour créer un visiteur.'
        });
    }

    try {
        // 🔍 DEBUG COMPLET
        console.log('=== DEBUG DÉBUT ===');
        console.log('📥 Headers Content-Type:', req.headers['content-type']);
        console.log('📝 req.body keys:', Object.keys(req.body));
        console.log('📁 req.files keys:', req.files ? Object.keys(req.files) : 'null');
        
        // Vérifier CHAQUE fichier en détail
        if (req.files) {
            for (const fieldName in req.files) {
                const files = req.files[fieldName];
                console.log(`\n🔍 Champ "${fieldName}":`);
                files.forEach((file, index) => {
                    console.log(`  [${index}]`, {
                        fieldname: file.fieldname,
                        originalname: file.originalname,
                        originalnameType: typeof file.originalname,
                        originalnameValue: JSON.stringify(file.originalname),
                        mimetype: file.mimetype,
                        size: file.size,
                        bufferExists: !!file.buffer,
                        pathExists: !!file.path
                    });
                });
            }
        }
        console.log('=== DEBUG FIN ===\n');

        // 📁 1. VALIDER LES DONNÉES TEXTUELLES
        const validatedData = createVisitorWithTransform.parse(req.body);
        console.log('✅ Données validées:', {
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            idType: validatedData.idType,
            idNumber: validatedData.idNumber
        });

        // 📁 2. TRAITEMENT DES FICHIERS MULTIPART
        let finalPhotoUrl = null;
        let finalIdScanUrl = null;

        const now = new Date();
        const year = now.getFullYear().toString(); // Convertir en string
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Déjà string
        const day = String(now.getDate()).padStart(2, '0'); // Déjà string
        const baseUploadDir = path.join(__dirname, '../../../public/uploads/visitors');
        const uploadDir = path.join(baseUploadDir, year, month, day);
        
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
            console.log('📁 Dossier créé:', uploadDir);
        }

        // 🔧 Fonction SÉCURISÉE pour l'extension - SANS path.extname()
        const getSafeExtension = (file) => {
            console.log(`\n🔧 getSafeExtension appelée:`, {
                originalname: file.originalname,
                originalnameType: typeof file.originalname,
                mimetype: file.mimetype
            });

            // CAS 1: originalname est INVALIDE (nombre ou undefined)
            if (!file.originalname || typeof file.originalname !== 'string') {
                console.log(`⚠️ originalname invalide (${typeof file.originalname}), utilisation mimetype`);
                return getExtensionFromMimeType(file.mimetype);
            }

            // CAS 2: originalname est une string
            const originalnameStr = String(file.originalname);
            
            // Essayer d'extraire l'extension manuellement
            const lastDotIndex = originalnameStr.lastIndexOf('.');
            
            if (lastDotIndex === -1 || lastDotIndex === originalnameStr.length - 1) {
                // Pas de point ou point à la fin
                console.log(`⚠️ Pas d'extension dans "${originalnameStr}", utilisation mimetype`);
                return getExtensionFromMimeType(file.mimetype);
            }
            
            const ext = originalnameStr.substring(lastDotIndex + 1).toLowerCase();
            console.log(`🔧 Extension extraite: "${ext}"`);
            
            // Valider l'extension
            const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'];
            if (validExtensions.includes(ext)) {
                return '.' + (ext === 'jpeg' ? 'jpg' : ext);
            }
            
            // Extension invalide
            console.log(`⚠️ Extension "${ext}" invalide, utilisation mimetype`);
            return getExtensionFromMimeType(file.mimetype);
        };

        // Fonction pour obtenir l'extension depuis mimetype
        const getExtensionFromMimeType = (mimetype) => {
            if (!mimetype) return '.jpg';
            
            if (mimetype.includes('jpeg') || mimetype.includes('jpg')) return '.jpg';
            if (mimetype.includes('png')) return '.png';
            if (mimetype.includes('gif')) return '.gif';
            if (mimetype.includes('webp')) return '.webp';
            if (mimetype.includes('pdf')) return '.pdf';
            
            return '.jpg';
        };

        // 📸 Photo - CORRECTION ICI : cherche 'photoUrl' pas 'photo'
        if (req.files?.photoUrl?.[0]) {
            console.log('\n📸 Traitement PHOTO...');
            const photoFile = req.files.photoUrl[0];
            
            // Utiliser notre fonction sécurisée
            const extension = getSafeExtension(photoFile);
            console.log(`📸 Extension finale: ${extension}`);
            
            const timestamp = now.getTime();
            const randomString = Math.random().toString(36).substring(2, 8);
            const safeFirstName = (validatedData.firstName || 'unknown').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
            const safeLastName = (validatedData.lastName || 'unknown').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
            
            const fileName = `photo_${safeFirstName}_${safeLastName}_${year}${month}${day}_${timestamp}_${randomString}${extension}`;
            const filePath = path.join(uploadDir, fileName);
            
            console.log(`💾 Écriture: ${fileName}`);
            // Vérifier si on a un buffer ou un fichier sur disque
            if (photoFile.buffer) {
                fs.writeFileSync(filePath, photoFile.buffer);
            } else if (photoFile.path) {
                // Si le fichier est déjà sur disque (middleware diskStorage)
                fs.copyFileSync(photoFile.path, filePath);
                // Supprimer le fichier temporaire
                fs.unlinkSync(photoFile.path);
            } else {
                throw new Error('Aucun contenu de fichier trouvé');
            }
            
            finalPhotoUrl = `/uploads/visitors/${year}/${month}/${day}/${fileName}`;
            console.log(`✅ Photo URL: ${finalPhotoUrl}`);
        } else {
            console.log('📸 Aucune photo reçue (champ photoUrl non trouvé)');
        }

        // 🆔 ID Scan - CORRECTION ICI : cherche 'idScanUrl' pas 'idScan'
        if (req.files?.idScanUrl?.[0]) {
            console.log('\n🆔 ID Scan trouvé dans "idScanUrl"');
            const idScanFile = req.files.idScanUrl[0];
            
            console.log('\n🆔 Traitement ID SCAN...');
            
            // Utiliser notre fonction sécurisée
            const extension = getSafeExtension(idScanFile);
            console.log(`🆔 Extension finale: ${extension}`);
            
            const timestamp = now.getTime();
            const randomString = Math.random().toString(36).substring(2, 8);
            const safeFirstName = (validatedData.firstName || 'unknown').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
            const safeLastName = (validatedData.lastName || 'unknown').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
            
            const fileName = `idscan_${safeFirstName}_${safeLastName}_${validatedData.idType}_${year}${month}${day}_${timestamp}_${randomString}${extension}`;
            const filePath = path.join(uploadDir, fileName);
            
            console.log(`💾 Écriture: ${fileName}`);
            // Vérifier si on a un buffer ou un fichier sur disque
            if (idScanFile.buffer) {
                fs.writeFileSync(filePath, idScanFile.buffer);
            } else if (idScanFile.path) {
                // Si le fichier est déjà sur disque
                fs.copyFileSync(idScanFile.path, filePath);
                // Supprimer le fichier temporaire
                fs.unlinkSync(idScanFile.path);
            } else {
                throw new Error('Aucun contenu de fichier trouvé');
            }
            
            finalIdScanUrl = `/uploads/visitors/${year}/${month}/${day}/${fileName}`;
            console.log(`✅ ID Scan URL: ${finalIdScanUrl}`);
        } else {
            console.log('🆔 Aucun ID Scan trouvé (champ idScanUrl non trouvé)');
        }

        // 📁 3. PRÉPARER LES DONNÉES POUR LA BD
        const finalData = {
            ...validatedData,
            photoUrl: finalPhotoUrl,
            idScanUrl: finalIdScanUrl
        };
        
        console.log('\n📋 Données finales:', {
            firstName: finalData.firstName,
            lastName: finalData.lastName,
            idType: finalData.idType,
            idNumber: finalData.idNumber,
            photoUrl: finalData.photoUrl ? '✓' : '✗',
            idScanUrl: finalData.idScanUrl ? '✓' : '✗'
        });

        // 📁 4. APPELER LE SERVICE
        console.log('\n👤 Appel au service createOrFindVisitor...');
        const result = await visitorService.createOrFindVisitor(finalData);
        console.log('✅ Résultat:', result.status);

        // 🎉 5. RÉPONSE
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        
        const responseData = {
            success: true,
            message: result.message,
            data: {
                ...result,
                visitor: result.visitor ? {
                    ...result.visitor,
                    photoUrl: result.visitor.photoUrl?.startsWith('/') 
                        ? `${baseUrl}${result.visitor.photoUrl}`
                        : result.visitor.photoUrl,
                    idScanUrl: result.visitor.idScanUrl?.startsWith('/') 
                        ? `${baseUrl}${result.visitor.idScanUrl}`
                        : result.visitor.idScanUrl
                } : null
            }
        };

        console.log('\n🎉 Réponse envoyée avec succès!');
        res.status(result.status === "NEW_VISITOR_CREATED" ? 201 : 200).json(responseData);

    } catch (error) {
        console.error('\n❌ ERREUR FATALE:', error.message);
        console.error('❌ Type:', error.name);
        console.error('❌ Stack complète:');
        console.error(error.stack);
        
        // Vérifier spécifiquement l'erreur path.extname
        if (error.message.includes('path.extname') || 
            error.message.includes('path argument') || 
            error.message.includes('must be of type string')) {
            console.error('\n🔴 ERREUR CONFIRMÉE: path.extname() utilisé quelque part!');
            console.error('🔴 Vérifie dans les logs ci-dessus si originalname est un nombre');
            
            // Si l'erreur vient de getSafeExtension, on peut contourner
            if (error.stack.includes('getSafeExtension')) {
                console.error('🔴 Erreur dans getSafeExtension! Utilisation extension par défaut .jpg');
                // Tu peux forcer .jpg en cas d'erreur
                return res.status(500).json({
                    success: false,
                    message: `Erreur fichier: ${error.message}. Utilisez une extension valide (.jpg, .png, etc.)`
                });
            }
        }
        
        if (error.name === 'ZodError') {
            return res.status(400).json({
                success: false,
                message: 'Données invalides',
                errors: error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            });
        }

        res.status(500).json({
            success: false,
            message: `Erreur lors de la création du visiteur: ${error.message}`
        });
    }
});

    getAllVisitors = asyncHandler(async (req, res) => {
        if (!['ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE', 'CHEF_SERVICE'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé. Permissions insuffisantes pour consulter les visiteurs.'
            });
        }

        const validated = visitorQuerySchema.parse(req.query);
        
        try {
            const result = await visitorService.getAllVisitors(
                validated.page, 
                validated.limit, 
                validated.search,
                validated.company
            );
            res.json({
                success: true,
                data: result.visitors,
                pagination: result.pagination
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    });

    getVisitorById = asyncHandler(async (req, res) => {
        if (!['ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE', 'CHEF_SERVICE'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé. Permissions insuffisantes pour consulter les détails du visiteur.'
            });
        }

        const validated = visitorIdSchema.parse(req.params);
        
        try {
            const visitor = await visitorService.getVisitorById(validated.id);
            res.json({
                success: true,
                data: visitor
            });
        } catch (error) {
            if (error.message.includes('non trouvé')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    });

    updateVisitor = asyncHandler(async (req, res) => {
        if (!['ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE', 'CHEF_SERVICE'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé. Permissions insuffisantes pour modifier un visiteur.'
            });
        }

        const { id } = visitorIdSchema.parse(req.params);
        const validated = updateVisitorSchema.parse(req.body);
        
        try {
            const visitor = await visitorService.updateVisitor(id, validated);
            
            res.json({
                success: true,
                message: 'Visiteur mis à jour avec succès',
                data: visitor
            });
        } catch (error) {
            if (error.message.includes('non trouvé')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    });

    deleteVisitor = asyncHandler(async (req, res) => {
        if (!['ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE', 'CHEF_SERVICE'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé. Permissions insuffisantes pour supprimer un visiteur.'
            });
        }

        const validated = visitorIdSchema.parse(req.params);
        
        try {
            const result = await visitorService.deleteVisitor(validated.id);
            res.json({
                success: true,
                message: result.message
            });
        } catch (error) {
            if (error.message.includes('non trouvé')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            if (error.message.includes('visites associées')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    });

    checkNonDesirable = asyncHandler(async (req, res) => {
        if (!['ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE', 'CHEF_SERVICE'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé. Permissions insuffisantes pour vérifier le statut indésirable.'
            });
        }

        const validated = visitorIdSchema.parse(req.params);
        
        try {
            const result = await visitorService.checkNonDesirable(validated.id);
            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            if (error.message.includes('non trouvé')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    });

    getVisitorStats = asyncHandler(async (req, res) => {
        if (!['ADMIN', 'AGENT_GESTION'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé. Permissions insuffisantes pour consulter les statistiques.'
            });
        }

        try {
            const stats = await visitorService.getVisitorStats();
            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    });

    getVisitorHistory = asyncHandler(async (req, res) => {
        if (!['ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE', 'CHEF_SERVICE'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé. Permissions insuffisantes pour consulter l\'historique.'
            });
        }

        const { id } = visitorIdSchema.parse(req.params);
        const days = req.query.days ? parseInt(req.query.days) : 30;
        
        try {
            const history = await visitorService.getVisitorHistory(id, days);
            res.json({
                success: true,
                data: history
            });
        } catch (error) {
            if (error.message.includes('non trouvé')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    });

    getWeekPlanning = asyncHandler(async (req, res) => {
        if (!['ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE', 'CHEF_SERVICE'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé. Permissions insuffisantes pour consulter le planning.'
            });
        }

        const { siteId } = req.params;
        
        try {
            const planning = await visitorService.getWeekPlanning(siteId);
            
            res.json({
                success: true,
                message: 'Planning de la semaine récupéré avec succès',
                data: planning
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    });

    getvisitorsAgents = asyncHandler(async (req, res) => {
      try {
        const userId = req.params.userId;
        console.log("id de l'agent:", userId)
        const {
          currentOnly = 'true',
          includeInactive = 'false',
          withSiteInfo = 'true',
          withStats = 'false',
          page = '1',
          limit = '20'
        } = req.query;
    
        if (!userId) {
          return res.status(400).json({ success: false, message: "L'ID de l'agent est requis" });
        }
    
        const options = {
          includeInactive: includeInactive === 'true',
          withSiteInfo: withSiteInfo === 'true',
          withStats: withStats === 'true',
          page: parseInt(page),
          limit: parseInt(limit)
        };
    
        if (currentOnly === 'true') {
          options.includeInactive = false; // checkpoints actifs seulement
        }
    
        const result = await checkpointService.getVisitorsByAgent(userId, options);
    
        res.status(200).json(result);
      } catch (error) {
        console.error('Erreur dans getAgentCheckpoints:', error);
        res.status(500).json({ success: false, message: error.message || 'Erreur serveur' });
      }
    })

}

module.exports = new VisitorController();