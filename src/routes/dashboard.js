const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { asyncHandler } = require('../middleware/asyncHandler');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/v1/dashboard/stats:
 *   get:
 *     summary: 📊 Statistiques du Dashboard SONABHY - Gestion des flux
 *     description: |
 *       Récupère toutes les statistiques en temps réel du dashboard comme affiché dans l'application mobile :
 *       - 👥 Visiteurs enregistrés (carte bleue)
 *       - 🟢 Visites en cours (carte verte) 
 *       - 🟠 Visites terminées (carte orange)
 *       - 🟣 Incidents signalés (carte violette)
 *       - 📋 Liste détaillée des visiteurs présents sur site
 *     tags: [📱 Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ✅ Statistiques du dashboard récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     visitorsRegistered:
 *                       type: integer
 *                       description: 👥 Nombre total de visiteurs enregistrés (carte bleue)
 *                       example: 8
 *                     visitsInProgress:
 *                       type: integer
 *                       description: 🟢 Nombre de visites actuellement en cours (carte verte)
 *                       example: 3
 *                     visitsCompleted:
 *                       type: integer
 *                       description: 🟠 Nombre de visites terminées aujourd'hui (carte orange)
 *                       example: 5
 *                     incidentsReported:
 *                       type: integer
 *                       description: 🟣 Nombre total d'incidents signalés (carte violette)
 *                       example: 1
 *                     visitorsPresent:
 *                       type: array
 *                       description: 📋 Liste détaillée des visiteurs actuellement présents sur site
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             description: ID unique du visiteur
 *                             example: "880e8400-e29b-41d4-a716-446655440001"
 *                           name:
 *                             type: string
 *                             description: Nom complet du visiteur
 *                             example: "Marie KABORE"
 *                           company:
 *                             type: string
 *                             description: Entreprise du visiteur
 *                             example: "Entreprise KABORE & Fils"
 *                           phone:
 *                             type: string
 *                             description: Numéro de téléphone
 *                             example: "+226 70 11 22 33"
 *                           service:
 *                             type: string
 *                             description: Service visité
 *                             example: "Direction Générale"
 *                           entryTime:
 *                             type: string
 *                             format: date-time
 *                             description: Heure d'entrée sur le site
 *                             example: "2024-11-24T08:45:00Z"
 *                           reason:
 *                             type: string
 *                             description: Motif de la visite
 *                             example: "Réunion direction générale"
 *                     summary:
 *                       type: object
 *                       description: 📈 Résumé des statistiques
 *                       properties:
 *                         totalVisitorsToday:
 *                           type: integer
 *                           description: Total des visiteurs aujourd'hui (en cours + terminées)
 *                           example: 8
 *                         hasVisitorsPresent:
 *                           type: boolean
 *                           description: Y a-t-il des visiteurs actuellement présents ?
 *                           example: true
 *                         presentCount:
 *                           type: integer
 *                           description: Nombre exact de visiteurs présents maintenant
 *                           example: 3
 *             example:
 *               success: true
 *               data:
 *                 visitorsRegistered: 8
 *                 visitsInProgress: 3
 *                 visitsCompleted: 5
 *                 incidentsReported: 1
 *                 visitorsPresent:
 *                   - id: "880e8400-e29b-41d4-a716-446655440001"
 *                     name: "Marie KABORE"
 *                     company: "Entreprise KABORE & Fils"
 *                     phone: "+226 70 11 22 33"
 *                     service: "Direction Générale"
 *                     entryTime: "2024-11-24T08:45:00Z"
 *                     reason: "Réunion direction générale"
 *                   - id: "880e8400-e29b-41d4-a716-446655440002"
 *                     name: "Jean OUATTARA"
 *                     company: "Ouattara Consulting"
 *                     phone: "+226 76 44 55 66"
 *                     service: "Ressources Humaines"
 *                     entryTime: "2024-11-24T13:30:00Z"
 *                     reason: "Entretien d'embauche"
 *                 summary:
 *                   totalVisitorsToday: 8
 *                   hasVisitorsPresent: true
 *                   presentCount: 3
 *       401:
 *         description: ❌ Non autorisé - Token JWT manquant ou invalide
 *       500:
 *         description: ❌ Erreur serveur lors de la récupération des statistiques
 */
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
      name: `${visit.visitor.firstName} ${visit.visitor.lastName}`,
      company: visit.visitor.company,
      phone: visit.visitor.phone,
      service: visit.service?.name,
      entryTime: visit.entryTime,
      reason: visit.reason
    }));

    res.json({
      success: true,
      data: {
        // Statistiques principales (comme dans l'image)
        visitorsRegistered,      // 8 dans l'image
        visitsInProgress,        // 3 dans l'image  
        visitsCompleted,         // 5 dans l'image
        incidentsReported,       // 1 dans l'image
        
        // Détails des visiteurs présents
        visitorsPresent: presentVisitors,
        
        // Informations supplémentaires
        summary: {
          totalVisitorsToday: visitsInProgress + visitsCompleted,
          hasVisitorsPresent: presentVisitors.length > 0,
          presentCount: presentVisitors.length
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

/**
 * @swagger
 * /api/v1/dashboard/visitors-present:
 *   get:
 *     summary: 👥 Visiteurs Présents - Détails complets
 *     description: |
 *       Récupère la liste détaillée de tous les visiteurs actuellement présents sur site.
 *       Correspond à la section "Visiteurs présents" de l'application mobile.
 *       Affiche "Aucun visiteur présent" si la liste est vide.
 *     tags: [📱 Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ✅ Liste des visiteurs présents récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                       description: Nombre total de visiteurs présents
 *                       example: 2
 *                     visitors:
 *                       type: array
 *                       description: Liste détaillée des visiteurs présents
 *                       items:
 *                         type: object
 *                         properties:
 *                           visitId:
 *                             type: string
 *                             description: ID de la visite en cours
 *                             example: "aa0e8400-e29b-41d4-a716-446655440001"
 *                           visitor:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "880e8400-e29b-41d4-a716-446655440001"
 *                               name:
 *                                 type: string
 *                                 example: "Marie KABORE"
 *                               company:
 *                                 type: string
 *                                 example: "Entreprise KABORE & Fils"
 *                               phone:
 *                                 type: string
 *                                 example: "+226 70 11 22 33"
 *                               email:
 *                                 type: string
 *                                 example: "marie.kabore@email.com"
 *                           visit:
 *                             type: object
 *                             properties:
 *                               entryTime:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2024-11-24T08:45:00Z"
 *                               reason:
 *                                 type: string
 *                                 example: "Réunion direction générale"
 *                               service:
 *                                 type: string
 *                                 example: "Direction Générale"
 *                               checkpoint:
 *                                 type: string
 *                                 example: "Entrée Principale Ouaga"
 *                               site:
 *                                 type: string
 *                                 example: "Site Principal Ouagadougou"
 *             example:
 *               success: true
 *               data:
 *                 count: 2
 *                 visitors:
 *                   - visitId: "aa0e8400-e29b-41d4-a716-446655440001"
 *                     visitor:
 *                       id: "880e8400-e29b-41d4-a716-446655440001"
 *                       name: "Marie KABORE"
 *                       company: "Entreprise KABORE & Fils"
 *                       phone: "+226 70 11 22 33"
 *                       email: "marie.kabore@email.com"
 *                     visit:
 *                       entryTime: "2024-11-24T08:45:00Z"
 *                       reason: "Réunion direction générale"
 *                       service: "Direction Générale"
 *                       checkpoint: "Entrée Principale Ouaga"
 *                       site: "Site Principal Ouagadougou"
 *       401:
 *         description: ❌ Non autorisé - Token JWT manquant ou invalide
 *       500:
 *         description: ❌ Erreur serveur
 */
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
        name: `${visit.visitor.firstName} ${visit.visitor.lastName}`,
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

module.exports = router;
