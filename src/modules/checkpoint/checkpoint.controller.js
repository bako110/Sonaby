const checkpointService = require('./checkpoint.service');
const { 
  createCheckpointSchema, 
  updateCheckpointSchema, 
  checkpointIdSchema, 
  checkpointQuerySchema,
  assignAgentSchema,
  sosSchema
} = require('./checkpoint.schema');
const { asyncHandler } = require('../../middleware/asyncHandler');

class CheckpointController {
  getFilteredCheckpoints = asyncHandler(async (req, res) => {
    // Valider les filtres avec le schéma
    const validatedFilters = checkpointQuerySchema.parse(req.query);
    
    const filters = {
      ...validatedFilters,
      page: validatedFilters.page || 1,
      limit: validatedFilters.limit || 10
    };

    const result = await checkpointService.getFilteredCheckpoints(filters);
    
    res.status(200).json({
      success: true,
      message: 'Checkpoints filtrés récupérés avec succès',
      data: result.checkpoints,
      pagination: result.pagination,
      filterOptions: result.filterOptions,
      filters: filters
    });
  });

  getFilterOptions = asyncHandler(async (req, res) => {
    try {
      // Construire les filtres à partir des query params (sauf les options)
      const { page, limit, ...currentFilters } = req.query;
      
      const filterOptions = await checkpointService.getFilterOptions(currentFilters);
      
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

  createCheckpoint = asyncHandler(async (req, res) => {
    // Vérifier les permissions ADMIN et AGENT_GESTION
    if (!['ADMIN', 'AGENT_GESTION'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Seuls les administrateurs et agents de gestion peuvent créer des checkpoints.'
      });
    }

    const validated = createCheckpointSchema.parse(req.body);
    
    try {
      const checkpoint = await checkpointService.createCheckpoint(validated);
      res.status(201).json({
        success: true,
        message: 'Checkpoint créé avec succès',
        data: checkpoint
      });
    } catch (error) {
      if (error.message.includes('Site non trouvé') || error.message.includes('déjà utilisé')) {
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

  getAllCheckpoints = asyncHandler(async (req, res) => {
    const validated = checkpointQuerySchema.parse(req.query);
    
    try {
      const result = await checkpointService.getAllCheckpoints(
        validated.page, 
        validated.limit, 
        validated.search,
        validated.siteId
      );
      res.json({
        success: true,
        data: result.checkpoints,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  getCheckpointById = asyncHandler(async (req, res) => {
    const validated = checkpointIdSchema.parse(req.params);
    
    try {
      const checkpoint = await checkpointService.getCheckpointById(validated.id);
      res.json({
        success: true,
        data: checkpoint
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

  updateCheckpoint = asyncHandler(async (req, res) => {
    // Vérifier les permissions ADMIN et AGENT_GESTION
    if (!['ADMIN', 'AGENT_GESTION'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Seuls les administrateurs et agents de gestion peuvent modifier des checkpoints.'
      });
    }

    const { id } = checkpointIdSchema.parse(req.params);
    const validated = updateCheckpointSchema.parse(req.body);
    
    try {
      const checkpoint = await checkpointService.updateCheckpoint(id, validated);
      res.json({
        success: true,
        message: 'Checkpoint mis à jour avec succès',
        data: checkpoint
      });
    } catch (error) {
      if (error.message.includes('non trouvé')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      if (error.message.includes('déjà utilisé')) {
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

  deleteCheckpoint = asyncHandler(async (req, res) => {
    // Vérifier les permissions ADMIN et AGENT_GESTION
    if (!['ADMIN', 'AGENT_GESTION'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Seuls les administrateurs et agents de gestion peuvent supprimer des checkpoints.'
      });
    }

    const validated = checkpointIdSchema.parse(req.params);
    
    try {
      const result = await checkpointService.deleteCheckpoint(validated.id);
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

  assignAgent = asyncHandler(async (req, res) => {
    // Vérifier les permissions ADMIN et AGENT_GESTION
    if (!['ADMIN', 'AGENT_GESTION'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Seuls les administrateurs et agents de gestion peuvent assigner des agents.'
      });
    }

    const { id } = checkpointIdSchema.parse(req.params);
    const { agentId } = assignAgentSchema.parse(req.body);
    
    try {
      const checkpoint = await checkpointService.assignAgent(id, agentId);
      res.json({
        success: true,
        message: 'Agent assigné avec succès',
        data: checkpoint
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

  sendSOS = asyncHandler(async (req, res) => {
    const { id } = checkpointIdSchema.parse(req.params);
    const { message } = sosSchema.parse(req.body);
    
    try {
      const sos = await checkpointService.sendSOS(id, req.user.id, message);
      res.status(201).json({
        success: true,
        message: 'SOS envoyé avec succès',
        data: sos
      });
    } catch (error) {
      if (error.message.includes('non trouvé')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      if (error.message.includes('déjà actif')) {
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

  getCheckpointAgents = asyncHandler(async (req, res) => {
    const { id } = checkpointIdSchema.parse(req.params);
    
    try {
      const result = await checkpointService.getCheckpointAgents(id);
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

  getCheckpointStats = asyncHandler(async (req, res) => {
    try {
      const stats = await checkpointService.getCheckpointStats();
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

module.exports = new CheckpointController();
