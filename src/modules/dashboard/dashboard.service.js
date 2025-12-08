const { prisma } = require('../../config/prisma');

class DashboardService {
  
  // Récupérer les statistiques pour un checkpoint spécifique (uniquement du jour)
  async getCheckpointStats(checkpointId) {
    try {
      if (!checkpointId) {
        throw new Error('checkpointId est requis');
      }

      // Vérifier si le checkpoint existe
      const checkpoint = await prisma.checkpoint.findUnique({
        where: { id: checkpointId },
        select: {
          id: true,
          name: true
        }
      });

      if (!checkpoint) {
        throw new Error('Checkpoint non trouvé');
      }

      // Obtenir la date du jour
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      const [
        visitsInProgress,
        visitsCompleted,
        totalVisitorsToday,
        incidentsCountToday
      ] = await Promise.all([
        // Visites en cours pour ce checkpoint aujourd'hui
        prisma.visit.count({
          where: {
            checkpointId,
            entryTime: { gte: startOfDay, lt: endOfDay },
            exitTime: null,
            status: { in: ['active', 'present'] }
          }
        }),
        
        // Visites terminées pour ce checkpoint aujourd'hui
        prisma.visit.count({
          where: {
            checkpointId,
            entryTime: { gte: startOfDay, lt: endOfDay },
            status: 'finished'
          }
        }),
        
        // Total des visites pour ce checkpoint aujourd'hui (tous statuts)
        prisma.visit.count({
          where: {
            checkpointId,
            entryTime: { gte: startOfDay, lt: endOfDay }
          }
        }),
        
        // Total des incidents pour ce checkpoint aujourd'hui
        prisma.incident.count({
          where: {
            siteId: checkpointId,
            dateIncident: { gte: startOfDay, lt: endOfDay }
          }
        })
      ]);

      return {
        checkpointId,
        checkpointName: checkpoint.name,
        visitsInProgress,
        visitsCompleted,
        totalVisitorsToday,
        incidentsCountToday,
        date: today.toISOString().split('T')[0]
      };
      
    } catch (error) {
      console.error('Erreur dans getCheckpointStats:', error);
      throw error;
    }
  }
}

module.exports = new DashboardService();