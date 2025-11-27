const rendezvousService = require('./rendezvous.service');
const { createRendezvousSchema, updateRendezvousSchema, rendezvousIdSchema, rendezvousQuerySchema, validateRendezvousSchema, cancelRendezvousSchema } = require('./rendezvous.schema');

class RendezvousController {
  // Créer un nouveau rendez-vous
  createRendezvous = async (req, res) => {
    try {
      const rendezvousData = createRendezvousSchema.parse(req.body);
      const newRendezvous = await rendezvousService.createRendezvous(rendezvousData);
      
      res.status(201).json({
        success: true,
        message: 'Rendez-vous créé avec succès',
        data: newRendezvous
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: 'Erreur de validation',
          errors: error.errors
        });
      }
      
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  // Récupérer tous les rendez-vous avec filtres
  getAllRendezvous = async (req, res) => {
    try {
      const filters = rendezvousQuerySchema.parse(req.query);
      const result = await rendezvousService.getAllRendezvous(filters);
      
      res.json({
        success: true,
        message: 'Rendez-vous récupérés avec succès',
        ...result
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: 'Erreur de validation des filtres',
          errors: error.errors
        });
      }
      
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  // Récupérer un rendez-vous par son ID
  getRendezvousById = async (req, res) => {
    try {
      const { id } = rendezvousIdSchema.parse(req.params);
      const rendezvous = await rendezvousService.getRendezvousById(id);
      
      res.json({
        success: true,
        message: 'Rendez-vous récupéré avec succès',
        data: rendezvous
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: 'Erreur de validation de l\'ID',
          errors: error.errors
        });
      }
      
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
  };

  // Mettre à jour un rendez-vous
  updateRendezvous = async (req, res) => {
    try {
      const { id } = rendezvousIdSchema.parse(req.params);
      const updateData = updateRendezvousSchema.parse(req.body);
      const updatedRendezvous = await rendezvousService.updateRendezvous(id, updateData);
      
      res.json({
        success: true,
        message: 'Rendez-vous mis à jour avec succès',
        data: updatedRendezvous
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: 'Erreur de validation',
          errors: error.errors
        });
      }
      
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
  };

  // Supprimer un rendez-vous
  deleteRendezvous = async (req, res) => {
    try {
      const { id } = rendezvousIdSchema.parse(req.params);
      await rendezvousService.deleteRendezvous(id);
      
      res.json({
        success: true,
        message: 'Rendez-vous supprimé avec succès'
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: 'Erreur de validation de l\'ID',
          errors: error.errors
        });
      }
      
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
  };

  // Valider un rendez-vous
  validateRendezvous = async (req, res) => {
    try {
      const { id } = rendezvousIdSchema.parse(req.params);
      const validatedRendezvous = await rendezvousService.validateRendezvous(id);
      
      res.json({
        success: true,
        message: 'Rendez-vous validé avec succès',
        data: validatedRendezvous
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: 'Erreur de validation',
          errors: error.errors
        });
      }
      
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
  };

  // Annuler un rendez-vous
  cancelRendezvous = async (req, res) => {
    try {
      const { id } = rendezvousIdSchema.parse(req.params);
      const { notes } = cancelRendezvousSchema.parse(req.body);
      const cancelledRendezvous = await rendezvousService.cancelRendezvous(id, notes);
      
      res.json({
        success: true,
        message: 'Rendez-vous annulé avec succès',
        data: cancelledRendezvous
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: 'Erreur de validation',
          errors: error.errors
        });
      }
      
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
  };

  // Récupérer les statistiques des rendez-vous
  getRendezvousStats = async (req, res) => {
    try {
      const stats = await rendezvousService.getRendezvousStats();
      
      res.json({
        success: true,
        message: 'Statistiques récupérées avec succès',
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
}

module.exports = new RendezvousController();
