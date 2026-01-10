import { describe, it, expect } from 'vitest';
import { hashPin, generateSalt, verifyPin, createSecuritySettings } from '../lib/security';

describe('security', () => {
  describe('generateSalt', () => {
    it('should generate a 32-character hex string', () => {
      const salt = generateSalt();
      expect(salt.length).toBe(32);
      expect(/^[0-9a-f]+$/.test(salt)).toBe(true);
    });

    it('should generate unique salts', () => {
      const salt1 = generateSalt();
      const salt2 = generateSalt();
      expect(salt1).not.toBe(salt2);
    });
  });

  describe('hashPin', () => {
    it('should return a 64-character hex string (SHA-256)', async () => {
      const hash = await hashPin('1234', 'somesalt');
      expect(hash.length).toBe(64);
      expect(/^[0-9a-f]+$/.test(hash)).toBe(true);
    });

    it('should produce same hash for same pin and salt', async () => {
      const hash1 = await hashPin('1234', 'salt123');
      const hash2 = await hashPin('1234', 'salt123');
      expect(hash1).toBe(hash2);
    });

    it('should produce different hash for different salt', async () => {
      const hash1 = await hashPin('1234', 'salt1');
      const hash2 = await hashPin('1234', 'salt2');
      expect(hash1).not.toBe(hash2);
    });

    it('should produce different hash for different pin', async () => {
      const hash1 = await hashPin('1234', 'salt');
      const hash2 = await hashPin('5678', 'salt');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPin', () => {
    it('should return true for correct pin', async () => {
      const salt = generateSalt();
      const hash = await hashPin('1234', salt);
      const settings = createSecuritySettings(hash, salt);

      const result = await verifyPin('1234', settings);

      expect(result.valid).toBe(true);
      expect(result.failedAttempts).toBe(0);
    });

    it('should return false for incorrect pin', async () => {
      const salt = generateSalt();
      const hash = await hashPin('1234', salt);
      const settings = createSecuritySettings(hash, salt);

      const result = await verifyPin('0000', settings);

      expect(result.valid).toBe(false);
      expect(result.failedAttempts).toBe(1);
    });

    it('should increment failed attempts on wrong pin', async () => {
      const salt = generateSalt();
      const hash = await hashPin('1234', salt);
      let settings = createSecuritySettings(hash, salt, 5);

      const result = await verifyPin('0000', settings);

      expect(result.failedAttempts).toBe(6);
    });

    it('should reset failed attempts on correct pin', async () => {
      const salt = generateSalt();
      const hash = await hashPin('1234', salt);
      let settings = createSecuritySettings(hash, salt, 5);

      const result = await verifyPin('1234', settings);

      expect(result.failedAttempts).toBe(0);
    });

    it('should trigger wipe after 10 failed attempts', async () => {
      const salt = generateSalt();
      const hash = await hashPin('1234', salt);
      let settings = createSecuritySettings(hash, salt, 9);

      const result = await verifyPin('0000', settings);

      expect(result.valid).toBe(false);
      expect(result.shouldWipe).toBe(true);
    });

    it('should not wipe before 10 attempts', async () => {
      const salt = generateSalt();
      const hash = await hashPin('1234', salt);
      let settings = createSecuritySettings(hash, salt, 8);

      const result = await verifyPin('0000', settings);

      expect(result.shouldWipe).toBe(false);
    });

    it('should return valid true when security is disabled', async () => {
      const settings = createSecuritySettings(null, null, 0, false);

      const result = await verifyPin('anything', settings);

      expect(result.valid).toBe(true);
    });
  });

  describe('getRemainingAttempts', () => {
    it('should calculate remaining attempts correctly', async () => {
      const salt = generateSalt();
      const hash = await hashPin('1234', salt);
      const settings = createSecuritySettings(hash, salt, 7);

      const result = await verifyPin('0000', settings);

      expect(result.remainingAttempts).toBe(2);
    });
  });
});
