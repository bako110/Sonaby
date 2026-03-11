const visitorService = require('./visitor.service');
const { createVisitorWithTransform, updateVisitorSchema, visitorIdSchema, visitorQuerySchema, weekPlanningSchema,visitorFilterSchema } = require('./visitor.schema');
const { asyncHandler } = require('../../middleware/asyncHandler');
const uploadService = require('../upload');
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
    if (!['ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE', 'CHEF_SERVICE'].includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Accès refusé.' });
    }

    try {
        
        // 🔹 Nettoyer les données: convertir les chaînes vides en null
        const cleanedData = Object.keys(req.body).reduce((acc, key) => {
            const value = req.body[key];
            // Convertir les chaînes vides, 'false' littéral, etc. en null
            if (value === '' || value === 'null' || value === 'undefined') {
                acc[key] = null;
            } else if (value === 'false') {
                acc[key] = false;
            } else if (value === 'true') {
                acc[key] = true;
            } else {
                acc[key] = value;
            }
            return acc;
        }, {});

        const validatedData = createVisitorWithTransform.parse(cleanedData);

        // 🔹 Mapper les fichiers uploadés avec flexibilité
        const photoFile = req.files?.photoUrl?.[0] || req.files?.photo?.[0];
        const idScanFile = req.files?.idScanUrl?.[0] || req.files?.file?.[0];
        const photoUrl = photoFile ? uploadService.getPublicUrl(photoFile) : null;
        const idScanUrl = idScanFile ? uploadService.getPublicUrl(idScanFile) : null;
        const finalData = { ...validatedData, photoUrl, idScanUrl };

        const result = await visitorService.createOrFindVisitor(finalData);
        res.status(result.status === "NEW_VISITOR_CREATED" ? 201 : 200).json({
            success: true,
            message: result.message,
            data: {
                ...result,
                visitor: result.visitor
            }
        });

    } catch (error) {
        console.error('❌ Error creating visitor:', error.message);
        console.error('❌ Stack:', error.stack);
        if (error.name === 'ZodError') {
            console.error('🔴 Zod validation errors:', JSON.stringify(error.errors, null, 2));
            return res.status(400).json({
                success: false,
                message: 'Données invalides',
                errors: error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                    code: err.code
                }))
            });
        }
        res.status(500).json({ success: false, message: error.message });
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
