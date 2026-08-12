import 'dotenv/config';
import path from 'node:path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { env } from './lib/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { securityHeaders } from './middleware/securityHeaders.js';
import { auditLogsRouter } from './routes/auditLogs.js';
import { authRouter } from './routes/auth.js';
import { communityRouter } from './routes/community.js';
import { documentsRouter } from './routes/documents.js';
import { heroSlidesRouter } from './routes/heroSlides.js';
import { labsRouter } from './routes/labs.js';
import { mediaRouter } from './routes/media.js';
import { newsRouter } from './routes/news.js';
import { programsRouter } from './routes/programs.js';
import { siteConfigRouter } from './routes/siteConfig.js';
import { specialtiesRouter } from './routes/specialties.js';
import { subjectsRouter } from './routes/subjects.js';
import { teachersRouter } from './routes/teachers.js';
import { timelineRouter } from './routes/timeline.js';
import { usersRouter } from './routes/users.js';

const app = express();

app.use(securityHeaders);

// Solo se aceptan requests desde los orígenes explícitos de web/admin
// (CORS_ORIGINS en .env), con credenciales habilitadas únicamente para esos
// orígenes — nunca un comodín cuando se usan cookies de sesión. Se pasa
// `false` (no un Error) para un origen no permitido: así `cors` simplemente
// omite las cabeceras de acceso (el navegador bloquea la lectura de la
// respuesta) en vez de disparar el error handler genérico con un 500 que
// además confundiría monitoreo/alertas con una caída real del servidor.
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, !origin || env.corsOrigins.includes(origin));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// Archivos subidos desde el sistema (ver src/storage/). Solo se sirven como
// estáticos, nunca se ejecutan — express.static no interpreta código.
const uploadsRoot = path.resolve(process.cwd(), 'storage', 'uploads');
app.use(
  '/uploads',
  express.static(uploadsRoot, {
    setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
  }),
);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'dsc-isc-api' });
});

app.use('/api/auth', authRouter);
app.use('/api/media', mediaRouter);
app.use('/api/site-config', siteConfigRouter);
app.use('/api/hero-slides', heroSlidesRouter);
app.use('/api/timeline', timelineRouter);
app.use('/api/programs', programsRouter);
app.use('/api/subjects', subjectsRouter);
app.use('/api/teachers', teachersRouter);
app.use('/api/labs', labsRouter);
app.use('/api/specialties', specialtiesRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/news', newsRouter);
app.use('/api/community-sections', communityRouter);
app.use('/api/users', usersRouter);
app.use('/api/audit-logs', auditLogsRouter);

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`[api] escuchando en http://localhost:${env.port}`);
});
