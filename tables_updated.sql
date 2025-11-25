USE `sonabhy-es-db`;

-- =====================================================================================
-- SYSTÈME DE GESTION DES VISITES MULTI-SITES - STRUCTURE COMPLÈTE
-- =====================================================================================
-- Version: 4.0
-- Date: 2024-11-25
-- Description: Structure complète mise à jour selon tous les schémas Prisma actuels
-- Correspondance exacte avec prisma/schema.prisma
-- =====================================================================================

-- =====================================================================================
-- SECTION 1: TABLES D'ÉNUMÉRATION ET RÉFÉRENTIELS
-- =====================================================================================

-- Table des rôles utilisateurs
CREATE TABLE IF NOT EXISTS user_roles (
    role_name VARCHAR(20) PRIMARY KEY
);

INSERT IGNORE INTO user_roles (role_name) VALUES 
('ADMIN'), 
('AGENT_GESTION'), 
('AGENT_CONTROLE'), 
('CHEF_SERVICE');

-- Table des types d'identité
CREATE TABLE IF NOT EXISTS id_types (
    type_name VARCHAR(20) PRIMARY KEY
);

INSERT IGNORE INTO id_types (type_name) VALUES 
('CNI'), 
('PASSEPORT'), 
('PERMIS_CONDUITE'),
('CARTE_SEJOUR'),
('AUTRE');

-- Table des statuts de rendez-vous
CREATE TABLE IF NOT EXISTS rendezvous_statuses (
    status_name VARCHAR(20) PRIMARY KEY
);

INSERT IGNORE INTO rendezvous_statuses (status_name) VALUES 
('pending'), 
('validated'), 
('cancelled');

-- Table des statuts de visite
CREATE TABLE IF NOT EXISTS visit_statuses (
    status_name VARCHAR(20) PRIMARY KEY
);

INSERT IGNORE INTO visit_statuses (status_name) VALUES 
('active'), 
('finished'), 
('cancelled');

-- Table des statuts de checkpoint
CREATE TABLE IF NOT EXISTS checkpoint_statuses (
    status_name VARCHAR(20) PRIMARY KEY
);

INSERT IGNORE INTO checkpoint_statuses (status_name) VALUES 
('active'), 
('inactive'), 
('maintenance');

-- Table des types de checkpoint
CREATE TABLE IF NOT EXISTS checkpoint_types (
    type_name VARCHAR(20) PRIMARY KEY
);

INSERT IGNORE INTO checkpoint_types (type_name) VALUES 
('entry'), 
('exit'), 
('internal');

-- Table des priorités de checkpoint
CREATE TABLE IF NOT EXISTS checkpoint_priorities (
    priority_name VARCHAR(20) PRIMARY KEY
);

INSERT IGNORE INTO checkpoint_priorities (priority_name) VALUES 
('low'), 
('medium'), 
('high'), 
('critical');

-- Table des fréquences de contrôle
CREATE TABLE IF NOT EXISTS control_frequencies (
    frequency_name VARCHAR(20) PRIMARY KEY
);

INSERT IGNORE INTO control_frequencies (frequency_name) VALUES 
('always'), 
('random'), 
('never');

-- Table des actions de blacklist
CREATE TABLE IF NOT EXISTS blacklist_actions (
    action_name VARCHAR(20) PRIMARY KEY
);

INSERT IGNORE INTO blacklist_actions (action_name) VALUES 
('BLACKLIST'), 
('UNBLACKLIST');

-- =====================================================================================
-- SECTION 2: TABLES PRINCIPALES
-- =====================================================================================

-- 2.1 Table users (Utilisateurs du système)
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'AGENT_CONTROLE' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    FOREIGN KEY (role) REFERENCES user_roles(role_name) ON DELETE RESTRICT
);

