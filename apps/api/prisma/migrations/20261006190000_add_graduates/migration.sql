CREATE TABLE "Graduate" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "graduationYear" INTEGER NOT NULL,
    "headline" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "website" TEXT,
    "linkedin" TEXT,
    "github" TEXT,
    "facebook" TEXT,
    "instagram" TEXT,
    "showEmail" BOOLEAN NOT NULL DEFAULT false,
    "consentAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewNote" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "diploma" BYTEA NOT NULL,
    "diplomaMime" TEXT NOT NULL,
    "photo" BYTEA,
    "photoMime" TEXT,
    "curriculum" BYTEA,
    "hasCurriculum" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Graduate_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Graduate_status_check" CHECK ("status" IN ('PENDING', 'APPROVED', 'REJECTED'))
);
CREATE UNIQUE INDEX "Graduate_email_key" ON "Graduate"("email");
CREATE INDEX "Graduate_status_fullName_idx" ON "Graduate"("status", "fullName");
ALTER TABLE "Graduate" ENABLE ROW LEVEL SECURITY;
