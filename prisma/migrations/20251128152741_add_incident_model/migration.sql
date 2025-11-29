-- CreateTable
CREATE TABLE `incidents` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `titre` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `type_incident` VARCHAR(50) NOT NULL,
    `severite` VARCHAR(20) NOT NULL,
    `priorite` VARCHAR(20) NOT NULL,
    `source` VARCHAR(20) NOT NULL,
    `date_incident` TIMESTAMP(0) NOT NULL,
    `heure_incident` TIMESTAMP(0) NOT NULL,
    `site_id` CHAR(36) NULL,
    `visiteur_id` CHAR(36) NULL,
    `actions_immediates` TEXT NULL,
    `temoin_present` BOOLEAN NOT NULL DEFAULT false,
    `notifier_agents` BOOLEAN NOT NULL DEFAULT false,
    `is_resolved` BOOLEAN NOT NULL DEFAULT false,
    `resolved_at` TIMESTAMP(0) NULL,
    `resolution_notes` TEXT NULL,
    `reported_by` CHAR(36) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,

    INDEX `incidents_site_id_idx`(`site_id`),
    INDEX `incidents_visiteur_id_idx`(`visiteur_id`),
    INDEX `incidents_reported_by_idx`(`reported_by`),
    INDEX `incidents_date_incident_idx`(`date_incident`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `incidents` ADD CONSTRAINT `incidents_site_id_fkey` FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `incidents` ADD CONSTRAINT `incidents_visiteur_id_fkey` FOREIGN KEY (`visiteur_id`) REFERENCES `visitors`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `incidents` ADD CONSTRAINT `incidents_reported_by_fkey` FOREIGN KEY (`reported_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
