const { prisma } = require('../../config/prisma');


class SiteService {

  // 🔥 Affecter un agent à un site
  async assignAgentToSite(siteId, userId) {
    // Vérifier que le site existe
    const site = await prisma.site.findUnique({ where: { id: siteId } });
    if (!site) throw new Error("Site introuvable");

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("Agent introuvable");

    // Vérifier le rôle
    if (user.role !== "CHEF_SERVICE" && user.role !== "AGENT_GESTION") {
      throw new Error("Cet utilisateur n'est pas un agent de service ou gestion");
    }

    // Vérifier si déjà assigné
    const already = await prisma.userSite.findFirst({
      where: { userId, siteId }
    });
    if (already) {
      throw new Error("Agent déjà affecté à ce site");
    }

    // Créer l'affectation
    return prisma.userSite.create({
      data: {
        userId,
        siteId
      }
    });
  }

  // 🔍 Lister les agents affectés à un site
  async getSiteAgents(siteId) {
    return prisma.userSite.findMany({
      where: { siteId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            phone: true,
            email: true
          }
        }
      }
    });
  }

  // ❌ Retirer un agent d’un site
  async removeAgentFromSite(siteId, userId) {
    return prisma.userSite.deleteMany({
      where: { siteId, userId }
    });
  }
}

module.exports = new SiteService();
