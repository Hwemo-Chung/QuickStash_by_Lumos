import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateDatePrefix, shouldAutoPrefix } from '../lib/datePrefix';

describe('datePrefix', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-09T14:30:00'));
  });

  describe('generateDatePrefix', () => {
    it('should return date prefix for money drawer', () => {
      expect(generateDatePrefix('money')).toBe('[01/09] ');
    });

    it('should return empty string for ideas drawer', () => {
      expect(generateDatePrefix('ideas')).toBe('');
    });

    it('should return datetime prefix for schedule drawer', () => {
      expect(generateDatePrefix('schedule')).toBe('[01/09 14:30] ');
    });

    it('should return empty string for contacts drawer', () => {
      expect(generateDatePrefix('contacts')).toBe('');
    });

    it('should return empty string for recipes drawer', () => {
      expect(generateDatePrefix('recipes')).toBe('');
    });

    it('should return empty string for watch drawer', () => {
      expect(generateDatePrefix('watch')).toBe('');
    });
  });

  describe('shouldAutoPrefix', () => {
    it('should return true for money drawer', () => {
      expect(shouldAutoPrefix('money')).toBe(true);
    });

    it('should return false for ideas drawer', () => {
      expect(shouldAutoPrefix('ideas')).toBe(false);
    });

    it('should return true for schedule drawer', () => {
      expect(shouldAutoPrefix('schedule')).toBe(true);
    });

    it('should return false for contacts drawer', () => {
      expect(shouldAutoPrefix('contacts')).toBe(false);
    });

    it('should return false for recipes drawer', () => {
      expect(shouldAutoPrefix('recipes')).toBe(false);
    });

    it('should return false for notes drawer', () => {
      expect(shouldAutoPrefix('notes')).toBe(false);
    });
  });
});
