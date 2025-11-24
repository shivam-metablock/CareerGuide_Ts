/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Coaching` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `College` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `PG` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Coaching_name_key" ON "Coaching"("name");

-- CreateIndex
CREATE UNIQUE INDEX "College_name_key" ON "College"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PG_name_key" ON "PG"("name");
