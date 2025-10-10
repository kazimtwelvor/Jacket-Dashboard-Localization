-- Add isSale field to Product table
ALTER TABLE "Product" ADD COLUMN "isSale" BOOLEAN NOT NULL DEFAULT false;