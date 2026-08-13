import { describe, expect, it } from 'vitest';
import { toYoutubeEmbedUrl } from './youtube';

describe('toYoutubeEmbedUrl', () => {
  it('converts a watch?v= URL into an embeddable URL', () => {
    expect(toYoutubeEmbedUrl('https://www.youtube.com/watch?v=-HLXkFLCxcM')).toBe(
      'https://www.youtube.com/embed/-HLXkFLCxcM',
    );
  });

  it('converts a /shorts/ URL into an embeddable URL', () => {
    expect(toYoutubeEmbedUrl('https://www.youtube.com/shorts/-HLXkFLCxcM')).toBe(
      'https://www.youtube.com/embed/-HLXkFLCxcM',
    );
  });

  it('leaves an already-embed URL unchanged', () => {
    const url = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
    expect(toYoutubeEmbedUrl(url)).toBe(url);
  });

  it('preserves the youtube-nocookie.com host', () => {
    expect(toYoutubeEmbedUrl('https://www.youtube-nocookie.com/watch?v=abc123')).toBe(
      'https://www.youtube-nocookie.com/embed/abc123',
    );
  });

  it('drops extra query params (playlist position, timestamp) when converting', () => {
    expect(toYoutubeEmbedUrl('https://www.youtube.com/watch?v=abc123&t=42s&list=xyz')).toBe(
      'https://www.youtube.com/embed/abc123',
    );
  });

  it('returns the URL unchanged when no video id can be found', () => {
    const url = 'https://www.youtube.com/';
    expect(toYoutubeEmbedUrl(url)).toBe(url);
  });

  it('does not throw on a malformed URL', () => {
    expect(() => toYoutubeEmbedUrl('not-a-url')).not.toThrow();
  });
});
