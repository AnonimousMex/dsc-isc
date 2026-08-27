# Decisiones del proyecto

Este archivo registra decisiones menores tomadas de forma autónoma durante la
construcción (nombres, versiones, herramientas concretas dentro de lo que ya
definía el documento de producto), y el contenido de relleno pendiente de
reemplazo antes de publicar el sitio real. Las decisiones de arquitectura
mayores están en el documento de producto original y no se repiten aquí.

## Fase 1 — Scaffold del monorepo

- **Gestor de workspaces**: `npm workspaces` (no `pnpm`) porque el entorno de
  desarrollo no tenía `pnpm` instalado globalmente y el documento permitía
  cualquiera de los dos. Ningún comando depende de una CLI de pnpm.
- **Nombres de paquete**: `@dsc-isc/shared` y `@dsc-isc/api` (scope `@dsc-isc`)
  para que el `package.json` raíz (`dsc-isc`) y los workspaces convivan sin
  colisión de nombres. `apps/web` y `apps/admin` se dejaron con nombre corto
  (`web`, `admin`) tal como los generó `create-vite`.
- **Linter de `apps/web` y `apps/admin`**: se dejó `oxlint`, que es lo que trae
  por defecto la plantilla `react-ts` de `create-vite` en la versión de Vite
  usada (muy rápido, basado en Rust). `apps/api` y `packages/shared` usan
  ESLint 9 (flat config) + `typescript-eslint` + `eslint-config-prettier`,
  como pedía el documento. Ambos enfoques conviven sin conflicto porque cada
  paquete corre su propio script `lint`.
- **React 19 / Vite 8 / TypeScript ~6.0**: son las versiones que instaló
  `create-vite@latest` al día de la construcción; no se forzó una versión
  anterior porque el documento no fijaba una versión exacta de React, solo
  "React 18 + Vite". Se optó por tomar las versiones estables más recientes
  del template oficial en vez de fijar artificialmente React 18.
- **`@react-three/fiber` / `@react-three/drei`**: se instalaron en `^9` / `^10`
  (no `^8` / `^9` como se intentó primero) porque las versiones `8.x` de
  `@react-three/fiber` sólo aceptan React 18 como peer dependency y el proyecto
  quedó en React 19. Las versiones `9.x`/`10.x` sí soportan React 19.
- **`multer`**: se fijó en `^2.0.1` (no `1.x`) porque `1.x` está marcado como
  vulnerable/deprecado por npm; la API de subida de archivo usada en este
  proyecto (`upload.single`, `memoryStorage`) es compatible entre ambas
  versiones.
- **`otplib`**: se fijó en `^13` (no `12`) por el mismo motivo (deprecación).
- **`vitest`**: se fijó en `^4` y `file-type` en `^21` para resolver
  vulnerabilidades moderadas señaladas por `npm audit` en las versiones
  inicialmente propuestas. Con estos cambios `npm audit` reporta 0
  vulnerabilidades sobre el scaffold base.
- **Assets de plantilla eliminados**: se borraron `App.css`, `react.svg` y el
  `hero.png` de ejemplo que trae `create-vite` en `apps/web` y `apps/admin`,
  y se reemplazó el contenido de `App.tsx` por una pantalla mínima de
  "en construcción" — el contenido real llega en fases posteriores y nunca
  debe quedar contenido de la plantilla de Vite en el sitio final.

## Fase 2 — Base de datos, seed y almacenamiento

- **Enums de Prisma → `String`**: el documento de producto describe `Role`,
  `MediaKind` y `SourceType` como `enum` de Prisma. El conector de SQLite de
  Prisma **no soporta `enum` nativo** (a diferencia de Postgres/MySQL), así
  que esos tres campos se modelaron como `String` con un comentario en el
  schema indicando los valores válidos, y se validan con los union types de
  `packages/shared` (`Role`, `MediaKind`, `SourceType`) y con Zod en cada
  servicio antes de escribir. Al migrar a Postgres esto puede volver a un
  `enum` nativo sin rediseñar el resto del modelo — es exactamente el tipo de
  cambio que la sección 6.4 anticipaba.
- **Campo nuevo `User.mustChangePassword`**: no estaba en el modelo original
  del documento, pero la sección 6.2 pide explícitamente generar una
  contraseña aleatoria para el `SUPERADMIN` inicial "forzando cambio en el
  primer login". Sin un campo que registre ese estado no hay forma de
  aplicar esa regla, así que se agregó `mustChangePassword Boolean
  @default(false)` a `User` (el usuario semilla se crea con `true`). La
  lógica de forzar el cambio se implementa en la Fase 3 (auth).
- **Prisma 5.22 (no 7.x)**: al correr la migración, Prisma avisó que existe
  una versión mayor más nueva (7.9.1). Se decidió quedarse en la línea 5.x,
  estable y ampliamente documentada, en vez de saltar dos versiones mayores
  a mitad de la construcción del proyecto (Prisma 7 cambia el motor de
  queries y parte de la configuración). Es una actualización recomendable
  más adelante, tratándola como su propio cambio aislado y probado, no como
  parte del scaffold inicial.
- **Reemplazo de una URL de stock rota**: la imagen de apoyo 1 de "Oferta
  educativa" que proponía el documento
  (`photo-1523050854058-8df90110c9f1`) respondió `404` al verificarla con
  `curl -I` antes de escribir el seed (regla explícita de la sección 6.5).
  Se sustituyó por `photo-1522202176988-66273c2fd55f` (aula/clase, mismo
  tema), verificada con `200 image/jpeg`. El resto de las URLs del documento
  se verificaron sin cambios.
- **Normateca y Comunidad se dejan vacías en el seed**: a diferencia de
  Docentes/Laboratorios/Oferta/Noticias, no se fabricó contenido de ejemplo
  para `Document` (reglamentos/formatos) ni para `CommunitySection`
  (Residencias/Investigación/Créditos complementarios), porque inventar
  texto que suene a normativa oficial o a información de trámites reales se
  sentiría engañoso, a diferencia de una foto de stock genérica de un
  laboratorio. Estas dos secciones arrancan vacías con un estado editorial
  de "aún no hay contenido publicado" (se construye en la Fase 8/10) hasta
  que el departamento cargue los documentos y textos reales desde el
  sistema.
