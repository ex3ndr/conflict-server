/*
  Warnings:

  - You are about to drop the column `mid` on the `session` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "session" DROP COLUMN "mid",
ADD COLUMN     "inboxA" INTEGER,
ADD COLUMN     "inboxB" INTEGER;

-- CreateTable
CREATE TABLE "inbox" (
    "id" SERIAL NOT NULL,
    "mid" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "inbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message" (
    "mid" INTEGER NOT NULL,
    "inbox" INTEGER NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "body" JSONB NOT NULL,

    CONSTRAINT "message_pkey" PRIMARY KEY ("inbox","mid")
);

-- CreateTable
CREATE TABLE "updates" (
    "inbox" INTEGER NOT NULL,
    "uid" INTEGER NOT NULL,
    "body" JSONB NOT NULL,
    "repeatKey" TEXT NOT NULL,

    CONSTRAINT "updates_pkey" PRIMARY KEY ("inbox","uid")
);

-- CreateIndex
CREATE UNIQUE INDEX "updates_inbox_repeatKey_key" ON "updates"("inbox", "repeatKey");
