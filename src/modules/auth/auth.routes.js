// src/modules/auth/auth.routes.js
const express = require('express');
const authController = require('./auth.controller');
// const { authenticateToken } = require('../../middleware/authMiddleware');
const { asyncHandler } = require('../../middleware/asyncHandler');

const router = express.Router();

// --------------------
// Routes publiques
// --------------------

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/register', authController.register);

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     summary: Connexion utilisateur avec email ou téléphone
 *     description: Permet de se connecter avec soit un email soit un numéro de téléphone. Pour les agents de contrôle, retourne également toutes les données du tableau de bord (site, checkpoints, visiteurs, visites).
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *           examples:
 *             loginWithEmail:
 *               summary: Connexion avec email
 *               value:
 *                 identifier: "user@example.com"
 *                 password: "motdepasse123"
 *             loginWithPhone:
 *               summary: Connexion avec téléphone
 *               value:
 *                 identifier: "+225 XX XX XX XX"
 *                 password: "motdepasse123"
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     dashboard:
 *                       type: object
 *                       description: Données complètes du tableau de bord (uniquement pour les agents de contrôle)
 *                       properties:
 *                         agent:
 *                           $ref: '#/components/schemas/User'
 *                         site:
 *                           $ref: '#/components/schemas/Site'
 *                         checkpoints:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Checkpoint'
 *                         visitors:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Visitor'
 *                         visits:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Visit'
 *                         statistics:
 *                           type: object
 *                           properties:
 *                             activeVisits:
 *                               type: integer
 *                             todayVisits:
 *                               type: integer
 *                             activeCheckpoints:
 *                               type: integer
 *                             blacklistedVisitors:
 *                               type: integer
 *                             totalCheckpoints:
 *                               type: integer
 *                             totalVisitors:
 *                               type: integer
 *       401:
 *         description: Identifiants invalides (email/téléphone ou mot de passe incorrect)
 */
router.post('/login', authController.login);

/**
 * @openapi
 * /api/v1/auth/refresh-token:
 *   post:
 *     summary: Refresh JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenInput'
 *     responses:
 *       200:
 *         description: New access token generated
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh-token', authController.refreshToken);

/**
 * @openapi
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout user (delete refresh token)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Successfully logged out
 *       401:
 *         description: Unauthorized
 */
router.post('/logout', authController.logout);

// --------------------
// Routes protégées
// --------------------

/**
 * @openapi
 * /api/v1/auth/profile:
 *   get:
 *     summary: Get authenticated user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *         content:
 *           application/json:
 * 
 *  
 *      
 *             schema:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Access denied
 */
router.get('/profile',  authController.getProfile);

/**
 * @openapi
 * /api/v1/auth/agent-dashboard:
 *   get:
 *     summary: Tableau de bord complet pour agent de contrôle
 *     description: Retourne toutes les informations nécessaires pour un agent de contrôle après connexion: site d'affectation, checkpoints, visiteurs et visites liés au site
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Données complètes du tableau de bord agent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     agent:
 *                       $ref: '#/components/schemas/User'
 *                     site:
 *                       $ref: '#/components/schemas/Site'
 *                     checkpoints:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Checkpoint'
 *                     visitors:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Visitor'
 *                     visits:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Visit'
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         activeVisits:
 *                           type: integer
 *                         todayVisits:
 *                           type: integer
 *                         activeCheckpoints:
 *                           type: integer
 *                         blacklistedVisitors:
 *                           type: integer
 *                         totalCheckpoints:
 *                           type: integer
 *                         totalVisitors:
 *                           type: integer
 *       403:
 *         description: Accès réservé aux agents de contrôle
 *       401:
 *         description: Non authentifié
 */
router.get('/agent-dashboard',  authController.getAgentDashboard);

/**
 * @swagger
 * /api/v1/auth/test-login:
 *   post:
 *     summary: Tester la connexion sans vérification de mot de passe (développement uniquement)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email ou téléphone
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 description: Mot de passe (non vérifié)
 *                 example: "test123"
 *     responses:
 *       200:
 *         description: Utilisateur trouvé (développement)
 *       404:
 *         description: Utilisateur non trouvé
 */