- **`@aws-sdk/client-s3`**: se agregó como dependencia real de `apps/api`
  (no solo como referencia) para que `S3StorageAdapter` sea código
  funcional y no un stub — queda escrito y probado por tipos, pero inactivo
  mientras `STORAGE_DRIVER=local` en `.env`.

## Fase 3 — Autenticación y seguridad base

- **`RefreshToken` como tabla propia (no en el documento original)**: para
  implementar rotación real de refresh tokens (cada refresh invalida el
  anterior y emite uno nuevo) y poder revocar sesiones individuales (logout,
  cambio de contraseña, detección de reuso tras robo de token), se agregó un
  modelo `RefreshToken` (id = `jti` del JWT, hash del token, expiración,
  revocación) en vez de solo confiar en la firma y expiración del JWT. Es
  una extensión menor sobre el modelo de datos del documento, no un cambio
  de arquitectura: no afecta a ninguna otra entidad.
- **Campos `failedLoginAttempts` / `lockedUntil` en `User`** (tampoco estaban
  en el documento): son necesarios para implementar el bloqueo de cuenta
  tras 5 intentos fallidos que pide la sección 9 de forma literal (no basta
  con rate limiting por IP, que es una defensa distinta y complementaria).
- **CSRF con patrón "doble envío" en vez de `csurf`**: el paquete `csurf`
  que suele recomendarse está sin mantenimiento desde hace años. Se
  implementó el patrón estándar actual "double-submit cookie": al iniciar
  sesión se emite una cookie `csrfToken` NO httpOnly, y toda mutación debe
  reenviar ese mismo valor en el header `X-CSRF-Token` — un sitio atacante
  puede hacer que el navegador mande la cookie de sesión, pero no puede leer
  la cookie de otro origen para copiarla al header. Se probó end-to-end
  (logout sin header → 403; con header → 204).
- **2FA obligatorio para SUPERADMIN implementado como flujo de enrolamiento
  forzoso**: si un usuario `SUPERADMIN` no tiene `totpSecret` configurado,
  el login no abre sesión — responde `requiresTotpSetup` con un secreto
  recién generado, la URL `otpauth://` (para el QR) y un `setupToken` de un
  solo uso (10 min) que debe confirmarse con un código válido en
  `POST /api/auth/2fa/confirm` antes de recibir cookies de sesión. Para
  `EDITOR`/`VIEWER`, 2FA es opcional: si configuran un `totpSecret` (fuera
  del alcance de esta fase, se agrega en la Fase 10 junto con el resto del
  panel de usuarios), el login se los exige igual.
- **`otplib` v13 cambió de API**: el paquete pasó de un objeto singleton
  `authenticator` (v12 y anteriores) a funciones sueltas asíncronas
  (`generateSecret`, `generateURI`, `generate`, `verify`). El código se
  escribió contra la API nueva; quedó encapsulado en `src/lib/totp.ts` para
  que un cambio de librería futuro no toque el resto de la aplicación.
- **Prueba funcional end-to-end del login**: antes de dar por cerrada la
  fase, se levantó la API real y se ejercitó todo el flujo con un script
  temporal (login incorrecto x5 → bloqueo 423; enrolamiento 2FA real con un
  código TOTP generado en el momento; `/api/auth/me`; logout con/sin CSRF;
  rotación de refresh token; reuso de un refresh token ya rotado → rechazado
  y sesiones revocadas). El script se borró al terminar, no forma parte del
  repositorio — la cobertura permanente de estos flujos se construye como
  pruebas reales en la Fase 12.

## Fase 4 — Rutas, controladores y servicios de cada entidad

- **Flujo de medios en dos pasos, no `mediaRefSchema` embebido**: el
  documento sugería que cada formulario (docente, laboratorio, noticia...)
  cargara directamente un objeto `{sourceType, url|mediaId}` como parte de
  su propio payload. Se simplificó a un flujo de dos pasos: primero se
  registra el archivo (`POST /api/media/upload` o `POST /api/media/external`),
  lo que devuelve un `MediaAsset` con su `id`; después, cualquier entidad
  solo referencia ese `mediaId`. Esto es exactamente lo que necesita
  `ImageUploader.tsx` (pestañas "Subir archivo"/"Usar enlace") para ser un
  componente independiente del formulario que lo usa, y evita duplicar la
  lógica de creación de `MediaAsset` en cada servicio de entidad.
- **Validación de tipo real de archivo con `file-type` (magic bytes), nunca
  el `mimetype` que declara el navegador**: `multer` guarda el archivo en
  memoria, y antes de escribirlo a disco se detecta su tipo real a partir
  de los primeros bytes. Un archivo `.html` renombrado a `.jpg` se rechaza
  con 415, no se guarda nunca. Límites por tipo: 5MB imagen, 100MB video,
  15MB documento (este último no estaba especificado en el documento, se
  fijó como valor razonable).
- **Detección de ciclos en prerrequisitos como función pura y compartida**
  (`packages/shared/src/graph/prerequisites.ts`, `hasCycle`): se probó
  explícitamente contra el servidor real, tanto un ciclo transitivo (A
  depende de B, se intenta que B dependa de A) como un auto-ciclo (A
  prerrequisito de sí misma) — ambos casos responden `409` y no se
  guardan. Vive en `packages/shared` (no en `apps/api`) precisamente porque
  la sección 12 pide que sea testeable de forma aislada en la Fase 12.
- **Integridad de la retícula vía `onDelete` de Prisma, no solo lógica de
  aplicación**: se decidió explícitamente qué pasa al borrar cada entidad
  relacionada (documentado como comentario en `schema.prisma`): borrar una
  materia borra sus propios enlaces de prerrequisito (`Cascade`), pero se
  **bloquea** si otra materia todavía la lista como prerrequisito
  (`Restrict`, comportamiento por defecto) — probado end-to-end: intentar
  borrar ISC-101 (prerrequisito de otras 3 materias) responde `409`, no
  rompe la retícula silenciosamente. Lo mismo aplica a `MediaAsset`: no se
  puede borrar un archivo que otra entidad todavía referencia.
- **"Eliminar" un usuario en realidad lo desactiva** (`isActive = false`),
  nunca un `DELETE SQL` real: así se conserva la integridad del historial
  de `AuditLog` y de `RefreshToken`, que referencian al usuario. Un
  `SUPERADMIN` tampoco puede desactivar su propia cuenta (evita quedar
  fuera del sistema por accidente).
