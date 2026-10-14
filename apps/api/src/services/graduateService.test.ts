import { beforeEach, describe, expect, it, vi } from 'vitest';

const db = vi.hoisted(() => ({
  graduate: { findMany: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
  auditLog: { create: vi.fn() },
  $transaction: vi.fn(),
}));
vi.mock('../lib/prisma.js', () => ({ prisma: db }));
vi.mock('../lib/env.js', () => ({ env: { apiPublicUrl: 'http://localhost:4000', isProduction: false } }));
import { getGraduate, getGraduateFile, listGraduates, registerGraduate, reviewGraduate, updateGraduate, toGraduateProfile, validateGraduateFile } from './graduateService.js';

const row = {
  id: 'graduate1', fullName: 'María Pérez', email: 'maria@example.com', headline: 'Ingeniera',
  graduationYear: 2020, bio: 'Perfil profesional de una egresada.', experience: '', city: '',
  website: null, linkedin: null, github: null, facebook: null, instagram: null,
  showEmail: false, status: 'APPROVED', reviewNote: 'Nota privada',
  reviewedAt: null, createdAt: new Date(), photoMime: 'image/png', hasCurriculum: true,
};
const profile = { ...row, consent: true, website: '', linkedin: '', github: '', facebook: '', instagram: '', status: 'APPROVED' };
const file = (buffer: Buffer, name = 'titulo.pdf') => ({ buffer, size: buffer.byteLength, originalname: name, mimetype: 'application/pdf' }) as Express.Multer.File;
const pdf = file(Buffer.from('%PDF-1.7\nExample diploma'));

beforeEach(() => { vi.clearAllMocks(); db.$transaction.mockImplementation((callback) => callback(db)); });

describe('Edición administrativa de egresados', () => {
  it('conserva archivos y aprobación cuando solo cambian los datos', async () => {
    db.graduate.findUnique.mockResolvedValue(row);
    db.graduate.update.mockResolvedValue(row);
    await updateGraduate(row.id, 'admin1', profile, {});
    const args = db.graduate.update.mock.calls[0]![0];
    expect(args.where).toEqual({ id: row.id, status: 'APPROVED' });
    expect(args.data).not.toHaveProperty('status');
    expect(args.data).not.toHaveProperty('diploma');
    expect(args.data).not.toHaveProperty('photo');
    expect(args.data).not.toHaveProperty('curriculum');
    expect(args.select).not.toHaveProperty('diploma');
    expect(db.auditLog.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ userId: 'admin1', entityId: row.id }) }));
  });
  it('reemplaza el CV y permite quitar la foto sin cargar bytes en auditoría', async () => {
    db.graduate.findUnique.mockResolvedValue(row);
    db.graduate.update.mockResolvedValue(row);
    await updateGraduate(row.id, 'admin1', { ...profile, removePhoto: true }, { curriculum: [pdf] });
    expect(db.graduate.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ photo: null, photoMime: null, curriculum: pdf.buffer, hasCurriculum: true }) }));
    expect(db.auditLog.create.mock.calls[0]![0].data.after).not.toContain('%PDF');
  });
  it('rechaza editar perfiles pendientes o inexistentes', async () => {
    db.graduate.findUnique.mockResolvedValue({ ...row, status: 'PENDING' });
    await expect(updateGraduate(row.id, 'admin1', profile, {})).rejects.toMatchObject({ status: 409 });
    db.graduate.findUnique.mockResolvedValue(null);
    await expect(updateGraduate(row.id, 'admin1', profile, {})).rejects.toMatchObject({ status: 404 });
    expect(db.graduate.update).not.toHaveBeenCalled();
    expect(db.auditLog.create).not.toHaveBeenCalled();
  });
  it('rechaza fotos falsas antes de abrir la transacción', async () => {
    await expect(updateGraduate(row.id, 'admin1', profile, { photo: [pdf] })).rejects.toMatchObject({ status: 415 });
    expect(db.$transaction).not.toHaveBeenCalled();
  });
});
describe('Privacidad y publicación de egresados', () => {
  it('omite correo privado, título, estado y notas del perfil público', () => {
    const result = toGraduateProfile(row);
    expect(result.email).toBeNull();
    expect(result).not.toHaveProperty('reviewNote');
    expect(result).not.toHaveProperty('diploma');
    expect(result).not.toHaveProperty('status');
    expect(toGraduateProfile({ ...row, showEmail: true }).email).toBe(row.email);
  });
  it('solo lista aprobados y no carga bytes de documentos', async () => {
    db.graduate.findMany.mockResolvedValue([row]);
    await listGraduates();
    expect(db.graduate.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { status: 'APPROVED' } }));
    const args = db.graduate.findMany.mock.calls[0]![0];
    expect(args.select).not.toHaveProperty('diploma');
    expect(args.select).not.toHaveProperty('curriculum');
  });
  it('no permite acceder a perfiles pendientes por ID', async () => {
    db.graduate.findFirst.mockResolvedValue(null);
    await expect(getGraduate('pending')).rejects.toMatchObject({ status: 404 });
    expect(db.graduate.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'pending', status: 'APPROVED' } }));
  });
  it('nunca entrega el título por una ruta pública', async () => {
    await expect(getGraduateFile(row.id, 'diploma', false)).rejects.toMatchObject({ status: 404 });
    expect(db.graduate.findFirst).not.toHaveBeenCalled();
  });
  it('solo entrega fotos y CV públicos de aprobados', async () => {
    db.graduate.findFirst.mockResolvedValue(null);
    await expect(getGraduateFile(row.id, 'curriculum', false)).rejects.toMatchObject({ status: 404 });
    expect(db.graduate.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: row.id, status: 'APPROVED' } }));
  });
  it('permite al revisor recuperar el título pendiente', async () => {
    db.graduate.findFirst.mockResolvedValue({ diploma: pdf.buffer, diplomaMime: 'application/pdf' });
    expect(await getGraduateFile(row.id, 'diploma', true)).toEqual({ bytes: pdf.buffer, mime: 'application/pdf' });
  });
});
describe('Registro y moderación', () => {
  it('exige el título sin crear filas incompletas', async () => {
    await expect(registerGraduate(profile, {})).rejects.toMatchObject({ status: 400 });
    expect(db.graduate.create).not.toHaveBeenCalled();
  });
  it('comprueba el tipo real aunque el navegador declare PDF', async () => {
    await expect(validateGraduateFile(file(Buffer.from('<html>fake diploma</html>')), 'diploma')).rejects.toMatchObject({ status: 415 });
    await expect(validateGraduateFile(pdf, 'photo')).rejects.toMatchObject({ status: 415 });
  });
  it('rechaza un documento mayor al límite', async () => {
    await expect(validateGraduateFile({ ...pdf, size: 16 * 1024 * 1024 }, 'diploma')).rejects.toMatchObject({ status: 413 });
  });
  it('siempre registra pendiente aunque el solicitante envíe aprobación', async () => {
    db.graduate.create.mockResolvedValue({ id: row.id });
    await registerGraduate(profile, { diploma: [pdf], curriculum: [pdf] });
    expect(db.graduate.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: 'PENDING', diploma: pdf.buffer, hasCurriculum: true }) }));
  });
  it('registra la decisión y auditoría en una transacción sin documentos privados', async () => {
    db.graduate.findUnique.mockResolvedValue({ status: 'PENDING', reviewNote: null });
    db.$transaction.mockImplementation((callback) => callback(db));
    await reviewGraduate(row.id, 'admin1', 'APPROVED', 'Título verificado');
    expect(db.$transaction).toHaveBeenCalledOnce();
    expect(db.$transaction).toHaveBeenCalledWith(expect.any(Function), { timeout: 30_000 });
    expect(db.graduate.update.mock.calls[0]![0].select).toEqual({ id: true });
    expect(db.graduate.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: 'APPROVED', reviewedBy: 'admin1' }) }));
    expect(db.auditLog.create).toHaveBeenCalledWith({ data: expect.objectContaining({ entityType: 'Graduate', userId: 'admin1', after: JSON.stringify({ status: 'APPROVED', reviewNote: 'Título verificado' }) }) });
  });
  it('no actualiza ni audita una solicitud inexistente', async () => {
    db.graduate.findUnique.mockResolvedValue(null);
    db.$transaction.mockImplementation((callback) => callback(db));
    await expect(reviewGraduate('missing', 'admin1', 'APPROVED', '')).rejects.toMatchObject({ status: 404 });
    expect(db.graduate.update).not.toHaveBeenCalled();
    expect(db.auditLog.create).not.toHaveBeenCalled();
  });
});
