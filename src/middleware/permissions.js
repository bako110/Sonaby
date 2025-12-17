const permissionsService = require('../services/permissions.service');

// Middleware de vérification de permissions
const requirePermissions = (...requiredPermissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          error: 'Utilisateur non authentifié' 
        });
      }

      // Vérifier chaque permission requise
      for (const permission of requiredPermissions) {
        const hasPermission = await permissionsService.userHasPermission(
          req.user.id, 
          permission
        );
        
        if (!hasPermission) {
          return res.status(403).json({ 
            success: false, 
            error: `Permission requise: ${permission}` 
          });
        }
      }

      next();
    } catch (error) {
      console.error('Erreur vérification permissions:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erreur de vérification des permissions' 
      });
    }
  };
};

module.exports = { requirePermissions };