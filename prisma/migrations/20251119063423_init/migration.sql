/*
  Warnings:

  - Made the column `created_at` on table `agent_checkpoint_assignments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `audit_logs` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `blacklist_history` required. This step will fail if there are existing NULL values in that column.
  - Made the column `is_active` on table `checkpoints` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `checkpoints` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `checkpoints` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `group_visitors` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `rendezvous` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `rendezvous` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `rendezvous` required. This step will fail if there are existing NULL values in that column.
  - Made the column `is_active` on table `services` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `services` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `services` required. This step will fail if there are existing NULL values in that column.
  - Made the column `is_active` on table `sites` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `sites` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `sites` required. This step will fail if there are existing NULL values in that column.
  - Made the column `triggered_at` on table `sos_alerts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `is_resolved` on table `sos_alerts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `is_active` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `severity_level` on table `visit_incidents` required. This step will fail if there are existing NULL values in that column.
  - Made the column `is_resolved` on table `visit_incidents` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `visit_incidents` required. This step will fail if there are existing NULL values in that column.
  - Made the column `expected_count` on table `visitor_groups` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `visitor_groups` required. This step will fail if there are existing NULL values in that column.
  - Made the column `is_blacklisted` on table `visitors` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `visitors` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `visitors` required. This step will fail if there are existing NULL values in that column.
  - Made the column `is_group` on table `visits` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `visits` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `visits` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "agent_checkpoint_assignments" DROP CONSTRAINT "agent_checkpoint_assignments_checkpoint_id_fkey";

-- DropForeignKey
ALTER TABLE "agent_checkpoint_assignments" DROP CONSTRAINT "agent_checkpoint_assignments_user_id_fkey";

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_user_id_fkey";

-- DropForeignKey
ALTER TABLE "blacklist_history" DROP CONSTRAINT "blacklist_history_created_by_fkey";

-- DropForeignKey
ALTER TABLE "blacklist_history" DROP CONSTRAINT "blacklist_history_visitor_id_fkey";

-- DropForeignKey
ALTER TABLE "checkpoints" DROP CONSTRAINT "checkpoints_site_id_fkey";

-- DropForeignKey
ALTER TABLE "group_visitors" DROP CONSTRAINT "group_visitors_group_id_fkey";

-- DropForeignKey
ALTER TABLE "group_visitors" DROP CONSTRAINT "group_visitors_visitor_id_fkey";

-- DropForeignKey
ALTER TABLE "rendezvous" DROP CONSTRAINT "rendezvous_organizer_id_fkey";

-- DropForeignKey
ALTER TABLE "rendezvous" DROP CONSTRAINT "rendezvous_service_id_fkey";

-- DropForeignKey
ALTER TABLE "rendezvous" DROP CONSTRAINT "rendezvous_visitor_id_fkey";

-- DropForeignKey
ALTER TABLE "services" DROP CONSTRAINT "services_chef_id_fkey";

-- DropForeignKey
ALTER TABLE "sos_alerts" DROP CONSTRAINT "sos_alerts_checkpoint_id_fkey";

-- DropForeignKey
ALTER TABLE "sos_alerts" DROP CONSTRAINT "sos_alerts_resolved_by_fkey";

-- DropForeignKey
ALTER TABLE "sos_alerts" DROP CONSTRAINT "sos_alerts_triggered_by_fkey";

-- DropForeignKey
ALTER TABLE "visit_incidents" DROP CONSTRAINT "visit_incidents_reported_by_fkey";

-- DropForeignKey
ALTER TABLE "visit_incidents" DROP CONSTRAINT "visit_incidents_visit_id_fkey";

-- DropForeignKey
ALTER TABLE "visitor_groups" DROP CONSTRAINT "visitor_groups_organizer_id_fkey";

-- DropForeignKey
ALTER TABLE "visitor_groups" DROP CONSTRAINT "visitor_groups_service_id_fkey";

-- DropForeignKey
ALTER TABLE "visits" DROP CONSTRAINT "visits_checkpoint_id_fkey";

-- DropForeignKey
ALTER TABLE "visits" DROP CONSTRAINT "visits_created_by_fkey";

-- DropForeignKey
ALTER TABLE "visits" DROP CONSTRAINT "visits_planned_id_fkey";

-- DropForeignKey
ALTER TABLE "visits" DROP CONSTRAINT "visits_service_id_fkey";

-- DropForeignKey
ALTER TABLE "visits" DROP CONSTRAINT "visits_visitor_id_fkey";

-- DropIndex
DROP INDEX "idx_agent_assignments_checkpoint_id";

-- DropIndex
DROP INDEX "idx_agent_assignments_user_id";

-- DropIndex
DROP INDEX "idx_audit_logs_created_at";

-- DropIndex
DROP INDEX "idx_audit_logs_entity";

-- DropIndex
DROP INDEX "idx_checkpoints_site_id";

-- DropIndex
DROP INDEX "idx_checkpoints_sos_code";

-- DropIndex
DROP INDEX "idx_rendezvous_qr_code";

-- DropIndex
DROP INDEX "idx_rendezvous_visit_date";

-- DropIndex
DROP INDEX "idx_sos_alerts_checkpoint_id";

-- DropIndex
DROP INDEX "idx_sos_alerts_triggered_at";

-- DropIndex
DROP INDEX "idx_users_email";

-- DropIndex
DROP INDEX "idx_users_role";

-- DropIndex
DROP INDEX "idx_visitors_blacklisted";

-- DropIndex
DROP INDEX "idx_visitors_id_number";

-- DropIndex
DROP INDEX "idx_visits_entry_time";

-- DropIndex
DROP INDEX "idx_visits_exit_time";

-- DropIndex
DROP INDEX "idx_visits_planned_id";

-- DropIndex
DROP INDEX "idx_visits_visitor_id";

-- AlterTable
ALTER TABLE "agent_checkpoint_assignments" ALTER COLUMN "created_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "audit_logs" ALTER COLUMN "created_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "blacklist_history" ALTER COLUMN "created_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "checkpoints" ALTER COLUMN "is_active" SET NOT NULL,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "group_visitors" ALTER COLUMN "created_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "rendezvous" ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "services" ALTER COLUMN "is_active" SET NOT NULL,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "sites" ALTER COLUMN "is_active" SET NOT NULL,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "sos_alerts" ALTER COLUMN "triggered_at" SET NOT NULL,
ALTER COLUMN "is_resolved" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "is_active" SET NOT NULL,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "visit_incidents" ADD COLUMN     "resolved_by" UUID,
ALTER COLUMN "severity_level" SET NOT NULL,
ALTER COLUMN "is_resolved" SET NOT NULL,
ALTER COLUMN "created_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "visitor_groups" ALTER COLUMN "expected_count" SET NOT NULL,
ALTER COLUMN "created_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "visitors" ALTER COLUMN "is_blacklisted" SET NOT NULL,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "visits" ALTER COLUMN "is_group" SET NOT NULL,
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "created_at" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "checkpoints" ADD CONSTRAINT "checkpoints_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_checkpoint_assignments" ADD CONSTRAINT "agent_checkpoint_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_checkpoint_assignments" ADD CONSTRAINT "agent_checkpoint_assignments_checkpoint_id_fkey" FOREIGN KEY ("checkpoint_id") REFERENCES "checkpoints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_chef_id_fkey" FOREIGN KEY ("chef_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rendezvous" ADD CONSTRAINT "rendezvous_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rendezvous" ADD CONSTRAINT "rendezvous_visitor_id_fkey" FOREIGN KEY ("visitor_id") REFERENCES "visitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rendezvous" ADD CONSTRAINT "rendezvous_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_visitor_id_fkey" FOREIGN KEY ("visitor_id") REFERENCES "visitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_checkpoint_id_fkey" FOREIGN KEY ("checkpoint_id") REFERENCES "checkpoints"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_planned_id_fkey" FOREIGN KEY ("planned_id") REFERENCES "rendezvous"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_incidents" ADD CONSTRAINT "visit_incidents_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_incidents" ADD CONSTRAINT "visit_incidents_reported_by_fkey" FOREIGN KEY ("reported_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_incidents" ADD CONSTRAINT "visit_incidents_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sos_alerts" ADD CONSTRAINT "sos_alerts_checkpoint_id_fkey" FOREIGN KEY ("checkpoint_id") REFERENCES "checkpoints"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sos_alerts" ADD CONSTRAINT "sos_alerts_triggered_by_fkey" FOREIGN KEY ("triggered_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sos_alerts" ADD CONSTRAINT "sos_alerts_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blacklist_history" ADD CONSTRAINT "blacklist_history_visitor_id_fkey" FOREIGN KEY ("visitor_id") REFERENCES "visitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blacklist_history" ADD CONSTRAINT "blacklist_history_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitor_groups" ADD CONSTRAINT "visitor_groups_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitor_groups" ADD CONSTRAINT "visitor_groups_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_visitors" ADD CONSTRAINT "group_visitors_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "visitor_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_visitors" ADD CONSTRAINT "group_visitors_visitor_id_fkey" FOREIGN KEY ("visitor_id") REFERENCES "visitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
