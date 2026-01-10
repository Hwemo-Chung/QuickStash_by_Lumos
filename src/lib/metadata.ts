export interface Metadata {
  title?: string;
  description?: string;
  thumbnail?: string;
}

interface OEmbedResponse {
  title?: string;
  description?: string;
  thumbnail_url?: string;
  author_name?: string;
}

const OEMBED_ENDPOINTS: Record<string, string> = {
  youtube: 'https://noembed.com/embed?url=',
  vimeo: 'https://noembed.com/embed?url=',
  twitter: 'https://noembed.com/embed?url=',
  spotify: 'https://noembed.com/embed?url=',
  soundcloud: 'https://noembed.com/embed?url=',
  tiktok: 'https://noembed.com/embed?url=',
};

/**
 * SSRF 공격 방지: 사설 IP 범위 확인
 */
function isPrivateIP(hostname: string): boolean {
  // IPv4 사설 범위
  const ipv4Patterns = [
    /^localhost$/i,
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[01])\./,
    /^192\.168\./,
    /^169\.254\./, // 링크-로컬 주소
    /^224\.0\.0\./, // 멀티캐스트
  ];

  // IPv6 사설 범위
  const ipv6Patterns = [
    /^::1$/i, // loopback
    /^fc00:/i, // ULA
    /^fd00:/i, // ULA
    /^fe80:/i, // 링크-로컬
    /^ff00:/i, // 멀티캐스트
  ];

  const allPatterns = [...ipv4Patterns, ...ipv6Patterns];
  return allPatterns.some(pattern => pattern.test(hostname));
}

function detectProvider(url: string): string | null {
  const patterns: Record<string, RegExp> = {
    youtube: /(?:youtube\.com|youtu\.be)/i,
    vimeo: /vimeo\.com/i,
    twitter: /(?:twitter\.com|x\.com)/i,
    spotify: /spotify\.com/i,
    soundcloud: /soundcloud\.com/i,
    tiktok: /tiktok\.com/i,
  };

  for (const [provider, pattern] of Object.entries(patterns)) {
    if (pattern.test(url)) {
      return provider;
    }
  }
  return null;
}

function isValidUrl(content: string): boolean {
  try {
    const trimmed = content.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return false;
    }
    new URL(trimmed);
    return true;
  } catch {
    return false;
  }
}

function extractUrlFromContent(content: string): string | null {
  const urlMatch = content.match(/https?:\/\/[^\s]+/);
  return urlMatch ? urlMatch[0] : null;
}

export async function fetchMetadata(content: string): Promise<Metadata | null> {
  const url = extractUrlFromContent(content);
  if (!url || !isValidUrl(url)) {
    return null;
  }

  try {
    const urlObj = new URL(url);

    // SSRF 방지: 사설 IP 차단
    if (isPrivateIP(urlObj.hostname)) {
      console.warn('Security: Private IP access denied:', urlObj.hostname);
      return null;
    }

    // SSRF 방지: 파일 프로토콜 차단
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      console.warn('Security: Invalid protocol:', urlObj.protocol);
      return null;
    }

    const provider = detectProvider(url);
    if (!provider) {
      return null;
    }

    const endpoint = OEMBED_ENDPOINTS[provider];
    if (!endpoint) {
      return null;
    }

    const response = await fetch(`${endpoint}${encodeURIComponent(url)}`, {
      signal: AbortSignal.timeout(5000),
      mode: 'cors',
      credentials: 'omit', // 민감한 요청이 아니므로 credentials 제외
    });

    if (!response.ok) {
      return null;
    }

    const data: OEmbedResponse = await response.json();

    return {
      title: data.title || data.author_name,
      description: data.description,
      thumbnail: data.thumbnail_url,
    };
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.warn('Metadata fetch failed (possible CORS/network issue)');
    }
    return null;
  }
}

export function getYouTubeThumbnail(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`;
    }
  }
  return null;
}
