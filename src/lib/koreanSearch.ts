const HANGUL_START = 0xAC00;
const HANGUL_END = 0xD7A3;
const JUNGSUNG_COUNT = 21;
const JONGSUNG_COUNT = 28;

const CHOSUNG_LIST = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
];

function isHangulSyllable(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= HANGUL_START && code <= HANGUL_END;
}

function isChosung(char: string): boolean {
  return CHOSUNG_LIST.includes(char);
}

function getChosung(char: string): string {
  if (!isHangulSyllable(char)) return char;
  
  const code = char.charCodeAt(0);
  const chosungIndex = Math.floor((code - HANGUL_START) / (JUNGSUNG_COUNT * JONGSUNG_COUNT));
  return CHOSUNG_LIST[chosungIndex];
}

export function extractChosung(text: string): string {
  return [...text].map(char => getChosung(char)).join('');
}

export function isChosungOnly(text: string): boolean {
  return [...text].every(char => isChosung(char) || char === ' ');
}

export function matchesChosung(text: string, chosungQuery: string): boolean {
  if (!chosungQuery.trim()) return false;
  
  const textChosung = extractChosung(text);
  const queryClean = chosungQuery.replace(/\s+/g, '');
  
  return textChosung.includes(queryClean);
}
