/*
  Warnings:

  - Made the column `codeGroupId` on table `Interest` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Interest" DROP CONSTRAINT "Interest_codeGroupId_fkey";

-- AlterTable
ALTER TABLE "Interest" ALTER COLUMN "codeGroupId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Interest" ADD CONSTRAINT "Interest_codeGroupId_fkey" FOREIGN KEY ("codeGroupId") REFERENCES "CodeGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
