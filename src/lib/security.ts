import type { SecuritySettings } from '../types';
import {
  hashPinWithPBKDF2,
  generateRandomString,
  secureCompare,
} from './cryptoUtils';

const MAX_ATTEMPTS = 5; // 강화된 보안: 10회에서 5회로 감소
const PBKDF2_ITERATIONS = 100000; // PBKDF2 반복 횟수

export function generateSalt(): string {
  return generateRandomString(32); // 16에서 32 바이트로 증가
}

/**
 * PIN을 PBKDF2로 해싱 (더 보안적)
 * @deprecated hashPin 대신 사용
 */
export async function hashPin(pin: string, salt: string): Promise<string> {
  // 이전 코드와 호환성을 위해 유지하지만, hashPinSecure 사용 권장
  return hashPinWithPBKDF2(pin, salt, PBKDF2_ITERATIONS);
}

/**
 * PIN을 PBKDF2로 안전하게 해싱
 */
export async function hashPinSecure(
  pin: string,
  salt: string,
  iterations: number = PBKDF2_ITERATIONS
): Promise<string> {
  // PIN 검증
  if (!pin || pin.length < 4) {
    throw new Error('PIN must be at least 4 characters');
  }
  if (pin.length > 20) {
    throw new Error('PIN must be at most 20 characters');
  }

  return hashPinWithPBKDF2(pin, salt, iterations);
}

/**
 * PIN 강도 검사
 */
export function validatePinStrength(pin: string): {
  valid: boolean;
  score: number; // 0-100
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (!pin) {
    return { valid: false, score: 0, feedback: ['PIN은 필수입니다'] };
  }

  // 길이 검사
  if (pin.length < 4) {
    feedback.push('PIN은 최소 4자 이상이어야 합니다');
  } else {
    score += 20;
  }

  if (pin.length >= 6) score += 10;
  if (pin.length >= 8) score += 10;

  // 문자 유형 검사
  const hasDigits = /\d/.test(pin);
  const hasLower = /[a-z]/.test(pin);
  const hasUpper = /[A-Z]/.test(pin);
  const hasSpecial = /[!@#$%^&*]/.test(pin);

  if (hasDigits) score += 15;
  if (hasLower) score += 15;
  if (hasUpper) score += 15;
  if (hasSpecial) score += 15;

  // 연속 문자 검사
  if (/(.)\1{2,}/.test(pin)) {
    feedback.push('같은 문자가 3개 이상 반복되지 않아야 합니다');
    score = Math.max(0, score - 20);
  }

  // 순차 숫자 검사
  if (/012|123|234|345|456|567|678|789|890/.test(pin)) {
    feedback.push('순차적인 숫자는 피해주세요');
    score = Math.max(0, score - 10);
  }

  const valid = pin.length >= 4 && !feedback.length;

  return {
    valid,
    score: Math.min(100, Math.max(0, score)),
    feedback,
  };
}

export function createSecuritySettings(
  pinHash: string | null,
  pinSalt: string | null,
  failedAttempts: number = 0,
  isEnabled: boolean = true
): SecuritySettings {
  return {
    id: 'main',
    pinHash,
    pinSalt,
    failedAttempts,
    isEnabled,
  };
}

export interface VerifyResult {
  valid: boolean;
  failedAttempts: number;
  shouldWipe: boolean;
  remainingAttempts: number;
}

/**
 * PIN 검증 (시간 기반 공격 방지)
 */
export async function verifyPin(
  pin: string,
  settings: SecuritySettings
): Promise<VerifyResult> {
  if (!settings.isEnabled || !settings.pinHash || !settings.pinSalt) {
    return {
      valid: true,
      failedAttempts: 0,
      shouldWipe: false,
      remainingAttempts: MAX_ATTEMPTS,
    };
  }

  try {
    const hash = await hashPinSecure(pin, settings.pinSalt);

    // 시간 기반 공격 방지: 항상 동일한 시간 소요
    // 실제로는 timing attack은 PBKDF2의 반복으로 인해 충분히 완화됨
    const isValid = secureCompare(hash, settings.pinHash);

    if (isValid) {
      return {
        valid: true,
        failedAttempts: 0,
        shouldWipe: false,
        remainingAttempts: MAX_ATTEMPTS,
      };
    }

    const newFailedAttempts = settings.failedAttempts + 1;
    const shouldWipe = newFailedAttempts >= MAX_ATTEMPTS;
    const remainingAttempts = MAX_ATTEMPTS - newFailedAttempts;

    return {
      valid: false,
      failedAttempts: newFailedAttempts,
      shouldWipe,
      remainingAttempts: Math.max(0, remainingAttempts),
    };
  } catch (error) {
    console.error('Error verifying PIN:', error);
    return {
      valid: false,
      failedAttempts: settings.failedAttempts + 1,
      shouldWipe: settings.failedAttempts + 1 >= MAX_ATTEMPTS,
      remainingAttempts: MAX_ATTEMPTS - settings.failedAttempts - 1,
    };
  }
}
