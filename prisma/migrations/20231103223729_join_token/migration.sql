/*
  Warnings:

  - You are about to drop the column `joinedA` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `joinedB` on the `session` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "session" DROP COLUMN "joinedA",
DROP COLUMN "joinedB",
ADD COLUMN     "joinTokenA" TEXT,
ADD COLUMN     "joinTokenB" TEXT;
