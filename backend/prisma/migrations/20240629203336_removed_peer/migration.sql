/*
  Warnings:

  - You are about to drop the `Peer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Peer" DROP CONSTRAINT "Peer_peerId_fkey";

-- DropForeignKey
ALTER TABLE "Peer" DROP CONSTRAINT "Peer_userId_fkey";

-- AlterTable
ALTER TABLE "GroupMember" ADD COLUMN     "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "Peer";

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
