USE `sonabhy-es-db`;

-- =====================================================================================
-- SYSTÈME DE GESTION DES VISITES MULTI-SITES - STRUCTURE COMPLÈTE
-- =====================================================================================
-- Version: 3.0
-- Date: 2024-11-24
-- Description: Structure complète adaptée au schéma Prisma actuel
-- Correspondance exacte avec prisma/schema.prisma
-- =====================================================================================

-- =====================================================================================
-- SECTION 1: TABLES D'ÉNUMÉRATION ET RÉFÉRENTIELS
-- =====================================================================================
CREATE TABLE IF NOT EXISTS user_roles (
    role_name VARCHAR(20) PRIMARY KEY
);

INSERT IGNORE INTO user_roles (role_name) VALUES 
('ADMIN'), 
('AGENT_GESTION'), 
('AGENT_CONTROLE'), 
('CHEF_SERVICE');

CREATE TABLE IF NOT EXISTS id_types (
    type_name VARCHAR(20) PRIMARY KEY
);

INSERT IGNORE INTO id_types (type_name) VALUES 
('CNI'), 
('PASSEPORT'), 
('PERMIS_CONDUITE'),
('CARTE_SEJOUR'),
('AUTRE');

CREATE TABLE IF NOT EXISTS rendezvous_statuses (
    status_name VARCHAR(20) PRIMARY KEY
);

INSERT IGNORE INTO rendezvous_statuses (status_name) VALUES 
('pending'), 
('validated'), 
('cancelled');

CREATE TABLE IF NOT EXISTS visit_statuses (
    status_name VARCHAR(20) PRIMARY KEY
);

INSERT IGNORE INTO visit_statuses (status_name) VALUES 
('active'), 
('finished'), 
('refused');

CREATE TABLE IF NOT EXISTS blacklist_actions (
    action_name VARCHAR(20) PRIMARY KEY
);

INSERT IGNORE INTO blacklist_actions (action_name) VALUES 
('added'), 
('removed');

CREATE TABLE IF NOT EXISTS checkpoint_statuses (
    status_name VARCHAR(20) PRIMARY KEY
);

INSERT IGNORE INTO checkpoint_statuses (status_name) VALUES 
('active'), 
('inactive'), 
('maintenance');

CREATE TABLE IF NOT EXISTS checkpoint_types (
    type_name VARCHAR(30) PRIMARY KEY
);

INSERT IGNORE INTO checkpoint_types (type_name) VALUES 
('entry'), 
('exit'), 
('internal'), 
('emergency');

CREATE TABLE IF NOT EXISTS checkpoint_priorities (
    priority_name VARCHAR(20) PRIMARY KEY
);

INSERT IGNORE INTO checkpoint_priorities (priority_name) VALUES 
('low'), 
('medium'), 
('high'), 
('critical');

CREATE TABLE IF NOT EXISTS control_frequencies (
    frequency_name VARCHAR(20) PRIMARY KEY
);

INSERT IGNORE INTO control_frequencies (frequency_name) VALUES 
('hourly'), 
('daily'), 
('weekly'), 
('monthly');

CREATE TABLE IF NOT EXISTS activity_types (
    type_name VARCHAR(50) PRIMARY KEY
);

INSERT IGNORE INTO activity_types (type_name) VALUES 
('OFFICE'), 
('PRODUCTION'), 
('WAREHOUSE'), 
('RETAIL'), 
('RESEARCH'), 
('DATACENTER'), 
('LOGISTICS'), 
('MANUFACTURING'), 
('HEADQUARTERS'), 
('OTHER');

CREATE TABLE IF NOT EXISTS site_statuses (
    status_name VARCHAR(50) PRIMARY KEY
);

INSERT IGNORE INTO site_statuses (status_name) VALUES 
('ACTIVE'), 
('INACTIVE'), 
('UNDER_CONSTRUCTION'), 
('MAINTENANCE'), 
('CLOSED'), 
('PLANNED'), 
('SUSPENDED');

-- =====================================================================================
-- SECTION 2: TABLES PRINCIPALES - UTILISATEURS ET SITES
-- =====================================================================================

-- 2.1 Table users (tous les utilisateurs du système)
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'AGENT_CONTROLE',
    is_active BOOLEAN DEFAULT TRUE,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role) REFERENCES user_roles(role_name)
);

