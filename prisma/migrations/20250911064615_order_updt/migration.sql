/*
  Warnings:

  - You are about to drop the column `actualDelivery` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `cardCountry` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `cardNumber` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedDelivery` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `expirationDate` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `fulfillmentStatus` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `securityCode` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `tax` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `trackingNumber` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "actualDelivery",
DROP COLUMN "cardCountry",
DROP COLUMN "cardNumber",
DROP COLUMN "estimatedDelivery",
DROP COLUMN "expirationDate",
DROP COLUMN "fulfillmentStatus",
DROP COLUMN "securityCode",
DROP COLUMN "tax",
DROP COLUMN "trackingNumber";
