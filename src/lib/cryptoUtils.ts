/**
 * 보안 유틸리티 - 암호화, 해싱, 데이터 보호
 */

/**
 * PBKDF2를 사용한 PIN 해싱
 */
export async function hashPinWithPBKDF2(
  pin: string,
  salt: string,
  iterations: number = 100000
): Promise<string> {
  const encoder = new TextEncoder();
  const pinData = encoder.encode(pin);
  const saltData = encoder.encode(salt);

  const baseKey = await crypto.subtle.importKey(
    'raw',
    pinData,
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltData,
      iterations,
      hash: 'SHA-256',
    },
    baseKey,
    256 // 32 bytes
  );

  const hashArray = Array.from(new Uint8Array(derivedBits));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 암호화 키 생성
 */
export async function generateEncryptionKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * 데이터 암호화 (AES-GCM)
 */
export async function encryptData(
  data: string,
  key: CryptoKey
): Promise<{ ciphertext: string; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    dataBuffer
  );

  const ciphertext = Array.from(new Uint8Array(encryptedBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  const ivString = Array.from(iv)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return { ciphertext, iv: ivString };
}

/**
 * 데이터 복호화 (AES-GCM)
 */
export async function decryptData(
  ciphertext: string,
  iv: string,
  key: CryptoKey
): Promise<string> {
  const ciphertextArray = new Uint8Array(
    ciphertext.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
  );
  const ivArray = new Uint8Array(
    iv.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
  );

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivArray },
    key,
    ciphertextArray
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

/**
 * 암호화 키를 JSON 형식으로 내보내기 (저장용)
 */
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('jwk', key);
  return JSON.stringify(exported);
}

/**
 * JSON 형식의 키를 CryptoKey로 가져오기
 */
export async function importKey(keyJson: string): Promise<CryptoKey> {
  const keyObj = JSON.parse(keyJson);
  return crypto.subtle.importKey(
    'jwk',
    keyObj,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * 마스터 키 생성 (PIN 기반)
 */
export async function deriveMasterKey(pin: string, salt: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const pinData = encoder.encode(pin);
  const saltData = encoder.encode(salt);

  const baseKey = await crypto.subtle.importKey(
    'raw',
    pinData,
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltData,
      iterations: 100000,
      hash: 'SHA-256',
    },
    baseKey,
    256
  );

  return crypto.subtle.importKey(
    'raw',
    derivedBits,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * 난수 생성 (salt, nonce 등)
 */
export function generateRandomString(length: number = 16): string {
  const array = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * 보안 비교 (timing attack 방지)
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
