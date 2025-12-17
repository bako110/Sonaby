const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requirePermissions } = require('../middleware/permissions');
const controller = require('../controllers/rolesPermissions.controller');
const { AgentPermission } = require('../utils/constants');

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Rôles
router.get('/roles', 
  requirePermissions(AgentPermission.MANAGE_ROLES),
  controller.getRoles
);

// Permissions
router.get('/permissions', 
  requirePermissions(AgentPermission.MANAGE_PERMISSIONS),
  controller.getPermissions
);

// Permissions utilisateur
router.get('/user/:userId/permissions',
  requirePermissions(AgentPermission.MANAGE_AGENT_PERMISSIONS),
  controller.getUserPermissions
);

// Assigner permission
router.post('/user/:userId/permissions',
  requirePermissions(AgentPermission.MANAGE_AGENT_PERMISSIONS),
  controller.assignPermission
);

// Retirer permission
router.delete('/user/:userId/permissions/:permission',
  requirePermissions(AgentPermission.MANAGE_AGENT_PERMISSIONS),
  controller.removePermission
);

// Initialiser permissions système (admin seulement)
router.post('/initialize',
  requirePermissions(AgentPermission.MANAGE_SYSTEM_SETTINGS),
  controller.initializePermissions
);

// Vérifier accès
router.get('/check-access/:userId',
  controller.checkAccess
);

module.exports = router;