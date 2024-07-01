-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
