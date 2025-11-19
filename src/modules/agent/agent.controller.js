const agentService = require('./agent.service');
const { createAgentSchema, updateAgentSchema, agentIdSchema, agentQuerySchema } = require('./agent.schema');
const { asyncHandler } = require('../../middleware/asyncHandler');

class AgentController {
  createAgent = asyncHandler(async (req, res) => {
    // Vérifier les permissions ADMIN uniquement
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Seuls les administrateurs peuvent créer des agents de contrôle.'
      });
    }

    const validated = createAgentSchema.parse(req.body);
    
    try {
      const agent = await agentService.createAgent(validated);
      res.status(201).json({
        success: true,
        message: 'Agent de contrôle créé avec succès',
        data: agent
      });
    } catch (error) {
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

  getAllAgents = asyncHandler(async (req, res) => {
    // Vérifier les permissions ADMIN uniquement
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Seuls les administrateurs peuvent consulter les agents de contrôle.'
      });
    }

    const validated = agentQuerySchema.parse(req.query);
    
    try {
      const result = await agentService.getAllAgents(
        validated.page, 
        validated.limit, 
        validated.search,
        validated.checkpointId
      );
      res.json({
        success: true,
        data: result.agents,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  getAgentById = asyncHandler(async (req, res) => {
    // Vérifier les permissions ADMIN uniquement
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Seuls les administrateurs peuvent consulter les détails des agents de contrôle.'
      });
    }

    const validated = agentIdSchema.parse(req.params);
    
    try {
      const agent = await agentService.getAgentById(validated.id);
      res.json({
        success: true,
        data: agent
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

  updateAgent = asyncHandler(async (req, res) => {
    // Vérifier les permissions ADMIN uniquement
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Seuls les administrateurs peuvent modifier des agents de contrôle.'
      });
    }

    const { id } = agentIdSchema.parse(req.params);
    const validated = updateAgentSchema.parse(req.body);
    
    try {
      const agent = await agentService.updateAgent(id, validated);
      res.json({
        success: true,
        message: 'Agent de contrôle mis à jour avec succès',
        data: agent
      });
    } catch (error) {
      if (error.message.includes('non trouvé')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      if (error.message.includes('existe déjà')) {
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

  deleteAgent = asyncHandler(async (req, res) => {
    // Vérifier les permissions ADMIN uniquement
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Seuls les administrateurs peuvent supprimer des agents de contrôle.'
      });
    }

    const validated = agentIdSchema.parse(req.params);
    
    try {
      const result = await agentService.deleteAgent(validated.id);
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

  assignToCheckpoint = asyncHandler(async (req, res) => {
    // Vérifier les permissions ADMIN uniquement
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Seuls les administrateurs peuvent assigner des agents aux checkpoints.'
      });
    }

    const { id } = agentIdSchema.parse(req.params);
    const { checkpointId } = req.body;
    
    try {
      const agent = await agentService.assignToCheckpoint(id, checkpointId);
      res.json({
        success: true,
        message: 'Agent assigné au checkpoint avec succès',
        data: agent
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

  getAgentStats = asyncHandler(async (req, res) => {
    // Vérifier les permissions ADMIN uniquement
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Seuls les administrateurs peuvent consulter les statistiques des agents.'
      });
    }

    try {
      const stats = await agentService.getAgentStats();
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

module.exports = new AgentController();
