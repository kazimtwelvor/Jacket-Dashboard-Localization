/*
  Warnings:

  - You are about to drop the column `cardCountry` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `cardNumber` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `expirationDate` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `fulfillmentStatus` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `securityCode` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `tax` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `trackingNumber` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `transactionId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Order` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";

-- DropIndex
DROP INDEX "Order_transactionId_idx";

-- DropIndex
DROP INDEX "Order_userId_idx";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "cardCountry",
DROP COLUMN "cardNumber",
DROP COLUMN "expirationDate",
DROP COLUMN "fulfillmentStatus",
DROP COLUMN "securityCode",
DROP COLUMN "tax",
DROP COLUMN "trackingNumber",
DROP COLUMN "transactionId",
DROP COLUMN "userId";
