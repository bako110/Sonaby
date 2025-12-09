const dashboardService = require('./dashboard.service');
const { asyncHandler } = require('../../middleware/asyncHandler');

class DashboardController {
  
 // GET /api/v1/dashboard/checkpoint-stats
  getCheckpointStats = asyncHandler(async (req, res) => {
    try {
      const { checkpointId } = req.query;

      if (!checkpointId) {
        return res.status(400).json({
          success: false,
          message: 'checkpointId est requis dans les paramètres de requête'
        });
      }

      const stats = await dashboardService.getCheckpointStats(checkpointId);
      
      return res.json({
        success: true,
        data: stats
      });
      
    } catch (error) {
      console.error('Erreur checkpoint stats controller:', error);
      
      if (error.message === 'Checkpoint non trouvé') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des statistiques du checkpoint'
      });
    }
  });

  // GET /api/v1/dashboard/visitors-present
  getVisitorsPresent = asyncHandler(async (req, res) => {
    try {
      const { checkpointId } = req.query;

      if (!checkpointId) {
        return res.status(400).json({
          success: false,
          message: 'checkpointId est requis dans les paramètres de requête'
        });
      }

      const visitorsData = await dashboardService.getVisitorsPresentByCheckpoint(checkpointId);
      
      return res.json({
        success: true,
        data: visitorsData
      });
      
    } catch (error) {
      console.error('Erreur dans visitorPresent controller:', error);
      
      if (error.message === 'Checkpoint non trouvé') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des visiteurs présents'
      });
    }
  });
}


module.exports = new DashboardController();
