/*
  Warnings:

  - You are about to drop the column `preferred_category` on the `CodeGroup` table. All the data in the column will be lost.
  - You are about to drop the column `isImportant` on the `Notification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CodeGroup" DROP COLUMN "preferred_category";

-- AlterTable
ALTER TABLE "Interest" ADD COLUMN     "codeGroupId" INTEGER;

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "isImportant";

-- AddForeignKey
ALTER TABLE "Interest" ADD CONSTRAINT "Interest_codeGroupId_fkey" FOREIGN KEY ("codeGroupId") REFERENCES "CodeGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
