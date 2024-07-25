-- DropForeignKey
ALTER TABLE "Skill" DROP CONSTRAINT "Skill_codeGroupId_fkey";

-- AlterTable
ALTER TABLE "Skill" ALTER COLUMN "codeGroupId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_codeGroupId_fkey" FOREIGN KEY ("codeGroupId") REFERENCES "CodeGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
