/*
  Warnings:

  - You are about to drop the column `sector` on the `CodeGroup` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CodeGroup" DROP COLUMN "sector",
ADD COLUMN     "category" TEXT;
