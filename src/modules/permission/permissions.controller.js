const permissionsService = require('../services/permissions.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class RolesPermissionsController {
  // Obtenir tous les rôles
  async getRoles(req, res) {
    try {
      const roles = await permissionsService.getRolesInfo();
      
      // Statistiques
      const stats = {
        totalRoles: roles.length,
        activeRoles: roles.filter(r => r.isActive).length,
        systemRoles: roles.filter(r => r.isSystem).length,
        totalUsers: roles.reduce((total, role) => total + (role.userCount || 0), 0),
        rolesWithoutUsers: roles.filter(r => !r.userCount || r.userCount === 0).length
      };

      res.json({
        success: true,
        data: roles,
        stats,
        message: 'Rôles récupérés avec succès'
      });
    } catch (error) {
      console.error('Erreur getRoles:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erreur lors de la récupération des rôles' 
      });
    }
  }

  // Obtenir les permissions groupées
  async getPermissions(req, res) {
    try {
      const { module, search } = req.query;
      let permissions = permissionsService.getPermissionsGrouped();

      // Filtrer par module
      if (module) {
        permissions = permissions.filter(p => p.module === module);
      }

      // Filtrer par recherche
      if (search) {
        permissions = permissions.map(moduleGroup => ({
          ...moduleGroup,
          categories: moduleGroup.categories.map(category => ({
            ...category,
            permissions: category.permissions.filter(perm => 
              perm.name.toLowerCase().includes(search.toLowerCase()) ||
              perm.code.toLowerCase().includes(search.toLowerCase())
            )
          })).filter(category => category.permissions.length > 0)
        })).filter(moduleGroup => moduleGroup.categories.length > 0);
      }

      res.json({
        success: true,
        data: permissions,
        message: 'Permissions récupérées avec succès'
      });
    } catch (error) {
      console.error('Erreur getPermissions:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erreur lors de la récupération des permissions' 
      });
    }
  }

  // Obtenir les permissions d'un utilisateur
  async getUserPermissions(req, res) {
    try {
      const { userId } = req.params;
      
      const permissions = await permissionsService.getUserPermissions(userId);
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true
        }
      });

      res.json({
        success: true,
        data: {
          user,
          permissions,
          count: permissions.length
        },
        message: 'Permissions utilisateur récupérées'
      });
    } catch (error) {
      console.error('Erreur getUserPermissions:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erreur lors de la récupération des permissions utilisateur' 
      });
    }
  }

  // Assigner une permission à un utilisateur
  async assignPermission(req, res) {
    try {
      const { userId } = req.params;
      const { permission } = req.body;

      if (!permission) {
        return res.status(400).json({ 
          success: false, 
          error: 'Permission requise' 
        });
      }

      const result = await permissionsService.assignPermissionToUser(userId, permission);
      
      if (result.success) {
        // Log d'audit
        await prisma.auditLog.create({
          data: {
            userId: req.user.id,
            action: 'ASSIGN_PERMISSION',
            entity: 'USER',
            entityId: userId,
            newValues: { permission },
            ipAddress: req.ip
          }
        });

        res.json({
          success: true,
          message: 'Permission assignée avec succès'
        });
      } else {
        res.status(400).json({ 
          success: false, 
          error: result.error 
        });
      }
    } catch (error) {
      console.error('Erreur assignPermission:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erreur lors de l\'assignation de la permission' 
      });
    }
  }

  // Retirer une permission d'un utilisateur
  async removePermission(req, res) {
    try {
      const { userId, permission } = req.params;

      const result = await permissionsService.removePermissionFromUser(userId, permission);
      
      if (result.success) {
        // Log d'audit
        await prisma.auditLog.create({
          data: {
            userId: req.user.id,
            action: 'REMOVE_PERMISSION',
            entity: 'USER',
            entityId: userId,
            oldValues: { permission },
            ipAddress: req.ip
          }
        });

        res.json({
          success: true,
          message: 'Permission retirée avec succès'
        });
      } else {
        res.status(400).json({ 
          success: false, 
          error: result.error 
        });
      }
    } catch (error) {
      console.error('Erreur removePermission:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erreur lors du retrait de la permission' 
      });
    }
  }

  // Initialiser les permissions système
  async initializePermissions(req, res) {
    try {
      const result = await permissionsService.initializePermissions();
      
      if (result) {
        res.json({
          success: true,
          message: 'Permissions système initialisées avec succès'
        });
      } else {
        res.status(500).json({ 
          success: false, 
          error: 'Échec de l\'initialisation des permissions' 
        });
      }
    } catch (error) {
      console.error('Erreur initializePermissions:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erreur lors de l\'initialisation des permissions' 
      });
    }
  }

  // Vérifier l'accès à une ressource
  async checkAccess(req, res) {
    try {
      const { userId } = req.params;
      const { resource, action } = req.query;

      if (!resource || !action) {
        return res.status(400).json({ 
          success: false, 
          error: 'Resource et action requis' 
        });
      }

      // Mapping ressource/action vers permission
      const permission = this._mapResourceToPermission(resource, action);
      if (!permission) {
        return res.json({
          success: true,
          hasAccess: false,
          message: 'Aucune permission correspondante'
        });
      }

      const hasAccess = await permissionsService.userHasPermission(userId, permission);
      
      res.json({
        success: true,
        hasAccess,
        userId,
        resource,
        action,
        permission
      });
    } catch (error) {
      console.error('Erreur checkAccess:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erreur lors de la vérification d\'accès' 
      });
    }
  }

  // Méthode utilitaire: mapping ressource -> permission
  _mapResourceToPermission(resource, action) {
    const mapping = {
      'checkpoints': {
        'view': 'VIEW_CHECKPOINTS',
        'create': 'CREATE_CHECKPOINTS',
        'edit': 'EDIT_CHECKPOINTS',
        'delete': 'DELETE_CHECKPOINTS'
      },
      'sites': {
        'view': 'VIEW_SITES',
        'create': 'CREATE_SITES',
        'edit': 'EDIT_SITES',
        'delete': 'DELETE_SITES',
        'manage': 'MANAGE_SITES'
      },
      'agents': {
        'view': 'VIEW_AGENTS',
        'create': 'CREATE_AGENTS',
        'edit': 'EDIT_AGENTS',
        'delete': 'DELETE_AGENTS',
        'manage': 'MANAGE_AGENTS'
      },
      'visitors': {
        'view': 'VIEW_VISITORS',
        'create': 'CREATE_VISITORS',
        'edit': 'EDIT_VISITORS',
        'delete': 'DELETE_VISITORS'
      },
      'visits': {
        'view': 'VIEW_VISITS',
        'create': 'CREATE_VISITS',
        'edit': 'EDIT_VISITS',
        'delete': 'DELETE_VISITS'
      },
      'incidents': {
        'view': 'VIEW_INCIDENTS',
        'create': 'CREATE_INCIDENTS',
        'edit': 'EDIT_INCIDENTS',
        'delete': 'DELETE_INCIDENTS'
      }
    };

    return mapping[resource]?.[action];
  }
}

module.exports = new RolesPermissionsController();