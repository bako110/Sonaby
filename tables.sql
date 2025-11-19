USE `sonabhy-es-db`;

-- Script de création des tables pour le système de gestion des visites multi-sites
-- MySQL

-- 1. Création des tables pour les énumérations (simulées via ENUM ou tables de référence)
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

-- 2. Table users (tous les utilisateurs du système)
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

-- 3. Table sites (chaque site de l'entreprise)
CREATE TABLE IF NOT EXISTS sites (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Table checkpoints (les postes de contrôle / tablettes)
CREATE TABLE IF NOT EXISTS checkpoints (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    site_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    sos_code VARCHAR(100) UNIQUE NOT NULL,
    location_description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
);

-- 5. Table agent_checkpoint_assignments (Affectation des agents)
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

-- 6. Table visitors (identité du visiteur)
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

-- 7. Table services (départements visitables)
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

-- 8. Table rendezvous (pré-enregistrement)
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

-- 9. Table visits (visite réelle)
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

-- 10. Table visit_incidents (déclarations incidents)
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

-- 11. Table sos_alerts (gestion des SOS)
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
    FOREIGN KEY (checkpoint_id) REFERENCES checkpoints(id),
    FOREIGN KEY (triggered_by) REFERENCES users(id),
    FOREIGN KEY (resolved_by) REFERENCES users(id)
);

-- 12. Table blacklist_history (historique des indésirables)
CREATE TABLE IF NOT EXISTS blacklist_history (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    visitor_id CHAR(36) NOT NULL,
    action VARCHAR(20) NOT NULL,
    reason TEXT NOT NULL,
    created_by CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (visitor_id) REFERENCES visitors(id) ON DELETE CASCADE,
    FOREIGN KEY (action) REFERENCES blacklist_actions(action_name),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 13. Table audit_logs (sécurité + traçabilité RGPD)
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

-- 14. Table visitor_groups (pour les visites de groupe)
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
    FOREIGN KEY (organizer_id) REFERENCES users(id),
    FOREIGN KEY (service_id) REFERENCES services(id)
);

-- 15. Table group_visitors (liens groupe-visiteurs)
CREATE TABLE IF NOT EXISTS group_visitors (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    group_id CHAR(36) NOT NULL,
    visitor_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_group_visitor (group_id, visitor_id),
    FOREIGN KEY (group_id) REFERENCES visitor_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (visitor_id) REFERENCES visitors(id) ON DELETE CASCADE
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_checkpoints_site_id ON checkpoints(site_id);
CREATE INDEX IF NOT EXISTS idx_checkpoints_sos_code ON checkpoints(sos_code);
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

-- Insertion des données de base
INSERT IGNORE INTO users (email, password_hash, first_name, last_name, role) VALUES
('admin@entreprise.com', '$2b$12$LQv3c1yqBWVHxkd0L6k0R.LCs.5rJdK7Q2c5Jv5Q5Jv5Q5Jv5Q5Jv', 'Admin', 'Système', 'ADMIN'),
('chef.service1@entreprise.com', '$2b$12$LQv3c1yqBWVHxkd0L6k0R.LCs.5rJdK7Q2c5Jv5Q5Jv5Q5Jv5Q5Jv', 'Jean', 'Dupont', 'CHEF_SERVICE'),
('agent.gestion1@entreprise.com', '$2b$12$LQv3c1yqBWVHxkd0L6k0R.LCs.5rJdK7Q2c5Jv5Q5Jv5Q5Jv5Q5Jv', 'Marie', 'Martin', 'AGENT_GESTION'),
('agent.controle1@entreprise.com', '$2b$12$LQv3c1yqBWVHxkd0L6k0R.LCs.5rJdK7Q2c5Jv5Q5Jv5Q5Jv5Q5Jv', 'Pierre', 'Durand', 'AGENT_CONTROLE');

INSERT IGNORE INTO sites (name, address) VALUES
('Siège Social', '123 Avenue des Champs-Élysées, 75008 Paris'),
('Site Production', '456 Rue de l''Industrie, 69000 Lyon'),
('Centre R&D', '789 Boulevard de l''Innovation, 31000 Toulouse');

INSERT IGNORE INTO services (name, description) VALUES
('Direction Générale', 'Direction générale de l''entreprise'),
('Ressources Humaines', 'Service des ressources humaines'),
('Informatique', 'Service des technologies de l''information'),
('Production', 'Service de production'),
('Recherche & Développement', 'Service de recherche et développement');

-- Mise à jour des chefs de service
UPDATE services SET chef_id = (SELECT id FROM users WHERE email = 'chef.service1@entreprise.com') WHERE name = 'Direction Générale';

INSERT IGNORE INTO checkpoints (site_id, name, sos_code) VALUES
((SELECT id FROM sites WHERE name = 'Siège Social'), 'Entrée Principale', 'SOS-PARIS-001'),
((SELECT id FROM sites WHERE name = 'Siège Social'), 'Parking Sous-sol', 'SOS-PARIS-002'),
((SELECT id FROM sites WHERE name = 'Site Production'), 'Portail Usine', 'SOS-LYON-001'),
((SELECT id FROM sites WHERE name = 'Centre R&D'), 'Accueil R&D', 'SOS-TOULOUSE-001');

-- Assignation des agents aux checkpoints
INSERT IGNORE INTO agent_checkpoint_assignments (user_id, checkpoint_id, start_date) VALUES
((SELECT id FROM users WHERE email = 'agent.controle1@entreprise.com'), 
 (SELECT id FROM checkpoints WHERE sos_code = 'SOS-PARIS-001'), NOW());

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

-- Message de confirmation
SELECT '✅ Tables créées avec succès dans la base sonabhy-es-db!' as message;
SELECT CONCAT('📊 ', COUNT(*), ' tables créées') as message FROM information_schema.tables WHERE table_schema = 'sonabhy-es-db';
SELECT '👤 Utilisateurs créés: admin@entreprise.com / password123' as message;
SELECT '🏢 Sites créés: 3 sites avec checkpoints' as message;