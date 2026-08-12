import { describe, expect, it } from 'vitest';
import { resizeImageUrl } from './imageUrl';

describe('resizeImageUrl', () => {
  it('rewrites the width query param for an Unsplash URL', () => {
    const result = resizeImageUrl(
      'https://images.unsplash.com/photo-123?w=1400&q=80&auto=format&fit=crop',
      400,
    );
    expect(result).toContain('w=400');
    expect(result).not.toContain('w=1400');
  });

  it('leaves a Picsum URL unchanged (size is encoded in the path, not a query param)', () => {
    const url = 'https://picsum.photos/id/42/1200/800';
    expect(resizeImageUrl(url, 400)).toBe(url);
  });

  it('leaves a locally-uploaded file URL unchanged (no resize pipeline for uploads)', () => {
    const url = 'http://localhost:4000/uploads/images/abc123.jpg';
    expect(resizeImageUrl(url, 400)).toBe(url);
  });

  it('does not throw on a malformed URL', () => {
    expect(() => resizeImageUrl('not-a-url', 400)).not.toThrow();
  });
});
