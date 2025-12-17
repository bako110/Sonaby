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

    // 🔹 Si c'est un AGENT_GESTION, le faire devenir manager du site
    if (user.role === "AGENT_GESTION") {
      // 1️⃣ Supprimer l'ancien manager de UserSite
      const oldUserSite = await prisma.userSite.findFirst({
        where: { siteId }
      });
      
      if (oldUserSite) {
        await prisma.userSite.delete({
          where: { id: oldUserSite.id }
        });
      }
      
      // 2️⃣ Mettre à jour le champ manager du site avec le nouveau nom
      const newManagerName = `${user.firstName} ${user.lastName}`;
      await prisma.site.update({
        where: { id: siteId },
        data: { manager: newManagerName }
      });
    }

    // 3️⃣ Créer l'affectation dans UserSite
    const assignment = await prisma.userSite.create({
      data: {
        userId,
        siteId
      }
    });

    // 4️⃣ Retourner l'assignation avec les détails
    return assignment;
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