-- 2.2 Table sites (Sites à sécuriser)
CREATE TABLE IF NOT EXISTS sites (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    
    -- Informations de base (champs requis)
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    country VARCHAR(100),
    activity_type VARCHAR(50),
    status VARCHAR(50),
    
    -- Informations optionnelles
    code VARCHAR(50) UNIQUE,
    region VARCHAR(100),
    phone VARCHAR(20),
    fax VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    
    -- Management
    manager VARCHAR(255),
    manager_email VARCHAR(255),
    manager_phone VARCHAR(20),
    
    -- Surfaces et capacités
    area DECIMAL(10,2),
    usable_area DECIMAL(10,2),
    employee_count INT,
    max_employee_capacity INT,
    building_count INT,
    
    -- Dates
    creation_date TIMESTAMP,
    opening_date TIMESTAMP,
    closing_date TIMESTAMP,
    
    -- Localisation
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    
    -- Descriptions
    description TEXT,
    comments TEXT,
    
    -- Informations financières
    monthly_cost DECIMAL(15,2),
    annual_budget DECIMAL(15,2),
    
    -- Certifications et conformité
    certifications JSON,
    last_inspection TIMESTAMP,
    next_inspection TIMESTAMP,
    
    -- Équipements et services
    equipment JSON,
    services JSON,
    
    -- Accessibilité
    wheelchair_accessible BOOLEAN,
    parking_available BOOLEAN,
    parking_spaces INT,
    
    -- Sécurité
    security_system BOOLEAN,
    security_guard BOOLEAN,
    
    -- Environnement
    environmental_certification VARCHAR(255),
    energy_consumption DECIMAL(10,2),
    
    -- Métadonnées
    created_by VARCHAR(255),
    modified_by VARCHAR(255),
    version INT DEFAULT 1,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_sites_city (city),
    INDEX idx_sites_status (status),
    INDEX idx_sites_activity_type (activity_type)
);

