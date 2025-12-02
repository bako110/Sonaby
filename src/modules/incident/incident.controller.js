const incidentService = require('./incident.service');
const { createIncidentSchema, updateIncidentSchema, resolveIncidentSchema, incidentIdSchema, incidentQuerySchema } = require('./incident.schema');
const { asyncHandler } = require('../../middleware/asyncHandler');

class IncidentController {
  createIncident = asyncHandler(async (req, res) => {
    console.log('DEBUG - req.user:', req.user); // Debug pour voir ce que contient req.user
    
    if (!['ADMIN', 'AGENT_GESTION', 'CHEF_SERVICE', 'AGENT_CONTROLE'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.'
      });
    }

    const validated = createIncidentSchema.parse(req.body);
    
    try {
      // Utiliser req.user.userId au lieu de req.user.id
      const reporterId = req.user?.userId || req.user?.id || '880e8400-e29b-41d4-a716-446655440000';
      console.log('DEBUG - Using reporterId:', reporterId);
      
      const result = await incidentService.createIncident(validated, reporterId);
      res.status(201).json(result);
    } catch (error) {
      if (error.message.includes('non trouvé') || error.message.includes('requis')) {
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

  getIncidents = asyncHandler(async (req, res) => {
    if (!['ADMIN', 'AGENT_GESTION', 'CHEF_SERVICE', 'AGENT_CONTROLE'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.'
      });
    }

    const validated = incidentQuerySchema.parse(req.query);
    
    try {
      const result = await incidentService.getIncidents(validated);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  getIncidentsByVisitor = asyncHandler(async (req, res) => {
    if (!['ADMIN', 'AGENT_GESTION', 'CHEF_SERVICE', 'AGENT_CONTROLE'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.'
      });
    }

    const { visitorId } = req.params;
    const filters = req.query;
    
    try {
      const result = await incidentService.getIncidentsByVisitor(visitorId, filters);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  getIncidentById = asyncHandler(async (req, res) => {
    if (!['ADMIN', 'AGENT_GESTION', 'CHEF_SERVICE', 'AGENT_CONTROLE'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.'
      });
    }

    const validated = incidentIdSchema.parse(req.params);
    
    try {
      const result = await incidentService.getIncidentById(validated.id);
      res.json(result);
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

  updateIncident = asyncHandler(async (req, res) => {
    if (!['ADMIN', 'AGENT_GESTION', 'CHEF_SERVICE'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.'
      });
    }

    const { id } = incidentIdSchema.parse(req.params);
    const validated = updateIncidentSchema.parse(req.body);
    
    try {
      const result = await incidentService.updateIncident(id, validated, req.user.id);
      res.json(result);
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

  resolveIncident = asyncHandler(async (req, res) => {
    if (!['ADMIN', 'AGENT_GESTION', 'CHEF_SERVICE'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.'
      });
    }

    const { id } = incidentIdSchema.parse(req.params);
    const validated = resolveIncidentSchema.parse(req.body);
    
    try {
      const result = await incidentService.resolveIncident(id, validated, req.user.id);
      res.json(result);
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

  deleteIncident = asyncHandler(async (req, res) => {
    if (!['ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Seuls les administrateurs peuvent supprimer des incidents.'
      });
    }

    const validated = incidentIdSchema.parse(req.params);
    
    try {
      const result = await incidentService.deleteIncident(validated.id);
      res.json(result);
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

  getIncidentStatistics = asyncHandler(async (req, res) => {
    if (!['ADMIN', 'AGENT_GESTION', 'CHEF_SERVICE'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.'
      });
    }

    const validated = incidentQuerySchema.parse(req.query);
    
    try {
      const result = await incidentService.getIncidentStatistics(validated);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });
}

module.exports = new IncidentController();