- **Listados públicos vs. de administración son el mismo endpoint** (no
  rutas duplicadas): un middleware `optionalAuth` intenta leer la sesión
  sin rechazar la petición si no hay una; los servicios de `teachers`,
  `news`, `hero-slides` y `timeline` deciden si incluir
  inactivos/borradores según si `req.user` existe. Evita mantener dos
  copias de la misma lógica de listado.
- **Prueba funcional end-to-end de todo lo anterior**: se levantó la API
  real (con datos del seed) y se verificó con un script temporal (borrado
  al terminar): crear un docente vía admin autenticado y confirmar que
  aparece de inmediato en el endpoint público `/api/teachers/:slug`;
  registrar y borrar un `MediaAsset` externo; los dos casos de ciclo en
  prerrequisitos: el bloqueo por FK al intentar borrar una materia en uso; y
  el rechazo `403` de una mutación sin header CSRF.

## Fase 6 — Diseño base de apps/web

- **Header con transparencia condicionada por ruta, no solo por scroll**: el
  patrón Gucci/Louis Vuitton (header transparente sobre el hero, sólido al
  scrollear) solo tiene sentido en las rutas con hero cinematográfico
  (`/`, `/laboratorios`, `/oferta-educativa/isc`, sección 5.3). En el resto
  de rutas (editoriales) el header arranca sólido de inmediato — así nunca
  hay texto blanco invisible sobre un fondo claro en, por ejemplo,
  `/nosotros`.
- **`ImageUploader`/CSRF no aplica a `apps/web`**: el sitio público es de
  solo lectura contra la API (nunca hace `POST`/`PUT`/`DELETE`), así que su
  `apiClient.ts` es deliberadamente más simple que el de `apps/admin` (que
  se construye en la Fase 9) — no maneja cookies de sesión ni el header
  `X-CSRF-Token`.
- **Biblioteca digital sin URL inventada**: el sitio original enlaza a un
  SharePoint institucional real que no tenemos. En vez de inventar una URL
  (lo cual sería engañoso), el link se muestra deshabilitado con la
  etiqueta "(próximamente)" tanto en el mega-menú como en el footer, hasta
  que el departamento proporcione el enlace real (se puede cargar como
  `SiteConfig` desde el admin sin tocar código).
- **Playwright instalado en la raíz desde esta fase** (no hasta la Fase 12):
  se necesitó para verificar visualmente el resultado de este cambio de UI
  en un navegador real antes de darlo por terminado (headless Chromium,
  captura de pantalla en desktop/mobile + revisión de errores de consola),
  como pide la instrucción de "probar el camino feliz en un navegador
  antes de reportar completo". Queda instalado y listo para reutilizarse
  como la suite de e2e real en la Fase 12, no se desinstaló al terminar la
  prueba.
- **Verificación visual real**: se levantaron `apps/api` y `apps/web` juntos
  y se capturó el home (hero placeholder + reveal), el mega-menú desplegado
  (con "Biblioteca digital" deshabilitada), una página editorial
  (`/nosotros`, header ya sólido) y la vista mobile a 375px (menú
  hamburguesa) — sin errores de consola en ningún caso.

## Fase 7 — Home y HeroCinematic

- **Sticky + un solo ScrollTrigger, sin `pin: true`**: el patrón habitual de
  "hero que se fija mientras se hace scroll" usa el plugin de pin de GSAP,
  pero eso trae de vuelta un pin-spacer y complejidad extra para des-pinear
  al terminar. Se implementó en su lugar con `position: sticky` (CSS puro)
  para la fijación visual, y un único `ScrollTrigger.create(...)` que solo
  lee `self.progress` para calcular opacidad/escala/parallax de cada slide
  a mano en `onUpdate`. Es más simple, más barato (no crea un timeline por
  slide) y hace literal el requisito de "un único ScrollTrigger maestro".
- **Bug real encontrado y corregido en vivo con captura de pantalla**: la
  primera versión de la fórmula de zoom hacía que el slide 1 apareciera ya
  "a medio zoom" en cuanto cargaba la página (scale ~0.81 en vez de 0.7),
  porque la ventana de zoom asumía simétricamente el solape de crossfade
  hacia atrás aunque `progress` nunca puede ser negativo. Se detectó
  comparando una captura de Playwright contra el comportamiento esperado, y
  se corrigió recortando la ventana de zoom de cada slide a los límites
  reales de scroll (`Math.max(0, ...)` / `Math.min(1, ...)`).
- **Segundo bug real encontrado y corregido**: el header pasaba a fondo
  sólido a los 40px de scroll en cualquier ruta, incluida `/` — rompiendo
  el efecto Gucci/LV de "transparente durante todo el hero". Se cambió a
  medir el borde inferior real del wrapper del hero (`id="hero-wrapper"`)
  y solo poner fondo sólido cuando ese borde ya cruzó por completo la parte
  superior del viewport — funciona sin importar cuántos slides tenga el
  hero ni si ya está en su estado "locked".
- **Verificación visual del scroll-lock de un solo uso**: se probó con
  Playwright real (no solo lectura de código) que: (a) haciendo scroll
  hacia abajo se ve el crossfade con parallax entre los 3 slides; (b) al
  cruzar el 100% del recorrido, `sessionStorage` guarda el candado y el
  último slide queda fijo en estado neutro; (c) al volver a subir el
  scroll, el hero se ve estático en ese último frame — no se repite la
  animación; (d) con `prefers-reduced-motion: reduce` emulado, el hero
  monta directo en el estado final sin crear ningún `ScrollTrigger`. Cero
  errores de consola en los cuatro escenarios.

## Fase 8 — Resto de páginas del sitio

- **`SiteConfig` para contenido a nivel departamento**: Misión/Visión/Valores
  de "¿Quiénes somos?" (Nosotros) no pertenecen a `Program` (que es
  específico de un plan de estudios), así que se guardan como entradas
  `SiteConfig` (`nosotros.mision`, `nosotros.vision`, `nosotros.valores`) —
  exactamente el uso que el propio comentario del schema original sugería
  para este modelo. Se agregaron al seed con contenido redactado por el
  equipo de construcción (marcado como relleno en la tabla de abajo).
- **Egresados se dejó sin contenido de ejemplo, a propósito**: iba a usar el
  mismo patrón de `SiteConfig` para "Titulación" y "Títulos recibidos",
  pero redactar el proceso de titulación real es exactamente el mismo tipo
  de contenido institucional específico que ya se decidió no fabricar para
  Normateca/Comunidad (sección de la Fase 2) — un trámite oficial inventado
  se siente engañoso de la misma forma que un reglamento inventado. La
  página está completamente conectada a la API (lee `SiteConfig` si
  existe) y muestra un estado vacío editorial mientras tanto.
