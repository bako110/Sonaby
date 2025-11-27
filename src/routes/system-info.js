const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/authMiddleware');

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/v1/system/available-data:
 *   get:
 *     summary: Récupérer les données disponibles pour la création d'utilisateurs
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Données disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     sites:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           city:
 *                             type: string
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           description:
 *                             type: string
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: string
 */
router.get('/available-data', authenticate, async (req, res) => {
  try {
    // Récupérer tous les sites
    const sites = await prisma.site.findMany({
      select: {
        id: true,
        name: true,
        city: true,
        status: true
      },
      where: {
        status: 'ACTIVE'
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Récupérer toutes les permissions
    const permissions = await prisma.permission.findMany({
      select: {
        id: true,
        name: true,
        description: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Rôles disponibles
    const roles = ['ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE', 'CHEF_SERVICE'];

    res.json({
      success: true,
      data: {
        sites,
        permissions,
        roles,
        info: {
          totalSites: sites.length,
          totalPermissions: permissions.length,
          totalRoles: roles.length
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des données système:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
