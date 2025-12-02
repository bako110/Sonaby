const statsService = require('./stats.service');
const { asyncHandler } = require('../../middleware/asyncHandler');

class StatsController {
  getAllStats = asyncHandler(async (req, res) => {
    try {
      const stats = await statsService.getAllStats();
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

  getAgentStats = asyncHandler(async (req, res) => {
    try {
      const stats = await statsService.getAgentStats();
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

  getRecentConnections = asyncHandler(async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      const stats = await statsService.getRecentConnections(parseInt(limit));
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

  getAgentActivity = asyncHandler(async (req, res) => {
    try {
      const { limit = 20, agentId } = req.query;
      const stats = await statsService.getAgentActivity(parseInt(limit), agentId);
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

module.exports = new StatsController();
