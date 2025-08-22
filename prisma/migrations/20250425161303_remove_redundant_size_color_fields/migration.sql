/*
  Warnings:

  - You are about to drop the column `colorDetails` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `sizeDetails` on the `Product` table. All the data in the column will be lost.
  - The `sizeIds` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `colorIds` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "colorDetails",
DROP COLUMN "sizeDetails",
DROP COLUMN "sizeIds",
ADD COLUMN     "sizeIds" JSONB,
DROP COLUMN "colorIds",
ADD COLUMN     "colorIds" JSONB;
