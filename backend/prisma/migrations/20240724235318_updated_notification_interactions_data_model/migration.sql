/*
  Warnings:

  - A unique constraint covering the columns `[notificationId]` on the table `NotificationInteractions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `notificationId` to the `NotificationInteractions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "NotificationInteractions" ADD COLUMN     "notificationId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "NotificationInteractions_notificationId_key" ON "NotificationInteractions"("notificationId");
