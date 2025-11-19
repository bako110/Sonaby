const sosService = require('./sos.service');
const { createSOSSchema, sosIdSchema, sosQuerySchema, deactivateSOSSchema } = require('./sos.schema');
const { asyncHandler } = require('../../middleware/asyncHandler');

class SOSController {
  createSOS = asyncHandler(async (req, res) => {
    if (!['ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.'
      });
    }

    const validated = createSOSSchema.parse(req.body);
    
    try {
      const sos = await sosService.createSOS(validated, req.user.id);
      res.status(201).json({
        success: true,
        message: 'SOS envoyé avec succès',
        data: sos
      });
    } catch (error) {
      if (error.message.includes('non trouvé') || error.message.includes('déjà actif')) {
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

  getAllSOS = asyncHandler(async (req, res) => {
    if (!['ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.'
      });
    }

    const validated = sosQuerySchema.parse(req.query);
    
    try {
      const result = await sosService.getAllSOS(
        validated.page, 
        validated.limit, 
        validated.checkpointId,
        validated.active
      );
      res.json({
        success: true,
        data: result.sosAlerts,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  getSOSById = asyncHandler(async (req, res) => {
    if (!['ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.'
      });
    }

    const validated = sosIdSchema.parse(req.params);
    
    try {
      const sos = await sosService.getSOSById(validated.id);
      res.json({
        success: true,
        data: sos
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

  deactivateSOS = asyncHandler(async (req, res) => {
    if (!['ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.'
      });
    }

    const validated = sosIdSchema.parse(req.params);
    
    try {
      const sos = await sosService.deactivateSOS(validated.id);
      res.json({
        success: true,
        message: 'SOS désactivé avec succès',
        data: sos
      });
    } catch (error) {
      if (error.message.includes('non trouvé')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      if (error.message.includes('déjà désactivé')) {
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

  getActiveSOS = asyncHandler(async (req, res) => {
    if (!['ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.'
      });
    }

    try {
      const activeSOS = await sosService.getActiveSOS();
      res.json({
        success: true,
        data: activeSOS,
        count: activeSOS.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  getSOSStats = asyncHandler(async (req, res) => {
    if (!['ADMIN', 'AGENT_GESTION'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.'
      });
    }

    try {
      const stats = await sosService.getSOSStats();
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
}

module.exports = new SOSController();
