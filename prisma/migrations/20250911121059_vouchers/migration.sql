-- CreateEnum
CREATE TYPE "VoucherType" AS ENUM ('PERCENTAGE', 'FIXED', 'BUY_X_GET_Y');

-- CreateTable
CREATE TABLE "Voucher" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "VoucherType" NOT NULL,
    "value" DECIMAL(65,30) NOT NULL,
    "minOrderAmount" DECIMAL(65,30),
    "maxDiscount" DECIMAL(65,30),
    "usageLimit" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "description" TEXT,
    "buyQuantity" INTEGER,
    "getQuantity" INTEGER,
    "applicableProducts" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Voucher_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_code_key" ON "Voucher"("code");

-- CreateIndex
CREATE INDEX "Voucher_storeId_idx" ON "Voucher"("storeId");

-- CreateIndex
CREATE INDEX "Voucher_code_idx" ON "Voucher"("code");

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
