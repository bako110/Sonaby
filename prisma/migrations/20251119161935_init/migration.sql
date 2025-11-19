-- CreateTable
CREATE TABLE `users` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `email` VARCHAR(255) NOT NULL,
    `password_hash` TEXT NOT NULL,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `role` VARCHAR(20) NOT NULL DEFAULT 'AGENT_CONTROLE',
    `is_active` BOOLEAN NULL DEFAULT true,
    `phone` VARCHAR(20) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `email`(`email`),
    INDEX `idx_users_email`(`email`),
    INDEX `idx_users_role`(`role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sites` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `name` VARCHAR(255) NOT NULL,
    `address` TEXT NOT NULL,
    `phone` VARCHAR(20) NULL,
    `is_active` BOOLEAN NULL DEFAULT true,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `checkpoints` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `site_id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `sos_code` VARCHAR(100) NOT NULL,
    `location_description` TEXT NULL,
    `is_active` BOOLEAN NULL DEFAULT true,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `sos_code`(`sos_code`),
    INDEX `idx_checkpoints_site_id`(`site_id`),
    INDEX `idx_checkpoints_sos_code`(`sos_code`),
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
    `phone` VARCHAR(20) NULL,
    `email` VARCHAR(255) NULL,
    `id_type` VARCHAR(20) NOT NULL,
    `id_number` VARCHAR(255) NOT NULL,
    `id_scan_url` TEXT NULL,
    `photo_url` TEXT NULL,
    `is_blacklisted` BOOLEAN NULL DEFAULT false,
    `blacklist_reason` TEXT NULL,
    `company` VARCHAR(255) NULL,
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
    `visitor_id` CHAR(36) NULL,
    `group_code` VARCHAR(100) NULL,
    `service_id` CHAR(36) NOT NULL,
    `reason` TEXT NOT NULL,
    `visit_date` DATE NOT NULL,
    `start_time` TIME(0) NULL,
    `end_time` TIME(0) NULL,
    `qr_code` VARCHAR(255) NOT NULL,
    `status` VARCHAR(20) NULL DEFAULT 'pending',
    `notes` TEXT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `qr_code`(`qr_code`),
    INDEX `idx_rendezvous_qr_code`(`qr_code`),
    INDEX `idx_rendezvous_visit_date`(`visit_date`),
    INDEX `organizer_id`(`organizer_id`),
    INDEX `service_id`(`service_id`),
    INDEX `status`(`status`),
    INDEX `visitor_id`(`visitor_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `visits` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `visitor_id` CHAR(36) NOT NULL,
    `checkpoint_id` CHAR(36) NOT NULL,
    `service_id` CHAR(36) NOT NULL,
    `reason` TEXT NOT NULL,
    `planned_id` CHAR(36) NULL,
    `is_group` BOOLEAN NULL DEFAULT false,
    `group_code` VARCHAR(100) NULL,
    `entry_time` TIMESTAMP(0) NOT NULL,
    `exit_time` TIMESTAMP(0) NULL,
    `created_by` CHAR(36) NOT NULL,
    `status` VARCHAR(20) NULL DEFAULT 'active',
    `signature_url` TEXT NULL,
    `notes` TEXT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `checkpoint_id`(`checkpoint_id`),
    INDEX `created_by`(`created_by`),
    INDEX `idx_visits_entry_time`(`entry_time`),
    INDEX `idx_visits_exit_time`(`exit_time`),
    INDEX `idx_visits_planned_id`(`planned_id`),
    INDEX `idx_visits_visitor_id`(`visitor_id`),
    INDEX `service_id`(`service_id`),
    INDEX `status`(`status`),
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
    `visitor_id` CHAR(36) NOT NULL,
    `action` VARCHAR(20) NOT NULL,
    `reason` TEXT NOT NULL,
    `created_by` CHAR(36) NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `action`(`action`),
    INDEX `created_by`(`created_by`),
    INDEX `visitor_id`(`visitor_id`),
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

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role`) REFERENCES `user_roles`(`role_name`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `checkpoints` ADD CONSTRAINT `checkpoints_ibfk_1` FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

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
ALTER TABLE `rendezvous` ADD CONSTRAINT `rendezvous_ibfk_2` FOREIGN KEY (`visitor_id`) REFERENCES `visitors`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `rendezvous` ADD CONSTRAINT `rendezvous_ibfk_3` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `rendezvous` ADD CONSTRAINT `rendezvous_ibfk_4` FOREIGN KEY (`status`) REFERENCES `rendezvous_statuses`(`status_name`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `visits` ADD CONSTRAINT `visits_ibfk_1` FOREIGN KEY (`visitor_id`) REFERENCES `visitors`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `visits` ADD CONSTRAINT `visits_ibfk_2` FOREIGN KEY (`checkpoint_id`) REFERENCES `checkpoints`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `visits` ADD CONSTRAINT `visits_ibfk_3` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `visits` ADD CONSTRAINT `visits_ibfk_4` FOREIGN KEY (`planned_id`) REFERENCES `rendezvous`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `visits` ADD CONSTRAINT `visits_ibfk_5` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `visits` ADD CONSTRAINT `visits_ibfk_6` FOREIGN KEY (`status`) REFERENCES `visit_statuses`(`status_name`) ON DELETE NO ACTION ON UPDATE NO ACTION;

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
ALTER TABLE `blacklist_history` ADD CONSTRAINT `blacklist_history_ibfk_1` FOREIGN KEY (`visitor_id`) REFERENCES `visitors`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `blacklist_history` ADD CONSTRAINT `blacklist_history_ibfk_2` FOREIGN KEY (`action`) REFERENCES `blacklist_actions`(`action_name`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `blacklist_history` ADD CONSTRAINT `blacklist_history_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

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
