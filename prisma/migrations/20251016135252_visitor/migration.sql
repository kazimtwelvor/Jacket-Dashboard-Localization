-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "anonymousId" TEXT,
ADD COLUMN     "firstCampaign" TEXT,
ADD COLUMN     "firstClickId" TEXT,
ADD COLUMN     "firstContent" TEXT,
ADD COLUMN     "firstMedium" TEXT,
ADD COLUMN     "firstReferrer" TEXT,
ADD COLUMN     "firstSource" TEXT,
ADD COLUMN     "firstTerm" TEXT,
ADD COLUMN     "firstTouchAt" TIMESTAMP(3),
ADD COLUMN     "firstVisitId" TEXT,
ADD COLUMN     "lastCampaign" TEXT,
ADD COLUMN     "lastClickId" TEXT,
ADD COLUMN     "lastContent" TEXT,
ADD COLUMN     "lastMedium" TEXT,
ADD COLUMN     "lastReferrer" TEXT,
ADD COLUMN     "lastSource" TEXT,
ADD COLUMN     "lastTerm" TEXT,
ADD COLUMN     "lastTouchAt" TIMESTAMP(3),
ADD COLUMN     "lastVisitId" TEXT,
ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isSale" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Visit" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "anonymousId" TEXT NOT NULL,
    "userId" TEXT,
    "path" TEXT NOT NULL,
    "referrer" TEXT,
    "source" TEXT,
    "medium" TEXT,
    "campaign" TEXT,
    "term" TEXT,
    "content" TEXT,
    "clickId" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "visitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Visit_storeId_anonymousId_visitedAt_idx" ON "Visit"("storeId", "anonymousId", "visitedAt");

-- CreateIndex
CREATE INDEX "Visit_storeId_userId_visitedAt_idx" ON "Visit"("storeId", "userId", "visitedAt");

-- CreateIndex
CREATE INDEX "Order_anonymousId_idx" ON "Order"("anonymousId");

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
