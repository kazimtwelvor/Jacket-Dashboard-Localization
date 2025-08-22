/*
  Warnings:

  - You are about to drop the column `colorIds` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `customerName` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `discountAmount` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `hasBeenReviewed` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `originalPrice` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `productName` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `selectedOptions` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `sizeIds` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `colorIds` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `sizeIds` on the `Product` table. All the data in the column will be lost.
  - Added the required column `totalPrice` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitPrice` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "colorIds",
DROP COLUMN "customerName",
DROP COLUMN "discountAmount",
DROP COLUMN "hasBeenReviewed",
DROP COLUMN "originalPrice",
DROP COLUMN "price",
DROP COLUMN "productName",
DROP COLUMN "selectedOptions",
DROP COLUMN "sizeIds",
DROP COLUMN "total",
ADD COLUMN     "colorDetails" JSONB,
ADD COLUMN     "sizeDetails" JSONB,
ADD COLUMN     "totalPrice" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "unitPrice" DECIMAL(65,30) NOT NULL,
ALTER COLUMN "quantity" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "colorIds",
DROP COLUMN "sizeIds",
ADD COLUMN     "colorDetails" JSONB,
ADD COLUMN     "sizeDetails" JSONB;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
