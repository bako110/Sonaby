const incidentService = require('./incident.service');
const { createIncidentSchema, updateIncidentSchema, resolveIncidentSchema, incidentIdSchema, incidentQuerySchema } = require('./incident.schema');
const { asyncHandler } = require('../../middleware/asyncHandler');

class IncidentController {
  createIncident = asyncHandler(async (req, res) => {
    if (!['ADMIN', 'AGENT_GESTION', 'CHEF_SERVICE', 'AGENT_CONTROLE'].includes(req.user?.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.'
      });
    }

    const validated = createIncidentSchema.parse(req.body);
    
    try {
      const reporterId = req.user?.userId || req.user?.id;
      
      if (!reporterId) {
        return res.status(400).json({
          success: false,
          message: 'ID du rapporteur non trouvé dans la requête.'
        });
      }
      
      const result = await incidentService.createIncident(validated, reporterId);
      res.status(201).json(result);
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: error.errors
        });
      }
      
      if (error.message.includes('non trouvé') || error.message.includes('requis')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      console.error('Erreur création incident:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  });

  getIncidents = asyncHandler(async (req, res) => {
    if (!['ADMIN', 'AGENT_GESTION', 'CHEF_SERVICE', 'AGENT_CONTROLE'].includes(req.user?.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.'
      });
    }

    try {
      const validated = incidentQuerySchema.parse(req.query);
      const result = await incidentService.getIncidents(validated);
      res.json(result);
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: 'Paramètres de requête invalides',
          errors: error.errors
        });
      }
      
      console.error('Erreur récupération incidents:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  });

  getIncidentsByVisitor = asyncHandler(async (req, res) => {
    if (!['ADMIN', 'AGENT_GESTION', 'CHEF_SERVICE', 'AGENT_CONTROLE'].includes(req.user?.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.'
      });
    }

    const { visitorId } = req.params;
    
    try {
      const validatedQuery = incidentQuerySchema.parse(req.query);
      const result = await incidentService.getIncidentsByVisitor(visitorId, validatedQuery);
      res.json(result);
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: 'Paramètres de requête invalides',
          errors: error.errors
        });
      }
      
      console.error('Erreur récupération incidents visiteur:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  });

  // Récupérer les incidents d'un visiteur à partir d'un visitId
  getIncidentsByVisitIdVisitor = asyncHandler(async (req, res) => {
    const { visitId } = req.params;
    
    if (!['ADMIN', 'AGENT_GESTION', 'CHEF_SERVICE', 'AGENT_CONTROLE'].includes(req.user?.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.'
      });
    }
    
    try {
      // Récupérer la visite et le visiteur associé
      const visitService = require('../visit/visit.service');
      const visit = await visitService.getVisitById(visitId);
      
      if (!visit) {
        return res.status(404).json({ 
          success: false, 
          message: "Visite non trouvée." 
        });
      }
      
      if (!visit.visitor || !visit.visitor.id) {
        return res.status(404).json({ 
          success: false, 
          message: "Visiteur non trouvé pour cette visite." 
        });
      }
      
      // Utiliser la méthode existante pour récupérer les incidents du visiteur
      const validatedQuery = incidentQuerySchema.parse(req.query);
      const result = await incidentService.getIncidentsByVisitor(visit.visitor.id, validatedQuery);
      
      res.json(result);
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: 'Paramètres de requête invalides',
          errors: error.errors
        });
      }
      
      console.error('Erreur getIncidentsByVisitIdVisitor:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erreur interne du serveur' 
      });
    }
  });

  getIncidentById = asyncHandler(async (req, res) => {
    if (!['ADMIN', 'AGENT_GESTION', 'CHEF_SERVICE', 'AGENT_CONTROLE'].includes(req.user?.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.'
      });
    }

    try {
      const validated = incidentIdSchema.parse(req.params);
      const result = await incidentService.getIncidentById(validated.id);
      
      res.json(result);
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: 'ID d\'incident invalide',
          errors: error.errors
        });
      }
      
      if (error.message.includes('non trouvé')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      console.error('Erreur récupération incident par ID:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  });

  updateIncident = asyncHandler(async (req, res) => {
    if (!['ADMIN', 'AGENT_GESTION', 'CHEF_SERVICE'].includes(req.user?.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.'
      });
    }

    try {
      const { id } = incidentIdSchema.parse(req.params);
      const validated = updateIncidentSchema.parse(req.body);
      
      const updaterId = req.user?.userId || req.user?.id;
      if (!updaterId) {
        return res.status(400).json({
          success: false,
          message: 'ID de l\'utilisateur non trouvé dans la requête.'
        });
      }
      
      const result = await incidentService.updateIncident(id, validated, updaterId);
      res.json(result);
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: error.errors
        });
      }
      
      if (error.message.includes('non trouvé')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      console.error('Erreur mise à jour incident:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  });

  resolveIncident = asyncHandler(async (req, res) => {
    if (!['ADMIN', 'AGENT_GESTION', 'CHEF_SERVICE'].includes(req.user?.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.'
      });
    }

    try {
      const { id } = incidentIdSchema.parse(req.params);
      const validated = resolveIncidentSchema.parse(req.body);
      
      const resolverId = req.user?.userId || req.user?.id;
      if (!resolverId) {
        return res.status(400).json({
          success: false,
          message: 'ID de l\'utilisateur non trouvé dans la requête.'
        });
      }
      
      const result = await incidentService.resolveIncident(id, validated, resolverId);
      res.json(result);
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: error.errors
        });
      }
      
      if (error.message.includes('non trouvé')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      console.error('Erreur résolution incident:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  });

  deleteIncident = asyncHandler(async (req, res) => {
    if (!['ADMIN'].includes(req.user?.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Seuls les administrateurs peuvent supprimer des incidents.'
      });
    }

    try {
      const validated = incidentIdSchema.parse(req.params);
      const result = await incidentService.deleteIncident(validated.id);
      
      res.json(result);
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: 'ID d\'incident invalide',
          errors: error.errors
        });
      }
      
      if (error.message.includes('non trouvé')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      console.error('Erreur suppression incident:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  });

  getIncidentStatistics = asyncHandler(async (req, res) => {
    if (!['ADMIN', 'AGENT_GESTION', 'CHEF_SERVICE'].includes(req.user?.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.'
      });
    }

    try {
      const validated = incidentQuerySchema.parse(req.query);
      const result = await incidentService.getIncidentStatistics(validated);
      
      res.json(result);
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: 'Paramètres de requête invalides',
          errors: error.errors
        });
      }
      
      console.error('Erreur statistiques incidents:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  });

  getWeeklyIncidents = asyncHandler(async (req, res) => {
    const { siteId } = req.params;

    if (!siteId) {
      return res.status(400).json({
        success: false,
        message: "Le siteId est requis."
      });
    }

    try {
      const result = await incidentService.getWeeklyIncidentsBySite(siteId);

      res.json({
        success: true,
        total: result.data?.length || 0,
        data: result.data || []
      });
    } catch (error) {
      console.error("❌ Controller getWeeklyIncidents:", error);
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la récupération des incidents de la semaine."
      });
    }
  });

  getIncidentsByCheckpoint = asyncHandler(async (req, res) => {
    const { checkpointId } = req.params;
    
    if (!checkpointId) {
      return res.status(400).json({
        success: false,
        message: "Le checkpointId est requis."
      });
    }

    try {
      const result = await incidentService.getWeeklyIncidentsByCheckpoint(checkpointId);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error('Erreur contrôleur getIncidentsByCheckpoint:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la récupération des incidents par checkpoint'
      });
    }
  });
}

module.exports = new IncidentController();