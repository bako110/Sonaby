const incidentService = require('./incident.service');
const { createIncidentSchema, incidentIdSchema, incidentQuerySchema } = require('./incident.schema');
const { asyncHandler } = require('../../middleware/asyncHandler');

class IncidentController {
  createIncident = asyncHandler(async (req, res) => {
    if (!['ADMIN', 'AGENT_GESTION', 'CHEF_SERVICE'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.'
      });
    }

    const validated = createIncidentSchema.parse(req.body);
    
    try {
      const incident = await incidentService.createIncident(validated, req.user.id);
      res.status(201).json({
        success: true,
        message: 'Incident créé avec succès',
        data: incident
      });
    } catch (error) {
      if (error.message.includes('non trouvé')) {
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

  getAllIncidents = asyncHandler(async (req, res) => {
    if (!['ADMIN', 'AGENT_GESTION', 'CHEF_SERVICE'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.'
      });
    }

    const validated = incidentQuerySchema.parse(req.query);
    
    try {
      const result = await incidentService.getAllIncidents(
        validated.page, 
        validated.limit, 
        validated.search,
        validated.visitorId,
        validated.serviceId
      );
      res.json({
        success: true,
        data: result.incidents,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  getIncidentById = asyncHandler(async (req, res) => {
    if (!['ADMIN', 'AGENT_GESTION', 'CHEF_SERVICE'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.'
      });
    }

    const validated = incidentIdSchema.parse(req.params);
    
    try {
      const incident = await incidentService.getIncidentById(validated.id);
      res.json({
        success: true,
        data: incident
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

  deleteIncident = asyncHandler(async (req, res) => {
    if (!['ADMIN', 'AGENT_GESTION', 'CHEF_SERVICE'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.'
      });
    }

    const validated = incidentIdSchema.parse(req.params);
    
    try {
      const result = await incidentService.deleteIncident(validated.id);
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
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });
}

module.exports = new IncidentController();
