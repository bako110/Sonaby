const visitService = require('./visit.service');
const { createVisitSchema, updateVisitSchema, visitIdSchema, visitQuerySchema, checkoutSchema } = require('./visit.schema');
const { asyncHandler } = require('../../middleware/asyncHandler');

class VisitController {
  getFilteredVisits = asyncHandler(async (req, res) => {
    const filters = {
      ...req.query,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10
    };

    const result = await visitService.getFilteredVisits(filters);
    
    res.status(200).json({
      success: true,
      message: 'Visites filtrées récupérées avec succès',
      data: result.visits,
      pagination: result.pagination,
      filterOptions: result.filterOptions,
      filters: filters
    });
  });

  getFilterOptions = asyncHandler(async (req, res) => {
    try {
      // Construire les filtres à partir des query params (sauf les options)
      const { page, limit, ...currentFilters } = req.query;
      
      const filterOptions = await visitService.getFilterOptions(currentFilters);
      
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

  createVisit = asyncHandler(async (req, res) => {
    // Vérifier les permissions ADMIN, AGENT_GESTION, AGENT_CONTROLE
    if (!['ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes pour créer une visite.'
      });
    }

    const validated = createVisitSchema.parse(req.body);
    
    // Ajouter l'ID du créateur
    const visitData = {
      ...validated,
      createdBy: req.user.userId
    };
    
    try {
      const result = await visitService.createVisit(visitData);
      
      // Si la personne est blacklistée
      if (result.isBlacklisted) {
        return res.status(403).json({
          success: false,
          isBlacklisted: true,
          blacklistType: result.blacklistType,
          message: result.message,
          blacklistDetails: result.blacklistDetails,
          visitorInfo: result.visitorInfo,
          alert: {
            type: 'SECURITY_ALERT',
            level: 'HIGH',
            action: 'DENY_ACCESS',
            timestamp: new Date().toISOString()
          }
        });
      }
      
      // Succès - visite créée
      res.status(201).json({
        success: true,
        isBlacklisted: false,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      if (error.message.includes('non trouvé') || error.message.includes('en cours') || error.message.includes('requis')) {
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

  getAllVisits = asyncHandler(async (req, res) => {
    // Vérifier les permissions ADMIN, AGENT_GESTION, AGENT_CONTROLE
    if (!['ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE', 'CHEF_SERVICE'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes pour consulter les visites.'
      });
    }

    const validated = visitQuerySchema.parse(req.query);
    
    try {
      const result = await visitService.getAllVisits(
        validated.page, 
        validated.limit, 
        validated.search,
        validated.visitorId,
        validated.checkpointId,
        validated.serviceId,
        validated.status
      );
      res.json({
        success: true,
        data: result.visits,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  getVisitById = asyncHandler(async (req, res) => {
    // Vérifier les permissions ADMIN, AGENT_GESTION, AGENT_CONTROLE
    if (!['ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes pour consulter les détails de la visite.'
      });
    }

    const validated = visitIdSchema.parse(req.params);
    
    try {
      const visit = await visitService.getVisitById(validated.id);
      res.json({
        success: true,
        data: visit
      });
    } catch (error) {
      if (error.message.includes('non trouvée')) {
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

  checkoutVisit = asyncHandler(async (req, res) => {
    // Vérifier les permissions ADMIN, AGENT_GESTION, AGENT_CONTROLE
    if (!['ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes pour terminer une visite.'
      });
    }

    const { id } = visitIdSchema.parse(req.params);
    const { endAt } = checkoutSchema.parse(req.body);
    
    try {
      const visit = await visitService.checkoutVisit(id, endAt);
      res.json({
        success: true,
        message: 'Visite terminée avec succès',
        data: visit
      });
    } catch (error) {
      if (error.message.includes('non trouvée')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      if (error.message.includes('déjà terminée')) {
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

  deleteVisit = asyncHandler(async (req, res) => {
    // Vérifier les permissions ADMIN, AGENT_GESTION, AGENT_CONTROLE
    if (!['ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes pour supprimer une visite.'
      });
    }

    const validated = visitIdSchema.parse(req.params);
    
    try {
      const result = await visitService.deleteVisit(validated.id);
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      if (error.message.includes('non trouvée')) {
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

  getVisitStats = asyncHandler(async (req, res) => {
    // Vérifier les permissions ADMIN, AGENT_GESTION
    if (!['ADMIN', 'AGENT_GESTION'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes pour consulter les statistiques.'
      });
    }

    try {
      const stats = await visitService.getVisitStats();
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

  getActiveVisits = asyncHandler(async (req, res) => {
    // Vérifier les permissions ADMIN, AGENT_GESTION, AGENT_CONTROLE
    if (!['ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes pour consulter les visites actives.'
      });
    }

    try {
      const activeVisits = await visitService.getActiveVisits();
      res.json({
        success: true,
        data: activeVisits,
        count: activeVisits.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  getVisitorsByCheckpointByDay = asyncHandler(async (req, res) => {
    // Vérifier les permissions ADMIN, AGENT_GESTION, AGENT_CONTROLE, CHEF_SERVICE
    if (!['ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE', 'CHEF_SERVICE'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes pour consulter les visiteurs du checkpoint.'
      });
    }

    const { checkpointId } = req.params;
    const { date } = req.query;
    
    // Valider que la date est fournie
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'La date est requise (format: YYYY-MM-DD)'
      });
    }
    
    try {
      const result = await visitService.getVisitorsByCheckpointByDay(checkpointId, date);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  getFinishedVisits = asyncHandler(async (req, res) => {
        const { checkpointId } = req.params;

        if (!checkpointId) {
            return res.status(400).json({
                success: false,
                message: "Le checkpointId est requis."
            });
        }

        try {
            const visits = await visitService.getFinishedVisitsByCheckpoint(checkpointId);

            return res.json({
                success: true,
                total: visits.length,
                data: visits
            });
        } catch (error) {
            console.error("❌ Controller getFinishedVisits:", error);
            return res.status(500).json({
                success: false,
                message: "Erreur serveur lors de la récupération des visites terminées."
            })
        } 
    });

}

module.exports = new VisitController();