-- 2.2 Table sites (chaque site de l'entreprise)
CREATE TABLE IF NOT EXISTS sites (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    
    -- Basic information (required fields)
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    
    -- Optional basic information
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
    
    -- Areas and capacity
    area DECIMAL(10,2), -- in square meters
    usable_area DECIMAL(10,2), -- Actual usable area
    employee_count INT,
    max_employee_capacity INT,
    building_count INT,
    
    -- Dates
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modification_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    opening_date TIMESTAMP,
    closing_date TIMESTAMP,
    
    -- Coordinates (stored as JSON)
    coordinates JSON,
    
    -- Descriptions
    description TEXT,
    comments TEXT,
    
    -- Financial information
    monthly_cost DECIMAL(15,2),
    annual_budget DECIMAL(15,2),
    
    -- Certifications and compliance (stored as JSON arrays)
    certifications JSON, -- ISO, HACCP, etc.
    last_inspection TIMESTAMP,
    next_inspection TIMESTAMP,
    
    -- Equipment and services (stored as JSON arrays)
    equipment JSON,
    services JSON,
    
    -- Accessibility
    wheelchair_accessible BOOLEAN,
    parking_available BOOLEAN,
    parking_spaces INT,
    
    -- Security
    security_system BOOLEAN,
    security_guard BOOLEAN,
    
    -- Environment
    environmental_certification VARCHAR(255),
    energy_consumption DECIMAL(10,2), -- kWh/month
    
    -- Metadata
    created_by VARCHAR(255),
    modified_by VARCHAR(255),
    version INT DEFAULT 1,
    
    -- Foreign key constraints
    FOREIGN KEY (activity_type) REFERENCES activity_types(type_name),
    FOREIGN KEY (status) REFERENCES site_statuses(status_name)
);

-- =====================================================================================
-- SECTION 3: TABLES DE CONTRÔLE ET SÉCURITÉ
-- =====================================================================================

-- 3.1 Table checkpoints (les postes de contrôle / tablettes)
CREATE TABLE IF NOT EXISTS checkpoints (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    site_id CHAR(36) NOT NULL,
    
    -- Location
    zone VARCHAR(100),
    building VARCHAR(100),
    floor VARCHAR(50),
    coordinates_latitude DECIMAL(10,8),
    coordinates_longitude DECIMAL(11,8),
    
    -- SOS Configuration
    sos_id VARCHAR(100) UNIQUE NOT NULL,
    sos_configuration JSON,
    
    -- Agent Assignment (dénormalisé pour performance)
    agent_id CHAR(36),
    agent_name VARCHAR(255),
    agent_email VARCHAR(255),
    agent_phone VARCHAR(20),
    assignment_date TIMESTAMP,
    
    -- Status and State
    status VARCHAR(20) DEFAULT 'active',
    checkpoint_type VARCHAR(30) DEFAULT 'internal',
    priority VARCHAR(20) DEFAULT 'medium',
    
    -- Scheduling
    control_frequency VARCHAR(20),
    next_control TIMESTAMP,
    last_control TIMESTAMP,
    
    -- Equipment and Materials
    equipment JSON,
    required_material JSON,
    special_instructions TEXT,
    
    -- Metadata
    active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(255),
    modified_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (status) REFERENCES checkpoint_statuses(status_name),
    FOREIGN KEY (checkpoint_type) REFERENCES checkpoint_types(type_name),
    FOREIGN KEY (priority) REFERENCES checkpoint_priorities(priority_name),
    FOREIGN KEY (control_frequency) REFERENCES control_frequencies(frequency_name)
);

-- 3.2 Table agent_checkpoint_assignments (Affectation des agents)
CREATE TABLE IF NOT EXISTS agent_checkpoint_assignments (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    checkpoint_id CHAR(36) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_assignment (user_id, checkpoint_id, start_date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (checkpoint_id) REFERENCES checkpoints(id) ON DELETE CASCADE
);

-- 3.3 Table sos_alerts (gestion des alertes SOS)
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
    FOREIGN KEY (triggered_by) REFERENCES users(id),
    FOREIGN KEY (resolved_by) REFERENCES users(id)
);

-- =====================================================================================
-- SECTION 4: TABLES VISITEURS ET SERVICES
-- =====================================================================================

-- 4.1 Table visitors (identité du visiteur)
CREATE TABLE IF NOT EXISTS visitors (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
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
    FOREIGN KEY (id_type) REFERENCES id_types(type_name)
);

-- 4.2 Table services (départements visitables)
CREATE TABLE IF NOT EXISTS services (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    chef_id CHAR(36),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (chef_id) REFERENCES users(id)
);

-- =====================================================================================
-- SECTION 5: TABLES DE GESTION DES VISITES
-- =====================================================================================

-- 5.1 Table rendezvous (pré-enregistrement)
CREATE TABLE IF NOT EXISTS rendezvous (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    organizer_id CHAR(36) NOT NULL,
    visitor_id CHAR(36),
    group_code VARCHAR(100),
    service_id CHAR(36) NOT NULL,
    reason TEXT NOT NULL,
    visit_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    qr_code VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (visitor_id) REFERENCES visitors(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id),
    FOREIGN KEY (status) REFERENCES rendezvous_statuses(status_name)
);

-- 5.2 Table visits (visite réelle)
CREATE TABLE IF NOT EXISTS visits (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    visitor_id CHAR(36) NOT NULL,
    checkpoint_id CHAR(36) NOT NULL,
    service_id CHAR(36) NOT NULL,
    reason TEXT NOT NULL,
    planned_id CHAR(36),
    is_group BOOLEAN DEFAULT FALSE,
    group_code VARCHAR(100),
    entry_time TIMESTAMP NOT NULL,
    exit_time TIMESTAMP NULL,
    created_by CHAR(36) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    signature_url TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (visitor_id) REFERENCES visitors(id) ON DELETE CASCADE,
    FOREIGN KEY (checkpoint_id) REFERENCES checkpoints(id),
    FOREIGN KEY (service_id) REFERENCES services(id),
    FOREIGN KEY (planned_id) REFERENCES rendezvous(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (status) REFERENCES visit_statuses(status_name)
);

-- 5.3 Table visit_incidents (déclarations incidents)
CREATE TABLE IF NOT EXISTS visit_incidents (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    visit_id CHAR(36) NOT NULL,
    reported_by CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity_level INT DEFAULT 1, -- 1: Low, 2: Medium, 3: High
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP NULL,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_by) REFERENCES users(id)
);

-- 5.4 Table visitor_groups (pour les visites de groupe)
CREATE TABLE IF NOT EXISTS visitor_groups (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    group_code VARCHAR(100) UNIQUE NOT NULL,
    organizer_id CHAR(36) NOT NULL,
    service_id CHAR(36) NOT NULL,
    reason TEXT NOT NULL,
    visit_date DATE NOT NULL,
    expected_count INT DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id)
);