-- 2.3 Table services (Services disponibles sur les sites)
CREATE TABLE IF NOT EXISTS services (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    site_id CHAR(36) NOT NULL,
    chef_id CHAR(36),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
    FOREIGN KEY (chef_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_services_site_id (site_id),
    INDEX idx_services_chef_id (chef_id)
);

-- 2.4 Table checkpoints (Points de contrôle)
CREATE TABLE IF NOT EXISTS checkpoints (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    site_id CHAR(36) NOT NULL,
    agent_id CHAR(36),
    type VARCHAR(20) NOT NULL DEFAULT 'entry',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    control_frequency VARCHAR(20) NOT NULL DEFAULT 'always',
    location_details TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (type) REFERENCES checkpoint_types(type_name),
    FOREIGN KEY (status) REFERENCES checkpoint_statuses(status_name),
    FOREIGN KEY (priority) REFERENCES checkpoint_priorities(priority_name),
    FOREIGN KEY (control_frequency) REFERENCES control_frequencies(frequency_name),
    INDEX idx_checkpoints_site_id (site_id),
    INDEX idx_checkpoints_agent_id (agent_id),
    INDEX idx_checkpoints_type (type),
    INDEX idx_checkpoints_status (status)
);

-- 2.5 Table visitors (Visiteurs) - MISE À JOUR COMPLÈTE
CREATE TABLE IF NOT EXISTS visitors (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    
    -- Nouveaux champs ajoutés
    birth_date VARCHAR(20),
    birth_place VARCHAR(255),
    sexe VARCHAR(10),
    giving_date VARCHAR(20),
    expiration_date VARCHAR(20),
    
    -- Champs existants
    phone VARCHAR(20),
    email VARCHAR(255),
    id_type VARCHAR(20) NOT NULL,
    id_number VARCHAR(255) NOT NULL,
    id_scan_url TEXT,
    photo_url TEXT,
    is_blacklisted BOOLEAN DEFAULT FALSE,
    blacklist_reason TEXT,
    company VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_identity (id_type, id_number),
    INDEX idx_visitors_blacklisted (is_blacklisted),
    INDEX idx_visitors_id_number (id_number),
    FOREIGN KEY (id_type) REFERENCES id_types(type_name) ON DELETE RESTRICT
);

-- 2.6 Table visits (Visites)
CREATE TABLE IF NOT EXISTS visits (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    visitor_id CHAR(36) NOT NULL,
    checkpoint_id CHAR(36) NOT NULL,
    service_id CHAR(36),
    rendezvous_id CHAR(36),
    created_by CHAR(36),
    
    reason TEXT,
    entry_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    exit_time TIMESTAMP NULL,
    status VARCHAR(20) DEFAULT 'active',
    
    -- Informations de groupe
    group_representative_id CHAR(36),
    group_size INT DEFAULT 1,
    
    -- Métadonnées
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (visitor_id) REFERENCES visitors(id) ON DELETE CASCADE,
    FOREIGN KEY (checkpoint_id) REFERENCES checkpoints(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (group_representative_id) REFERENCES visitors(id) ON DELETE SET NULL,
    FOREIGN KEY (status) REFERENCES visit_statuses(status_name),
    
    INDEX idx_visits_visitor_id (visitor_id),
    INDEX idx_visits_checkpoint_id (checkpoint_id),
    INDEX idx_visits_service_id (service_id),
    INDEX idx_visits_status (status),
    INDEX idx_visits_entry_time (entry_time)
);

-- 2.7 Table rendezvous (Rendez-vous)
CREATE TABLE IF NOT EXISTS rendezvous (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    visitor_id CHAR(36) NOT NULL,
    service_id CHAR(36) NOT NULL,
    organizer_id CHAR(36) NOT NULL,
    
    scheduled_date TIMESTAMP NOT NULL,
    purpose TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (visitor_id) REFERENCES visitors(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (status) REFERENCES rendezvous_statuses(status_name),
    
    INDEX idx_rendezvous_visitor_id (visitor_id),
    INDEX idx_rendezvous_service_id (service_id),
    INDEX idx_rendezvous_organizer_id (organizer_id),
    INDEX idx_rendezvous_scheduled_date (scheduled_date),
    INDEX idx_rendezvous_status (status)
);

-- =====================================================================================
-- SECTION 3: TABLES SPÉCIALISÉES
-- =====================================================================================

-- 3.1 Table agent_checkpoint_assignments (Affectation des agents)
CREATE TABLE IF NOT EXISTS agent_checkpoint_assignments (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    checkpoint_id CHAR(36) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_assignment (user_id, checkpoint_id, start_date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (checkpoint_id) REFERENCES checkpoints(id) ON DELETE CASCADE,
    INDEX idx_agent_assignments_user_id (user_id),
    INDEX idx_agent_assignments_checkpoint_id (checkpoint_id)
);

-- 3.2 Table sos_alerts (Gestion des alertes SOS)
CREATE TABLE IF NOT EXISTS sos_alerts (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    checkpoint_id CHAR(36) NOT NULL,
    triggered_by CHAR(36) NOT NULL,
    triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    message TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP NULL,
    resolved_by CHAR(36),
    resolution_notes TEXT,
    FOREIGN KEY (checkpoint_id) REFERENCES checkpoints(id) ON DELETE CASCADE,
    FOREIGN KEY (triggered_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_sos_alerts_checkpoint_id (checkpoint_id),
    INDEX idx_sos_alerts_triggered_by (triggered_by),
    INDEX idx_sos_alerts_resolved (is_resolved)
);

-- 3.3 Table visit_incidents (Incidents de visite)
CREATE TABLE IF NOT EXISTS visit_incidents (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    visit_id CHAR(36) NOT NULL,
    reported_by CHAR(36) NOT NULL,
    incident_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    severity_level INT DEFAULT 1,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolution_notes TEXT,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_visit_incidents_visit_id (visit_id),
    INDEX idx_visit_incidents_reported_by (reported_by),
    INDEX idx_visit_incidents_severity (severity_level)
);

-- 3.4 Table blacklist_history (Historique des blacklists)
CREATE TABLE IF NOT EXISTS blacklist_history (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    
    -- Référence visiteur (optionnelle)
    visitor_id CHAR(36),
    
    -- Informations d'identification (pour signalement national)
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    id_type VARCHAR(20),
    id_number VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    nationality VARCHAR(100),
    birth_date DATE,
    birth_place VARCHAR(255),
    
    -- Informations du signalement
    action VARCHAR(20) NOT NULL,
    reason TEXT NOT NULL,
    severity_level INT DEFAULT 1,
    incident_date DATE,
    incident_location VARCHAR(255),
    
    -- Métadonnées
    created_by CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Relations
    FOREIGN KEY (visitor_id) REFERENCES visitors(id) ON DELETE SET NULL,
    FOREIGN KEY (action) REFERENCES blacklist_actions(action_name),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (id_type) REFERENCES id_types(type_name),
    
    INDEX idx_blacklist_visitor_id (visitor_id),
    INDEX idx_blacklist_id_number (id_number),
    INDEX idx_blacklist_severity (severity_level),
    INDEX idx_blacklist_incident_date (incident_date),
    INDEX idx_blacklist_action (action),
    INDEX idx_blacklist_created_by (created_by)
);

-- 3.5 Table visitor_groups (Groupes de visiteurs)
CREATE TABLE IF NOT EXISTS visitor_groups (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    organizer_id CHAR(36) NOT NULL,
    max_size INT DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_visitor_groups_organizer_id (organizer_id)
);

-- 3.6 Table group_visitors (Membres des groupes)
CREATE TABLE IF NOT EXISTS group_visitors (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    group_id CHAR(36) NOT NULL,
    visitor_id CHAR(36) NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_group_member (group_id, visitor_id),
    FOREIGN KEY (group_id) REFERENCES visitor_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (visitor_id) REFERENCES visitors(id) ON DELETE CASCADE,
    INDEX idx_group_visitors_group_id (group_id),
    INDEX idx_group_visitors_visitor_id (visitor_id)
);

-- 3.7 Table non_desirables (Liste des indésirables)
CREATE TABLE IF NOT EXISTS non_desirables (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    visitor_id CHAR(36) NOT NULL,
    reason TEXT NOT NULL,
    reported_by CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (visitor_id) REFERENCES visitors(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_non_desirables_visitor_id (visitor_id),
    INDEX idx_non_desirables_reported_by (reported_by)
);

-- 3.8 Table refresh_tokens (Tokens de rafraîchissement)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    token TEXT NOT NULL,
    user_id CHAR(36) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_refresh_tokens_user_id (user_id),
    INDEX idx_refresh_tokens_expires_at (expires_at)
);

-- 3.9 Table audit_logs (Journaux d'audit)
CREATE TABLE IF NOT EXISTS audit_logs (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id CHAR(36),
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_logs_user_id (user_id),
    INDEX idx_audit_logs_entity (entity_type, entity_id),
    INDEX idx_audit_logs_action (action),
    INDEX idx_audit_logs_created_at (created_at)
);

-- =====================================================================================
-- SECTION 4: VUES ET PROCÉDURES UTILES
-- =====================================================================================

-- Vue pour les visiteurs actuellement présents
CREATE OR REPLACE VIEW current_visitors AS
SELECT 
    v.id as visit_id,
    vis.id as visitor_id,
    CONCAT(vis.first_name, ' ', vis.last_name) as visitor_name,
    vis.company,
    vis.phone,
    c.name as checkpoint_name,
    s.name as site_name,
    srv.name as service_name,
    v.entry_time,
    v.reason
FROM visits v
JOIN visitors vis ON v.visitor_id = vis.id
JOIN checkpoints c ON v.checkpoint_id = c.id
JOIN sites s ON c.site_id = s.id
LEFT JOIN services srv ON v.service_id = srv.id
WHERE v.status = 'active' AND v.exit_time IS NULL
ORDER BY v.entry_time DESC;

-- Vue pour les statistiques par site
CREATE OR REPLACE VIEW site_statistics AS
SELECT 
    s.id,
    s.name as site_name,
    s.city,
    COUNT(DISTINCT c.id) as checkpoint_count,
    COUNT(DISTINCT srv.id) as service_count,
    COUNT(DISTINCT v.id) as total_visits,
    COUNT(DISTINCT CASE WHEN v.status = 'active' THEN v.id END) as active_visits,
    COUNT(DISTINCT CASE WHEN DATE(v.entry_time) = CURDATE() THEN v.id END) as today_visits
FROM sites s
LEFT JOIN checkpoints c ON s.id = c.site_id
LEFT JOIN services srv ON s.id = srv.site_id
LEFT JOIN visits v ON c.id = v.checkpoint_id
GROUP BY s.id, s.name, s.city;

-- =====================================================================================
-- SECTION 5: DONNÉES D'EXEMPLE (OPTIONNEL)
-- =====================================================================================

-- Insertion d'un utilisateur admin par défaut
INSERT IGNORE INTO users (id, email, password_hash, first_name, last_name, role) 
VALUES (
    UUID(),
    'admin@sonabhy.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PJ/...',
    'Admin',
    'System',
    'ADMIN'
);

-- =====================================================================================
-- FIN DU SCRIPT
-- =====================================================================================
