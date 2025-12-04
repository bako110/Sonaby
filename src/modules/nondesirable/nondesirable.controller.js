const nonDesirableService = require('./nondesirable.service');
const { createNonDesirableSchema, createUnknownNonDesirableSchema, nonDesirableIdSchema, nonDesirableQuerySchema } = require('./nondesirable.schema');
const { asyncHandler } = require('../../middleware/asyncHandler');

class NonDesirableController {
  createNonDesirable = asyncHandler(async (req, res) => {
    if (!['ADMIN', 'AGENT_GESTION'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.'
      });
    }

    const validated = createNonDesirableSchema.parse(req.body);
    
    try {
      const nonDesirable = await nonDesirableService.createNonDesirable(validated, req.user.userId);
      res.status(201).json({
        success: true,
        message: 'Visiteur marqué comme indésirable avec succès',
        data: nonDesirable
      });
    } catch (error) {
      if (error.message.includes('non trouvé') || error.message.includes('déjà marqué')) {
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

  getAllNonDesirables = asyncHandler(async (req, res) => {
    if (!['ADMIN', 'AGENT_GESTION'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.'
      });
    }

    const validated = nonDesirableQuerySchema.parse(req.query);
    
    try {
      const result = await nonDesirableService.getAllNonDesirables(
        validated.page, 
        validated.limit, 
        validated.search
      );
      res.json({
        success: true,
        data: result.nonDesirables,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  removeNonDesirable = asyncHandler(async (req, res) => {
    if (!['ADMIN', 'AGENT_GESTION'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.'
      });
    }

    const { visitorId } = req.params;
    
    try {
      const result = await nonDesirableService.removeNonDesirable(visitorId, req.user.id);
      res.json({
        success: true,
        message: 'Visiteur retiré de la liste des indésirables avec succès',
        data: result
      });
    } catch (error) {
      if (error.message.includes('non trouvé') || error.message.includes('pas blacklisté')) {
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

  deleteNonDesirable = asyncHandler(async (req, res) => {
    if (!['ADMIN', 'AGENT_GESTION'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.'
      });
    }

    const validated = nonDesirableIdSchema.parse(req.params);
    
    try {
      const result = await nonDesirableService.deleteNonDesirable(validated.id);
      res.json({
        success: true,
        message: result.message,
        data: result.visitor
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

  createUnknownNonDesirable = asyncHandler(async (req, res) => {
    // Seuls les ADMIN peuvent créer des indésirables inconnus
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Seuls les administrateurs peuvent créer des indésirables inconnus.'
      });
    }

    const validated = createUnknownNonDesirableSchema.parse(req.body);
    
    try {
      const unknownNonDesirable = await nonDesirableService.createUnknownNonDesirable(validated, req.user.userId);
      res.status(201).json({
        success: true,
        message: 'Indésirable inconnu ajouté à la liste avec succès',
        data: unknownNonDesirable
      });
    } catch (error) {
      if (error.message.includes('déjà dans la liste')) {
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

  getKnownNonDesirables = asyncHandler(async (req, res) => {
  const data = await nonDesirableService.getAllNonDesirablesKnown(
    req.query.page,
    req.query.limit,
    req.query.search
  );

  res.json({ success: true, data });
});


getUnknownNonDesirables = asyncHandler(async (req, res) => {
  const data = await nonDesirableService.getAllNonDesirablesUnknown(
    req.query.page,
    req.query.limit,
    req.query.search
  );

  res.json({ success: true, data });
});


}

module.exports = new NonDesirableController();
