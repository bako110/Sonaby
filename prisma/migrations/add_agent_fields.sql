-- Ajouter le champ matricule à la table users
ALTER TABLE users ADD COLUMN matricule VARCHAR(50) UNIQUE AFTER id;

-- Créer la table des permissions
CREATE TABLE IF NOT EXISTS permissions (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_permissions_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Créer la table de liaison user_permissions
CREATE TABLE IF NOT EXISTS user_permissions (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  permission_id CHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_permission (user_id, permission_id),
  INDEX idx_user_permissions_user (user_id),
  INDEX idx_user_permissions_permission (permission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Créer la table de liaison user_sites (agents assignés aux sites)
CREATE TABLE IF NOT EXISTS user_sites (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  site_id CHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_site (user_id, site_id),
  INDEX idx_user_sites_user (user_id),
  INDEX idx_user_sites_site (site_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insérer les permissions de base
INSERT INTO permissions (name, description) VALUES
  ('MANAGE_USERS', 'Gérer les utilisateurs'),
  ('MANAGE_SITES', 'Gérer les sites'),
  ('MANAGE_CHECKPOINTS', 'Gérer les checkpoints'),
  ('MANAGE_VISITS', 'Gérer les visites'),
  ('MANAGE_VISITORS', 'Gérer les visiteurs'),
  ('VIEW_DASHBOARD', 'Voir le tableau de bord'),
  ('MANAGE_BLACKLIST', 'Gérer la liste noire'),
  ('MANAGE_SOS', 'Gérer les alertes SOS'),
  ('VIEW_REPORTS', 'Voir les rapports'),
  ('MANAGE_RENDEZVOUS', 'Gérer les rendez-vous')
ON DUPLICATE KEY UPDATE name=name;
