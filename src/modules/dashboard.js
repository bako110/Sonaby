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
          presentCount: presentVisitors.length,
          totalVisitorsInDb: visitorsRegistered
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

// GET /api/v1/dashboard/visitors-present - Visiteurs présents détaillés
router.get('/visitors-present', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const visitorsPresent = await prisma.visit.findMany({
      where: {
        status: 'active',
        exitTime: null
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
        site: visit.checkpoint?.site?.name
      }
    }));

    res.json({
      success: true,
      data: {
        count: formattedVisitors.length,
        visitors: formattedVisitors
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