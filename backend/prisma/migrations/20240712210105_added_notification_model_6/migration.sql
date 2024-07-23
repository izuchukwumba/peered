/*
  Warnings:

  - You are about to drop the column `notificationId` on the `CodeGroup` table. All the data in the column will be lost.
  - Added the required column `fileId` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `groupId` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CodeGroup" DROP CONSTRAINT "CodeGroup_notificationId_fkey";

-- AlterTable
ALTER TABLE "CodeGroup" DROP COLUMN "notificationId";

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "fileId" INTEGER NOT NULL,
ADD COLUMN     "groupId" INTEGER NOT NULL;
