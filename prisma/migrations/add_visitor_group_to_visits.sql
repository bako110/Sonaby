-- Ajouter la colonne responsable à visitor_groups
ALTER TABLE `visitor_groups` 
ADD COLUMN `responsible_visitor_id` CHAR(36) NULL AFTER `organizer_id`,
ADD COLUMN `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`,
ADD CONSTRAINT `visitor_groups_ibfk_responsible` 
  FOREIGN KEY (`responsible_visitor_id`) 
  REFERENCES `visitors`(`id`) 
  ON DELETE NO ACTION ON UPDATE NO ACTION;

-- Créer l'index pour le responsible_visitor_id
CREATE INDEX `responsible_visitor_id` ON `visitor_groups` (`responsible_visitor_id`);

-- Ajouter la colonne visitorGroupId à visits
ALTER TABLE `visits`
ADD COLUMN `visitor_group_id` CHAR(36) NULL AFTER `visitor_id`,
ADD CONSTRAINT `visits_ibfk_visitor_group` 
  FOREIGN KEY (`visitor_group_id`) 
  REFERENCES `visitor_groups`(`id`) 
  ON DELETE NO ACTION ON UPDATE NO ACTION;

-- Créer l'index pour le visitor_group_id
CREATE INDEX `idx_visits_visitor_group` ON `visits` (`visitor_group_id`);
