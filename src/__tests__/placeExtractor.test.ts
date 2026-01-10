import { describe, it, expect } from 'vitest';
import { extractPlaceFromUrl, formatPlaceTitle } from '../lib/placeExtractor';

describe('placeExtractor', () => {
  describe('extractPlaceFromUrl', () => {
    describe('Google Maps', () => {
      it('should extract place name and coordinates from Google Maps URL', () => {
        const url = 'https://www.google.com/maps/place/Tokyo+Tower/@35.6585805,139.7454329,17z';
        const result = extractPlaceFromUrl(url);
        expect(result).toEqual({
          name: 'Tokyo Tower',
          coordinates: { lat: 35.6585805, lng: 139.7454329 },
          source: 'google',
          isMapLink: true,
        });
      });

      it('should extract Korean place name from Google Maps URL', () => {
        const url = 'https://www.google.co.kr/maps/place/%EC%84%9C%EC%9A%B8%EC%97%AD/@37.5546,126.9707';
        const result = extractPlaceFromUrl(url);
        expect(result?.name).toBe('서울역');
        expect(result?.source).toBe('google');
      });

      it('should extract coordinates only when no place name', () => {
        const url = 'https://www.google.com/maps/@35.6762,139.6503,15z';
        const result = extractPlaceFromUrl(url);
        expect(result?.coordinates).toEqual({ lat: 35.6762, lng: 139.6503 });
        expect(result?.source).toBe('google');
      });
    });

    describe('Naver Map', () => {
      it('should extract place name from Naver Map search URL', () => {
        const url = 'https://map.naver.com/v5/search/서울역';
        const result = extractPlaceFromUrl(url);
        expect(result).toEqual({
          name: '서울역',
          source: 'naver',
          isMapLink: true,
        });
      });

      it('should extract encoded place name from Naver Map', () => {
        const url = 'https://map.naver.com/v5/search/%EC%84%9C%EC%9A%B8%EC%97%AD';
        const result = extractPlaceFromUrl(url);
        expect(result?.name).toBe('서울역');
      });
    });

    describe('Kakao Map', () => {
      it('should extract place name from Kakao Map search URL', () => {
        const url = 'https://map.kakao.com/link/search/강남역';
        const result = extractPlaceFromUrl(url);
        expect(result).toEqual({
          name: '강남역',
          source: 'kakao',
          isMapLink: true,
        });
      });

      it('should extract place name from Kakao Map link URL', () => {
        const url = 'https://map.kakao.com/link/map/카카오,37.402056,127.108212';
        const result = extractPlaceFromUrl(url);
        expect(result?.name).toBe('카카오');
        expect(result?.source).toBe('kakao');
      });
    });

    describe('Apple Maps', () => {
      it('should extract place name from Apple Maps URL', () => {
        const url = 'https://maps.apple.com/?q=Eiffel+Tower';
        const result = extractPlaceFromUrl(url);
        expect(result).toEqual({
          name: 'Eiffel Tower',
          source: 'apple',
          isMapLink: true,
        });
      });

      it('should extract coordinates from Apple Maps URL', () => {
        const url = 'https://maps.apple.com/?ll=48.8584,2.2945';
        const result = extractPlaceFromUrl(url);
        expect(result?.coordinates).toEqual({ lat: 48.8584, lng: 2.2945 });
        expect(result?.source).toBe('apple');
      });
    });

    describe('Unknown URLs', () => {
      it('should return null for non-map URL', () => {
        expect(extractPlaceFromUrl('https://example.com')).toBe(null);
      });

      it('should return null for empty string', () => {
        expect(extractPlaceFromUrl('')).toBe(null);
      });
    });
  });

  describe('formatPlaceTitle', () => {
    it('should return name when available', () => {
      expect(formatPlaceTitle({ name: 'Tokyo Tower', source: 'google', isMapLink: true })).toBe('Tokyo Tower');
    });

    it('should format coordinates when no name', () => {
      const result = formatPlaceTitle({ 
        coordinates: { lat: 35.6585, lng: 139.7454 }, 
        source: 'google',
        isMapLink: true,
      });
      expect(result).toBe('📍 35.6585, 139.7454');
    });

    it('should return empty string when no name or coordinates', () => {
      expect(formatPlaceTitle({ source: 'google', isMapLink: true })).toBe('');
    });
  });
});
