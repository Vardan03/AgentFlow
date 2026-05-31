-- AlterTable
ALTER TABLE "Agent" ADD COLUMN     "provider" TEXT NOT NULL DEFAULT 'anthropic';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deepseekApiKey" TEXT,
ADD COLUMN     "googleApiKey" TEXT,
ADD COLUMN     "openaiApiKey" TEXT;
