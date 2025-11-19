const serviceService = require('./service.service');
const { createServiceSchema, updateServiceSchema, serviceIdSchema, serviceQuerySchema } = require('./service.schema');
const { asyncHandler } = require('../../middleware/asyncHandler');

class ServiceController {
  createService = asyncHandler(async (req, res) => {
    // Vérifier les permissions ADMIN uniquement
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Seuls les administrateurs peuvent créer des services.'
      });
    }

    const validated = createServiceSchema.parse(req.body);
    
    try {
      const service = await serviceService.createService(validated);
      res.status(201).json({
        success: true,
        message: 'Service créé avec succès',
        data: service
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  getAllServices = asyncHandler(async (req, res) => {
    const validated = serviceQuerySchema.parse(req.query);
    
    try {
      const result = await serviceService.getAllServices(validated.page, validated.limit, validated.search);
      res.json({
        success: true,
        data: result.services,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  getServiceById = asyncHandler(async (req, res) => {
    const validated = serviceIdSchema.parse(req.params);
    
    try {
      const service = await serviceService.getServiceById(validated.id);
      res.json({
        success: true,
        data: service
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

  updateService = asyncHandler(async (req, res) => {
    // Vérifier les permissions ADMIN uniquement
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Seuls les administrateurs peuvent modifier des services.'
      });
    }

    const { id } = serviceIdSchema.parse(req.params);
    const validated = updateServiceSchema.parse(req.body);
    
    try {
      const service = await serviceService.updateService(id, validated);
      res.json({
        success: true,
        message: 'Service mis à jour avec succès',
        data: service
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

  deleteService = asyncHandler(async (req, res) => {
    // Vérifier les permissions ADMIN uniquement
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Seuls les administrateurs peuvent supprimer des services.'
      });
    }

    const validated = serviceIdSchema.parse(req.params);
    
    try {
      const result = await serviceService.deleteService(validated.id);
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
      if (error.message.includes('visites associées') || error.message.includes('rendez-vous associés')) {
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

  getServiceStats = asyncHandler(async (req, res) => {
    try {
      const stats = await serviceService.getServiceStats();
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

  getServiceActivity = asyncHandler(async (req, res) => {
    const { id } = serviceIdSchema.parse(req.params);
    const days = req.query.days ? parseInt(req.query.days) : 30;
    
    try {
      const activity = await serviceService.getServiceActivity(id, days);
      res.json({
        success: true,
        data: activity
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

module.exports = new ServiceController();
