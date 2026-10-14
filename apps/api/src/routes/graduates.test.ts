import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';

const db = vi.hoisted(() => ({ user: { findUnique: vi.fn() } }));
const service = vi.hoisted(() => ({ listGraduates: vi.fn(), getGraduate: vi.fn(), registerGraduate: vi.fn(), listApplications: vi.fn(), reviewGraduate: vi.fn(), updateGraduate: vi.fn(), getGraduateFile: vi.fn() }));
vi.mock('../lib/prisma.js', () => ({ prisma: db }));
vi.mock('../services/graduateService.js', () => service);
vi.mock('../lib/env.js', () => ({ env: { jwtSecret: 'test-secret', isProduction: false } }));
import { graduatesRouter } from './graduates.js';
import { errorHandler } from '../middleware/errorHandler.js';

let server: Server;
let origin: string;
const cookies = (role = 'EDITOR') => `accessToken=${jwt.sign({ sub: 'admin1', role, email: 'admin@example.com' }, 'test-secret', { expiresIn: '15m' })}; csrfToken=test-csrf`;
beforeAll(async () => {
  const app = express();
  app.use(express.json(), cookieParser());
  app.use('/api/graduates', graduatesRouter);
  app.use(errorHandler);
  server = await new Promise<Server>((resolve) => { const instance = app.listen(0, '127.0.0.1', () => resolve(instance)); });
  origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/graduates`;
});
afterAll(async () => { await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())); });
beforeEach(() => {
  vi.clearAllMocks();
  db.user.findUnique.mockResolvedValue({ role: 'EDITOR', isActive: true, mustChangePassword: false });
  service.listApplications.mockResolvedValue([]);
});
describe('Acceso a solicitudes de egresados', () => {
  it('protege la edición con sesión, rol y CSRF', async () => {
    const form = new FormData();
    form.append('profile', '{}');
    expect((await fetch(`${origin}/admin/id`, { method: 'PUT', body: form })).status).toBe(401);
    expect((await fetch(`${origin}/admin/id`, { method: 'PUT', body: form, headers: { cookie: cookies('VIEWER'), 'x-csrf-token': 'test-csrf' } })).status).toBe(403);
    expect((await fetch(`${origin}/admin/id`, { method: 'PUT', body: form, headers: { cookie: cookies() } })).status).toBe(403);
    expect(service.updateGraduate).not.toHaveBeenCalled();
  });
  it('recibe datos y archivos del editor autorizado', async () => {
    const form = new FormData();
    form.append('profile', JSON.stringify({ fullName: 'Nombre actualizado' }));
    form.append('curriculum', new Blob(['%PDF-1.7'], { type: 'application/pdf' }), 'cv.pdf');
    const response = await fetch(`${origin}/admin/id`, { method: 'PUT', body: form, headers: { cookie: cookies(), 'x-csrf-token': 'test-csrf' } });
    expect(response.status).toBe(204);
    expect(service.updateGraduate).toHaveBeenCalledWith('id', 'admin1', { fullName: 'Nombre actualizado' }, expect.objectContaining({ curriculum: [expect.objectContaining({ originalname: 'cv.pdf' })] }));
  });
  it('bloquea solicitudes y títulos sin sesión', async () => {
    for (const path of ['/admin/applications', '/admin/id/files/diploma']) {
      expect((await fetch(`${origin}${path}`)).status).toBe(401);
    }
    expect(service.listApplications).not.toHaveBeenCalled();
    expect(service.getGraduateFile).not.toHaveBeenCalled();
  });
  it('bloquea VIEWER y revisores desactivados', async () => {
    expect((await fetch(`${origin}/admin/applications`, { headers: { cookie: cookies('VIEWER') } })).status).toBe(403);
    db.user.findUnique.mockResolvedValue({ role: 'EDITOR', isActive: false, mustChangePassword: false });
    expect((await fetch(`${origin}/admin/id/files/diploma`, { headers: { cookie: cookies() } })).status).toBe(403);
    expect(service.getGraduateFile).not.toHaveBeenCalled();
  });
  it('exige CSRF y confirmación del título antes de aprobar', async () => {
    const init = { method: 'PUT', headers: { cookie: cookies(), 'content-type': 'application/json' }, body: JSON.stringify({ status: 'APPROVED', titleVerified: true }) };
    expect((await fetch(`${origin}/admin/id/review`, init)).status).toBe(403);
    expect((await fetch(`${origin}/admin/id/review`, { ...init, headers: { ...init.headers, 'x-csrf-token': 'test-csrf' }, body: JSON.stringify({ status: 'APPROVED' }) })).status).toBe(400);
    expect(service.reviewGraduate).not.toHaveBeenCalled();
  });
  it('permite revisar con sesión y CSRF válidos', async () => {
    const response = await fetch(`${origin}/admin/id/review`, { method: 'PUT', headers: { cookie: cookies(), 'content-type': 'application/json', 'x-csrf-token': 'test-csrf' }, body: JSON.stringify({ status: 'APPROVED', titleVerified: true, reviewNote: 'Verificado' }) });
    expect(response.status).toBe(204);
    expect(service.reviewGraduate).toHaveBeenCalledWith('id', 'admin1', 'APPROVED', 'Verificado');
  });
  it('entrega el título privado como descarga sin caché', async () => {
    service.getGraduateFile.mockResolvedValue({ bytes: Buffer.from('%PDF-1.7'), mime: 'application/pdf' });
    const response = await fetch(`${origin}/admin/id/files/diploma`, { headers: { cookie: cookies() } });
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('content-disposition')).toContain('attachment');
    expect(service.getGraduateFile).toHaveBeenCalledWith('id', 'diploma', true);
  });
});
describe('Formulario multipart público', () => {
  it('acepta una solicitud con sus archivos sin abrir el endpoint de medios del CMS', async () => {
    const form = new FormData();
    form.append('profile', JSON.stringify({ fullName: 'María Pérez' }));
    form.append('diploma', new Blob(['%PDF-1.7'], { type: 'application/pdf' }), 'titulo.pdf');
    const response = await fetch(`${origin}/register`, { method: 'POST', body: form });
    expect(response.status).toBe(201);
    expect(service.registerGraduate).toHaveBeenCalledWith({ fullName: 'María Pérez' }, expect.objectContaining({ diploma: [expect.objectContaining({ originalname: 'titulo.pdf' })] }));
    expect(await response.json()).not.toHaveProperty('id');
  });
  it('rechaza perfiles JSON malformados y campos de archivo inesperados', async () => {
    const form = new FormData();
    form.append('profile', '{invalid');
    expect((await fetch(`${origin}/register`, { method: 'POST', body: form })).status).toBe(400);
    const unexpected = new FormData();
    unexpected.append('profile', '{}');
    unexpected.append('secret', new Blob(['fake']), 'unexpected.pdf');
    expect((await fetch(`${origin}/register`, { method: 'POST', body: unexpected })).status).toBe(400);
    expect(service.registerGraduate).not.toHaveBeenCalled();
  });
});