-- 5.5 Table group_visitors (liens groupe-visiteurs)
CREATE TABLE IF NOT EXISTS group_visitors (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    group_id CHAR(36) NOT NULL,
    visitor_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_group_visitor (group_id, visitor_id),
    FOREIGN KEY (group_id) REFERENCES visitor_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (visitor_id) REFERENCES visitors(id) ON DELETE CASCADE
);
-- SECTION 6: TABLES DE SÉCURITÉ ET AUDIT
-- =====================================================================================

-- 6.1 Table blacklist_history (historique des indésirables - niveau national)
CREATE TABLE IF NOT EXISTS blacklist_history (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    
    -- Référence visiteur (optionnelle si déjà enregistré)
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
    severity_level INT DEFAULT 1, -- 1: Low, 2: Medium, 3: High, 4: Critical
    incident_date DATE,
    incident_location VARCHAR(255),
    
    -- Métadonnées
    created_by CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Contraintes
    FOREIGN KEY (visitor_id) REFERENCES visitors(id) ON DELETE SET NULL,
    FOREIGN KEY (action) REFERENCES blacklist_actions(action_name),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (id_type) REFERENCES id_types(type_name),
    
    -- Au moins une identification doit être fournie
    CONSTRAINT chk_identification CHECK (
        visitor_id IS NOT NULL OR 
        (first_name IS NOT NULL AND last_name IS NOT NULL AND id_number IS NOT NULL)
    )
);

