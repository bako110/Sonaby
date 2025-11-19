-- Script de création des tables pour le système de gestion des visites multi-sites
-- PostgreSQL

-- 1. Enumérations
CREATE TYPE user_role AS ENUM ('ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE', 'CHEF_SERVICE');
CREATE TYPE id_type_enum AS ENUM ('CNI', 'PASSEPORT', 'PERMIS_CONDUITE', 'CARTE_SEJOUR', 'AUTRE');
CREATE TYPE rendezvous_status AS ENUM ('pending', 'validated', 'cancelled');
CREATE TYPE visit_status AS ENUM ('active', 'finished', 'refused');
CREATE TYPE blacklist_action AS ENUM ('added', 'removed');

-- 2. Table users (tous les utilisateurs du système)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'AGENT_CONTROLE',
    is_active BOOLEAN DEFAULT TRUE,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table sites (chaque site de l'entreprise)
CREATE TABLE sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table checkpoints (les postes de contrôle / tablettes)
CREATE TABLE checkpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sos_code TEXT UNIQUE NOT NULL,
    location_description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Table agent_checkpoint_assignments (Affectation des agents)
CREATE TABLE agent_checkpoint_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    checkpoint_id UUID NOT NULL REFERENCES checkpoints(id) ON DELETE CASCADE,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, checkpoint_id, start_date)
);

-- 6. Table visitors (identité du visiteur)
CREATE TABLE visitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    id_type id_type_enum NOT NULL,
    id_number TEXT NOT NULL,
    id_scan_url TEXT,
    photo_url TEXT,
    is_blacklisted BOOLEAN DEFAULT FALSE,
    blacklist_reason TEXT,
    company TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(id_type, id_number)
);

-- 7. Table services (départements visitables)
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    chef_id UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Table rendezvous (pré-enregistrement)
CREATE TABLE rendezvous (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    visitor_id UUID REFERENCES visitors(id) ON DELETE CASCADE,
    group_code TEXT,
    service_id UUID NOT NULL REFERENCES services(id),
    reason TEXT NOT NULL,
    visit_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    qr_code TEXT UNIQUE NOT NULL,
    status rendezvous_status DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Table visits (visite réelle)
CREATE TABLE visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id UUID NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
    checkpoint_id UUID NOT NULL REFERENCES checkpoints(id),
    service_id UUID NOT NULL REFERENCES services(id),
    reason TEXT NOT NULL,
    planned_id UUID REFERENCES rendezvous(id),
    is_group BOOLEAN DEFAULT FALSE,
    group_code TEXT,
    entry_time TIMESTAMPTZ NOT NULL,
    exit_time TIMESTAMPTZ,
    created_by UUID NOT NULL REFERENCES users(id),
    status visit_status DEFAULT 'active',
    signature_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Table visit_incidents (déclarations incidents)
CREATE TABLE visit_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
    reported_by UUID NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity_level INTEGER DEFAULT 1, -- 1: Low, 2: Medium, 3: High
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Table sos_alerts (gestion des SOS)
CREATE TABLE sos_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checkpoint_id UUID NOT NULL REFERENCES checkpoints(id),
    triggered_by UUID NOT NULL REFERENCES users(id),
    triggered_at TIMESTAMPTZ DEFAULT NOW(),
    message TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id),
    resolution_notes TEXT
);

-- 12. Table blacklist_history (historique des indésirables)
CREATE TABLE blacklist_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id UUID NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
    action blacklist_action NOT NULL,
    reason TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Table audit_logs (sécurité + traçabilité RGPD)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Table visitor_groups (pour les visites de groupe)
CREATE TABLE visitor_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_code TEXT UNIQUE NOT NULL,
    organizer_id UUID NOT NULL REFERENCES users(id),
    service_id UUID NOT NULL REFERENCES services(id),
    reason TEXT NOT NULL,
    visit_date DATE NOT NULL,
    expected_count INTEGER DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Table group_visitors (liens groupe-visiteurs)
CREATE TABLE group_visitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES visitor_groups(id) ON DELETE CASCADE,
    visitor_id UUID NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(group_id, visitor_id)
);