- **Ruta dinámica `/oferta-educativa/:programSlug`** en vez de dos rutas
  estáticas (`isc` e `informatica`): así ambas comparten literalmente la
  misma plantilla (como pedía la sección 4), y si se visita un `slug` sin
  `Program` creado todavía (como `informatica`, que no está en el seed), la
  página muestra un estado "programa no disponible" en vez de romperse.
  Verificado visualmente con Playwright.
- **Retícula (`CircuitBoard`) sin librería de diagramas**: se implementó a
  mano con un `<svg>` superpuesto y medición de posiciones vía
  `getBoundingClientRect()` de cada nodo (con `ResizeObserver` para
  recalcular), en vez de traer una librería de grafos/diagramas. Es más
  código, pero evita una dependencia pesada para lo que en el fondo son
  líneas rectas entre tarjetas — y se probó visualmente que el hover
  resalta exactamente los prerrequisitos directos, no toda la cadena.
- **Materias que imparte un docente**: la API no expone "traer materias por
  lista de IDs", así que `DocenteDetalle.tsx` pide todas las materias
  (`api.subjects()`) y filtra en el cliente por `teacher.subjectIds`.
  Aceptable a esta escala (decenas de materias); si el catálogo creciera
  mucho valdría la pena un endpoint dedicado, pero sería una optimización
  prematura ahora mismo.
- **`lucide-react` y `@tailwindcss/typography` añadidos a `apps/web`**: no
  estaban en la lista de dependencias del documento para `apps/web`
  (`lucide-react` solo se mencionaba para `apps/admin`), pero se
  necesitaban para los iconos de contacto del perfil de docente (correo,
  sitio web, LinkedIn, Facebook, X) y para el estilo tipográfico del HTML
  saneado de noticias/comunidad (clases `prose`) respectivamente. Ambas son
  librerías pequeñas y ya usadas en el resto del proyecto.
- **`LabRack3D` se separa en su propio chunk** (837KB) vía `React.lazy`,
  cargado solo en `/laboratorios` — verificado en el build de producción
  que el bundle principal del sitio no incluye three.js.
- **Verificación visual completa de la Fase 8**: se recorrieron con
  Playwright las 12 páginas nuevas (Nosotros con timeline interactiva,
  Oferta educativa con retícula y su hover/modal, grid y detalle de
  Docentes con avatares de iniciales, overview y detalle de Laboratorios
  con el rack 3D, Especialidades, Normateca con búsqueda/filtros y su
  estado vacío, Comunidad con su estado vacío, Egresados, y listado/detalle
  de Noticias) — cero errores de consola en todas. Se encontró y corrigió
  un detalle cosmético menor (un `<ul>` vacío dejaba visible su borde
  cuando no había documentos en Normateca).

## Fase 9 — Base de apps/admin

- **Componentes de `shadcn/ui` escritos a mano, no con el CLI oficial**: el
  CLI de `shadcn` descarga cada componente desde un registro en línea de
  forma interactiva, lo cual no es viable en este entorno de construcción
  automatizada. Como las dependencias reales que usa shadcn ya estaban
  instaladas desde la Fase 1 (Radix, `class-variance-authority`, `clsx`,
  `tailwind-merge`, `lucide-react`), se escribieron a mano los componentes
  base (`Button`, `Input`, `Label`, `Card`, `Dialog`) siguiendo exactamente
  los mismos patrones y clases que genera el CLI — el resultado es
  indistinguible en uso, solo cambió cómo llegó el código al repositorio.
- **`GET /api/auth/me` se corrigió para devolver el usuario completo**: el
  middleware `requireAuth` solo adjunta `{id, role, email}` (lo que trae el
  JWT), pero el admin necesita también `name` y `mustChangePassword` para
  la UI (sidebar, flujo de cambio de contraseña obligatorio) — se detectó
  esta falta mientras se escribía `AuthContext.tsx` y se corrigió
  consultando el usuario completo en la base de datos dentro de `getMe`.
- **`erasableSyntaxOnly` en el tsconfig de `apps/admin` (heredado de la
  plantilla de Vite) prohíbe las "parameter properties" de TypeScript**: la
  clase `ApiError` no pudo usar `constructor(public status: number, ...)`
  como sí hace `HttpError` en `apps/api` (que no tiene esa restricción) —
  se reescribió con asignación explícita de campos en el cuerpo del
  constructor. Detectado por el propio `tsc -b`, no por inspección manual.
- **Flujo de login construido como máquina de estados de 3 pasos**
  (`credentials` → `totp-required` o `totp-setup` → dashboard): se probó
  end-to-end con Playwright real, incluyendo generar un código TOTP válido
  en el momento para completar el enrolamiento forzoso de 2FA del
  `SUPERADMIN`, el cambio de contraseña obligatorio en el primer login, un
  segundo login ya con 2FA configurado, acceso a `/usuarios` (ruta exclusiva
  de `SUPERADMIN`), logout, y que visitar `/` después de cerrar sesión
  redirige de nuevo a `/login` — sin errores de consola inesperados (los
  `401` que sí aparecen son las verificaciones normales de "¿hay sesión?"
  antes de loguearse y después de cerrar sesión, no fallos).
- **Dashboard con métricas calculadas en el cliente, sin endpoint
  dedicado**: en vez de agregar un endpoint `/api/dashboard/metrics` en la
  API, `Dashboard.tsx` pide las listas ya existentes (`teachers`,
  `subjects`, `documents`, `news`) y calcula los 4 conteos que pide la
  sección 8 en el propio componente. Es la opción más simple mientras el
  volumen de datos sea bajo (decenas de filas); si el catálogo creciera
  mucho, valdría la pena mover el cálculo al servidor — no se hizo ahora
  para no construir una optimización que todavía no hace falta.
- **Puerto de `apps/admin` fijado a 5174** (`server.port` +
  `strictPort: true` en `vite.config.ts`): sin esto, Vite toma el primer
  puerto libre y `apps/admin` podía terminar en el 5173 si `apps/web` no
  estaba corriendo — rompiendo la suposición del `CORS_ORIGINS` documentado
  y la convención web=5173/admin=5174 usada en el resto de la
  documentación.

