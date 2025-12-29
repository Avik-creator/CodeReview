-- AlterTable
ALTER TABLE "user" ADD COLUMN     "badRules" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "goodRules" TEXT[] DEFAULT ARRAY[]::TEXT[];
