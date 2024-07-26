/*
  Warnings:

  - You are about to drop the column `username` on the `Skill` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Skill" DROP CONSTRAINT "Skill_username_fkey";

-- AlterTable
ALTER TABLE "Skill" DROP COLUMN "username",
ADD COLUMN     "userId" INTEGER;

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
