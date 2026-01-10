import { describe, it, expect } from 'vitest';
import { extractGenreFromUrl, getAvailableGenres } from '../lib/genreExtractor';

describe('genreExtractor', () => {
  describe('extractGenreFromUrl', () => {
    describe('Netflix URLs', () => {
      it('should extract anime genre from Netflix genre URL', () => {
        expect(extractGenreFromUrl('https://netflix.com/browse/genre/7424')).toBe('anime');
      });

      it('should extract action genre from Netflix genre URL', () => {
        expect(extractGenreFromUrl('https://netflix.com/browse/genre/1365')).toBe('action');
      });

      it('should extract horror genre from Netflix genre URL', () => {
        expect(extractGenreFromUrl('https://netflix.com/browse/genre/8711')).toBe('horror');
      });

      it('should extract comedy genre from Netflix genre URL', () => {
        expect(extractGenreFromUrl('https://netflix.com/browse/genre/6548')).toBe('comedy');
      });

      it('should extract documentary genre from Netflix genre URL', () => {
        expect(extractGenreFromUrl('https://netflix.com/browse/genre/6839')).toBe('documentary');
      });

      it('should return null for unknown Netflix genre code', () => {
        expect(extractGenreFromUrl('https://netflix.com/browse/genre/99999')).toBe(null);
      });

      it('should return null for regular Netflix URL without genre', () => {
        expect(extractGenreFromUrl('https://netflix.com/watch/12345')).toBe(null);
      });
    });

    describe('YouTube Music URLs', () => {
      it('should return music for YouTube Music URL', () => {
        expect(extractGenreFromUrl('https://music.youtube.com/watch?v=abc123')).toBe('music');
      });
    });

    describe('YouTube Gaming URLs', () => {
      it('should return gaming for YouTube Gaming URL', () => {
        expect(extractGenreFromUrl('https://gaming.youtube.com/watch?v=abc123')).toBe('gaming');
      });
    });

    describe('Other URLs', () => {
      it('should return null for regular YouTube URL', () => {
        expect(extractGenreFromUrl('https://youtube.com/watch?v=abc123')).toBe(null);
      });

      it('should return null for Vimeo URL', () => {
        expect(extractGenreFromUrl('https://vimeo.com/123456')).toBe(null);
      });

      it('should return null for non-video URL', () => {
        expect(extractGenreFromUrl('https://example.com')).toBe(null);
      });
    });
  });

  describe('getAvailableGenres', () => {
    it('should return array of genres', () => {
      const genres = getAvailableGenres();
      expect(Array.isArray(genres)).toBe(true);
      expect(genres.length).toBeGreaterThan(0);
    });

    it('should include common genres', () => {
      const genres = getAvailableGenres();
      expect(genres).toContain('action');
      expect(genres).toContain('anime');
      expect(genres).toContain('comedy');
      expect(genres).toContain('drama');
      expect(genres).toContain('horror');
      expect(genres).toContain('music');
    });
  });
});
