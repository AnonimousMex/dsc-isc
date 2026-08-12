# DSC ISC — Sitio y Sistema del Departamento de Sistemas y Computación

Rediseño propio (no oficial) del sitio público y del sistema interno (CMS)
del Departamento de Sistemas y Computación, inspirado en el lenguaje visual
del sitio real y en patrones de interacción de Harvard, Gucci y Louis
Vuitton. Ver el documento de producto para el detalle completo de visión,
diseño, modelo de datos y seguridad.

> Estado: **las 13 fases del plan de construcción están completas.** El
> sitio público, el sistema/CMS, la base de datos, la autenticación, la
> pasada de seguridad, las pruebas automatizadas (unit + e2e) y el pulido
> de accesibilidad/rendimiento ya están hechos y verificados —no solo
> "escritos"— contra el proyecto real (build, typecheck, lint, pruebas y
> capturas de pantalla reales en cada fase). El detalle completo de qué se
> construyó y por qué en cada fase está en `DECISIONES.md`.

## Correr el sistema (apps/admin)

```bash
cp apps/admin/.env.example apps/admin/.env
npm run dev:admin   # http://localhost:5174
```

Inicia sesión con el email y la contraseña que imprimió el seed
(`npm run prisma:seed -w apps/api`). Como es `SUPERADMIN`, el primer login
te pedirá configurar 2FA (escanea el enlace `otpauth://` con Google
Authenticator/Authy o similar) y luego cambiar la contraseña generada
automáticamente.

## Estructura del monorepo

```
apps/
  web/      sitio público (React + Vite + TS + Tailwind)
  admin/    sistema/CMS (React + Vite + TS + Tailwind + shadcn/ui)
  api/      backend (Express + TS + Prisma + SQLite)
packages/
  shared/   tipos, esquemas Zod y preset de Tailwind compartidos
tests/
  unit/     pruebas unitarias
  e2e/      pruebas end-to-end (Playwright)
```

## Requisitos

- Node.js 20+
- npm 10+ (el proyecto usa npm workspaces, no requiere pnpm ni yarn)

## Cómo correr el proyecto en desarrollo

```bash
# 1. Instalar dependencias de todo el monorepo (una sola vez, o cuando cambien package.json)
npm install

# 2. Copiar el .env de ejemplo de la API, ajustarlo y generar tus propios secretos
cp apps/api/.env.example apps/api/.env
# edita JWT_SECRET / JWT_REFRESH_SECRET en apps/api/.env — nunca uses los de ejemplo.
# Puedes generar valores aleatorios con:
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# 3. Crear la base de datos SQLite local y aplicar las migraciones
npm run prisma:migrate -w apps/api

# 4. Poblar la base de datos con contenido de relleno (ver DECISIONES.md)
npm run prisma:seed -w apps/api
# Este comando imprime en consola el email y la contraseña generada del
# usuario SUPERADMIN inicial — apúntala, solo se muestra una vez.

# 5. Levantar cada app (en terminales separadas)
npm run dev:api      # http://localhost:4000
npm run dev:web      # http://localhost:5173
npm run dev:admin    # http://localhost:5174 (o el puerto que asigne Vite si 5173 está ocupado)
```

La API por ahora solo expone `GET /api/health` y sirve `/uploads/*` como
estático — el resto de rutas de negocio (Fase 3-4) y las páginas reales de
`web`/`admin` (Fases 6-10) se documentan aquí a medida que se construyen.

## Scripts útiles desde la raíz

```bash
npm run build        # build de producción de todas las apps
npm run lint         # lint de todas las apps/paquetes
npm run test         # pruebas de todas las apps/paquetes
```

## Variables de entorno

Cada app trae su propio `.env.example` documentado (por ahora solo
`apps/api/.env.example` existe; `web`/`admin` no necesitan variables de
entorno hasta que consuman la URL de la API en fases posteriores). Nunca se
commitea un `.env` real.

## Base de datos

- Los datos viven en SQLite, en `apps/api/prisma/dev.db` (se crea al correr
  `npm run prisma:migrate -w apps/api`; no se commitea, ver `.gitignore`).
- El esquema completo está en `apps/api/prisma/schema.prisma`. Nota: el
  conector de SQLite de Prisma no soporta `enum` nativo, así que campos como
  `User.role` o `MediaAsset.kind`/`sourceType` se guardan como `String` y se
  validan contra los union types de `packages/shared` y esquemas Zod antes
  de escribirse (ver comentario al inicio del `schema.prisma` y
  `DECISIONES.md`).
- El seed (`apps/api/prisma/seed.ts`, `npm run prisma:seed -w apps/api`)
  borra y vuelve a poblar todas las tablas con contenido de relleno
  verificado (imágenes de stock estables, retícula de ejemplo con
  prerrequisitos reales, docentes sin foto con fallback de iniciales, un
  usuario `SUPERADMIN` con contraseña aleatoria de un solo uso). El detalle
  de qué es relleno y qué falta reemplazar está en `DECISIONES.md`.

