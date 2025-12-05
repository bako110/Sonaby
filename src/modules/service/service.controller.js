const siteService = require("./service.service");

class SiteController {

  // POST /sites/:siteId/assign/:userId
  async assignAgent(req, res) {
    try {
      const { siteId, userId } = req.params;

      const result = await siteService.assignAgentToSite(siteId, userId);
      res.status(201).json({
        success: true,
        message: "Agent affecté avec succès",
        data: result
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // GET /sites/:siteId/agents
  async getSiteAgents(req, res) {
    try {
      const { siteId } = req.params;
      const agents = await siteService.getSiteAgents(siteId);

      res.json({ success: true, data: agents });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // DELETE /sites/:siteId/agent/:userId
  async removeAgent(req, res) {
    try {
      const { siteId, userId } = req.params;

      await siteService.removeAgentFromSite(siteId, userId);
      res.json({ success: true, message: "Agent retiré du site" });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new SiteController();
