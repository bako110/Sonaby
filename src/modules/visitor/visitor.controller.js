const visitorService = require('./visitor.service');
const { createVisitorWithTransform, updateVisitorSchema, visitorIdSchema, visitorQuerySchema, weekPlanningSchema } = require('./visitor.schema');
const { asyncHandler } = require('../../middleware/asyncHandler');
const path = require('path');
const fs = require('fs');

class VisitorController {
    getFilteredVisitors = asyncHandler(async (req, res) => {
        const filters = {
            ...req.query,
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10
        };

        const result = await visitorService.getFilteredVisitors(filters);
        
        res.status(200).json({
            success: true,
            message: 'Visiteurs filtrés récupérés avec succès',
            data: result.visitors,
            pagination: result.pagination,
            filterOptions: result.filterOptions,
            filters: filters
        });
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
        console.log('📥 Données reçues:', JSON.stringify(req.body, null, 2).substring(0, 500));
        
        // 📁 1. VALIDER LES DONNÉES
        const validated = createVisitorWithTransform.parse(req.body);
        console.log('✅ Données validées:', {
            firstName: validated.firstName,
            lastName: validated.lastName,
            idType: validated.idType,
            idNumber: validated.idNumber,
            photoIsBase64: validated._photoData?.isBase64 || false,
            idScanIsBase64: validated._idScanData?.isBase64 || false
        });
        
        // 📁 2. TRAITEMENT DES FICHIERS (Base64 ou URLs)
        let finalPhotoUrl = null;
        let finalIdScanUrl = null;
        
        console.log('📁 Début traitement des fichiers...');
        
        // 📅 Créer la structure de dossier par date
        const now = new Date();
        const year = now.getFullYear().toString();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        
        // Chemin : uploads/visitors/2025/12/03
        const baseUploadDir = path.join(__dirname, '../../../public/uploads/visitors');
        const uploadDir = path.join(baseUploadDir, year, month, day);
        
        console.log('📂 Chemin upload:', uploadDir);
        
        // Créer les dossiers récursivement
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
            console.log('📁 Dossiers créés:', uploadDir);
        }

        // 📸 TRAITEMENT DE LA PHOTO
        if (validated._photoData) {
            if (validated._photoData.isBase64) {
                // CAS 1: Base64 -> sauvegarder fichier
                console.log('📸 Traitement photo Base64...');
                const { fileName, base64 } = validated._photoData;
                
                // Générer un nom de fichier unique
                const timestamp = now.getTime();
                const randomString = Math.random().toString(36).substring(2, 8);
                const safeFirstName = validated.firstName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
                const safeLastName = validated.lastName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
                
                const photoFileName = `photo_${safeFirstName}_${safeLastName}_${year}${month}${day}_${timestamp}_${randomString}.${fileName.split('.').pop() || 'jpg'}`;
                const photoPath = path.join(uploadDir, photoFileName);
                
                // Convertir Base64 en buffer
                console.log('🔧 Conversion Base64 -> Buffer...');
                const photoBuffer = Buffer.from(base64, 'base64');
                console.log(`📏 Taille buffer photo: ${photoBuffer.length} bytes`);
                
                // Écrire le fichier
                fs.writeFileSync(photoPath, photoBuffer);
                console.log(`💾 Photo écrite: ${photoPath}`);
                
                // URL relative
                finalPhotoUrl = `/uploads/visitors/${year}/${month}/${day}/${photoFileName}`;
                console.log(`✅ Photo sauvegardée: ${finalPhotoUrl}`);
                
            } else if (validated._photoData.url) {
                // CAS 2: URL existante
                finalPhotoUrl = validated._photoData.url;
                console.log('📸 URL photo existante utilisée:', finalPhotoUrl);
            }
        }

        // 🆔 TRAITEMENT DU SCAN D'IDENTITÉ
        if (validated._idScanData) {
            if (validated._idScanData.isBase64) {
                // CAS 1: Base64 -> sauvegarder fichier
                console.log('🆔 Traitement ID scan Base64...');
                const { fileName, base64 } = validated._idScanData;
                
                const timestamp = now.getTime();
                const randomString = Math.random().toString(36).substring(2, 8);
                const safeFirstName = validated.firstName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
                const safeLastName = validated.lastName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
                
                const idScanFileName = `idscan_${safeFirstName}_${safeLastName}_${validated.idType}_${year}${month}${day}_${timestamp}_${randomString}.${fileName.split('.').pop() || 'jpg'}`;
                const idScanPath = path.join(uploadDir, idScanFileName);
                
                // Convertir Base64 en buffer
                console.log('🔧 Conversion Base64 ID scan -> Buffer...');
                const idScanBuffer = Buffer.from(base64, 'base64');
                console.log(`📏 Taille buffer ID scan: ${idScanBuffer.length} bytes`);
                
                // Écrire le fichier
                fs.writeFileSync(idScanPath, idScanBuffer);
                console.log(`💾 ID scan écrit: ${idScanPath}`);
                
                // URL relative
                finalIdScanUrl = `/uploads/visitors/${year}/${month}/${day}/${idScanFileName}`;
                console.log(`✅ ID Scan sauvegardé: ${finalIdScanUrl}`);
                
            } else if (validated._idScanData.url) {
                // CAS 2: URL existante
                finalIdScanUrl = validated._idScanData.url;
                console.log('🆔 URL ID scan existante utilisée:', finalIdScanUrl);
            }
        }
        
        console.log('📁 Traitement fichiers terminé!');

        // 📁 3. PRÉPARER LES DONNÉES POUR LA BD
        const finalData = {
            firstName: validated.firstName,
            lastName: validated.lastName,
            birthDate: validated.birthDate,
            birthPlace: validated.birthPlace,
            residence: validated.residence,
            sexe: validated.sexe,
            givingDate: validated.givingDate,
            expirationDate: validated.expirationDate,
            phone: validated.phone,
            email: validated.email,
            idType: validated.idType,
            idNumber: validated.idNumber,
            photoUrl: finalPhotoUrl,  // URL finale (générée ou existante)
            idScanUrl: finalIdScanUrl, // URL finale (générée ou existante)
            isBlacklisted: validated.isBlacklisted,
            blacklistReason: validated.blacklistReason,
            company: validated.company,
            emergencyContactPhone: validated.emergencyContactPhone,
            emergencyContactName: validated.emergencyContactName
        };

        console.log('📋 Données pour BD:', {
            firstName: finalData.firstName,
            lastName: finalData.lastName,
            idType: finalData.idType,
            idNumber: finalData.idNumber,
            photoUrl: finalData.photoUrl,
            idScanUrl: finalData.idScanUrl
        });

        // 📁 4. APPELER LE SERVICE
        console.log('👤 Appel au service createOrFindVisitor...');
        const result = await visitorService.createOrFindVisitor(finalData);
        console.log('✅ Résultat service:', result.status);

        // 🎉 5. RÉPONSE (convertir les URLs relatives en absolues)
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        
        const responseData = {
            ...result,
            visitor: result.visitor ? {
                ...result.visitor,
                // Convertir URLs relatives en absolues si besoin
                photoUrl: result.visitor.photoUrl?.startsWith('/') 
                    ? `${baseUrl}${result.visitor.photoUrl}`
                    : result.visitor.photoUrl,
                idScanUrl: result.visitor.idScanUrl?.startsWith('/') 
                    ? `${baseUrl}${result.visitor.idScanUrl}`
                    : result.visitor.idScanUrl
            } : null
        };

        console.log('🎉 Visiteur traité avec succès!');
        res.status(result.status === "NEW_VISITOR_CREATED" ? 201 : 200).json({
            success: true,
            message: result.message,
            data: responseData
        });

    } catch (error) {
        console.error('❌ ERREUR:', error.message);
        console.error('Stack:', error.stack);
        
        if (error.name === 'ZodError') {
            return res.status(400).json({
                success: false,
                message: 'Données invalides',
                errors: error.errors ? error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                })) : []
            });
        }

        if (error.message.includes('Unique constraint failed')) {
            return res.status(400).json({
                success: false,
                message: `Un visiteur avec ce type et numéro d'identité existe déjà.`
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

}

module.exports = new VisitorController();