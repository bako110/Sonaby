-- Mise à jour des types de checkpoint pour supporter 'external' et 'patrol'
USE `sonabhy-es-db`;

-- Ajouter les nouveaux types de checkpoint
INSERT IGNORE INTO checkpoint_types (type_name) VALUES 
('external'),
('patrol');

-- Vérifier que tous les types sont présents
SELECT * FROM checkpoint_types;
