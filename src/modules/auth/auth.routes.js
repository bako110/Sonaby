// src/modules/auth/auth.routes.js
const express = require('express');
const authController = require('./auth.controller');
const { authenticateToken } = require('../../middleware/authMiddleware');

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
 *     description: Permet de se connecter avec soit un email soit un numéro de téléphone
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
 *               $ref: '#/components/schemas/AuthResponse'
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
router.get('/profile', authenticateToken, authController.getProfile);

module.exports = router;
