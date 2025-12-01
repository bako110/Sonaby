-- AlterTable
ALTER TABLE `visitors` ADD COLUMN `checkpoint_id` CHAR(36) NULL;

-- AddForeignKey
ALTER TABLE `visitors` ADD CONSTRAINT `visitors_ibfk_checkpoint` FOREIGN KEY (`checkpoint_id`) REFERENCES `checkpoints`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;
