// src/modules/user/user.routes.js
const express = require('express');
const userController = require('./user.controller');
const { authenticateToken, allowRoles } = require('../../middleware/authMiddleware');

const router = express.Router();

// Route de test publique (pour vérifier que l'API fonctionne)
/**
 * @openapi
 * /api/v1/users/test:
 *   get:
 *     summary: Test endpoint to check if users API is working
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: API is working
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 userCount:
 *                   type: number
 */
router.get('/test', async (req, res) => {
  try {
    const { prisma } = require('../../config/prisma');
    const userCount = await prisma.user.count();
    res.json({
      success: true,
      message: 'Users API is working',
      userCount: userCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Database connection failed',
      message: error.message
    });
  }
});

// Toutes les autres routes utilisateurs nécessitent authentification
router.use(authenticateToken);

// --------------------
// Routes Admin uniquement
// --------------------

/**
 * @openapi
 * /api/v1/user:
 *   post:
 *     summary: Create a new user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
 *               $ref: '#/components/schemas/User'
 *       403:
 *         description: Forbidden
 */
router.post('/', allowRoles('ADMIN'), userController.createUser);

/**
 * @openapi
 * /api/v1/user/{id}:
 *   delete:
 *     summary: Delete a user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.delete('/:id', allowRoles('ADMIN'), userController.deleteUser);

// --------------------
// Routes accessibles par tous les utilisateurs authentifiés avec rôle
// --------------------

/**
 * @openapi
 * /api/v1/user:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get(
  '/',
  allowRoles('ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE', 'CHEF_SERVICE'),
  userController.getAllUsers
);

/**
 * @openapi
 * /api/v1/user/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.get(
  '/:id',
  allowRoles('ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE', 'CHEF_SERVICE'),
  userController.getUserById
);

/**
 * @openapi
 * /api/v1/user/{id}:
 *   patch:
 *     summary: Update a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.patch(
  '/:id',
  allowRoles('ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE', 'CHEF_SERVICE'),
  userController.updateUser
);

module.exports = router;