### Migrar de SQLite a Postgres

1. Cambia `provider = "sqlite"` a `provider = "postgresql"` en
   `apps/api/prisma/schema.prisma`, y actualiza `DATABASE_URL` en
   `apps/api/.env` con la cadena de conexión de Postgres.
2. Corre `npx prisma migrate deploy` (o `prisma migrate dev` en desarrollo)
   dentro de `apps/api` contra la base nueva.

Como el esquema ya evita depender de nada exclusivo de SQLite (los campos
tipo enum se guardan como `String` a propósito, ver arriba), no hace falta
rediseñar el modelo — a lo sumo, convertir esos `String` a `enum` nativo de
Postgres es opcional, no obligatorio.

## Almacenamiento de archivos

- Los archivos subidos desde el sistema (`apps/admin`) se guardan en
  `apps/api/storage/uploads/{images,videos,documents}/`, con un nombre
  generado por el servidor (`crypto.randomUUID()` + extensión, nunca el
  nombre que manda el navegador), y se sirven como estáticos en
  `GET /uploads/...` (ver `src/server.ts`). Esta carpeta nunca ejecuta
  nada — solo se sirve como estático.
- Como alternativa a subir un archivo, cualquier campo de imagen/video/
  documento admite pegar un enlace externo (por ejemplo, un video de
  YouTube o una imagen ya alojada en otro servicio) — la API valida que sea
  una URL bien formada y no descarga ni guarda nada.
- Todo el acceso a archivos pasa por la interfaz `StorageAdapter`
  (`apps/api/src/storage/StorageAdapter.ts`). Hay dos implementaciones:
  - `LocalDiskStorageAdapter` — activa por defecto (`STORAGE_DRIVER=local`).
  - `S3StorageAdapter` — ya escrita y funcional, compatible con cualquier
    proveedor que hable el protocolo S3 (AWS S3, Cloudflare R2, Backblaze
    B2), pero **inactiva** hasta que se configure `STORAGE_DRIVER=s3` y las
    variables `S3_*` en `.env`.
  - El resto de la API (rutas/servicios/controladores) solo conoce la
    interfaz `StorageAdapter` — nunca las clases concretas — así que migrar
    de disco local a un bucket de pago es una sola línea de `.env`.

### Migrar de disco local a S3 (o R2/B2)

1. En `apps/api/.env`, define `STORAGE_DRIVER=s3` y completa `S3_ENDPOINT`
   (déjalo vacío si usas AWS S3 real), `S3_REGION`, `S3_BUCKET`,
   `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` y `S3_PUBLIC_BASE_URL`.
2. Reinicia la API. No hace falta tocar código: `src/storage/index.ts` lee
   `STORAGE_DRIVER` en cada arranque y decide qué adaptador instanciar.

## Autenticación

- Sesión basada en JWT de acceso (15 min) + refresh token (7 días), ambos en
  cookies `httpOnly`, `Secure` (en producción) y `SameSite=Strict` — nunca
  en `localStorage`. El refresh token solo se envía en requests a
  `/api/auth/*` (`path` de la cookie restringido).
- Cada refresh rota el token anterior (queda revocado) y emite uno nuevo;
  si se detecta el reuso de un refresh ya rotado, se revocan todas las
  sesiones activas del usuario (posible robo de token).
- Protección CSRF de "doble envío": toda mutación (`POST`/`PUT`/`DELETE`)
  autenticada debe incluir el header `X-CSRF-Token` con el mismo valor de
  la cookie `csrfToken` (no httpOnly) que se recibe al iniciar sesión.
- `POST /api/auth/login` bloquea la cuenta 15 minutos tras 5 intentos
  fallidos consecutivos, además del límite por IP (`express-rate-limit`).
- 2FA (TOTP) es **obligatorio para `SUPERADMIN`**: si el usuario aún no lo
  configuró, `login` no abre sesión — responde con un secreto y una URL
  `otpauth://` para escanear en una app como Google Authenticator/Authy, y
  hay que confirmar un código válido en `POST /api/auth/2fa/confirm` antes
  de recibir cookies de sesión. Para `EDITOR`/`VIEWER` es opcional.
- Endpoints: `POST /api/auth/login`, `POST /api/auth/2fa/confirm`,
  `POST /api/auth/refresh`, `POST /api/auth/logout`, `GET /api/auth/me`,
  `POST /api/auth/change-password`.

## Rutas de la API

Todas bajo `/api`. Las de solo lectura son públicas (algunas, marcadas ⚙️,
muestran más contenido — inactivos/borradores — si la petición trae una
sesión válida); las de escritura requieren sesión + rol `EDITOR` o
`SUPERADMIN` + header `X-CSRF-Token`, salvo donde se indica `SUPERADMIN`.

