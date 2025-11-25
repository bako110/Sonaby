const blacklistService = require('./blacklist.service');
const { 
  addBlacklistSchema, 
  removeBlacklistSchema, 
  blacklistQuerySchema,
  visitorIdSchema 
} = require('./blacklist.schema');
const { asyncHandler } = require('../../middleware/asyncHandler');

class BlacklistController {
  // Vérifier le statut blacklist d'un visiteur
  checkVisitorBlacklist = asyncHandler(async (req, res) => {
    const { id } = visitorIdSchema.parse(req.params);
    
    try {
      const result = await blacklistService.checkVisitorBlacklist(id);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  });

  // Ajouter un visiteur à la blacklist (agents seulement)
  addToBlacklist = asyncHandler(async (req, res) => {
    // Vérifier les permissions
    if (!['ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Seuls les agents peuvent ajouter à la blacklist.'
      });
    }

    const { id } = visitorIdSchema.parse(req.params);
    const blacklistData = addBlacklistSchema.parse(req.body);
    
    try {
      const result = await blacklistService.addToBlacklistByAgent(id, blacklistData, req.user.userId);
      res.status(201).json({
        success: true,
        message: result.message,
        data: result.blacklistEntry
      });
    } catch (error) {
      if (error.message.includes('non trouvé') || error.message.includes('déjà blacklisté')) {
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

  // Retirer un visiteur de la blacklist agent
  removeFromBlacklist = asyncHandler(async (req, res) => {
    // Vérifier les permissions
    if (!['ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Seuls les agents peuvent retirer de la blacklist.'
      });
    }

    const { id } = visitorIdSchema.parse(req.params);
    const { reason } = removeBlacklistSchema.parse(req.body);
    
    try {
      const result = await blacklistService.removeFromBlacklistByAgent(id, reason, req.user.userId);
      res.json({
        success: true,
        message: result.message,
        data: result.unblacklistEntry
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

  // Obtenir l'historique des blacklists d'un visiteur
  getVisitorHistory = asyncHandler(async (req, res) => {
    const { id } = visitorIdSchema.parse(req.params);
    
    try {
      const result = await blacklistService.getVisitorBlacklistHistory(id);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  });

  // Lister tous les visiteurs blacklistés
  getAllBlacklisted = asyncHandler(async (req, res) => {
    const { page, limit, type } = blacklistQuerySchema.parse(req.query);
    
    try {
      const result = await blacklistService.getAllBlacklistedVisitors(page, limit, type);
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
}

module.exports = new BlacklistController();
