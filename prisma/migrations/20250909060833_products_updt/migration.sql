/*
  Warnings:

  - You are about to drop the column `colorDetails` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `sizeDetails` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `totalPrice` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `unitPrice` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `additionalKeywords` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `focusKeyword` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `isDownloadable` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `isVirtual` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `material` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `noIndex` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `originalPrice` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `productType` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `purchaseNote` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `ratingValue` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `reviewCount` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `style` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `WishlistItem` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `price` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CategoryPageStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "ContactFormStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "NewsletterFormStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'UNSUBSCRIBED');

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "WishlistItem" DROP CONSTRAINT "WishlistItem_productId_fkey";

-- DropIndex
DROP INDEX "Product_categoryId_idx";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "categoryContent" JSONB,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "isBest" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "Color" ADD COLUMN     "value2" TEXT;

-- AlterTable
ALTER TABLE "Image" ALTER COLUMN "description" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "cardCountry" TEXT,
ADD COLUMN     "cardNumber" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "customerName" TEXT,
ADD COLUMN     "expirationDate" TEXT,
ADD COLUMN     "securityCode" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "zipCode" TEXT;

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "colorDetails",
DROP COLUMN "sizeDetails",
DROP COLUMN "totalPrice",
DROP COLUMN "unitPrice",
ADD COLUMN     "colorIds" TEXT[],
ADD COLUMN     "customerName" TEXT NOT NULL DEFAULT 'Customer',
ADD COLUMN     "discountAmount" DECIMAL(65,30) DEFAULT 0,
ADD COLUMN     "hasBeenReviewed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "originalPrice" DECIMAL(65,30),
ADD COLUMN     "price" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "productName" TEXT,
ADD COLUMN     "selectedOptions" JSONB,
ADD COLUMN     "sizeIds" TEXT[],
ADD COLUMN     "total" DECIMAL(65,30),
ALTER COLUMN "quantity" SET DEFAULT 1;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "additionalKeywords",
DROP COLUMN "categoryId",
DROP COLUMN "focusKeyword",
DROP COLUMN "isDownloadable",
DROP COLUMN "isVirtual",
DROP COLUMN "material",
DROP COLUMN "noIndex",
DROP COLUMN "originalPrice",
DROP COLUMN "productType",
DROP COLUMN "purchaseNote",
DROP COLUMN "ratingValue",
DROP COLUMN "reviewCount",
DROP COLUMN "style",
ADD COLUMN     "categoryData" JSONB,
ADD COLUMN     "createdByEmail" TEXT,
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "createdByName" TEXT,
ADD COLUMN     "isParentProduct" BOOLEAN DEFAULT false,
ADD COLUMN     "keywords" TEXT[],
ADD COLUMN     "parentProductId" TEXT,
ADD COLUMN     "relatedProducts" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "schema" TEXT,
ADD COLUMN     "updatedByEmail" TEXT,
ADD COLUMN     "updatedById" TEXT,
ADD COLUMN     "updatedByName" TEXT;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "email" TEXT,
ADD COLUMN   "photoUrl" TEXT;

-- DropTable
DROP TABLE "WishlistItem";

-- CreateTable
CREATE TABLE "ExportLog" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "productCount" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "fileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExportLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportLog" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "totalRows" INTEGER NOT NULL,
    "successCount" INTEGER NOT NULL,
    "errorCount" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "errorLogUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecaptchaSettings" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "siteKey" TEXT NOT NULL,
    "secretKey" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "version" TEXT NOT NULL DEFAULT 'v3',
    "threshold" DOUBLE PRECISION DEFAULT 0.5,
    "enabledOnLogin" BOOLEAN NOT NULL DEFAULT true,
    "enabledOnRegister" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecaptchaSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Blog" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "slug" TEXT,
    "title" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Blog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryPage" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "apiSlug" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "bannerImageUrl" TEXT,
    "materials" TEXT[],
    "styles" TEXT[],
    "colors" TEXT[],
    "genders" TEXT[],
    "collars" TEXT[],
    "cuffs" TEXT[],
    "closures" TEXT[],
    "pockets" TEXT[],
    "isBest" BOOLEAN DEFAULT false,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "focusKeyword" TEXT,
    "supportingKeywords" TEXT[],
    "categoryContent" JSONB,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "twitterTitle" TEXT,
    "twitterDescription" TEXT,
    "canonicalUrl" TEXT,
    "indexPage" BOOLEAN NOT NULL DEFAULT true,
    "followLinks" BOOLEAN NOT NULL DEFAULT true,
    "enableSchema" BOOLEAN NOT NULL DEFAULT true,
    "schemaType" TEXT DEFAULT 'CollectionPage',
    "customSchema" TEXT,
    "status" "CategoryPageStatus" NOT NULL DEFAULT 'DRAFT',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoryPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactForm" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "agreeToPrivacyPolicy" BOOLEAN NOT NULL DEFAULT false,
    "status" "ContactFormStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsletterForm" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "NewsletterFormStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsletterForm_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExportLog_storeId_idx" ON "ExportLog"("storeId");

-- CreateIndex
CREATE INDEX "ImportLog_storeId_idx" ON "ImportLog"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "RecaptchaSettings_storeId_key" ON "RecaptchaSettings"("storeId");

-- CreateIndex
CREATE INDEX "RecaptchaSettings_storeId_idx" ON "RecaptchaSettings"("storeId");

-- CreateIndex
CREATE INDEX "Blog_storeId_idx" ON "Blog"("storeId");

-- CreateIndex
CREATE INDEX "CategoryPage_storeId_idx" ON "CategoryPage"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryPage_storeId_slug_key" ON "CategoryPage"("storeId", "slug");

-- CreateIndex
CREATE INDEX "ContactForm_storeId_idx" ON "ContactForm"("storeId");

-- CreateIndex
CREATE INDEX "ContactForm_email_idx" ON "ContactForm"("email");

-- CreateIndex
CREATE INDEX "NewsletterForm_storeId_idx" ON "NewsletterForm"("storeId");

-- CreateIndex
CREATE INDEX "NewsletterForm_email_idx" ON "NewsletterForm"("email");

-- CreateIndex
CREATE INDEX "Review_email_idx" ON "Review"("email");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExportLog" ADD CONSTRAINT "ExportLog_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportLog" ADD CONSTRAINT "ImportLog_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecaptchaSettings" ADD CONSTRAINT "RecaptchaSettings_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blog" ADD CONSTRAINT "Blog_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryPage" ADD CONSTRAINT "CategoryPage_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactForm" ADD CONSTRAINT "ContactForm_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsletterForm" ADD CONSTRAINT "NewsletterForm_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
