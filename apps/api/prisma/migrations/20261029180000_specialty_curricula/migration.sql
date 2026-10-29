ALTER TABLE "Subject" ADD COLUMN "specialtyId" TEXT;
ALTER TABLE "Subject" ADD COLUMN "isElective" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Specialty" ADD COLUMN "reticulaUrl" TEXT;
ALTER TABLE "Specialty" ADD COLUMN "reticulaPdfId" TEXT;
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "Specialty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Specialty" ADD CONSTRAINT "Specialty_reticulaPdfId_fkey" FOREIGN KEY ("reticulaPdfId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "Subject_specialtyId_idx" ON "Subject"("specialtyId");
