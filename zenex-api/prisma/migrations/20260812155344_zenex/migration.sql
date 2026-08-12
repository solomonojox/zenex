-- CreateTable
CREATE TABLE "pricing_rules" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "perBedroom" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "perBathroom" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "baseMinutes" INTEGER NOT NULL DEFAULT 120,
    "minsPerBedroom" INTEGER NOT NULL DEFAULT 30,
    "minsPerBathroom" INTEGER NOT NULL DEFAULT 30,
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pricing_rules_tenantId_idx" ON "pricing_rules"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_rules_tenantId_key_key" ON "pricing_rules"("tenantId", "key");

-- AddForeignKey
ALTER TABLE "pricing_rules" ADD CONSTRAINT "pricing_rules_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
