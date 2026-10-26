# Registro y verificación de egresados

`/egresados` muestra el directorio de perfiles aprobados y el acceso **Soy un egresado**. El formulario está en `/egresados/registro`; cada perfil publicado tiene su detalle en `/egresados/perfil/:id`.

El registro es una solicitud de publicación, sin crear cuentas del CMS ni dar permisos administrativos. Incluye nombre, correo de contacto, año de titulación, puesto/profesión, ciudad, biografía, experiencia, redes, fotografía opcional, currículum PDF opcional y título obligatorio (PDF/JPG/PNG/WEBP). El correo solo es público si el solicitante lo autoriza. El título nunca es público. El perfil, foto y CV requieren aprobación para ser accesibles desde las rutas públicas.

Los revisores SUPERADMIN y EDITOR usan **Egresados** en el CMS para descargar el título, verificar la titulación de ISC y aprobar o rechazar. Aprobar requiere una confirmación expresa; rechazar requiere un motivo. También pueden devolver un perfil aprobado a revisión para retirarlo de la web. Cada decisión y su auditoría se guardan en una transacción. Los permisos actuales del revisor se comprueban en la base de datos, además del JWT y CSRF.

Los archivos se guardan como `BYTEA` en PostgreSQL y se entregan mediante la API. No pasan por `/uploads` ni por el bucket S3 público. Los listados no cargan los binarios. Esto evita añadir un almacenamiento privado externo a la configuración existente; si aumenta el volumen de registros, conviene mover los binarios a un bucket privado con descargas autorizadas. Los respaldos de PostgreSQL incluyen los documentos.

Límites: título y CV de hasta 15 MB cada uno; foto de hasta 5 MB; cinco intentos de registro por IP por hora. La API comprueba el tipo real del archivo. Un correo solo puede tener una solicitud; para corregir una solicitud existente, el egresado debe contactar al departamento. Esta versión no incluye un portal de inicio de sesión/edición del egresado ni notificaciones por correo.

## Instalación

Desde `dsc-isc`:

```sh
npm run prisma:generate -w apps/api
cd apps/api
npx prisma migrate deploy
```

La migración `20261006190000_add_graduates` crea únicamente la tabla e índices de egresados y habilita RLS, siguiendo la configuración Supabase existente. No ejecutar el seed para instalar este módulo: borra los datos actuales.

## Verificación

```sh
npm run test -w packages/shared
npm run test -w apps/api
npm run test:graduates:ui
npm run build
```

Las pruebas de este módulo comprueban validación, privacidad, acceso a documentos, moderación y envío multipart. Usan una base simulada; no escriben en Supabase ni ejecutan el seed E2E.
