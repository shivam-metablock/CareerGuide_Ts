-- CreateEnum
CREATE TYPE "Stream" AS ENUM ('Science', 'Commerce', 'Arts');

-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('Class10', 'Stream', 'Graduation', 'PostGraduation');

-- CreateTable
CREATE TABLE "Career" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "stream" "Stream",
    "level" "EducationLevel" NOT NULL DEFAULT 'Class10',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Career_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryInsight" (
    "id" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "minSalary" DOUBLE PRECISION NOT NULL,
    "avgSalary" DOUBLE PRECISION NOT NULL,
    "maxSalary" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalaryInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coaching" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coaching_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachingCareer" (
    "id" TEXT NOT NULL,
    "coachingId" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoachingCareer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "College" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "stream" "Stream",
    "courses" TEXT[],
    "fees" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "College_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PG" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT,
    "ownerName" TEXT NOT NULL,
    "ownerPhone" TEXT NOT NULL,
    "ownerEmail" TEXT,
    "monthlyRent" DOUBLE PRECISION NOT NULL,
    "amenities" TEXT[],
    "coachingId" TEXT,
    "collegeId" TEXT,
    "distance" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PG_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetCalculation" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "budgetType" TEXT NOT NULL,
    "totalBudget" DOUBLE PRECISION NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "selectedCareers" TEXT[],
    "selectedCoachingIds" TEXT[],
    "selectedCollegeIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetCalculation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIGuidance" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "interests" TEXT[],
    "strengths" TEXT[],
    "goals" TEXT[],
    "budget" DOUBLE PRECISION,
    "location" TEXT,
    "recommendedStream" "Stream",
    "recommendedCareers" TEXT[],
    "recommendedColleges" TEXT[],
    "recommendedCoaching" TEXT[],
    "recommendedPGs" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIGuidance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Career_stream_level_idx" ON "Career"("stream", "level");

-- CreateIndex
CREATE INDEX "SalaryInsight_careerId_idx" ON "SalaryInsight"("careerId");

-- CreateIndex
CREATE UNIQUE INDEX "SalaryInsight_careerId_year_key" ON "SalaryInsight"("careerId", "year");

-- CreateIndex
CREATE INDEX "Coaching_city_state_idx" ON "Coaching"("city", "state");

-- CreateIndex
CREATE INDEX "CoachingCareer_coachingId_idx" ON "CoachingCareer"("coachingId");

-- CreateIndex
CREATE INDEX "CoachingCareer_careerId_idx" ON "CoachingCareer"("careerId");

-- CreateIndex
CREATE UNIQUE INDEX "CoachingCareer_coachingId_careerId_key" ON "CoachingCareer"("coachingId", "careerId");

-- CreateIndex
CREATE INDEX "College_city_state_stream_idx" ON "College"("city", "state", "stream");

-- CreateIndex
CREATE INDEX "PG_city_state_idx" ON "PG"("city", "state");

-- CreateIndex
CREATE INDEX "PG_coachingId_idx" ON "PG"("coachingId");

-- CreateIndex
CREATE INDEX "PG_collegeId_idx" ON "PG"("collegeId");

-- CreateIndex
CREATE INDEX "BudgetCalculation_userId_idx" ON "BudgetCalculation"("userId");

-- CreateIndex
CREATE INDEX "AIGuidance_userId_idx" ON "AIGuidance"("userId");

-- AddForeignKey
ALTER TABLE "SalaryInsight" ADD CONSTRAINT "SalaryInsight_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "Career"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachingCareer" ADD CONSTRAINT "CoachingCareer_coachingId_fkey" FOREIGN KEY ("coachingId") REFERENCES "Coaching"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachingCareer" ADD CONSTRAINT "CoachingCareer_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "Career"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PG" ADD CONSTRAINT "PG_coachingId_fkey" FOREIGN KEY ("coachingId") REFERENCES "Coaching"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PG" ADD CONSTRAINT "PG_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE SET NULL ON UPDATE CASCADE;
