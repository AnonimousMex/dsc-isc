import { describe, expect, it } from 'vitest';
import {
  changePasswordSchema,
  documentSchema,
  externalMediaSchema,
  loginSchema,
  subjectSchema,
  teacherSchema,
  userCreateSchema,
  youtubeEmbedUrlSchema,
} from './index';

describe('userCreateSchema', () => {
  it('accepts a valid payload', () => {
    const result = userCreateSchema.safeParse({
      name: 'Ana Villaseñor',
      email: 'ana@dsc.local',
      password: 'password1234',
      role: 'EDITOR',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a password shorter than 12 characters (política mínima, sección 9)', () => {
    const result = userCreateSchema.safeParse({
      name: 'Ana',
      email: 'ana@dsc.local',
      password: 'short',
      role: 'EDITOR',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid email', () => {
    const result = userCreateSchema.safeParse({
      name: 'Ana',
      email: 'no-es-un-correo',
      password: 'password1234',
      role: 'EDITOR',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a role outside the known set', () => {
    const result = userCreateSchema.safeParse({
      name: 'Ana',
      email: 'ana@dsc.local',
      password: 'password1234',
      role: 'ROOT',
    });
    expect(result.success).toBe(false);
  });
});

describe('changePasswordSchema', () => {
  it('rejects a new password shorter than 12 characters', () => {
    const result = changePasswordSchema.safeParse({ currentPassword: 'x', newPassword: 'short' });
    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('allows omitting the TOTP code', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: 'x' });
    expect(result.success).toBe(true);
  });

  it('rejects a TOTP code that is not exactly 6 characters', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: 'x', totpCode: '123' });
    expect(result.success).toBe(false);
  });
});

describe('subjectSchema', () => {
  it('accepts a valid subject with prerequisites', () => {
    const result = subjectSchema.safeParse({
      code: 'ISC-201',
      name: 'Estructuras de Datos',
      semester: 2,
      objective: 'Diseñar estructuras de datos eficientes.',
      programId: 'prog-1',
      prerequisiteIds: ['subj-1'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects a semester outside the 1-20 range', () => {
    const result = subjectSchema.safeParse({
      code: 'ISC-201',
      name: 'Estructuras de Datos',
      semester: 0,
      objective: 'x',
      programId: 'prog-1',
    });
    expect(result.success).toBe(false);
  });

  it('defaults prerequisiteIds to an empty array when omitted', () => {
    const result = subjectSchema.parse({
      code: 'ISC-101',
      name: 'Fundamentos',
      semester: 1,
      objective: 'x',
      programId: 'prog-1',
    });
    expect(result.prerequisiteIds).toEqual([]);
  });
});

describe('youtubeEmbedUrlSchema (mitigación de iframe arbitrario, sección 9/11)', () => {
  it('accepts a real youtube.com embed URL', () => {
    expect(youtubeEmbedUrlSchema.safeParse('https://www.youtube.com/embed/abc123').success).toBe(true);
  });

  it('accepts a youtube-nocookie.com embed URL', () => {
    expect(youtubeEmbedUrlSchema.safeParse('https://www.youtube-nocookie.com/embed/abc123').success).toBe(
      true,
    );
  });

  it('rejects an arbitrary external domain (vector de phishing/clickjacking)', () => {
    expect(youtubeEmbedUrlSchema.safeParse('https://evil.example.com/embed/abc123').success).toBe(false);
  });

  it('rejects a malformed URL', () => {
    expect(youtubeEmbedUrlSchema.safeParse('not-a-url').success).toBe(false);
  });
});

describe('teacherSchema', () => {
  const base = {
    fullName: 'Ana Villaseñor',
    title: 'Dra. en Ciencias de la Computación',
    bio: 'x',
    experience: 'x',
    isActive: true,
    subjectIds: [] as string[],
  };

  it('accepts a teacher without any social links', () => {
    expect(teacherSchema.safeParse(base).success).toBe(true);
  });

  it('accepts an empty string for youtubeUrl (sin video)', () => {
    expect(teacherSchema.safeParse({ ...base, youtubeUrl: '' }).success).toBe(true);
  });

  it('rejects a non-YouTube video URL', () => {
    expect(teacherSchema.safeParse({ ...base, youtubeUrl: 'https://vimeo.com/123' }).success).toBe(false);
  });
});

describe('documentSchema', () => {
  it('rejects a category outside Reglamento/Formato/Normativa', () => {
    const result = documentSchema.safeParse({ title: 'x', category: 'Otro', mediaId: 'media-1' });
    expect(result.success).toBe(false);
  });
});

describe('externalMediaSchema', () => {
  it('rejects a media kind outside IMAGE/VIDEO/DOCUMENT', () => {
    const result = externalMediaSchema.safeParse({ url: 'https://example.com/a.jpg', kind: 'AUDIO' });
    expect(result.success).toBe(false);
  });
});
