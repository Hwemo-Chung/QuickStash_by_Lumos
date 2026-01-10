import { describe, it, expect } from 'vitest';
import { extractChosung, isChosungOnly, matchesChosung } from '../lib/koreanSearch';

describe('koreanSearch', () => {
  describe('extractChosung', () => {
    it('should extract chosung from Korean syllables', () => {
      expect(extractChosung('안녕하세요')).toBe('ㅇㄴㅎㅅㅇ');
    });

    it('should preserve non-Korean characters', () => {
      expect(extractChosung('Hello안녕')).toBe('Helloㅇㄴ');
    });

    it('should handle mixed content', () => {
      expect(extractChosung('프로젝트123')).toBe('ㅍㄹㅈㅌ123');
    });

    it('should handle empty string', () => {
      expect(extractChosung('')).toBe('');
    });
  });

  describe('isChosungOnly', () => {
    it('should return true for chosung-only string', () => {
      expect(isChosungOnly('ㅎㅇㄹ')).toBe(true);
    });

    it('should return true for chosung with spaces', () => {
      expect(isChosungOnly('ㅎㅇ ㄹ')).toBe(true);
    });

    it('should return false for full Korean text', () => {
      expect(isChosungOnly('안녕')).toBe(false);
    });

    it('should return false for mixed chosung and syllables', () => {
      expect(isChosungOnly('ㅎ녕')).toBe(false);
    });

    it('should return false for English text', () => {
      expect(isChosungOnly('hello')).toBe(false);
    });
  });

  describe('matchesChosung', () => {
    it('should match chosung pattern in Korean text', () => {
      expect(matchesChosung('회의록', 'ㅎㅇㄹ')).toBe(true);
    });

    it('should not match incorrect chosung pattern', () => {
      expect(matchesChosung('회의록', 'ㅎㅇㅁ')).toBe(false);
    });

    it('should match partial chosung at any position', () => {
      expect(matchesChosung('프로젝트 회의록', 'ㅎㅇㄹ')).toBe(true);
    });

    it('should handle spaces in query', () => {
      expect(matchesChosung('회의록', 'ㅎ ㅇ ㄹ')).toBe(true);
    });

    it('should return false for empty query', () => {
      expect(matchesChosung('회의록', '')).toBe(false);
      expect(matchesChosung('회의록', '   ')).toBe(false);
    });

    it('should match double consonants correctly', () => {
      expect(matchesChosung('김치찌개', 'ㄱㅊㅉㄱ')).toBe(true);
    });
  });
});
