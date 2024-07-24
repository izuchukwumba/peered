-- DropForeignKey
ALTER TABLE "Interest" DROP CONSTRAINT "Interest_codeGroupId_fkey";

-- AlterTable
ALTER TABLE "Interest" ALTER COLUMN "codeGroupId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Interest" ADD CONSTRAINT "Interest_codeGroupId_fkey" FOREIGN KEY ("codeGroupId") REFERENCES "CodeGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
