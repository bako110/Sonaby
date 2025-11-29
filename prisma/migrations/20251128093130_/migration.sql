-- CreateTable
CREATE TABLE `users` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `matricule` VARCHAR(50) NULL,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` TEXT NOT NULL,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `role` VARCHAR(20) NOT NULL DEFAULT 'AGENT_CONTROLE',
    `is_active` BOOLEAN NULL DEFAULT true,
    `phone` VARCHAR(20) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `users_matricule_key`(`matricule`),
    UNIQUE INDEX `email`(`email`),
    INDEX `idx_users_email`(`email`),
    INDEX `idx_users_role`(`role`),
    INDEX `idx_users_matricule`(`matricule`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sites` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `name` VARCHAR(255) NOT NULL,
    `address` TEXT NOT NULL,
    `city` VARCHAR(100) NOT NULL,
    `postal_code` VARCHAR(20) NOT NULL,
    `country` VARCHAR(100) NOT NULL,
    `activity_type` VARCHAR(50) NOT NULL,
    `status` VARCHAR(50) NOT NULL,
    `code` VARCHAR(50) NULL,
    `region` VARCHAR(100) NULL,
    `phone` VARCHAR(20) NULL,
    `fax` VARCHAR(20) NULL,
    `email` VARCHAR(255) NULL,
    `website` VARCHAR(255) NULL,
    `manager` VARCHAR(255) NULL,
    `manager_email` VARCHAR(255) NULL,
    `manager_phone` VARCHAR(20) NULL,
    `area` DECIMAL(10, 2) NULL,
    `usable_area` DECIMAL(10, 2) NULL,
    `employee_count` INTEGER NULL,
    `max_employee_capacity` INTEGER NULL,
    `building_count` INTEGER NULL,
    `creation_date` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `modification_date` TIMESTAMP(0) NULL,
    `opening_date` TIMESTAMP(0) NULL,
    `closing_date` TIMESTAMP(0) NULL,
    `coordinates` JSON NULL,
    `description` TEXT NULL,
    `comments` TEXT NULL,
    `monthly_cost` DECIMAL(15, 2) NULL,
    `annual_budget` DECIMAL(15, 2) NULL,
    `certifications` JSON NULL,
    `last_inspection` TIMESTAMP(0) NULL,
    `next_inspection` TIMESTAMP(0) NULL,
    `equipment` JSON NULL,
    `services` JSON NULL,
    `wheelchair_accessible` BOOLEAN NULL,
    `parking_available` BOOLEAN NULL,
    `parking_spaces` INTEGER NULL,
    `security_system` BOOLEAN NULL,
    `security_guard` BOOLEAN NULL,
    `environmental_certification` VARCHAR(255) NULL,
    `energy_consumption` DECIMAL(10, 2) NULL,
    `created_by` VARCHAR(255) NULL,
    `modified_by` VARCHAR(255) NULL,
    `version` INTEGER NULL DEFAULT 1,

    UNIQUE INDEX `sites_code_key`(`code`),
    INDEX `idx_sites_code`(`code`),
    INDEX `idx_sites_status`(`status`),
    INDEX `idx_sites_city`(`city`),
    INDEX `idx_sites_activity_type`(`activity_type`),
    INDEX `idx_sites_manager`(`manager`),
    INDEX `idx_sites_creation_date`(`creation_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `checkpoints` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `site_id` CHAR(36) NOT NULL,
    `zone` VARCHAR(100) NULL,
    `building` VARCHAR(100) NULL,
    `floor` VARCHAR(50) NULL,
    `coordinates_latitude` VARCHAR(50) NULL,
    `coordinates_longitude` VARCHAR(50) NULL,
    `sos_id` VARCHAR(100) NOT NULL,
    `agent_id` CHAR(36) NULL,
    `checkpoint_type` VARCHAR(30) NOT NULL DEFAULT 'internal',
    `status` VARCHAR(20) NOT NULL DEFAULT 'active',
    `priority` VARCHAR(20) NOT NULL DEFAULT 'medium',
    `control_frequency` VARCHAR(20) NULL,
    `equipment` JSON NULL,
    `special_instructions` TEXT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `sos_id`(`sos_id`),
    INDEX `idx_checkpoints_site_id`(`site_id`),
    INDEX `idx_checkpoints_sos_id`(`sos_id`),
    INDEX `idx_checkpoints_agent_id`(`agent_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `agent_checkpoint_assignments` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `user_id` CHAR(36) NOT NULL,
    `checkpoint_id` CHAR(36) NOT NULL,
    `start_date` TIMESTAMP(0) NOT NULL,
    `end_date` TIMESTAMP(0) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_agent_assignments_checkpoint_id`(`checkpoint_id`),
    INDEX `idx_agent_assignments_user_id`(`user_id`),
    UNIQUE INDEX `unique_assignment`(`user_id`, `checkpoint_id`, `start_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `visitors` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `birth_date` VARCHAR(20) NULL,
    `birth_place` VARCHAR(255) NULL,
    `sexe` VARCHAR(10) NULL,
    `giving_date` VARCHAR(20) NULL,
    `expiration_date` VARCHAR(20) NULL,
    `phone` VARCHAR(20) NULL,
    `email` VARCHAR(255) NULL,
    `id_type` VARCHAR(20) NOT NULL,
    `id_number` VARCHAR(255) NOT NULL,
    `id_scan_url` TEXT NULL,
    `photo_url` TEXT NULL,
    `is_blacklisted` BOOLEAN NULL DEFAULT false,
    `blacklist_reason` TEXT NULL,
    `company` VARCHAR(255) NULL,
    `emergency_contact_phone` VARCHAR(20) NULL,
    `emergency_contact_name` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_visitors_blacklisted`(`is_blacklisted`),
    INDEX `idx_visitors_id_number`(`id_number`),
    UNIQUE INDEX `unique_identity`(`id_type`, `id_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `services` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `chef_id` CHAR(36) NULL,
    `is_active` BOOLEAN NULL DEFAULT true,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `chef_id`(`chef_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rendezvous` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `organizer_id` CHAR(36) NOT NULL,
    `site_id` CHAR(36) NULL,
    `first_name` VARCHAR(255) NULL,
    `last_name` VARCHAR(255) NULL,
    `office` VARCHAR(255) NULL,
    `service_name` VARCHAR(255) NULL,
    `reason` TEXT NOT NULL,
    `visit_date` DATE NOT NULL,
    `start_time` TIME(0) NULL,
    `end_time` TIME(0) NULL,
    `status` VARCHAR(20) NULL DEFAULT 'pending',
    `notes` TEXT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_rendezvous_visit_date`(`visit_date`),
    INDEX `organizer_id`(`organizer_id`),
    INDEX `site_id`(`site_id`),
    INDEX `first_name`(`first_name`),
    INDEX `last_name`(`last_name`),
    INDEX `service_name`(`service_name`),
    INDEX `status`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `visits` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `visitor_id` CHAR(36) NOT NULL,
    `checkpoint_id` CHAR(36) NOT NULL,
    `created_by` CHAR(36) NULL,
    `service_id` CHAR(36) NULL,
    `rendezvous_id` CHAR(36) NULL,
    `status_name` VARCHAR(20) NULL,
    `entry_time` TIMESTAMP(0) NOT NULL,
    `exit_time` TIMESTAMP(0) NULL,
    `entity_visited` TEXT NULL,
    `contact_person` VARCHAR(255) NULL,
    `origin` VARCHAR(255) NULL,
    `reason` TEXT NOT NULL,
    `notes` TEXT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'present',
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_visits_visitor`(`visitor_id`),
    INDEX `idx_visits_checkpoint`(`checkpoint_id`),
    INDEX `idx_visits_creator`(`created_by`),
    INDEX `idx_visits_service`(`service_id`),
    INDEX `idx_visits_rendezvous`(`rendezvous_id`),
    INDEX `idx_visits_status_name`(`status_name`),
    INDEX `idx_visits_status`(`status`),
    INDEX `idx_visits_entry_time`(`entry_time`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `visit_incidents` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `visit_id` CHAR(36) NOT NULL,
    `reported_by` CHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `severity_level` INTEGER NULL DEFAULT 1,
    `is_resolved` BOOLEAN NULL DEFAULT false,
    `resolved_at` TIMESTAMP(0) NULL,
    `resolution_notes` TEXT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `reported_by`(`reported_by`),
    INDEX `visit_id`(`visit_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sos_alerts` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `checkpoint_id` CHAR(36) NOT NULL,
    `triggered_by` CHAR(36) NOT NULL,
    `triggered_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `message` TEXT NULL,
    `is_resolved` BOOLEAN NULL DEFAULT false,
    `resolved_at` TIMESTAMP(0) NULL,
    `resolved_by` CHAR(36) NULL,
    `resolution_notes` TEXT NULL,

    INDEX `idx_sos_alerts_checkpoint_id`(`checkpoint_id`),
    INDEX `idx_sos_alerts_triggered_at`(`triggered_at`),
    INDEX `resolved_by`(`resolved_by`),
    INDEX `triggered_by`(`triggered_by`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blacklist_history` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `visitor_id` CHAR(36) NULL,
    `first_name` VARCHAR(100) NULL,
    `last_name` VARCHAR(100) NULL,
    `id_type` VARCHAR(20) NULL,
    `id_number` VARCHAR(255) NULL,
    `phone` VARCHAR(20) NULL,
    `email` VARCHAR(255) NULL,
    `nationality` VARCHAR(100) NULL,
    `birth_date` DATE NULL,
    `birth_place` VARCHAR(255) NULL,
    `action` VARCHAR(20) NOT NULL,
    `reason` TEXT NOT NULL,
    `severity_level` INTEGER NULL DEFAULT 1,
    `incident_date` DATE NULL,
    `incident_location` VARCHAR(255) NULL,
    `created_by` CHAR(36) NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_blacklist_visitor_id`(`visitor_id`),
    INDEX `idx_blacklist_id_number`(`id_number`),
    INDEX `idx_blacklist_severity`(`severity_level`),
    INDEX `idx_blacklist_incident_date`(`incident_date`),
    INDEX `action`(`action`),
    INDEX `created_by`(`created_by`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `user_id` CHAR(36) NULL,
    `action` VARCHAR(255) NOT NULL,
    `entity` VARCHAR(255) NOT NULL,
    `entity_id` CHAR(36) NULL,
    `old_values` JSON NULL,
    `new_values` JSON NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` TEXT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_audit_logs_created_at`(`created_at`),
    INDEX `idx_audit_logs_entity`(`entity`, `entity_id`),
    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `visitor_groups` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `group_code` VARCHAR(100) NOT NULL,
    `organizer_id` CHAR(36) NOT NULL,
    `service_id` CHAR(36) NOT NULL,
    `reason` TEXT NOT NULL,
    `visit_date` DATE NOT NULL,
    `expected_count` INTEGER NULL DEFAULT 1,
    `notes` TEXT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `group_code`(`group_code`),
    INDEX `organizer_id`(`organizer_id`),
    INDEX `service_id`(`service_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `group_visitors` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `group_id` CHAR(36) NOT NULL,
    `visitor_id` CHAR(36) NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `visitor_id`(`visitor_id`),
    UNIQUE INDEX `unique_group_visitor`(`group_id`, `visitor_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blacklist_actions` (
    `action_name` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`action_name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `id_types` (
    `type_name` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`type_name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rendezvous_statuses` (
    `status_name` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`status_name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_roles` (
    `role_name` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`role_name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `visit_statuses` (
    `status_name` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`status_name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refresh_tokens` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `token` VARCHAR(500) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `expires_at` TIMESTAMP(0) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `refresh_tokens_token_key`(`token`),
    INDEX `idx_refresh_tokens_user_id`(`user_id`),
    INDEX `idx_refresh_tokens_expires_at`(`expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `non_desirables` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `visitor_id` CHAR(36) NULL,
    `reason` TEXT NOT NULL,
    `reported_by` CHAR(36) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_non_desirables_visitor_id`(`visitor_id`),
    INDEX `idx_non_desirables_reported_by`(`reported_by`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissions` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `permissions_name_key`(`name`),
    INDEX `idx_permissions_name`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_permissions` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `user_id` CHAR(36) NOT NULL,
    `permission_id` CHAR(36) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_user_permissions_user`(`user_id`),
    INDEX `idx_user_permissions_permission`(`permission_id`),
    UNIQUE INDEX `unique_user_permission`(`user_id`, `permission_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_sites` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `user_id` CHAR(36) NOT NULL,
    `site_id` CHAR(36) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_user_sites_user`(`user_id`),
    INDEX `idx_user_sites_site`(`site_id`),
    UNIQUE INDEX `unique_user_site`(`user_id`, `site_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role`) REFERENCES `user_roles`(`role_name`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `checkpoints` ADD CONSTRAINT `checkpoints_site_id_fkey` FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `checkpoints` ADD CONSTRAINT `checkpoints_agent_id_fkey` FOREIGN KEY (`agent_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `agent_checkpoint_assignments` ADD CONSTRAINT `agent_checkpoint_assignments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `agent_checkpoint_assignments` ADD CONSTRAINT `agent_checkpoint_assignments_ibfk_2` FOREIGN KEY (`checkpoint_id`) REFERENCES `checkpoints`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `visitors` ADD CONSTRAINT `visitors_ibfk_1` FOREIGN KEY (`id_type`) REFERENCES `id_types`(`type_name`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `services` ADD CONSTRAINT `services_ibfk_1` FOREIGN KEY (`chef_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `rendezvous` ADD CONSTRAINT `rendezvous_ibfk_1` FOREIGN KEY (`organizer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `rendezvous` ADD CONSTRAINT `rendezvous_ibfk_site` FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `visits` ADD CONSTRAINT `visits_ibfk_1` FOREIGN KEY (`visitor_id`) REFERENCES `visitors`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `visits` ADD CONSTRAINT `visits_ibfk_2` FOREIGN KEY (`checkpoint_id`) REFERENCES `checkpoints`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `visits` ADD CONSTRAINT `visits_ibfk_creator` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `visits` ADD CONSTRAINT `visits_ibfk_service` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `visits` ADD CONSTRAINT `visits_ibfk_rendezvous` FOREIGN KEY (`rendezvous_id`) REFERENCES `rendezvous`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `visits` ADD CONSTRAINT `visits_ibfk_status` FOREIGN KEY (`status_name`) REFERENCES `visit_statuses`(`status_name`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `visit_incidents` ADD CONSTRAINT `visit_incidents_ibfk_1` FOREIGN KEY (`visit_id`) REFERENCES `visits`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `visit_incidents` ADD CONSTRAINT `visit_incidents_ibfk_2` FOREIGN KEY (`reported_by`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `sos_alerts` ADD CONSTRAINT `sos_alerts_ibfk_1` FOREIGN KEY (`checkpoint_id`) REFERENCES `checkpoints`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `sos_alerts` ADD CONSTRAINT `sos_alerts_ibfk_2` FOREIGN KEY (`triggered_by`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `sos_alerts` ADD CONSTRAINT `sos_alerts_ibfk_3` FOREIGN KEY (`resolved_by`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `blacklist_history` ADD CONSTRAINT `blacklist_history_visitor_id_fkey` FOREIGN KEY (`visitor_id`) REFERENCES `visitors`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `blacklist_history` ADD CONSTRAINT `blacklist_history_action_fkey` FOREIGN KEY (`action`) REFERENCES `blacklist_actions`(`action_name`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `blacklist_history` ADD CONSTRAINT `blacklist_history_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `blacklist_history` ADD CONSTRAINT `blacklist_history_id_type_fkey` FOREIGN KEY (`id_type`) REFERENCES `id_types`(`type_name`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `visitor_groups` ADD CONSTRAINT `visitor_groups_ibfk_1` FOREIGN KEY (`organizer_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `visitor_groups` ADD CONSTRAINT `visitor_groups_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `group_visitors` ADD CONSTRAINT `group_visitors_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `visitor_groups`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `group_visitors` ADD CONSTRAINT `group_visitors_ibfk_2` FOREIGN KEY (`visitor_id`) REFERENCES `visitors`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `non_desirables` ADD CONSTRAINT `non_desirables_visitor_id_fkey` FOREIGN KEY (`visitor_id`) REFERENCES `visitors`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `non_desirables` ADD CONSTRAINT `non_desirables_reported_by_fkey` FOREIGN KEY (`reported_by`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_permissions` ADD CONSTRAINT `user_permissions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_permissions` ADD CONSTRAINT `user_permissions_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_sites` ADD CONSTRAINT `user_sites_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_sites` ADD CONSTRAINT `user_sites_site_id_fkey` FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
