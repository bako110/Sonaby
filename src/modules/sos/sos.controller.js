const sosService = require('./sos.service');
const { createSOSSchema, createGeneralSOSSchema, sosIdSchema, sosQuerySchema } = require('./sos.schema');
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
    console.log('🔍 DEBUG CONTROLLER - validated data:', validated);
    console.log('🔍 DEBUG CONTROLLER - Using templateId:', validated.templateId);
    
    // Utiliser l'utilisateur authentifié comme triggeredBy
    const sentBy = req.user.userId;
    
    try {
      const sos = await sosService.createSOS(validated, sentBy);
      
      let responseMessage = 'SOS envoyé avec succès';
      
      // Personnaliser le message selon si template ou message personnalisé
      if (validated.templateId) {
        responseMessage = 'SOS envoyé avec template prédéfini';
      } else if (validated.message) {
        responseMessage = 'SOS personnalisé envoyé avec succès';
      }
      
      res.status(201).json({
        success: true,
        message: responseMessage,
        data: sos,
        metadata: {
          usedTemplate: !!validated.templateId,
          templateId: validated.templateId || null
        }
      });
    } catch (error) {
      // Gestion des erreurs spécifiques
      if (error.message.includes('non trouvé')) {
        return res.status(404).json({
          success: false,
          message: error.message.includes('Template') 
            ? 'Template SOS non trouvé' 
            : 'Checkpoint non trouvé'
        });
      }
      
      if (error.message.includes('déjà actif')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      if (error.message.includes('Message requis')) {
        return res.status(400).json({
          success: false,
          message: 'Message requis ou template invalide'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi du SOS',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
    
    // Utiliser l'utilisateur authentifié comme triggeredBy
    const sentBy = req.user.userId;
    
    try {
      const sos = await sosService.createGeneralSOS(validated, sentBy);
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
    // if (!['ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE'].includes(req.user.role)) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Accès refusé. Permissions insuffisantes.'
    //   });
    // }

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

  // Nouvelle méthode pour résoudre un SOS avec notes
  resolveSOS = asyncHandler(async (req, res) => {
    if (!['ADMIN', 'AGENT_GESTION'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.'
      });
    }

    const { id } = req.params;
    const { notes } = req.body;
    
    try {
      const resolvedSOS = await sosService.resolveSOS(id, req.user.userId, notes);
      res.json({
        success: true,
        message: 'SOS résolu avec succès',
        data: resolvedSOS
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

  // Méthode pour récupérer la liste simple des SOS
  getSOSList = asyncHandler(async (req, res) => {
    if (!['ADMIN', 'AGENT_GESTION'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.'
      });
    }

    try {
      const sosList = await sosService.getSOSList(req.query);
      res.json({
        success: true,
        data: sosList
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });


 // Créer un template
  async create(req, res) {
    try {
      const { titre, message } = req.body;
      
      if (!titre?.trim() || !message?.trim()) {
        return res.status(400).json({
          error: 'Titre et message sont requis'
        });
      }

      const template = await sosService.createTemplate(titre, message);
      
      res.status(201).json(template);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Lister tous les templates
  async getAll(req, res) {
    try {
      const templates = await sosService.getAllTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Récupérer un template par ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const template = await sosService.getTemplateById(id);
      res.json(template);
    } catch (error) {
      if (error.message === 'Template non trouvé') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  // Mettre à jour un template
  async update(req, res) {
    try {
      const { id } = req.params;
      const { titre, message } = req.body;
      
      if (!titre?.trim() || !message?.trim()) {
        return res.status(400).json({
          error: 'Titre et message sont requis'
        });
      }

      const template = await sosService.updateTemplate(id, titre, message);
      res.json(template);
    } catch (error) {
      if (error.message === 'Template non trouvé') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  // Supprimer un template
  async delete(req, res) {
    try {
      const { id } = req.params;
      const template = await sosService.deleteTemplate(id);
      res.json({ message: 'Template supprimé', template });
    } catch (error) {
      if (error.message === 'Template non trouvé') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }
}

module.exports = new SOSController();