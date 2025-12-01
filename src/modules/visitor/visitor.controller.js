const visitorService = require('./visitor.service');
const { createVisitorWithTransform, updateVisitorSchema, visitorIdSchema, visitorQuerySchema } = require('./visitor.schema');
const { asyncHandler } = require('../../middleware/asyncHandler');

class VisitorController {
    createVisitor = asyncHandler(async (req, res) => {
    // 🔹 Vérifier les permissions ADMIN, AGENT_GESTION, AGENT_CONTROLE, CHEF_SERVICE
      if (!['ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE', 'CHEF_SERVICE'].includes(req.user.role)) {
          return res.status(403).json({
              success: false,
              message: 'Accès refusé. Permissions insuffisantes pour créer un visiteur.'
          });
      }

      // 🔹 Valider les données
      const validated = createVisitorWithTransform.parse(req.body);

      try {
          // 🔹 Créer ou récupérer le visiteur
          const visitor = await visitorService.createOrFindVisitor(validated);

          res.status(201).json({
              success: true,
              message: visitor.message,
              data: visitor
          });

      } catch (error) {
          // 🔹 Gestion des contraintes uniques
          if (error.message.includes('Unique constraint failed on the constraint: `unique_identity`')) {
              return res.status(400).json({
                  success: false,
                  message: `Erreur de duplication : ${error.message}`
              });
          }

          // 🔹 Gestion des erreurs de type "non trouvé"
          if (error.message.includes('non trouvé')) {
              return res.status(400).json({
                  success: false,
                  message: error.message
              });
          }

          // 🔹 Erreur serveur générique
          res.status(500).json({
              success: false,
              message: `Erreur lors de la création du visiteur: ${error.message}`
          });
      }
  });

  getVisitorsBySite = asyncHandler(async (req, res) => {
    // Vérifier les permissions ADMIN, AGENT_GESTION, AGENT_CONTROLE, CHEF_SERVICE
    if (!['ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE', 'CHEF_SERVICE'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes pour consulter les visiteurs du site.'
      });
    }

    const { siteId } = req.params;
    const { page = 1, limit = 10, search } = req.query;
    
    try {
      const result = await visitorService.getVisitorsBySite(
        siteId,
        parseInt(page),
        parseInt(limit),
        search
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

  getAllVisitors = asyncHandler(async (req, res) => {
    // Vérifier les permissions ADMIN, AGENT_GESTION, AGENT_CONTROLE
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
    // Vérifier les permissions ADMIN, AGENT_GESTION, AGENT_CONTROLE
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
    // Vérifier les permissions ADMIN, AGENT_GESTION, AGENT_CONTROLE
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
    // Vérifier les permissions ADMIN, AGENT_GESTION, AGENT_CONTROLE
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
    // Vérifier les permissions ADMIN, AGENT_GESTION, AGENT_CONTROLE
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
    // Vérifier les permissions ADMIN, AGENT_GESTION
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
    // Vérifier les permissions ADMIN, AGENT_GESTION, AGENT_CONTROLE
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
}

module.exports = new VisitorController();