-- 6.2 Table audit_logs (sécurité + traçabilité RGPD)
CREATE TABLE IF NOT EXISTS audit_logs (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36),
    action VARCHAR(255) NOT NULL,
    entity VARCHAR(255) NOT NULL,
    entity_id CHAR(36),
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =====================================================================================
-- SECTION 7: INDEX ET OPTIMISATIONS
-- =====================================================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_checkpoints_site_id ON checkpoints(site_id);
CREATE INDEX IF NOT EXISTS idx_checkpoints_sos_id ON checkpoints(sos_id);
CREATE INDEX IF NOT EXISTS idx_checkpoints_status ON checkpoints(status);
CREATE INDEX IF NOT EXISTS idx_checkpoints_type ON checkpoints(checkpoint_type);
CREATE INDEX IF NOT EXISTS idx_checkpoints_priority ON checkpoints(priority);
CREATE INDEX IF NOT EXISTS idx_checkpoints_agent_id ON checkpoints(agent_id);
CREATE INDEX IF NOT EXISTS idx_checkpoints_next_control ON checkpoints(next_control);
CREATE INDEX IF NOT EXISTS idx_agent_assignments_user_id ON agent_checkpoint_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_assignments_checkpoint_id ON agent_checkpoint_assignments(checkpoint_id);
CREATE INDEX IF NOT EXISTS idx_visitors_blacklisted ON visitors(is_blacklisted);
CREATE INDEX IF NOT EXISTS idx_visitors_id_number ON visitors(id_number);
CREATE INDEX IF NOT EXISTS idx_rendezvous_qr_code ON rendezvous(qr_code);
CREATE INDEX IF NOT EXISTS idx_rendezvous_visit_date ON rendezvous(visit_date);
CREATE INDEX IF NOT EXISTS idx_visits_entry_time ON visits(entry_time);
CREATE INDEX IF NOT EXISTS idx_visits_exit_time ON visits(exit_time);
CREATE INDEX IF NOT EXISTS idx_visits_visitor_id ON visits(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visits_planned_id ON visits(planned_id);
CREATE INDEX IF NOT EXISTS idx_sos_alerts_checkpoint_id ON sos_alerts(checkpoint_id);
CREATE INDEX IF NOT EXISTS idx_sos_alerts_triggered_at ON sos_alerts(triggered_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_sites_code ON sites(code);
CREATE INDEX IF NOT EXISTS idx_sites_status ON sites(status);
CREATE INDEX IF NOT EXISTS idx_sites_city ON sites(city);
CREATE INDEX IF NOT EXISTS idx_sites_activity_type ON sites(activity_type);
CREATE INDEX IF NOT EXISTS idx_blacklist_visitor_id ON blacklist_history(visitor_id);
CREATE INDEX IF NOT EXISTS idx_blacklist_id_number ON blacklist_history(id_number);
CREATE INDEX IF NOT EXISTS idx_blacklist_severity ON blacklist_history(severity_level);
CREATE INDEX IF NOT EXISTS idx_blacklist_incident_date ON blacklist_history(incident_date);

-- =====================================================================================
-- SECTION 8: FONCTIONS ET PROCÉDURES UTILES
-- =====================================================================================

-- Procédure pour générer un QR code unique
DELIMITER //
CREATE FUNCTION IF NOT EXISTS generate_unique_qr_code() RETURNS VARCHAR(255)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE new_qr_code VARCHAR(255);
    DECLARE counter INT DEFAULT 0;
    
    REPEAT
        SET new_qr_code = CONCAT('QR', SUBSTRING(MD5(RAND()), 1, 12), UNIX_TIMESTAMP());
        SET counter = counter + 1;
    UNTIL NOT EXISTS (SELECT 1 FROM rendezvous WHERE qr_code = new_qr_code) OR counter > 10
    END REPEAT;
    
    RETURN new_qr_code;
END//
DELIMITER ;

-- =====================================================================================
-- SECTION 10: VUES ET RAPPORTS
-- =====================================================================================

-- Vues utiles pour les rapports
CREATE OR REPLACE VIEW active_visits AS
SELECT 
    v.*,
    CONCAT(vis.first_name, ' ', vis.last_name) as visitor_name,
    s.name as service_name,
    c.name as checkpoint_name,
    st.name as site_name
FROM visits v
JOIN visitors vis ON v.visitor_id = vis.id
JOIN services s ON v.service_id = s.id
JOIN checkpoints c ON v.checkpoint_id = c.id
JOIN sites st ON c.site_id = st.id
WHERE v.status = 'active' AND v.exit_time IS NULL;

CREATE OR REPLACE VIEW daily_visit_stats AS
SELECT 
    DATE(entry_time) as visit_date,
    COUNT(*) as total_visits,
    COUNT(CASE WHEN exit_time IS NULL THEN 1 END) as active_visits,
    COUNT(CASE WHEN is_group = TRUE THEN 1 END) as group_visits,
    COUNT(CASE WHEN planned_id IS NOT NULL THEN 1 END) as planned_visits
FROM visits
GROUP BY DATE(entry_time);

-- Vue pour les checkpoints avec leurs informations complètes
CREATE OR REPLACE VIEW checkpoint_details AS
SELECT 
    c.*,
    s.name as site_name,
    s.city as site_city,
    CONCAT(u.first_name, ' ', u.last_name) as agent_full_name
FROM checkpoints c
LEFT JOIN sites s ON c.site_id = s.id
LEFT JOIN users u ON c.agent_id = u.id;

-- Vue pour les visiteurs avec statut blacklist
CREATE OR REPLACE VIEW visitor_status AS
SELECT 
    v.*,
    CASE WHEN v.is_blacklisted = TRUE THEN 'BLACKLISTED' ELSE 'ACTIVE' END as status_label,
    (SELECT COUNT(*) FROM visits vis WHERE vis.visitor_id = v.id) as total_visits,
    (SELECT MAX(entry_time) FROM visits vis WHERE vis.visitor_id = v.id) as last_visit
FROM visitors v;

-- =====================================================================================
-- SECTION 11: MESSAGES DE CONFIRMATION
-- =====================================================================================

-- Message de confirmation
SELECT '✅ Structure de base de données créée avec succès!' as message;
SELECT CONCAT('📊 ', COUNT(*), ' tables créées') as message FROM information_schema.tables WHERE table_schema = 'sonabhy-es-db';
SELECT '� Base prête pour l''initialisation des données' as message;