const express = require('express');
const { prisma } = require('../config/prisma');
const { asyncHandler } = require('../middleware/asyncHandler');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/v1/dashboard/stats - Statistiques du dashboard
router.get('/stats', authenticateToken, asyncHandler(async (req, res) => {
  try {
    // Statistiques principales
    const [
      visitorsRegistered,
      visitsInProgress, 
      visitsCompleted,
      incidentsReported,
      visitorsPresent
    ] = await Promise.all([
      // Nombre total de visiteurs enregistrés
      prisma.visitor.count({
        where: { isBlacklisted: false }
      }),
      
      // Visites en cours
      prisma.visit.count({
        where: { 
          status: 'active',
          exitTime: null
        }
      }),
      
      // Visites terminées
      prisma.visit.count({
        where: { status: 'finished' }
      }),
      
      // Incidents signalés
      prisma.visitIncident.count(),
      
      // Visiteurs actuellement présents (visites actives)
      prisma.visit.findMany({
        where: {
          status: 'active',
          exitTime: null
        },
        include: {
          visitor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              company: true,
              phone: true
            }
          },
          service: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          entryTime: 'desc'
        }
      })
    ]);

    // Formater les visiteurs présents
    const presentVisitors = visitorsPresent.map(visit => ({
      id: visit.visitor.id,
      firstName: visit.visitor.firstName,
      lastName: visit.visitor.lastName,
      company: visit.visitor.company,
      phone: visit.visitor.phone,
      service: visit.service?.name,
      entryTime: visit.entryTime,
      reason: visit.reason
    }));

    // Récupérer aussi les derniers visiteurs enregistrés pour vérification
    const recentVisitors = await prisma.visitor.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        company: true,
        idType: true,
        idNumber: true,
        isBlacklisted: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      data: {
        // Statistiques principales
        visitorsRegistered,
        visitsInProgress,
        visitsCompleted,
        incidentsReported,
        
        // Détails des visiteurs présents
        visitorsPresent: presentVisitors,
        
        // Derniers visiteurs enregistrés (pour vérification)
        recentVisitors: recentVisitors.map(visitor => ({
          id: visitor.id,
          firstName: visitor.firstName,
          lastName: visitor.lastName,
          phone: visitor.phone,
          email: visitor.email,
          company: visitor.company,
          idType: visitor.idType,
          idNumber: visitor.idNumber,
          isBlacklisted: visitor.isBlacklisted,
          createdAt: visitor.createdAt
        })),
        
        // Informations supplémentaires
        summary: {
          totalVisitorsToday: visitsInProgress + visitsCompleted,
          hasVisitorsPresent: presentVisitors.length > 0,
        }
      }
    });

  } catch (error) {
    console.error('Erreur dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
}));

// GET /api/v1/dashboard/visitors-present - Visiteurs présents du jour pour un site
router.get('/visitors-present', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const { siteId } = req.query;

    // siteId est obligatoire
    if (!siteId) {
      return res.status(400).json({
        success: false,
        message: 'siteId est requis dans les paramètres de requête'
      });
    }

    // Obtenir la date du jour (sans l'heure)
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // 1. D'abord trouver tous les checkpoints du site
    const siteCheckpoints = await prisma.checkpoint.findMany({
      where: {
        siteId: siteId
      },
      select: {
        id: true,
        name: true
      }
    });

    if (siteCheckpoints.length === 0) {
      return res.json({
        success: true,
        data: {
          count: 0,
          visitors: [],
          siteId: siteId,
          date: today.toISOString().split('T')[0],
          message: 'Aucun checkpoint trouvé pour ce site'
        }
      });
    }

    // 2. Extraire les IDs des checkpoints
    const checkpointIds = siteCheckpoints.map(cp => cp.id);

    // 3. Chercher les visites du jour pour ces checkpoints (sans filtre de status pour debug)
    const allVisitsToday = await prisma.visit.findMany({
      where: {
        // Visiteurs du jour
        entryTime: {
          gte: startOfDay,
          lt: endOfDay
        },
        // Pour les checkpoints du site
        checkpointId: {
          in: checkpointIds
        }
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

    // Filtrer manuellement pour voir les visiteurs "présents" (ceux qui n'ont pas de exitTime)
    const visitorsPresent = allVisitsToday.filter(visit => 
      visit.exitTime === null || visit.status === 'active' || visit.status === 'present'
    );

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
        site: visit.checkpoint?.site?.name,
        siteId: visit.checkpoint?.site?.id,
        status: visit.status,
        exitTime: visit.exitTime
      }
    }));

    res.json({
      success: true,
      data: {
        count: formattedVisitors.length,
        visitors: formattedVisitors,
        siteId: siteId,
        date: today.toISOString().split('T')[0], // Format YYYY-MM-DD
        checkpointsFound: siteCheckpoints.length,
        checkpointIds: checkpointIds,
        debug: {
          totalVisitsToday: allVisitsToday.length,
          allVisitStatuses: allVisitsToday.map(v => ({ 
            id: v.id, 
            status: v.status, 
            exitTime: v.exitTime,
            visitorName: `${v.visitor.firstName} ${v.visitor.lastName}`
          }))
        }
      }
    });

  } catch (error) {
    console.error('Erreur visiteurs présents:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des visiteurs présents'
    });
  }
}));

// GET /api/v1/dashboard/test-visitors - Test pour vérifier les vraies données des visiteurs
router.get('/test-visitors', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const allVisitors = await prisma.visitor.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        idType: true,
        idNumber: true,
        company: true,
        isBlacklisted: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: {
        count: allVisitors.length,
        visitors: allVisitors
      }
    });

  } catch (error) {
    console.error('Erreur test visiteurs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des visiteurs de test',
      error: error.message
    });
  }
}));

module.exports = router;