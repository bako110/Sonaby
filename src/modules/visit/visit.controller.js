const visitService = require('./visit.service');
const { createVisitSchema, updateVisitSchema, visitIdSchema, visitQuerySchema, checkoutSchema } = require('./visit.schema');
const { asyncHandler } = require('../../middleware/asyncHandler');

class VisitController {
  createVisit = asyncHandler(async (req, res) => {
    // Vérifier les permissions ADMIN, AGENT_GESTION, AGENT_CONTROLE
    if (!['ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes pour créer une visite.'
      });
    }

    const validated = createVisitSchema.parse(req.body);
    
    try {
      const visit = await visitService.createVisit(validated);
      res.status(201).json({
        success: true,
        message: 'Visite créée avec succès',
        data: visit
      });
    } catch (error) {
      if (error.message.includes('non trouvé') || error.message.includes('indésirable') || error.message.includes('en cours')) {
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
    if (!['ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE'].includes(req.user.role)) {
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
}

module.exports = new VisitController();
