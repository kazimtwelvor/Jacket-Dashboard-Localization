-- AlterTable
ALTER TABLE "ContactForm" ADD COLUMN     "countryId" TEXT;

-- AlterTable
ALTER TABLE "Country" ADD COLUMN     "languages" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "NewsletterForm" ADD COLUMN     "countryId" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "countryId" TEXT;

-- CreateTable
CREATE TABLE "ProductCountry" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductCountry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryPageCountry" (
    "id" TEXT NOT NULL,
    "categoryPageId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CategoryPageCountry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoucherCountry" (
    "id" TEXT NOT NULL,
    "voucherId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoucherCountry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogCountry" (
    "id" TEXT NOT NULL,
    "blogId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogCountry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductCountry_productId_idx" ON "ProductCountry"("productId");

-- CreateIndex
CREATE INDEX "ProductCountry_countryId_idx" ON "ProductCountry"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCountry_productId_countryId_key" ON "ProductCountry"("productId", "countryId");

-- CreateIndex
CREATE INDEX "CategoryPageCountry_categoryPageId_idx" ON "CategoryPageCountry"("categoryPageId");

-- CreateIndex
CREATE INDEX "CategoryPageCountry_countryId_idx" ON "CategoryPageCountry"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryPageCountry_categoryPageId_countryId_key" ON "CategoryPageCountry"("categoryPageId", "countryId");

-- CreateIndex
CREATE INDEX "VoucherCountry_voucherId_idx" ON "VoucherCountry"("voucherId");

-- CreateIndex
CREATE INDEX "VoucherCountry_countryId_idx" ON "VoucherCountry"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "VoucherCountry_voucherId_countryId_key" ON "VoucherCountry"("voucherId", "countryId");

-- CreateIndex
CREATE INDEX "BlogCountry_blogId_idx" ON "BlogCountry"("blogId");

-- CreateIndex
CREATE INDEX "BlogCountry_countryId_idx" ON "BlogCountry"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "BlogCountry_blogId_countryId_key" ON "BlogCountry"("blogId", "countryId");

-- CreateIndex
CREATE INDEX "ContactForm_countryId_idx" ON "ContactForm"("countryId");

-- CreateIndex
CREATE INDEX "NewsletterForm_countryId_idx" ON "NewsletterForm"("countryId");

-- CreateIndex
CREATE INDEX "Order_countryId_idx" ON "Order"("countryId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactForm" ADD CONSTRAINT "ContactForm_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsletterForm" ADD CONSTRAINT "NewsletterForm_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCountry" ADD CONSTRAINT "ProductCountry_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCountry" ADD CONSTRAINT "ProductCountry_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryPageCountry" ADD CONSTRAINT "CategoryPageCountry_categoryPageId_fkey" FOREIGN KEY ("categoryPageId") REFERENCES "CategoryPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryPageCountry" ADD CONSTRAINT "CategoryPageCountry_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherCountry" ADD CONSTRAINT "VoucherCountry_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherCountry" ADD CONSTRAINT "VoucherCountry_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogCountry" ADD CONSTRAINT "BlogCountry_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogCountry" ADD CONSTRAINT "BlogCountry_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;
