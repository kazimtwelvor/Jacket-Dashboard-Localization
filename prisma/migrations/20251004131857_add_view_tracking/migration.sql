-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "CategoryPage" ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ProductView" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "referrer" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryView" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "referrer" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CategoryView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryPageView" (
    "id" TEXT NOT NULL,
    "categoryPageId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "referrer" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CategoryPageView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductView_productId_idx" ON "ProductView"("productId");

-- CreateIndex
CREATE INDEX "ProductView_storeId_idx" ON "ProductView"("storeId");

-- CreateIndex
CREATE INDEX "ProductView_viewedAt_idx" ON "ProductView"("viewedAt");

-- CreateIndex
CREATE INDEX "CategoryView_categoryId_idx" ON "CategoryView"("categoryId");

-- CreateIndex
CREATE INDEX "CategoryView_storeId_idx" ON "CategoryView"("storeId");

-- CreateIndex
CREATE INDEX "CategoryView_viewedAt_idx" ON "CategoryView"("viewedAt");

-- CreateIndex
CREATE INDEX "CategoryPageView_categoryPageId_idx" ON "CategoryPageView"("categoryPageId");

-- CreateIndex
CREATE INDEX "CategoryPageView_storeId_idx" ON "CategoryPageView"("storeId");

-- CreateIndex
CREATE INDEX "CategoryPageView_viewedAt_idx" ON "CategoryPageView"("viewedAt");

-- AddForeignKey
ALTER TABLE "ProductView" ADD CONSTRAINT "ProductView_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductView" ADD CONSTRAINT "ProductView_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryView" ADD CONSTRAINT "CategoryView_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryView" ADD CONSTRAINT "CategoryView_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryPageView" ADD CONSTRAINT "CategoryPageView_categoryPageId_fkey" FOREIGN KEY ("categoryPageId") REFERENCES "CategoryPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryPageView" ADD CONSTRAINT "CategoryPageView_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
