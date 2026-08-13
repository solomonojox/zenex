-- AlterEnum
ALTER TYPE "SubscriptionStatus" ADD VALUE 'PENDING';

-- AlterTable
ALTER TABLE "subscription_plans" ADD COLUMN     "extrasDiscountPercent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "includedCleans" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "activatedAt" TIMESTAMP(3),
ADD COLUMN     "cleansRemaining" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "consentAmount" DOUBLE PRECISION,
ADD COLUMN     "consentAt" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
