-- Supabase expone automáticamente cualquier tabla del esquema "public" vía
-- su API REST (PostgREST), protegida solo por la API key "anon" (pensada
-- para ser pública en apps cliente). Esta app nunca usa esa API — solo
-- Prisma, conectado como el rol "postgres" (superusuario, siempre se salta
-- RLS) — así que activar RLS sin políticas cierra ese acceso público sin
-- afectar en nada a apps/api.

ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RefreshToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SiteConfig" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MediaAsset" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "HeroSlide" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TimelineEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Program" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subject" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SubjectPrerequisite" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Teacher" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TeacherSubject" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Lab" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LabImage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Specialty" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Document" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "News" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CommunitySection" ENABLE ROW LEVEL SECURITY;
