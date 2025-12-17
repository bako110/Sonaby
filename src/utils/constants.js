// Rôles agents
const AgentRole = {
  ADMIN: 'ADMIN',
  AGENT_GESTION: 'AGENT_GESTION',
  AGENT_CONTROLE: 'AGENT_CONTROLE',
  CHEF_SERVICE: 'CHEF_SERVICE'
};

// Permissions agents
const AgentPermission = {
  // Checkpoints
  VIEW_CHECKPOINTS: 'VIEW_CHECKPOINTS',
  CREATE_CHECKPOINTS: 'CREATE_CHECKPOINTS',
  EDIT_CHECKPOINTS: 'EDIT_CHECKPOINTS',
  DELETE_CHECKPOINTS: 'DELETE_CHECKPOINTS',
  ASSIGN_CHECKPOINT_AGENTS: 'ASSIGN_CHECKPOINT_AGENTS',
  MANAGE_CHECKPOINT_STATUS: 'MANAGE_CHECKPOINT_STATUS',
  
  // Sites
  VIEW_SITES: 'VIEW_SITES',
  CREATE_SITES: 'CREATE_SITES',
  EDIT_SITES: 'EDIT_SITES',
  DELETE_SITES: 'DELETE_SITES',
  MANAGE_SITES: 'MANAGE_SITES',
  
  // Agents
  VIEW_AGENTS: 'VIEW_AGENTS',
  CREATE_AGENTS: 'CREATE_AGENTS',
  EDIT_AGENTS: 'EDIT_AGENTS',
  DELETE_AGENTS: 'DELETE_AGENTS',
  MANAGE_AGENTS: 'MANAGE_AGENTS',
  RESET_PASSWORDS: 'RESET_PASSWORDS',
  ACTIVATE_DEACTIVATE_AGENTS: 'ACTIVATE_DEACTIVATE_AGENTS',
  MANAGE_AGENT_PERMISSIONS: 'MANAGE_AGENT_PERMISSIONS',
  
  // SOS
  MANAGE_SOS: 'MANAGE_SOS',
  VIEW_SOS_LOGS: 'VIEW_SOS_LOGS',
  TRIGGER_SOS: 'TRIGGER_SOS',
  
  // Rendez-vous
  VIEW_APPOINTMENTS: 'VIEW_APPOINTMENTS',
  CREATE_APPOINTMENTS: 'CREATE_APPOINTMENTS',
  EDIT_APPOINTMENTS: 'EDIT_APPOINTMENTS',
  DELETE_APPOINTMENTS: 'DELETE_APPOINTMENTS',
  
  // Visiteurs
  VIEW_VISITORS: 'VIEW_VISITORS',
  CREATE_VISITORS: 'CREATE_VISITORS',
  EDIT_VISITORS: 'EDIT_VISITORS',
  DELETE_VISITORS: 'DELETE_VISITORS',
  MANAGE_BLACKLIST: 'MANAGE_BLACKLIST',
  
  // Visites
  VIEW_VISITS: 'VIEW_VISITS',
  CREATE_VISITS: 'CREATE_VISITS',
  EDIT_VISITS: 'EDIT_VISITS',
  DELETE_VISITS: 'DELETE_VISITS',
  
  // Incidents
  VIEW_INCIDENTS: 'VIEW_INCIDENTS',
  CREATE_INCIDENTS: 'CREATE_INCIDENTS',
  EDIT_INCIDENTS: 'EDIT_INCIDENTS',
  DELETE_INCIDENTS: 'DELETE_INCIDENTS',
  
  // Rapports
  VIEW_REPORTS: 'VIEW_REPORTS',
  EXPORT_DATA: 'EXPORT_DATA',
  VIEW_STATISTICS: 'VIEW_STATISTICS',
  
  // Système
  MANAGE_SYSTEM_SETTINGS: 'MANAGE_SYSTEM_SETTINGS',
  MANAGE_ROLES: 'MANAGE_ROLES',
  MANAGE_PERMISSIONS: 'MANAGE_PERMISSIONS',
  VIEW_AUDIT_LOGS: 'VIEW_AUDIT_LOGS',
  BACKUP_RESTORE: 'BACKUP_RESTORE'
};

// Permissions par défaut pour chaque rôle
const DEFAULT_PERMISSIONS = {
  [AgentRole.ADMIN]: Object.values(AgentPermission),
  [AgentRole.AGENT_GESTION]: [
    AgentPermission.VIEW_CHECKPOINTS,
    AgentPermission.CREATE_CHECKPOINTS,
    AgentPermission.EDIT_CHECKPOINTS,
    AgentPermission.MANAGE_CHECKPOINT_STATUS,
    AgentPermission.VIEW_SITES,
    AgentPermission.MANAGE_SITES,
    AgentPermission.VIEW_AGENTS,
    AgentPermission.MANAGE_AGENTS,
    AgentPermission.VIEW_VISITORS,
    AgentPermission.VIEW_VISITS,
    AgentPermission.VIEW_INCIDENTS,
    AgentPermission.CREATE_INCIDENTS,
    AgentPermission.VIEW_APPOINTMENTS,
    AgentPermission.CREATE_APPOINTMENTS,
    AgentPermission.VIEW_REPORTS,
    AgentPermission.EXPORT_DATA,
    AgentPermission.TRIGGER_SOS,
    AgentPermission.VIEW_SOS_LOGS,
  ],
  [AgentRole.AGENT_CONTROLE]: [
    AgentPermission.VIEW_CHECKPOINTS,
    AgentPermission.VIEW_VISITORS,
    AgentPermission.CREATE_VISITORS,
    AgentPermission.VIEW_VISITS,
    AgentPermission.CREATE_VISITS,
    AgentPermission.VIEW_INCIDENTS,
    AgentPermission.CREATE_INCIDENTS,
    AgentPermission.TRIGGER_SOS,
  ],
  [AgentRole.CHEF_SERVICE]: [
    AgentPermission.VIEW_APPOINTMENTS,
    AgentPermission.CREATE_APPOINTMENTS,
    AgentPermission.EDIT_APPOINTMENTS,
    AgentPermission.VIEW_VISITORS,
    AgentPermission.CREATE_VISITORS,
    AgentPermission.VIEW_VISITS,
    AgentPermission.VIEW_REPORTS,
  ],
};

// Informations sur les rôles
const ROLE_INFO = {
  [AgentRole.ADMIN]: {
    name: 'Administrateur',
    description: 'Accès complet au système avec tous les privilèges administratifs',
    color: '#ef4444',
    isSystem: true,
  },
  [AgentRole.AGENT_GESTION]: {
    name: 'Agent de Gestion',
    description: 'Gestion des checkpoints, sites et supervision des agents de contrôle',
    color: '#3b82f6',
    isSystem: true,
  },
  [AgentRole.AGENT_CONTROLE]: {
    name: 'Agent de Contrôle',
    description: 'Contrôle d\'accès aux checkpoints et gestion des visites',
    color: '#10b981',
    isSystem: true,
  },
  [AgentRole.CHEF_SERVICE]: {
    name: 'Chef de Service',
    description: 'Gestion des rendez-vous et coordination avec les visiteurs',
    color: '#8b5cf6',
    isSystem: true,
  },
};

module.exports = {
  AgentRole,
  AgentPermission,
  DEFAULT_PERMISSIONS,
  ROLE_INFO
};