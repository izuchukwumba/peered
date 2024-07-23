/*
  Warnings:

  - You are about to drop the column `ifOffline` on the `Notification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "ifOffline",
ADD COLUMN     "isOffline" BOOLEAN NOT NULL DEFAULT false;
