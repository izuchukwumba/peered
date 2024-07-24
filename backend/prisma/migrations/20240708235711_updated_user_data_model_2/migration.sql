/*
  Warnings:

  - You are about to drop the `Sector` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Sector" DROP CONSTRAINT "Sector_userId_fkey";

-- DropTable
DROP TABLE "Sector";

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "skill" TEXT NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
