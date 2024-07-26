/*
  Warnings:

  - You are about to drop the column `category` on the `CodeGroup` table. All the data in the column will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_userId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_senderId_fkey";

-- AlterTable
ALTER TABLE "CodeGroup" DROP COLUMN "category",
ADD COLUMN     "preferred_category" TEXT;

-- DropTable
DROP TABLE "Category";

-- CreateTable
CREATE TABLE "Interest" (
    "id" SERIAL NOT NULL,
    "Interest" TEXT NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "Interest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Interest" ADD CONSTRAINT "Interest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
