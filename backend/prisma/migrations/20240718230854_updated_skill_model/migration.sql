/*
  Warnings:

  - You are about to drop the column `userId` on the `Skill` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Skill" DROP CONSTRAINT "Skill_userId_fkey";

-- AlterTable
ALTER TABLE "Skill" DROP COLUMN "userId",
ADD COLUMN     "username" TEXT;

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_username_fkey" FOREIGN KEY ("username") REFERENCES "User"("username") ON DELETE SET NULL ON UPDATE CASCADE;
