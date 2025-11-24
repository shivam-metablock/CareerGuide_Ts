-- AlterTable
ALTER TABLE "Coaching" ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "College" ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "PG" ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false;