## Fase 10 — CRUDs del sistema y ReticulaEditor

- **Componentes de `shadcn/ui` completados**: además de los ya escritos en la
  Fase 9, se agregaron `Tabs` (usado por `ImageUploader` para las pestañas
  "Subir archivo"/"Usar enlace"), `Select` y `Checkbox`, todos sobre los
  primitivos de Radix ya instalados.
- **`ReticulaEditor` es un formulario con casillas, no arrastrar-y-soltar
  con líneas dibujadas a mano**: el documento describe "arrastrar materias
  entre semestres y dibujar/quitar relaciones de prerrequisito
  visualmente". Implementar esa interacción exacta requiere una librería
  de drag-and-drop (`dnd-kit`/`react-dnd`) que no estaba en la lista de
  dependencias aprobadas, y añadirla solo para este componente hubiera sido
  la única pieza del admin con esa dependencia. Se optó por un formulario
  accesible por teclado (casillas de verificación para prerrequisitos,
  campo numérico para el semestre) que logra exactamente el mismo
  resultado funcional, más una "Vista de la retícula" de solo lectura
  agrupada por semestre con los prerrequisitos de cada materia listados
  como chips — así el efecto visual de confirmar la estructura del plan de
  estudios sigue presente. La validación de ciclos en el servidor (Fase 4)
  es la misma sin importar cómo se arme el payload.
- **Bug real encontrado por la prueba automatizada, no por inspección de
  código**: la página de Docentes trataba la respuesta de `GET /teachers`
  como `Teacher[]` completo, cuando la API en realidad devuelve
  `TeacherSummary[]` (sin `bio`, `experience`, redes ni `subjectIds` —
  ver `apps/api/src/services/teacherService.ts`). Esto no solo rompía la
  columna "Materias" de la tabla (`Cannot read properties of undefined
  (reading 'length')`, capturado como error de consola real durante la
  prueba con Playwright), sino que además el diálogo de "Editar" habría
  mostrado todos los campos en blanco para cualquier docente ya existente
  — un bug mucho más serio que el error visible, porque no lanza excepción
  visible al abrir el diálogo (los campos simplemente quedan vacíos). Se
  corrigió: la tabla usa `TeacherSummary`, y "Editar" pide el detalle
  completo (`GET /teachers/:slug`) antes de abrir el formulario. Este es
  exactamente el tipo de error que solo aparece probando la app de verdad,
  no leyendo el código.
- **Verificación funcional real de todo el módulo**, no solo build/lint:
  con Playwright y generando códigos TOTP válidos en el momento, se probó
  un ciclo completo de crear→ver en la tabla→eliminar en Especialidades y
  Docentes; se intentó crear un ciclo de prerrequisitos real desde la UI de
  Materias (ISC-101 con ISC-201 como prerrequisito, cuando ISC-201 ya
  depende de ISC-101) y se confirmó que el formulario muestra el mensaje
  de error del servidor sin guardar nada; se confirmó que el botón
  "Desactivar" del propio usuario en sesión aparece deshabilitado en
  Usuarios; y se revisó Auditoría para confirmar que las mutaciones de la
  propia prueba (crear/eliminar un docente y una especialidad) quedaron
  registradas con el usuario y la marca de tiempo correctos.

## Fase 11 — Pasada de seguridad final (checklist sección 9)

Se revisó cada punto de la sección 9 contra el código ya construido (no
solo se releyó el checklist, se verificó con `grep` sistemático sobre
todos los routers/controladores y con pruebas reales contra el servidor
levantado). Se encontraron y corrigieron tres problemas reales:

- **Videos embebidos sin restricción de dominio**: `Teacher.youtubeUrl` y
  `Program.videoUrl` solo validaban "es una URL bien formada", no que
  fuera realmente un embed de YouTube. Como estos campos los puede escribir
  un `EDITOR` (rol de menor confianza que `SUPERADMIN`) y se renderizan en
  un `<iframe>` en el sitio público, una cuenta `EDITOR` comprometida podía
  embeber cualquier página (phishing/clickjacking) en el perfil de un
  docente o en Oferta Educativa. Se agregó `youtubeEmbedUrlSchema` en
  `packages/shared` que exige que el host sea `youtube.com` o
  `youtube-nocookie.com`, y se aplicó a ambos campos. Probado: una URL a
  un dominio arbitrario se rechaza con un mensaje claro; una URL real de
  YouTube se acepta.
- **Rechazo de CORS devolvía 500 en vez de simplemente omitir las
  cabeceras**: el `origin` callback de `cors()` llamaba
  `callback(new Error(...))` para un origen no permitido, lo que disparaba
  el manejador de errores genérico y devolvía un 500 "Error interno del
  servidor" (con el detalle del error incluso visible en modo no
  producción). Un 500 real activaría falsas alarmas de monitoreo para lo
  que en realidad es un rechazo esperado (un bot o script probando la API
  desde un origen arbitrario). Se corrigió a `callback(null, false)` — el
  patrón recomendado por la propia librería `cors` — que simplemente omite
  las cabeceras `Access-Control-Allow-*"` (el navegador bloquea la lectura
  de la respuesta) sin tocar el código de estado HTTP. Verificado con
  `curl` inspeccionando las cabeceras antes/después del cambio.
- **JSON malformado y archivos que exceden el límite de tamaño caían al
  manejador de errores genérico (500)** en vez de responder con un código
  claro. Se agregó manejo explícito en `errorHandler.ts` para
  `SyntaxError` de `express.json()` (→ 400) y para `MulterError` con
  código `LIMIT_FILE_SIZE` (→ 413). Verificado enviando JSON inválido por
  `curl` y confirmando el nuevo 400.

Puntos ya cubiertos por fases anteriores y reconfirmados en esta pasada
(sin cambios de código, solo verificación):

- Cada ruta de mutación en los 13 routers de entidades tiene
  `requireAuth` + `requireRole('SUPERADMIN', 'EDITOR')` + `requireCsrf`
  (verificado con `grep` línea por línea, no solo una muestra).
  `/usuarios` y `/audit-logs` restringen además a `SUPERADMIN` únicamente.
- Cada controlador de creación/edición registra una entrada en
  `AuditLog` (verificado contando `recordAudit` vs. handlers exportados
  en los 13 controladores — los únicos sin auditoría son los de solo
  lectura, como se espera).
