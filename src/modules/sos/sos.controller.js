const sosService = require('./sos.service');
const { createSOSSchema, createGeneralSOSSchema, sosIdSchema, sosQuerySchema, deactivateSOSSchema } = require('./sos.schema');
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
    
    console.log('🔍 DEBUG CONTROLLER - req.user:', req.user);
    console.log('🔍 DEBUG CONTROLLER - req.user.userId:', req.user?.userId);
    
    // Ajouter l'utilisateur authentifié comme triggeredBy si non fourni
    if (!validated.triggeredBy) {
      validated.triggeredBy = req.user.userId;
    }
    
    try {
      const sos = await sosService.createSOS(validated, req.user.userId);
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

  createGeneralSOS = asyncHandler(async (req, res) => {
    if (!['ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.'
      });
    }

    const validated = createGeneralSOSSchema.parse(req.body);
    
    console.log('🔍 DEBUG CONTROLLER - req.user:', req.user);
    console.log('🔍 DEBUG CONTROLLER - req.user.userId:', req.user?.userId);
    
    // Ajouter l'utilisateur authentifié comme triggeredBy si non fourni
    if (!validated.triggeredBy) {
      validated.triggeredBy = req.user.userId;
    }
    
    try {
      const sos = await sosService.createGeneralSOS(validated, req.user.userId);
      res.status(201).json({
        success: true,
        message: 'Alerte SOS générale déclenchée avec succès',
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
      const sos = await sosService.deactivateSOS(validated.id, req.user.userId);
      res.json({
        success: true,
        message: 'SOS résolu avec succès',
        data: sos
      });
    } catch (error) {
      if (error.message.includes('non trouvé')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      if (error.message.includes('déjà résolu')) {
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
