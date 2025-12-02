const siteService = require('./site.service');
const { createSiteSchema, updateSiteSchema, siteIdSchema, siteQuerySchema } = require('./site.schema');
const { asyncHandler } = require('../../middleware/asyncHandler');

class SiteController {
  getFilteredSites = asyncHandler(async (req, res) => {
    const filters = {
      ...req.query,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10
    };

    const result = await siteService.getFilteredSites(filters);
    
    res.status(200).json({
      success: true,
      message: 'Sites filtrés récupérés avec succès',
      data: result.sites,
      pagination: result.pagination,
      filterOptions: result.filterOptions,
      filters: filters
    });
  });

  getFilterOptions = asyncHandler(async (req, res) => {
    try {
      // Construire les filtres à partir des query params (sauf les options)
      const { page, limit, ...currentFilters } = req.query;
      
      const filterOptions = await siteService.getFilterOptions(currentFilters);
      
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

  createSite = asyncHandler(async (req, res) => {
    // Vérifier les permissions ADMIN
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Seuls les administrateurs peuvent créer des sites.'
      });
    }

    try {
      const validated = createSiteSchema.parse(req.body);
      const site = await siteService.createSite(validated);
      
      res.status(201).json({
        success: true,
        message: 'Site créé avec succès',
        data: site
      });
    } catch (error) {
      // Erreur de validation Zod
      if (error.name === 'ZodError' && error.errors) {
        return res.status(400).json({
          success: false,
          message: 'Erreur de validation des données',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            received: err.received
          }))
        });
      }
      
      // Autres erreurs (service, base de données, etc.)
      if (error.message.includes('existe déjà') || error.message.includes('non trouvé')) {
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

  getAllSites = asyncHandler(async (req, res) => {
    const validated = siteQuerySchema.parse(req.query);
    
    try {
      const result = await siteService.getAllSites(validated.page, validated.limit, validated.search);
      res.json({
        success: true,
        data: result.sites,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  getSiteById = asyncHandler(async (req, res) => {
    const validated = siteIdSchema.parse(req.params);
    
    try {
      const site = await siteService.getSiteById(validated.id);
      res.json({
        success: true,
        data: site
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

  updateSite = asyncHandler(async (req, res) => {
    // Vérifier les permissions ADMIN
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Seuls les administrateurs peuvent modifier des sites.'
      });
    }

    const { id } = siteIdSchema.parse(req.params);
    const validated = updateSiteSchema.parse(req.body);
    
    try {
      const site = await siteService.updateSite(id, validated);
      res.json({
        success: true,
        message: 'Site mis à jour avec succès',
        data: site
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

  deleteSite = asyncHandler(async (req, res) => {
    // Vérifier les permissions ADMIN
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Seuls les administrateurs peuvent supprimer des sites.'
      });
    }

    const validated = siteIdSchema.parse(req.params);
    
    try {
      const result = await siteService.deleteSite(validated.id);
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
      if (error.message.includes('checkpoints')) {
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

  getSiteStats = asyncHandler(async (req, res) => {
    try {
      const stats = await siteService.getSiteStats();
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

  // Endpoint de test pour valider les données de site
  validateSiteData = asyncHandler(async (req, res) => {
    try {
      const validated = createSiteSchema.parse(req.body);
      res.json({
        success: true,
        message: 'Données valides',
        data: {
          original: req.body,
          validated: validated
        }
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: 'Erreur de validation des données',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            received: err.received,
            expected: err.expected
          }))
        });
      }
      
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });
}

module.exports = new SiteController();
