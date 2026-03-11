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
          name: true,
          siteId: true
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
        // Visites en cours pour ce checkpoint aujourd'hui (exitTime null)
        prisma.visit.count({
          where: {
            checkpointId,
            entryTime: { gte: startOfDay, lt: endOfDay },
            exitTime: null
          }
        }),
        
        // Visites terminées pour ce checkpoint aujourd'hui (exitTime non null)
        prisma.visit.count({
          where: {
            checkpointId,
            entryTime: { gte: startOfDay, lt: endOfDay },
            exitTime: { not: null }
          }
        }),
        
        // Total des visites pour ce checkpoint aujourd'hui (tous statuts)
        prisma.visit.count({
          where: {
            checkpointId,
            entryTime: { gte: startOfDay, lt: endOfDay }
          }
        }),

        // Total des incidents pour ce site aujourd'hui
        prisma.incident.count({
          where: {
            siteId: checkpoint.siteId,
            dateIncident: { gte: startOfDay, lt: endOfDay }
          }
        }).then(count => {
          return count;
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

   // Récupérer les visiteurs présents pour un checkpoint spécifique
  async getVisitorsPresentByCheckpoint(checkpointId) {
    try {
      if (!checkpointId) {
        throw new Error('checkpointId est requis');
      }

      // Vérifier si le checkpoint existe
      const checkpoint = await prisma.checkpoint.findUnique({
        where: { id: checkpointId },
        select: {
          id: true,
          name: true,
          siteId: true,
          site: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      if (!checkpoint) {
        throw new Error('Checkpoint non trouvé');
      }

      // Obtenir la date du jour
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      // Chercher les visites du jour pour ce checkpoint
      const allVisitsToday = await prisma.visit.findMany({
        where: {
          entryTime: {
            gte: startOfDay,
            lt: endOfDay
          },
          checkpointId: checkpointId
        },
        include: {
          visitor: true,
          service: {
            select: {
              name: true
            }
          },
          checkpoint: {
            select: {
              name: true,
              site: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          entryTime: 'desc'
        }
      });

      // Filtrer les visiteurs "présents"
      const visitorsPresent = allVisitsToday.filter(visit => 
        visit.exitTime === null || visit.status === 'active' || visit.status === 'present'
      );

      // Formater les données
      const formattedVisitors = visitorsPresent.map(visit => ({
        visitId: visit.id,
        visitor: {
          id: visit.visitor.id,
          firstName: visit.visitor.firstName,
          lastName: visit.visitor.lastName,
          company: visit.visitor.company,
          phone: visit.visitor.phone,
          email: visit.visitor.email
        },
        visit: {
          entryTime: visit.entryTime,
          reason: visit.reason,
          service: visit.service?.name,
          checkpoint: visit.checkpoint?.name,
          notes: visit.notes,
          site: visit.checkpoint?.site?.name,
          siteId: visit.checkpoint?.site?.id,
          status: visit.status,
          exitTime: visit.exitTime
        }
      }));

      return {
        count: formattedVisitors.length,
        visitors: formattedVisitors,
        checkpointId: checkpointId,
        checkpointName: checkpoint.name,
        siteId: checkpoint.site.id,
        siteName: checkpoint.site.name,
        date: today.toISOString().split('T')[0],
        debug: {
          totalVisitsToday: allVisitsToday.length,
          allVisitStatuses: allVisitsToday.map(v => ({ 
            id: v.id, 
            status: v.status, 
            exitTime: v.exitTime,
            visitorName: `${v.visitor.firstName} ${v.visitor.lastName}`
          }))
        }
      };
      
    } catch (error) {
      console.error('Erreur dans getVisitorsPresentByCheckpoint:', error);
      throw new Error('Erreur lors de la récupération des visiteurs présents');
    }
  }

}

module.exports = new DashboardService();
