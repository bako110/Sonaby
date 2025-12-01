/*
  Warnings:

  - You are about to drop the column `comments` on the `sites` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `sites` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `incidents` DROP FOREIGN KEY `incidents_reported_by_fkey`;

-- AlterTable
ALTER TABLE `sites` DROP COLUMN `comments`,
    DROP COLUMN `version`;

-- AddForeignKey
ALTER TABLE `incidents` ADD CONSTRAINT `incidents_reported_by_fkey` FOREIGN KEY (`reported_by`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;
