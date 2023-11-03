-- CreateEnum
CREATE TYPE "SessionState" AS ENUM ('CREATED', 'JOINED', 'STARTED', 'FINISHED');

-- CreateTable
CREATE TABLE "sync_state" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "sync_state_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "session" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "repeatKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nameA" TEXT NOT NULL,
    "joinedA" BOOLEAN NOT NULL DEFAULT false,
    "nameB" TEXT NOT NULL,
    "joinedB" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT NOT NULL,
    "state" "SessionState" NOT NULL DEFAULT 'CREATED',
    "needAI" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "session_uid_key" ON "session"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "session_repeatKey_key" ON "session"("repeatKey");