-- Index pour optimiser les performances
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_checkpoints_site_id ON checkpoints(site_id);
CREATE INDEX idx_checkpoints_sos_code ON checkpoints(sos_code);
CREATE INDEX idx_agent_assignments_user_id ON agent_checkpoint_assignments(user_id);
CREATE INDEX idx_agent_assignments_checkpoint_id ON agent_checkpoint_assignments(checkpoint_id);
CREATE INDEX idx_visitors_blacklisted ON visitors(is_blacklisted);
CREATE INDEX idx_visitors_id_number ON visitors(id_number);
CREATE INDEX idx_rendezvous_qr_code ON rendezvous(qr_code);
CREATE INDEX idx_rendezvous_visit_date ON rendezvous(visit_date);
CREATE INDEX idx_visits_entry_time ON visits(entry_time);
CREATE INDEX idx_visits_exit_time ON visits(exit_time);
CREATE INDEX idx_visits_visitor_id ON visits(visitor_id);
CREATE INDEX idx_visits_planned_id ON visits(planned_id);
CREATE INDEX idx_sos_alerts_checkpoint_id ON sos_alerts(checkpoint_id);
CREATE INDEX idx_sos_alerts_triggered_at ON sos_alerts(triggered_at);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Triggers pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON sites FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_checkpoints_updated_at BEFORE UPDATE ON checkpoints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_visitors_updated_at BEFORE UPDATE ON visitors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rendezvous_updated_at BEFORE UPDATE ON rendezvous FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour générer un QR code unique
CREATE OR REPLACE FUNCTION generate_unique_qr_code()
RETURNS TEXT AS $$
DECLARE
    new_qr_code TEXT;
BEGIN
    LOOP
        new_qr_code := 'QR' || substr(md5(random()::text), 1, 12) || extract(epoch from now())::bigint::text;
        IF NOT EXISTS (SELECT 1 FROM rendezvous WHERE qr_code = new_qr_code) THEN
            RETURN new_qr_code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Insertion des données de base
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('admin@entreprise.com', '$2b$12$LQv3c1yqBWVHxkd0L6k0R.LCs.5rJdK7Q2c5Jv5Q5Jv5Q5Jv5Q5Jv', 'Admin', 'Système', 'ADMIN'),
('chef.service1@entreprise.com', '$2b$12$LQv3c1yqBWVHxkd0L6k0R.LCs.5rJdK7Q2c5Jv5Q5Jv5Q5Jv5Q5Jv', 'Jean', 'Dupont', 'CHEF_SERVICE'),
('agent.gestion1@entreprise.com', '$2b$12$LQv3c1yqBWVHxkd0L6k0R.LCs.5rJdK7Q2c5Jv5Q5Jv5Q5Jv5Q5Jv', 'Marie', 'Martin', 'AGENT_GESTION'),
('agent.controle1@entreprise.com', '$2b$12$LQv3c1yqBWVHxkd0L6k0R.LCs.5rJdK7Q2c5Jv5Q5Jv5Q5Jv5Q5Jv', 'Pierre', 'Durand', 'AGENT_CONTROLE');

INSERT INTO sites (name, address) VALUES
('Siège Social', '123 Avenue des Champs-Élysées, 75008 Paris'),
('Site Production', '456 Rue de l''Industrie, 69000 Lyon'),
('Centre R&D', '789 Boulevard de l''Innovation, 31000 Toulouse');

INSERT INTO services (name, description) VALUES
('Direction Générale', 'Direction générale de l''entreprise'),
('Ressources Humaines', 'Service des ressources humaines'),
('Informatique', 'Service des technologies de l''information'),
('Production', 'Service de production'),
('Recherche & Développement', 'Service de recherche et développement');

-- Mise à jour des chefs de service
UPDATE services SET chef_id = (SELECT id FROM users WHERE email = 'chef.service1@entreprise.com') WHERE name = 'Direction Générale';