| Recurso | Rutas |
| --- | --- |
| Auth | ver sección "Autenticación" arriba |
| Medios | `POST /media/upload` (multipart, campo `file`), `POST /media/external`, `DELETE /media/:id` |
| Site config | `GET /site-config`, `PUT /site-config/:key` |
| Hero slides ⚙️ | `GET /hero-slides`, `POST/PUT/DELETE /hero-slides[/:id]` |
| Timeline ⚙️ | `GET /timeline`, `POST/PUT/DELETE /timeline[/:id]` |
| Programas | `GET /programs`, `GET /programs/:slug`, `POST /programs`, `PUT/DELETE /programs/:slug` |
| Materias (retícula) | `GET /subjects?programId=`, `GET /subjects/:id`, `POST/PUT/DELETE /subjects[/:id]` — el `PUT` reemplaza el conjunto de prerrequisitos completo y rechaza con `409` cualquier ciclo (directo o transitivo) |
| Docentes ⚙️ | `GET /teachers`, `GET /teachers/:slug`, `POST/PUT/DELETE /teachers[/:id]` |
| Laboratorios | `GET /labs`, `GET /labs/:slug`, `POST/PUT/DELETE /labs[/:id]` |
| Especialidades | `GET /specialties`, `GET /specialties/:slug`, `POST/PUT/DELETE /specialties[/:id]` |
| Normateca | `GET /documents?category=&q=`, `POST/PUT/DELETE /documents[/:id]` |
| Noticias ⚙️ | `GET /news`, `GET /news/:slug`, `POST/PUT/DELETE /news[/:id]` |
| Comunidad | `GET /community-sections`, `GET /community-sections/:slug`, `POST/PUT/DELETE /community-sections[/:id]` |
| Usuarios (SUPERADMIN) | `GET/POST /users`, `PUT/DELETE /users/:id` (`DELETE` desactiva, no borra la fila) |
| Auditoría (SUPERADMIN) | `GET /audit-logs?take=` |

## Backups

Los dos únicos artefactos con estado real del proyecto son:

- `apps/api/prisma/dev.db` (toda la base de datos)
- `apps/api/storage/uploads/` (todos los archivos subidos desde el sistema)

Un respaldo periódico (`tar`/copia) de ambas rutas es el respaldo completo
del sitio. Ejemplo simple:

```bash
tar -czf "backup-$(date +%Y%m%d).tar.gz" apps/api/prisma/dev.db apps/api/storage/uploads
```

## Despliegue (nota importante, se amplía en la Fase 13)

`apps/api` depende de disco local por defecto (SQLite + `storage/uploads/`),
así que debe desplegarse en un host con disco persistente (VPS, contenedor
con volumen montado, Render/Railway con volumen) — nunca en una plataforma
serverless donde el disco se borra en cada despliegue. `apps/web` y
`apps/admin` son SPAs estáticas y pueden ir en cualquier hosting estático,
apuntando a la URL pública de `apps/api`.

### CSP de `apps/web` y `apps/admin` en producción (pendiente de configurar en el hosting)

Las cabeceras de seguridad de `apps/api` (helmet, sección de Autenticación)
solo cubren las respuestas de la propia API. `apps/web` y `apps/admin` son
SPAs estáticas: en desarrollo (`vite dev`) no llevan Content-Security-Policy
alguna, y en producción esa cabecera se configura en el hosting elegido, no
en el código. **Antes de publicar el sitio de verdad**, configura ahí una
CSP equivalente a la de la API, como mínimo:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com; object-src 'none'; frame-ancestors 'none';
```

(`style-src` necesita `'unsafe-inline'` porque Tailwind/Framer Motion
inyectan estilos en línea; si el hosting lo permite, usar un nonce es
preferible). En Vercel/Netlify esto se define en `vercel.json` o en un
archivo `_headers`; en un VPS con Nginx, en el bloque `server`. Sin esto,
un campo de texto que admita una URL de video (ver sección "Autenticación"
más abajo sobre `youtubeUrl`/`videoUrl`, ya restringidos a dominios de
YouTube en el propio esquema Zod) queda como única línea de defensa contra
un iframe malicioso — la CSP del hosting es la segunda capa.

## Pruebas

```bash
# Unit (validadores Zod + detección de ciclos en prerrequisitos)
npm run test -w packages/shared

# e2e (login completo + CRUD de docente admin ↔ sitio público).
# Levanta api/web/admin y siembra la base de datos automáticamente —
# no requiere que nada esté corriendo de antemano.
npm run test:e2e
```

La suite e2e reutiliza el seed real (`apps/api/prisma/seed.ts`), así que
cada corrida dejará la base de datos con los datos de ejemplo estándar (más
el docente de prueba, creado y borrado dentro de la misma prueba). El
archivo `tests/e2e/.seed-credentials.json` que genera es un fixture
temporal con una contraseña de prueba — está en `.gitignore`, nunca se
commitea.

## Lint

- `apps/web` y `apps/admin` usan `oxlint` (así vino configurado por la
  plantilla de Vite usada).
- `apps/api` y `packages/shared` usan ESLint 9 (flat config) +
  `typescript-eslint` + `eslint-config-prettier`.

Ver `DECISIONES.md` para el detalle de por qué se tomó cada decisión menor de
esta fase.
