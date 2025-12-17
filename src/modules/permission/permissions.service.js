const { PrismaClient } = require('@prisma/client');
const { 
  AgentRole, 
  AgentPermission, 
  DEFAULT_PERMISSIONS,
  ROLE_INFO 
} = require('../utils/constants');

const prisma = new PrismaClient();

class PermissionsService {
  constructor() {
    this.prisma = prisma;
  }

  /**
   * Vérifie si un utilisateur a une permission
   */
  async userHasPermission(userId, permission) {
    try {
      // 1. Vérifier les permissions directes
      const userPermission = await this.prisma.userPermission.findFirst({
        where: {
          userId,
          permission: {
            name: permission
          }
        },
        include: { permission: true }
      });

      if (userPermission) {
        return true;
      }

      // 2. Récupérer le rôle de l'utilisateur
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (!user || !user.role) {
        return false;
      }

      // 3. Vérifier les permissions par défaut du rôle
      const rolePermissions = DEFAULT_PERMISSIONS[user.role] || [];
      return rolePermissions.includes(permission);
    } catch (error) {
      console.error('Erreur vérification permission:', error);
      return false;
    }
  }

  /**
   * Obtient toutes les permissions d'un utilisateur
   */
  async getUserPermissions(userId) {
    try {
      // Permissions directes
      const userPermissions = await this.prisma.userPermission.findMany({
        where: { userId },
        include: { permission: true }
      });

      const directPermissions = userPermissions.map(up => up.permission.name);

      // Permissions du rôle
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      let rolePermissions = [];
      if (user && user.role) {
        rolePermissions = DEFAULT_PERMISSIONS[user.role] || [];
      }

      // Fusionner sans doublons
      return [...new Set([...directPermissions, ...rolePermissions])];
    } catch (error) {
      console.error('Erreur récupération permissions:', error);
      return [];
    }
  }

  /**
   * Initialise les permissions dans la base
   */
  async initializePermissions() {
    try {
      const allPermissions = Object.values(AgentPermission);
      
      for (const permission of allPermissions) {
        await this.prisma.permission.upsert({
          where: { name: permission },
          update: {
            description: this._getPermissionDescription(permission)
          },
          create: {
            name: permission,
            description: this._getPermissionDescription(permission)
          }
        });
      }
      
      console.log('✅ Permissions initialisées');
      return true;
    } catch (error) {
      console.error('❌ Erreur initialisation permissions:', error);
      return false;
    }
  }