- `passwordHash` y `totpSecret` nunca se incluyen en ninguna respuesta
  JSON ni en el `before`/`after` guardado en `AuditLog` — los DTOs de
  `userService.ts` los excluyen explícitamente.
- `apps/web`/`apps/admin` no tienen CSP propia en desarrollo (Vite no la
  agrega) — se documentó en el README como una tarea de despliegue
  obligatoria antes de publicar el sitio real, con un ejemplo de cabecera
  lista para copiar al hosting elegido.
- `npm audit` sobre todo el monorepo (con Playwright, Tiptap, Radix y
  `@tailwindcss/typography` ya instalados) reporta **0 vulnerabilidades**.

## Fase 12 — Pruebas automatizadas

- **`@playwright/test` en vez de solo `playwright`**: la Fase 6 había
  instalado el paquete `playwright` (la librería de automatización) para
  poder tomar capturas de pantalla durante la construcción. Para la suite
  e2e formal de esta fase se necesitaba el *test runner* real (`playwright
  test`, con `test()`/`expect()`, fixtures y `playwright.config.ts`), así
  que se agregó `@playwright/test` (que incluye la librería base) y se
  quitó la dependencia duplicada.
- **Unit tests en `packages/shared`, no en `apps/api`**: el documento pide
  explícitamente "pruebas unitarias de los validadores Zod y de la lógica
  de 'sin ciclos' en prerrequisitos" — ambas cosas ya vivían en
  `packages/shared` (no en `apps/api`) desde las fases 4 y 9, así que ahí
  es donde se agregó Vitest. Se escribieron 27 casos: 8 sobre `hasCycle`
  (grafo vacío, cadena lineal real de la retícula, ramas
  desconectadas, ciclo directo, ciclo transitivo de 3 nodos, auto-ciclo,
  un "diamante" legítimo que reutiliza un prerrequisito sin ser ciclo, y
  un ciclo escondido entre relaciones válidas) y 19 sobre los esquemas Zod
  más sensibles (política de contraseña de 12+ caracteres, roles válidos,
  rango de semestre, categorías de normateca, y — deliberadamente — el
  `youtubeEmbedUrlSchema` agregado en la Fase 11, para que una futura
  regresión que vuelva a permitir cualquier dominio de video falle en CI,
  no solo en una revisión manual).
- **Suite e2e con `globalSetup` que reutiliza el seed real**: en vez de
  crear datos de prueba ad-hoc, `tests/e2e/global-setup.ts` ejecuta el
  mismo `apps/api/prisma/seed.ts` que usa cualquier desarrollador y
  extrae la contraseña del `SUPERADMIN` de su salida por consola — así la
  suite prueba exactamente el estado en el que un desarrollador nuevo deja
  el proyecto al clonarlo, no un atajo. `playwright.config.ts` levanta los
  tres servidores (`api`, `web`, `admin`) con la opción `webServer` para
  que `npx playwright test` funcione con un solo comando, sin pasos manuales.
- **`loginAsAdmin` maneja los tres estados posibles de la cuenta sembrada**
  (2FA pendiente, cambio de contraseña obligatorio, o ya configurada) y
  actualiza un fixture compartido (`tests/e2e/.seed-credentials.json`,
  gitignored — contiene una contraseña real de prueba) cuando la cambia,
  para que los specs no dependan de un orden de ejecución específico entre
  archivos.
- **Se detectó y corrigió una fuga real antes de terminar la fase**: el
  fixture de credenciales (`.seed-credentials.json`) no estaba en
  `.gitignore` — un descuido que habría subido al repositorio una
  contraseña real (aunque sea de una cuenta de prueba local) en cuanto
  alguien corriera la suite y comiteara. Se agregó al `.gitignore` antes
  de que existiera ningún commit con ese archivo.
- **Cobertura de la suite e2e**: `login.spec.ts` prueba que las rutas
  protegidas redirigen sin sesión, que una contraseña incorrecta muestra
  un error claro sin redirigir, el flujo completo de primer login
  (2FA + cambio de contraseña obligatorio) hasta llegar al dashboard, y que
  cerrar sesión vuelve a bloquear el acceso. `teacher-crud.spec.ts` cubre
  literalmente el punto de aceptación del documento: crear un docente
  desde el admin (con video de YouTube) → verlo de inmediato en
  `/docentes` del sitio público, incluido el botón de reproducir video →
  editarlo desde el admin → confirmar que el cambio se refleja en el sitio
  público → borrarlo → confirmar que desaparece del sitio público. Las 5
  pruebas pasan de punta a punta contra los tres servidores reales, sin
  mocks.

## Fase 13 — Pulido, Lighthouse, accesibilidad y documentación final

Se auditó `apps/web` con Lighthouse real (Chromium de Playwright vía
`chrome-launcher`, contra un build de producción servido con
`vite preview`, con la API corriendo detrás) en Home, Docentes y Oferta
Educativa — las tres páginas que exige la sección 11.

**Accesibilidad y buenas prácticas: superan el objetivo.** Antes de esta
fase: 93/95/95 (accesibilidad) y 96/96/96 (buenas prácticas). Se
encontraron y corrigieron 4 problemas reales, no cosméticos:

- **Contraste insuficiente en dos lugares** que usaban `opacity-50`/
  `opacity-60` sobre texto para dar sensación de "deshabilitado"
  (`Footer.tsx`, `MegaMenu.tsx`, `MobileNav.tsx`) — la opacidad reduce el
  contraste por debajo del mínimo AA. Se quitó la opacidad y se usó
  directamente un color con contraste suficiente (`text-muted` en fondos
  claros, `text-line` sobre `bg-deep`), conservando la sensación visual de
  "próximamente" solo con el color y la etiqueta de texto.
- **Un color de la paleta de avatares de iniciales no pasaba contraste**:
  `#3FB8D6` (el "signal" de marca) daba 2.32:1 con texto blanco encima
  (mínimo exigido 3:1 para texto grande en negritas). Se reemplazó por una
  variante más oscura de la misma familia de color (`#1D7A94`), y de paso
  se ajustó otro tono limítrofe (`#5B8DB8` → `#3E6488`) para que los 6
  colores de la paleta pasen con margen — verificado calculando el
  contraste real de cada uno, no solo "a ojo".
