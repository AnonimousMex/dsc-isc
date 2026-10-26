ALTER TABLE "Subject"
  ADD COLUMN "theoryHours" INTEGER,
  ADD COLUMN "practicalHours" INTEGER,
  ADD COLUMN "academicSourceUrl" TEXT,
  ADD COLUMN "prerequisitesVerified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "syllabusMediaId" TEXT;
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_syllabusMediaId_fkey"
  FOREIGN KEY ("syllabusMediaId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