router.post('/test-login', asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  
  // Déterminer si c'est un email ou téléphone
  const isEmail = identifier.includes('@');
  
  // Chercher l'utilisateur
  const user = await prisma.user.findFirst({
    where: isEmail ? { email: identifier } : { phone: identifier },
    select: {
      id: true,
      email: true,
      phone: true,
      passwordHash: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true
    }
  });
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Utilisateur non trouvé',
      debug: {
        identifier,
        isEmail,
        found: false
      }
    });
  }
  
  // Retourner les infos de l'utilisateur (sans vérifier le mot de passe)
  const { passwordHash, ...userWithoutPassword } = user;
  
  res.json({
    success: true,
    message: 'Utilisateur trouvé (test)',
    debug: {
      identifier,
      isEmail,
      found: true,
      isActive: user.isActive,
      hasPasswordHash: !!passwordHash,
      passwordHashLength: passwordHash?.length || 0
    },
    user: userWithoutPassword
  });
}));

/**
 * @swagger
 * /api/v1/auth/create-test-user:
 *   post:
 *     summary: Créer un utilisateur de test (développement uniquement)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "test@example.com"
 *               password:
 *                 type: string
 *                 example: "test123"
 *               role:
 *                 type: string
 *                 enum: ["ADMIN", "AGENT_GESTION", "AGENT_CONTROLE"]
 *                 example: "AGENT_CONTROLE"
 *     responses:
 *       201:
 *         description: Utilisateur de test créé
 */
router.post('/create-test-user', asyncHandler(async (req, res) => {
  const { email, password, role = 'AGENT_CONTROLE' } = req.body;
  
  // Vérifier si l'utilisateur existe déjà
  const existingUser = await prisma.user.findFirst({
    where: { email }
  });
  
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'Utilisateur existe déjà'
    });
  }
  
  // Hacher le mot de passe
  const bcrypt = require('bcryptjs');
  const passwordHash = await bcrypt.hash(password, 10);
  
  // Créer l'utilisateur
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role,
      firstName: 'Test',
      lastName: 'User',
      isActive: true
    }
  });
  
  const { passwordHash: _, ...userWithoutPassword } = user;
  
  res.status(201).json({
    success: true,
    message: 'Utilisateur de test créé',
    user: userWithoutPassword
  });
}));

/**
 * @swagger
 * /api/v1/auth/assign-site:
 *   post:
 *     summary: Assigner un site à un utilisateur (développement uniquement)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 example: "4157207b-cb89-11f0-aa39-0242ac140013"
 *               siteId:
 *                 type: string
 *                 format: uuid
 *                 example: "550e8400-e29b-41d4-a716-446655440001"
 *     responses:
 *       200:
 *         description: Site assigné avec succès
 */
router.post('/assign-site', asyncHandler(async (req, res) => {
  const { userId, siteId } = req.body;
  
  // Vérifier si l'utilisateur existe
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Utilisateur non trouvé'
    });
  }
  
  // Vérifier si le site existe
  const site = await prisma.site.findUnique({
    where: { id: siteId }
  });
  
  if (!site) {
    return res.status(404).json({
      success: false,
      message: 'Site non trouvé'
    });
  }
  
  // Vérifier si l'assignation existe déjà
  const existingAssignment = await prisma.userSite.findUnique({
    where: {
      userId_siteId: {
        userId,
        siteId
      }
    }
  });
  
  if (existingAssignment) {
    return res.status(400).json({
      success: false,
      message: 'Cet utilisateur est déjà assigné à ce site'
    });
  }
  
  // Créer l'assignation
  const assignment = await prisma.userSite.create({
    data: {
      userId,
      siteId
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true
        }
      },
      site: {
        select: {
          id: true,
          name: true,
          city: true
        }
      }
    }
  });
  
  res.json({
    success: true,
    message: 'Site assigné avec succès',
    data: assignment
  });
}));

module.exports = router;