  /**
   * Assigner une permission à un utilisateur
   */
  async assignPermissionToUser(userId, permission) {
    try {
      // Vérifier si la permission existe
      let permissionRecord = await this.prisma.permission.findUnique({
        where: { name: permission }
      });

      // Créer si elle n'existe pas
      if (!permissionRecord) {
        permissionRecord = await this.prisma.permission.create({
          data: {
            name: permission,
            description: this._getPermissionDescription(permission)
          }
        });
      }

      // Assigner
      await this.prisma.userPermission.upsert({
        where: {
          userId_permissionId: {
            userId,
            permissionId: permissionRecord.id
          }
        },
        update: {},
        create: {
          userId,
          permissionId: permissionRecord.id
        }
      });

      return { success: true, message: 'Permission assignée' };
    } catch (error) {
      console.error('Erreur assignation permission:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Retirer une permission d'un utilisateur
   */
  async removePermissionFromUser(userId, permission) {
    try {
      const permissionRecord = await this.prisma.permission.findUnique({
        where: { name: permission }
      });

      if (permissionRecord) {
        await this.prisma.userPermission.deleteMany({
          where: {
            userId,
            permissionId: permissionRecord.id
          }
        });
      }

      return { success: true, message: 'Permission retirée' };
    } catch (error) {
      console.error('Erreur suppression permission:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtient les informations sur tous les rôles
   */
  async getRolesInfo() {
    const roles = Object.values(AgentRole);
    const rolesWithInfo = [];

    for (const role of roles) {
      // Compter les utilisateurs pour ce rôle
      const userCount = await this.prisma.user.count({
        where: { role }
      });

      rolesWithInfo.push({
        id: role,
        name: ROLE_INFO[role]?.name || role,
        code: role,
        description: ROLE_INFO[role]?.description || '',
        userCount,
        isActive: true,
        isSystem: ROLE_INFO[role]?.isSystem || false,
        permissions: DEFAULT_PERMISSIONS[role] || [],
        color: ROLE_INFO[role]?.color || '#6b7280'
      });
    }

    return rolesWithInfo;
  }

  /**
   * Obtient les permissions groupées par module
   */
  getPermissionsGrouped() {
    const allPermissions = Object.values(AgentPermission);
    const modules = {};

    allPermissions.forEach(permission => {
      const module = this._getPermissionModule(permission);
      const category = this._getPermissionCategory(permission);
      const action = this._getPermissionAction(permission);

      if (!modules[module]) {
        modules[module] = {
          module,
          categories: {}
        };
      }

      if (!modules[module].categories[category]) {
        modules[module].categories[category] = {
          name: category,
          permissions: []
        };
      }

      modules[module].categories[category].permissions.push({
        id: permission,
        name: this._getPermissionName(permission),
        description: this._getPermissionDescription(permission),
        code: permission,
        module,
        category,
        action
      });
    });

    // Convertir en tableau
    return Object.values(modules).map(module => ({
      module: module.module,
      categories: Object.values(module.categories)
    }));
  }

  // Méthodes utilitaires privées
  _getPermissionModule(permission) {
    if (permission.includes('CHECKPOINT')) return 'CHECKPOINTS';
    if (permission.includes('SITE')) return 'SITES';
    if (permission.includes('AGENT')) return 'AGENTS';
    if (permission.includes('SOS')) return 'SOS';
    if (permission.includes('APPOINTMENT')) return 'APPOINTMENTS';
    if (permission.includes('BLACKLIST')) return 'BLACKLIST';
    if (permission.includes('INCIDENT')) return 'INCIDENTS';
    if (permission.includes('VISITOR')) return 'VISITORS';
    if (permission.includes('VISIT')) return 'VISITS';
    if (permission.includes('REPORT') || permission.includes('STATISTICS')) return 'REPORTS';
    if (permission.includes('SYSTEM') || permission.includes('ROLE') || permission.includes('AUDIT') || permission.includes('BACKUP')) return 'SYSTEM';
    return 'GENERAL';
  }

  _getPermissionCategory(permission) {
    if (permission.includes('VIEW')) return 'READ';
    if (permission.includes('CREATE')) return 'CREATE';
    if (permission.includes('EDIT') || permission.includes('UPDATE')) return 'UPDATE';
    if (permission.includes('DELETE')) return 'DELETE';
    if (permission.includes('MANAGE')) return 'MANAGE';
    if (permission.includes('EXPORT')) return 'EXPORT';
    return 'OTHER';
  }

  _getPermissionAction(permission) {
    if (permission.includes('VIEW')) return 'VIEW';
    if (permission.includes('CREATE')) return 'CREATE';
    if (permission.includes('EDIT')) return 'EDIT';
    if (permission.includes('DELETE')) return 'DELETE';
    if (permission.includes('MANAGE')) return 'MANAGE';
    if (permission.includes('EXPORT')) return 'EXPORT';
    return 'OTHER';
  }

  _getPermissionName(permission) {
    const names = {
      // Checkpoints
      [AgentPermission.VIEW_CHECKPOINTS]: 'Voir les checkpoints',
      [AgentPermission.CREATE_CHECKPOINTS]: 'Créer des checkpoints',
      [AgentPermission.EDIT_CHECKPOINTS]: 'Modifier les checkpoints',
      [AgentPermission.DELETE_CHECKPOINTS]: 'Supprimer les checkpoints',
      [AgentPermission.ASSIGN_CHECKPOINT_AGENTS]: 'Assigner des agents aux checkpoints',
      [AgentPermission.MANAGE_CHECKPOINT_STATUS]: 'Gérer le statut des checkpoints',
      
      // Sites
      [AgentPermission.VIEW_SITES]: 'Voir les sites',
      [AgentPermission.CREATE_SITES]: 'Créer des sites',
      [AgentPermission.EDIT_SITES]: 'Modifier les sites',
      [AgentPermission.DELETE_SITES]: 'Supprimer les sites',
      [AgentPermission.MANAGE_SITES]: 'Gérer les sites',
      
      // Agents
      [AgentPermission.VIEW_AGENTS]: 'Voir les agents',
      [AgentPermission.CREATE_AGENTS]: 'Créer des agents',
      [AgentPermission.EDIT_AGENTS]: 'Modifier les agents',
      [AgentPermission.DELETE_AGENTS]: 'Supprimer les agents',
      [AgentPermission.MANAGE_AGENTS]: 'Gérer les agents',
      [AgentPermission.RESET_PASSWORDS]: 'Réinitialiser les mots de passe',
      [AgentPermission.ACTIVATE_DEACTIVATE_AGENTS]: 'Activer/Désactiver les agents',
      [AgentPermission.MANAGE_AGENT_PERMISSIONS]: 'Gérer les permissions des agents',
      
      // SOS
      [AgentPermission.MANAGE_SOS]: 'Gérer le système SOS',
      [AgentPermission.VIEW_SOS_LOGS]: 'Voir les logs SOS',
      [AgentPermission.TRIGGER_SOS]: 'Déclencher SOS',
      
      // Rendez-vous
      [AgentPermission.VIEW_APPOINTMENTS]: 'Voir les rendez-vous',
      [AgentPermission.CREATE_APPOINTMENTS]: 'Créer des rendez-vous',
      [AgentPermission.EDIT_APPOINTMENTS]: 'Modifier les rendez-vous',
      [AgentPermission.DELETE_APPOINTMENTS]: 'Supprimer les rendez-vous',
      
      // Visiteurs
      [AgentPermission.VIEW_VISITORS]: 'Voir les visiteurs',
      [AgentPermission.CREATE_VISITORS]: 'Créer des visiteurs',
      [AgentPermission.EDIT_VISITORS]: 'Modifier les visiteurs',
      [AgentPermission.DELETE_VISITORS]: 'Supprimer des visiteurs',
      [AgentPermission.MANAGE_BLACKLIST]: 'Gérer la liste noire',
      
      // Visites
      [AgentPermission.VIEW_VISITS]: 'Voir les visites',
      [AgentPermission.CREATE_VISITS]: 'Créer des visites',
      [AgentPermission.EDIT_VISITS]: 'Modifier les visites',
      [AgentPermission.DELETE_VISITS]: 'Supprimer des visites',
      
      // Incidents
      [AgentPermission.VIEW_INCIDENTS]: 'Voir les incidents',
      [AgentPermission.CREATE_INCIDENTS]: 'Créer des incidents',
      [AgentPermission.EDIT_INCIDENTS]: 'Modifier les incidents',
      [AgentPermission.DELETE_INCIDENTS]: 'Supprimer des incidents',
      
      // Rapports
      [AgentPermission.VIEW_REPORTS]: 'Voir les rapports',
      [AgentPermission.EXPORT_DATA]: 'Exporter les données',
      [AgentPermission.VIEW_STATISTICS]: 'Voir les statistiques',
      
      // Système
      [AgentPermission.MANAGE_SYSTEM_SETTINGS]: 'Gérer les paramètres système',
      [AgentPermission.MANAGE_ROLES]: 'Gérer les rôles',
      [AgentPermission.MANAGE_PERMISSIONS]: 'Gérer les permissions',
      [AgentPermission.VIEW_AUDIT_LOGS]: 'Voir les logs d\'audit',
      [AgentPermission.BACKUP_RESTORE]: 'Backup/Restore',
    };
    
    return names[permission] || permission.replace(/_/g, ' ');
  }

  _getPermissionDescription(permission) {
    const descriptions = {
      [AgentPermission.VIEW_CHECKPOINTS]: 'Permet de consulter la liste et les détails des checkpoints',
      [AgentPermission.CREATE_CHECKPOINTS]: 'Permet de créer de nouveaux checkpoints dans le système',
      [AgentPermission.EDIT_CHECKPOINTS]: 'Permet de modifier les informations des checkpoints existants',
      [AgentPermission.DELETE_CHECKPOINTS]: 'Permet de supprimer définitivement des checkpoints',
      [AgentPermission.ASSIGN_CHECKPOINT_AGENTS]: 'Permet d\'assigner des agents aux checkpoints',
      [AgentPermission.MANAGE_CHECKPOINT_STATUS]: 'Permet de gérer le statut des checkpoints',
      [AgentPermission.VIEW_SITES]: 'Permet de consulter la liste et les détails des sites',
      [AgentPermission.CREATE_SITES]: 'Permet de créer de nouveaux sites',
      [AgentPermission.EDIT_SITES]: 'Permet de modifier les informations des sites existants',
      [AgentPermission.DELETE_SITES]: 'Permet de supprimer définitivement des sites',
      [AgentPermission.MANAGE_SITES]: 'Permet la gestion complète des sites',
      [AgentPermission.VIEW_AGENTS]: 'Permet de consulter la liste et les profils des agents',
      [AgentPermission.CREATE_AGENTS]: 'Permet de créer de nouveaux comptes agents',
      [AgentPermission.EDIT_AGENTS]: 'Permet de modifier les informations des agents',
      [AgentPermission.DELETE_AGENTS]: 'Permet de supprimer définitivement des agents',
      [AgentPermission.MANAGE_AGENTS]: 'Permet la gestion complète des comptes agents',
      [AgentPermission.RESET_PASSWORDS]: 'Permet de réinitialiser les mots de passe des agents',
      [AgentPermission.ACTIVATE_DEACTIVATE_AGENTS]: 'Permet d\'activer ou désactiver les comptes agents',
      [AgentPermission.MANAGE_AGENT_PERMISSIONS]: 'Permet de gérer les permissions spécifiques des agents',
      [AgentPermission.MANAGE_SOS]: 'Permet la configuration et gestion du système SOS',
      [AgentPermission.VIEW_SOS_LOGS]: 'Permet de consulter les logs du système SOS',
      [AgentPermission.TRIGGER_SOS]: 'Permet de déclencher une alerte SOS',
      [AgentPermission.VIEW_APPOINTMENTS]: 'Permet de consulter les rendez-vous',
      [AgentPermission.CREATE_APPOINTMENTS]: 'Permet de créer de nouveaux rendez-vous',
      [AgentPermission.EDIT_APPOINTMENTS]: 'Permet de modifier les rendez-vous existants',
      [AgentPermission.DELETE_APPOINTMENTS]: 'Permet de supprimer des rendez-vous',
      [AgentPermission.VIEW_VISITORS]: 'Permet de consulter la liste et les détails des visiteurs',
      [AgentPermission.CREATE_VISITORS]: 'Permet de créer de nouveaux profils visiteurs',
      [AgentPermission.EDIT_VISITORS]: 'Permet de modifier les informations des visiteurs',
      [AgentPermission.DELETE_VISITORS]: 'Permet de supprimer des profils visiteurs',
      [AgentPermission.MANAGE_BLACKLIST]: 'Permet de gérer la liste noire des visiteurs',
      [AgentPermission.VIEW_VISITS]: 'Permet de consulter l\'historique des visites',
      [AgentPermission.CREATE_VISITS]: 'Permet d\'enregistrer de nouvelles visites',
      [AgentPermission.EDIT_VISITS]: 'Permet de modifier les informations des visites',
      [AgentPermission.DELETE_VISITS]: 'Permet de supprimer des enregistrements de visites',
      [AgentPermission.VIEW_INCIDENTS]: 'Permet de consulter la liste des incidents',
      [AgentPermission.CREATE_INCIDENTS]: 'Permet de signaler de nouveaux incidents',
      [AgentPermission.EDIT_INCIDENTS]: 'Permet de modifier les informations des incidents',
      [AgentPermission.DELETE_INCIDENTS]: 'Permet de supprimer des incidents',
      [AgentPermission.VIEW_REPORTS]: 'Permet d\'accéder aux rapports du système',
      [AgentPermission.EXPORT_DATA]: 'Permet d\'exporter des données du système',
      [AgentPermission.VIEW_STATISTICS]: 'Permet de consulter les statistiques',
      [AgentPermission.MANAGE_SYSTEM_SETTINGS]: 'Permet de modifier les paramètres système',
      [AgentPermission.MANAGE_ROLES]: 'Permet de gérer les rôles utilisateurs',
      [AgentPermission.MANAGE_PERMISSIONS]: 'Permet de gérer les permissions',
      [AgentPermission.VIEW_AUDIT_LOGS]: 'Permet de consulter les logs d\'audit',
      [AgentPermission.BACKUP_RESTORE]: 'Permet de réaliser des sauvegardes et restaurations',
    };
    
    return descriptions[permission] || `Permission: ${permission}`;
  }
}

module.exports = new PermissionsService();