-- Recuperación de contraseña por correo: hash del código pendiente y su
-- expiración. Se escribe a mano (en vez de `prisma migrate dev`) porque el
-- shadow database que ese comando necesita para generar el diff no se puede
-- crear contra el connection pooler de Supabase en este entorno (P1014) —
-- mismo tipo de limitación de red/privilegios ya documentada para las
-- conexiones directas. `prisma migrate deploy` no necesita shadow database,
-- así que sigue funcionando igual para aplicar esta migración.

ALTER TABLE "User" ADD COLUMN "passwordResetCodeHash" TEXT;
ALTER TABLE "User" ADD COLUMN "passwordResetExpiresAt" TIMESTAMP(3);
