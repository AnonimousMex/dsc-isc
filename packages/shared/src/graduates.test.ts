import { describe, expect, it } from 'vitest';
import { graduateRegistrationSchema, graduateReviewSchema } from './graduates';

const valid = { fullName: 'María Pérez', email: 'MARIA@example.com', graduationYear: 2020, headline: 'Ingeniera de software', bio: 'Desarrollo aplicaciones para la comunidad.', experience: '', city: '', consent: true };
describe('Registro de egresados', () => {
  it('normaliza el correo y no publica el contacto por defecto', () => {
    const result = graduateRegistrationSchema.parse(valid);
    expect(result.email).toBe('maria@example.com');
    expect(result.showEmail).toBe(false);
  });
  it('exige consentimiento y rechaza una titulación futura', () => {
    expect(graduateRegistrationSchema.safeParse({ ...valid, consent: false }).success).toBe(false);
    expect(graduateRegistrationSchema.safeParse({ ...valid, graduationYear: new Date().getFullYear() + 1 }).success).toBe(false);
  });
  it('rechaza protocolos ejecutables en las redes', () => {
    for (const key of ['website', 'linkedin', 'github', 'facebook', 'instagram']) {
      expect(graduateRegistrationSchema.safeParse({ ...valid, [key]: 'javascript:alert(1)' }).success).toBe(false);
    }
  });
  it('no acepta un estado de aprobación enviado por el solicitante', () => {
    expect(graduateRegistrationSchema.parse({ ...valid, status: 'APPROVED' })).not.toHaveProperty('status');
  });
});
describe('Revisión de egresados', () => {
  it('exige confirmar la verificación del título para aprobar', () => {
    expect(graduateReviewSchema.safeParse({ status: 'APPROVED' }).success).toBe(false);
    expect(graduateReviewSchema.safeParse({ status: 'APPROVED', titleVerified: true }).success).toBe(true);
  });
  it('exige un motivo de rechazo', () => {
    expect(graduateReviewSchema.safeParse({ status: 'REJECTED', reviewNote: '  ' }).success).toBe(false);
    expect(graduateReviewSchema.safeParse({ status: 'REJECTED', reviewNote: 'El documento no acredita titulación.' }).success).toBe(true);
  });
});
