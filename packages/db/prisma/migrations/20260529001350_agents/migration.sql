/*
  Warnings:

  - You are about to drop the column `instructions` on the `Agent` table. All the data in the column will be lost.
  - You are about to drop the column `personality` on the `Agent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Agent" DROP COLUMN "instructions",
DROP COLUMN "personality",
ADD COLUMN     "enabledTools" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "maxTokens" INTEGER NOT NULL DEFAULT 1024,
ADD COLUMN     "systemPrompt" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "anthropicApiKey" TEXT;