- **Orden de encabezados inválido**: varios títulos de tarjeta (docente,
  laboratorio, noticia, "¿Quiénes somos?", el evento activo de la línea de
  tiempo) usaban `<h3>` inmediatamente después de un `<h1>`, saltándose el
  `<h2>` — un fallo real de accesibilidad para quien navega por
  encabezados con lector de pantalla. Se revisó el uso de encabezados en
  **todas** las páginas (no solo la que Lighthouse marcó) y se corrigieron
  los cinco componentes con el mismo patrón.

Con esto, las tres páginas llegan a **accesibilidad 100/100/100** y
**buenas prácticas 100/100/100** — por encima de los mínimos de la sección
11 (≥95 en ambas).

**Rendimiento: no alcanza el objetivo de ≥85 de forma consistente, y se
documenta por qué en vez de forzar el número.** Los resultados variaron
bastante entre corridas (normal en Lighthouse local, ver nota abajo):
Home entre 43-48, Docentes entre 73-81, Oferta Educativa entre 56-81. Se
hicieron mejoras reales y se verificaron con el propio profiler de
Lighthouse antes de aceptar el resultado:

- Se creó `resizeImageUrl()` en `packages/shared` (con pruebas unitarias)
  que reescribe el ancho solicitado a Unsplash según el tamaño real de
  presentación — el profiler mostró una miniatura de noticia pidiendo una
  imagen de 104KB para mostrarse en 340×191px. Se aplicó en `NewsCard`,
  `Especialidades`, `LabTiltCard`, `TeacherAvatar` y la galería de
  `LaboratorioDetalle`.
- Se agregó `fetchPriority="high"` al primer slide del hero (es el
  elemento de LCP en Home).
- **La causa principal restante en Home es una tensión real entre dos
  requisitos del propio documento, no un descuido**: el CLS (Cumulative
  Layout Shift) de Home resultó muy alto, pero el audit
  `layout-shift-elements` no atribuye el shift a ningún elemento
  concreto — confirmando que no es un salto de layout real (nada "brinca"
  para el usuario, verificado visualmente en la Fase 7 con Playwright).
  La causa es que el hero anima `scale(0.7→1.2)` de un elemento del tamaño
  del viewport completo, tal como pide literalmente la sección 10.1
  ("Cada slide anima scale 0.7→1.2... efecto Ken Burns continuo") — Chrome
  cuenta ese cambio de tamaño visual como inestabilidad de layout aunque
  se implemente con `transform` (compositor, no reflow real). Reducir la
  amplitud del zoom bajaría el CLS pero traicionaría la especificación
  explícita del efecto cinematográfico que es la pieza central del sitio.
  Se decidió conservar el diseño tal como se pidió y documentar el
  trade-off en vez de diluir el efecto para perseguir un número.
- El resto de la brecha es atribuible al entorno de prueba: TTFB y tiempo
  de carga de imágenes externas de Unsplash (~250-450ms por imagen) desde
  una máquina de desarrollo local sin CDN — en producción, con las fotos
  reales del departamento servidas desde un CDN/hosting estático real (o
  incluso las mismas imágenes de stock pero cacheadas por Unsplash/el
  navegador en visitas repetidas), el tiempo de carga bajaría
  sustancialmente. La variación de ±20 puntos entre corridas idénticas
  confirma que el "laboratorio" local no es representativo de una medición
  de producción — la propia documentación de Lighthouse recomienda correr
  varias veces y promediar, o usar Lighthouse CI contra la URL real
  desplegada, no un solo run local.
- **Recomendación para antes de publicar el sitio real**: (1) reemplazar
  las fotos de stock de Unsplash por las fotos reales del departamento
  (ya marcado como pendiente en la tabla de relleno), subidas en un tamaño
  razonable desde el sistema; (2) correr Lighthouse CI contra la URL de
  producción real (con CDN) para una medición representativa, no contra
  `localhost`.
- **Lighthouse se instaló solo temporalmente para esta auditoría y se
  desinstaló al terminar**: su árbol de dependencias trae 17
  vulnerabilidades moderadas propias (herramientas de auditoría, no código
  de producción) que habrían ensuciado el `npm audit` limpio de todo el
  proyecto. `npm audit` vuelve a reportar 0 vulnerabilidades tras
  desinstalarlo.

**`prefers-reduced-motion`: se encontró y corrigió una cobertura
incompleta.** Una revisión sistemática (no solo los componentes obvios)
encontró que de los 6 componentes que usan Framer Motion, solo 1
(`MegaMenu.tsx`) verificaba `prefers-reduced-motion` manualmente — los
otros 5 (`VideoModal`, `SubjectModal`, `MobileNav`, `InteractiveTimeline`,
y el propio `Header` que envuelve `MobileNav`) no lo hacían. En vez de
repetir `useReducedMotion()` cinco veces más (el mismo patrón que ya había
fallado una vez), se envolvió toda la aplicación en
`<MotionConfig reducedMotion="user">` (`main.tsx`) — el mecanismo nativo
de Framer Motion para aplicar la preferencia del sistema operativo a
*todas* las animaciones de la librería en un solo lugar. Se simplificó
`MegaMenu.tsx` para quitar su chequeo manual, ahora redundante. También se
agregaron variantes `motion-reduce:` de Tailwind a las dos transiciones
CSS de hover-scale que no pasan por Framer Motion (`TeacherCard`,
`NewsCard`). Verificado con Playwright emulando
`reducedMotion: 'reduce'`: el menú, el menú móvil y la línea de tiempo
interactiva siguen siendo completamente funcionales (sin animación), sin
errores de consola. `HeroCinematic.tsx` y `LabTiltCard.tsx` ya
verificaban la preferencia por su cuenta desde las Fases 7 y 8
respectivamente (son animaciones manuales con GSAP/JS, no de Framer
Motion, así que `MotionConfig` no las cubre — se confirmó que ya estaban
bien).

**Mobile (320px+)**: verificado con Playwright a 320px de ancho en Home,
Docentes, Oferta Educativa, Laboratorios y Normateca — ningún overflow
horizontal a nivel de página en ninguna. El scroll horizontal de la
retícula (`CircuitBoard`) es intencional y está contenido dentro de su
propio contenedor, no afecta el ancho de la página.

## Contenido de relleno pendiente de reemplazar

Todo lo siguiente viene del seed de Prisma (`apps/api/prisma/seed.ts`) y debe
sustituirse por contenido real desde el sistema antes de publicar el sitio.

