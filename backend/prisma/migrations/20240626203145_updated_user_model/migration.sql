/*
  Warnings:

  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - Added the required column `imageUrl` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `fullName` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "password",
ADD COLUMN     "imageUrl" TEXT NOT NULL,
ALTER COLUMN "fullName" SET NOT NULL;
