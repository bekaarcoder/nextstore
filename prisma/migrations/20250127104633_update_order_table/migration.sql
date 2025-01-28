-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "isDelivered" DROP NOT NULL,
ALTER COLUMN "deliveredAt" DROP NOT NULL;
