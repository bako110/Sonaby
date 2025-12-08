const checkpointService = require('./checkpoint.service');
const { 
  createCheckpointSchema, 
  updateCheckpointSchema, 
  checkpointIdSchema, 
  checkpointQuerySchema,
  assignAgentSchema,
  sosSchema,
  unassignAgentSchema
} = require('./checkpoint.schema');
const { asyncHandler } = require('../../middleware/asyncHandler');

class CheckpointController {

  getFilteredCheckpoints = asyncHandler(async (req, res) => {
  try {
    // 1. Récupérer tous les paramètres de requête
    const {
      search,
      name,          // <-- AJOUT: Recherche par nom spécifique
      siteId,
      zone,
      checkpointType,
      status,
      priority,
      agentId,
      agentName,     // <-- AJOUT: Recherche par nom d'agent
      dateCreationDebut,
      dateCreationFin,
      avecAgent,
      enAlerte,
      page = 1,
      limit = 10
    } = req.query;

    // 2. Validation des dates
    if (dateCreationDebut && dateCreationFin) {
      const debut = new Date(dateCreationDebut);
      const fin = new Date(dateCreationFin);
      
      if (isNaN(debut.getTime()) || isNaN(fin.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Format de date invalide. Utilisez YYYY-MM-DD'
        });
      }
      
      if (debut > fin) {
        return res.status(400).json({
          success: false,
          message: 'La date de début ne peut pas être après la date de fin'
        });
      }
    }

    // 3. Validation UUID
    const isValidUUID = (uuid) => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return uuidRegex.test(uuid);
    };

    if (siteId && !isValidUUID(siteId)) {
      return res.status(400).json({
        success: false,
        message: 'Format UUID invalide pour siteId'
      });
    }
    
    if (agentId && !isValidUUID(agentId)) {
      return res.status(400).json({
        success: false,
        message: 'Format UUID invalide pour agentId'
      });
    }

    // 4. Validation des enum (types)
    const validCheckpointTypes = ['internal', 'external', 'virtual'];
    const validStatuses = ['active', 'inactive', 'maintenance'];
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    const validBooleanFilters = ['true', 'false'];

    if (checkpointType && !validCheckpointTypes.includes(checkpointType)) {
      return res.status(400).json({
        success: false,
        message: `Type de checkpoint invalide. Valeurs autorisées: ${validCheckpointTypes.join(', ')}`
      });
    }

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Statut invalide. Valeurs autorisées: ${validStatuses.join(', ')}`
      });
    }

    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: `Priorité invalide. Valeurs autorisées: ${validPriorities.join(', ')}`
      });
    }

    if (avecAgent && !validBooleanFilters.includes(avecAgent)) {
      return res.status(400).json({
        success: false,
        message: "Valeur invalide pour 'avecAgent'. Utilisez 'true' ou 'false'"
      });
    }

    if (enAlerte && !validBooleanFilters.includes(enAlerte)) {
      return res.status(400).json({
        success: false,
        message: "Valeur invalide pour 'enAlerte'. Utilisez 'true' ou 'false'"
      });
    }

    // 5. Construction des filtres pour le service
    const filtersForService = {
      search: search || undefined,
      name: name || undefined,          // <-- AJOUT
      siteId: siteId || undefined,
      zone: zone || undefined,
      checkpointType: checkpointType || undefined,
      status: status || undefined,
      priority: priority || undefined,
      agentId: agentId || undefined,
      agentName: agentName || undefined, // <-- AJOUT
      dateCreationStart: dateCreationDebut || undefined,  // Mapping
      dateCreationEnd: dateCreationFin || undefined,      // Mapping
      hasAgent: avecAgent === 'true' ? true : 
                avecAgent === 'false' ? false : undefined,
      inAlert: enAlerte === 'true' ? true : 
               enAlerte === 'false' ? false : undefined,
      page: parseInt(page),
      limit: parseInt(limit)
    };

    // Nettoyer les valeurs undefined
    Object.keys(filtersForService).forEach(key => {
      if (filtersForService[key] === undefined) {
        delete filtersForService[key];
      }
    });

    // 6. Construction des filtres pour la réponse (garder les noms originaux)
    const filtersForResponse = {
      search: search || undefined,
      name: name || undefined,
      siteId: siteId || undefined,
      zone: zone || undefined,
      checkpointType: checkpointType || undefined,
      status: status || undefined,
      priority: priority || undefined,
      agentId: agentId || undefined,
      agentName: agentName || undefined,
      dateCreationDebut: dateCreationDebut || undefined,
      dateCreationFin: dateCreationFin || undefined,
      avecAgent: avecAgent || undefined,
      enAlerte: enAlerte || undefined,
      page: parseInt(page),
      limit: parseInt(limit)
    };

    // Nettoyer les valeurs undefined pour la réponse aussi
    Object.keys(filtersForResponse).forEach(key => {
      if (filtersForResponse[key] === undefined) {
        delete filtersForResponse[key];
      }
    });

    console.log('=== DEBUG: Filters envoyés au service ===');
    console.log(filtersForService);

    // 7. Appel au service
    const result = await checkpointService.getFilteredCheckpoints(filtersForService);
    
    // 8. Réponse
    res.status(200).json({
      success: true,
      message: 'Checkpoints filtrés récupérés avec succès',
      data: result.checkpoints,
      pagination: result.pagination,
      filterOptions: result.filterOptions,
      filters: filtersForResponse
    });

  } catch (error) {
    console.error('Error in getFilteredCheckpoints:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des checkpoints filtrés'
    });
  }
});
  getFilterOptions = asyncHandler(async (req, res) => {
  try {
    // 1. Récupérer les filtres
    const {
      siteId,
      zone,
      checkpointType,
      status,
      priority,
      agentId
    } = req.query;

    // 2. Validation UUID
    const isValidUUID = (uuid) => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return uuidRegex.test(uuid);
    };

    if (siteId && !isValidUUID(siteId)) {
      return res.status(400).json({
        success: false,
        message: 'Format UUID invalide pour siteId'
      });
    }
    
    if (agentId && !isValidUUID(agentId)) {
      return res.status(400).json({
        success: false,
        message: 'Format UUID invalide pour agentId'
      });
    }

    // 3. Construction des pré-filtres
    const currentFilters = {};
    
    if (siteId) currentFilters.siteId = siteId;
    if (zone) currentFilters.zone = zone;
    if (checkpointType) currentFilters.checkpointType = checkpointType;
    if (status) currentFilters.status = status;
    if (priority) currentFilters.priority = priority;
    if (agentId) currentFilters.agentId = agentId;

    // 4. Appel au service
    const filterOptions = await checkpointService.getFilterOptions(currentFilters);
    
    // 5. Réponse
    res.status(200).json({
      success: true,
      message: 'Options de filtre récupérées avec succès',
      data: filterOptions
    });
    
  } catch (error) {
    console.error('Error in getFilterOptions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des options de filtre'
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

  unassignAgent = asyncHandler(async (req, res) => {
  // 🔹 Vérifier les permissions ADMIN et AGENT_GESTION
  if (!['ADMIN', 'AGENT_GESTION'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Accès refusé. Seuls les administrateurs et agents de gestion peuvent désaffecter des agents.'
    });
  }

  // 🔹 Validation des params et body
  const { id } = checkpointIdSchema.parse(req.params);
  const { agentId } = unassignAgentSchema.parse(req.body);

  try {
    // 🔹 Appel au service
    const checkpoint = await checkpointService.unassignAgent(id, agentId);

    res.json({
      success: true,
      message: 'Agent désaffecté avec succès',
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
