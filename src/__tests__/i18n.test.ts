import { describe, it, expect, beforeEach } from 'vitest';
import {
  setLocale,
  getLocale,
  t,
  saveLocaleToStorage,
  initLocaleFromStorage,
  getDrawerLabel,
  type Locale,
} from '../i18n';

describe('i18n', () => {
  beforeEach(() => {
    setLocale('ko');
    localStorage.clear();
  });

  describe('setLocale / getLocale', () => {
    it('should default to Korean locale', () => {
      expect(getLocale()).toBe('ko');
    });

    it('should change locale when setLocale is called', () => {
      setLocale('en');
      expect(getLocale()).toBe('en');
    });

    it('should support all available locales', () => {
      const locales: Locale[] = ['ko', 'en', 'ja', 'es'];
      
      locales.forEach((locale) => {
        setLocale(locale);
        expect(getLocale()).toBe(locale);
      });
    });
  });

  describe('t() translations', () => {
    it('should return Korean translations when locale is ko', () => {
      setLocale('ko');
      const translations = t();
      
      expect(translations.drawers.all).toBe('전체');
      expect(translations.quickInput.placeholder).toBe('아무거나 붙여넣기...');
    });

    it('should return English translations when locale is en', () => {
      setLocale('en');
      const translations = t();
      
      expect(translations.drawers.all).toBe('All');
      expect(translations.quickInput.placeholder).toBe('Paste anything...');
    });

    it('should return Japanese translations when locale is ja', () => {
      setLocale('ja');
      const translations = t();
      
      expect(translations.drawers.all).toBe('すべて');
      expect(translations.quickInput.placeholder).toBe('何でも貼り付け...');
    });

    it('should return Spanish translations when locale is es', () => {
      setLocale('es');
      const translations = t();
      
      expect(translations.drawers.all).toBe('Todo');
      expect(translations.quickInput.placeholder).toBe('Pega cualquier cosa...');
    });
  });

  describe('getDrawerLabel', () => {
    it('should return translated drawer label for current locale', () => {
      setLocale('ko');
      expect(getDrawerLabel('contacts')).toBe('연락처');
      
      setLocale('en');
      expect(getDrawerLabel('contacts')).toBe('Contacts');
    });

    it('should return drawer key if translation not found', () => {
      expect(getDrawerLabel('unknown-drawer')).toBe('unknown-drawer');
    });
  });

  describe('localStorage persistence', () => {
    it('should save locale to localStorage', () => {
      saveLocaleToStorage('ja');
      expect(localStorage.getItem('quickstash-locale')).toBe('ja');
    });

    it('should initialize locale from localStorage', () => {
      localStorage.setItem('quickstash-locale', 'es');
      
      const locale = initLocaleFromStorage();
      
      expect(locale).toBe('es');
      expect(getLocale()).toBe('es');
    });

    it('should keep default locale if localStorage has invalid value', () => {
      localStorage.setItem('quickstash-locale', 'invalid');
      
      const locale = initLocaleFromStorage();
      
      expect(locale).toBe('ko');
    });

    it('should keep default locale if localStorage is empty', () => {
      const locale = initLocaleFromStorage();
      
      expect(locale).toBe('ko');
    });
  });
});
