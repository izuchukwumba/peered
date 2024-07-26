-- CreateTable
CREATE TABLE "NotificationInteractions" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" TEXT NOT NULL,

    CONSTRAINT "NotificationInteractions_pkey" PRIMARY KEY ("id")
);
