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
}

module.exports = new StatsController();