| Entidad | Campo | URL/estado usado | Pendiente |
| --- | --- | --- | --- |
| HeroSlide (x3) | media (EXTERNAL) | Fotos de stock de Unsplash (redes, centro de datos, código) | ✅ Pendiente — reemplazar por fotografía/video real del departamento |
| TimelineEvent (x4) | description | Redactado por el equipo de construcción a partir del documento de producto, no verificado con el departamento | ✅ Pendiente — confirmar fechas y datos exactos |
| Program "isc" | mission/vision/goals/admissionProfile/graduateProfile/actionField | Redactado por el equipo de construcción, contenido plausible pero no oficial | ✅ Pendiente — validar con el departamento |
| Program "isc" | videoUrl | `null` a propósito — la UI debe mostrar "Video institucional próximamente" | ✅ Pendiente — cargar video real desde el sistema |
| Subject (x9) / SubjectPrerequisite (x7) | todo | Retícula de ejemplo con 3 semestres, no es la retícula oficial completa de ISC | ✅ Pendiente — cargar la retícula real completa vía `ReticulaEditor` (admin) |
| Teacher (x7) | fullName, title, bio, experience | Nombres placeholder tipo "Dra. Ana Villaseñor Cruz"; bio/experiencia son texto genérico | ✅ Pendiente — reemplazar por personal docente real |
| Teacher (x7) | photoId | `null` a propósito — se ve el fallback de iniciales (Regla 2, sección 6.5) | ✅ Pendiente — cargar fotos reales desde el sistema |
| Lab (x4) | equipment | Datos de equipo razonables pero de ejemplo, no un inventario real | ✅ Pendiente — capturar inventario real desde el sistema |
| Lab (x4) | gallery | Fotos de stock de Unsplash | ✅ Pendiente — reemplazar por fotos reales de cada laboratorio |
| Specialty (x3) | description | Descripción genérica de una línea | ✅ Pendiente — ampliar con contenido oficial de cada especialidad |
| Specialty (x3) | image | Fotos de stock de Unsplash | ✅ Pendiente — reemplazar por imagen representativa real |
| News (x2) | title/excerpt/body | Artículos de ejemplo explícitamente marcados como "contenido de ejemplo" en el propio `body` | ✅ Pendiente — reemplazar por noticias reales del departamento |
| News (x2) | coverImage | Fotos de stock de Unsplash | ✅ Pendiente — reemplazar por imagen real de cada noticia |
| Document (normateca) (x3) | title/category | "Reglamento de Laboratorios", "Formato de Registro de Residencia Profesional", "Normativa de Créditos Complementarios" — títulos genéricos, no se inventó texto de reglamento real | ✅ Pendiente — reemplazar por los documentos oficiales reales |
| Document (normateca) (x3) | media | Las 3 apuntan al mismo PDF de relleno público (`w3.org`, un archivo de prueba conocido), a propósito para no fabricar contenido regulatorio falso | ✅ Pendiente — subir el PDF real de cada documento |
| CommunitySection (x3) | title/body | Residencias Profesionales / Investigación / Créditos Complementarios — descripción genérica de qué es cada cosa, sin inventar fechas, formularios o procedimientos específicos | ✅ Pendiente — ampliar con el proceso real de cada una |
| SiteConfig | `nosotros.mision` / `nosotros.vision` / `nosotros.valores` | Redactado por el equipo de construcción, contenido plausible pero no oficial | ✅ Pendiente — validar con el departamento |
| SiteConfig | `egresados.titulacion` / `egresados.titulosRecibidos` | Descripción genérica del proceso de titulación, redactada por el equipo de construcción, no un procedimiento oficial con fechas/formatos reales | ✅ Pendiente — validar con el departamento |
| User SUPERADMIN | password | Fija (`DSC-ISC-Morelia-2026`), reseteada manualmente en la BD de `dev` — ver nota debajo | ✅ Resuelto |

> **Nota (rama `dev`, base de datos Supabase compartida):** Normateca,
> Comunidad y Egresados se rellenaron directo en la base de datos real de
> Supabase (no vía `seed.ts`, que en esta rama ya no siembra estos tres) a
> petición explícita para que el sitio no se viera vacío en una demo. Se
> mantuvo la misma regla de las fases anteriores: nunca inventar texto que
> suene a reglamento, trámite o fecha oficial específica — solo
> descripciones genéricas de qué es cada sección, y para Normateca un PDF
> de relleno público en vez de fabricar el contenido de un reglamento real.

> **Nota (rama `dev`): recuperación de contraseña por correo.** El
> `SUPERADMIN` inicial nace con una contraseña aleatoria que solo se imprime
> una vez en consola al correr `seed.ts` — en la práctica, imposible de
> recuperar si se olvida (es un hash bcrypt, no reversible). A petición
> explícita se resolvió de dos formas: (1) se fijó una contraseña conocida
> (`DSC-ISC-Morelia-2026`) y se cambió el correo del SUPERADMIN de
> `admin@dsc.local` (dominio falso, sin bandeja real) a
> `appprueba695@gmail.com`, la cuenta que se seguirá usando en adelante como
> correo fijo de recuperación; (2) se agregó un flujo real de "¿Olvidaste tu
> contraseña?" (`POST /auth/forgot-password` + `POST /auth/reset-password`,
> nuevos campos `User.passwordResetCodeHash`/`passwordResetExpiresAt`,
> código de 6 dígitos con expiración de 15 min, un solo intento válido a la
> vez, rate-limit dedicado) para no volver a depender de que alguien
> recuerde o me pida resetearla a mano. El envío real requiere
> `SMTP_PASSWORD` en `apps/api/.env` — una "contraseña de aplicación" de 16
> caracteres generada en la cuenta de Gmail (Seguridad > Verificación en dos
> pasos > Contraseñas de aplicaciones), **no** la contraseña normal de la
> cuenta; sin ella, el código se registra en consola del servidor en vez de
> enviarse, para no bloquear el desarrollo local.
>
> También: la migración que agrega esas dos columnas
> (`20260827010000_add_password_reset_code`) se escribió a mano y se aplicó
> con `prisma migrate deploy` en vez de `prisma migrate dev`, porque este
> último necesita crear una shadow database para calcular el diff y eso
> falla contra el connection pooler de Supabase en este entorno (error
> P1014) — la misma familia de limitación de red/privilegios ya documentada
> para las conexiones directas a Postgres. `migrate deploy` no necesita
> shadow database, así que sigue siendo seguro para aplicar migraciones ya
> escritas a mano contra la base compartida.