INSERT INTO checkpoints (site_id, name, sos_code) VALUES
((SELECT id FROM sites WHERE name = 'Siège Social'), 'Entrée Principale', 'SOS-PARIS-001'),
((SELECT id FROM sites WHERE name = 'Siège Social'), 'Parking Sous-sol', 'SOS-PARIS-002'),
((SELECT id FROM sites WHERE name = 'Site Production'), 'Portail Usine', 'SOS-LYON-001'),
((SELECT id FROM sites WHERE name = 'Centre R&D'), 'Accueil R&D', 'SOS-TOULOUSE-001');

-- Assignation des agents aux checkpoints
INSERT INTO agent_checkpoint_assignments (user_id, checkpoint_id, start_date) VALUES
((SELECT id FROM users WHERE email = 'agent.controle1@entreprise.com'), 
 (SELECT id FROM checkpoints WHERE sos_code = 'SOS-PARIS-001'), NOW());

COMMIT;

-- Vues utiles pour les rapports
CREATE VIEW active_visits AS
SELECT 
    v.*,
    vis.first_name || ' ' || vis.last_name as visitor_name,
    s.name as service_name,
    c.name as checkpoint_name,
    st.name as site_name
FROM visits v
JOIN visitors vis ON v.visitor_id = vis.id
JOIN services s ON v.service_id = s.id
JOIN checkpoints c ON v.checkpoint_id = c.id
JOIN sites st ON c.site_id = st.id
WHERE v.status = 'active' AND v.exit_time IS NULL;

CREATE VIEW daily_visit_stats AS
SELECT 
    DATE(entry_time) as visit_date,
    COUNT(*) as total_visits,
    COUNT(CASE WHEN exit_time IS NULL THEN 1 END) as active_visits,
    COUNT(CASE WHEN is_group = TRUE THEN 1 END) as group_visits,
    COUNT(CASE WHEN planned_id IS NOT NULL THEN 1 END) as planned_visits
FROM visits
GROUP BY DATE(entry_time);

-- Message de confirmation
DO $$ 
BEGIN
    RAISE NOTICE '✅ Base de données créée avec succès!';
    RAISE NOTICE '📊 % tables créées', (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public');
    RAISE NOTICE '👤 Utilisateurs créés: admin@entreprise.com / password123';
    RAISE NOTICE '🏢 Sites créés: 3 sites avec checkpoints';
END $$;


-- -- CreateEnum
-- CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE', 'CHEF_SERVICE');

-- -- CreateTable
-- CREATE TABLE "users" (
--     "id" TEXT NOT NULL,
--     "email" TEXT NOT NULL,
--     "passwordHash" TEXT NOT NULL,
--     "firstName" TEXT NOT NULL,
--     "lastName" TEXT NOT NULL,
--     "role" "UserRole" NOT NULL DEFAULT 'AGENT_GESTION',
--     "isActive" BOOLEAN NOT NULL DEFAULT true,
--     "profilePictureId" TEXT,
--     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "updatedAt" TIMESTAMP(3) NOT NULL,

--     CONSTRAINT "users_pkey" PRIMARY KEY ("id")
-- );

-- -- CreateTable
-- CREATE TABLE "refresh_tokens" (
--     "id" TEXT NOT NULL,
--     "token" TEXT NOT NULL,
--     "userId" TEXT NOT NULL,
--     "expiresAt" TIMESTAMP(3) NOT NULL,
--     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

--     CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
-- );

-- -- CreateTable
-- CREATE TABLE "files" (
--     "id" TEXT NOT NULL,
--     "originalName" TEXT NOT NULL,
--     "mimeType" TEXT NOT NULL,
--     "size" INTEGER NOT NULL,
--     "path" TEXT NOT NULL,
--     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

--     CONSTRAINT "files_pkey" PRIMARY KEY ("id")
-- );

-- -- CreateIndex
-- CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- -- CreateIndex
-- CREATE UNIQUE INDEX "users_profilePictureId_key" ON "users"("profilePictureId");

-- -- CreateIndex
-- CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- -- AddForeignKey
-- ALTER TABLE "users" ADD CONSTRAINT "users_profilePictureId_fkey" FOREIGN KEY ("profilePictureId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- -- AddForeignKey
-- ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;



