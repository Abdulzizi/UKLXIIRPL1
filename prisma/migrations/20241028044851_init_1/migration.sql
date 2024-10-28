-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'FINALIZED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "updatedAt" DROP DEFAULT;
