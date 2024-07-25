/*
  Warnings:

  - Made the column `codeGroupId` on table `Skill` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Skill" DROP CONSTRAINT "Skill_codeGroupId_fkey";

-- AlterTable
ALTER TABLE "Skill" ALTER COLUMN "codeGroupId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_codeGroupId_fkey" FOREIGN KEY ("codeGroupId") REFERENCES "CodeGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
