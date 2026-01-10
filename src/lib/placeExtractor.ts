export interface PlaceInfo {
  name?: string;
  coordinates?: { lat: number; lng: number };
  source: 'google' | 'naver' | 'kakao' | 'apple' | 'unknown';
  isMapLink: boolean;
}

const MAP_URL_PATTERNS = [
  { pattern: /maps\.app\.goo\.gl\//i, source: 'google' as const },
  { pattern: /google\.[^/]+\/maps/i, source: 'google' as const },
  { pattern: /goo\.gl\/maps/i, source: 'google' as const },
  { pattern: /map\.naver\.com/i, source: 'naver' as const },
  { pattern: /naver\.me\//i, source: 'naver' as const },
  { pattern: /map\.kakao\.com/i, source: 'kakao' as const },
  { pattern: /kko\.to\//i, source: 'kakao' as const },
  { pattern: /maps\.apple\.com/i, source: 'apple' as const },
];

export function isMapUrl(url: string): { isMap: boolean; source: PlaceInfo['source'] } {
  for (const { pattern, source } of MAP_URL_PATTERNS) {
    if (pattern.test(url)) {
      return { isMap: true, source };
    }
  }
  return { isMap: false, source: 'unknown' };
}

export function extractPlaceFromUrl(url: string): PlaceInfo | null {
  const { isMap, source } = isMapUrl(url);
  
  if (!isMap) return null;

  // Google Maps: /maps/place/Place+Name/@lat,lng
  const googlePlaceMatch = url.match(/google\.[^/]+\/maps\/place\/([^/@]+)/);
  if (googlePlaceMatch) {
    const name = decodeURIComponent(googlePlaceMatch[1].replace(/\+/g, ' '));
    const coordMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    return {
      name,
      coordinates: coordMatch ? { lat: parseFloat(coordMatch[1]), lng: parseFloat(coordMatch[2]) } : undefined,
      source: 'google',
      isMapLink: true,
    };
  }

  // Google Maps: coordinates only
  const googleCoordsOnly = url.match(/google\.[^/]+\/maps.*@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (googleCoordsOnly) {
    return {
      coordinates: { lat: parseFloat(googleCoordsOnly[1]), lng: parseFloat(googleCoordsOnly[2]) },
      source: 'google',
      isMapLink: true,
    };
  }

  // Naver Map: /search/장소명
  const naverSearchMatch = url.match(/map\.naver\.com\/v5\/search\/([^?&#]+)/);
  if (naverSearchMatch) {
    return {
      name: decodeURIComponent(naverSearchMatch[1]),
      source: 'naver',
      isMapLink: true,
    };
  }

  // Kakao Map: /link/search/장소명
  const kakaoSearchMatch = url.match(/map\.kakao\.com\/link\/search\/([^?&#]+)/);
  if (kakaoSearchMatch) {
    return {
      name: decodeURIComponent(kakaoSearchMatch[1]),
      source: 'kakao',
      isMapLink: true,
    };
  }

  const kakaoMapMatch = url.match(/map\.kakao\.com\/link\/map\/([^,]+)/);
  if (kakaoMapMatch) {
    return {
      name: decodeURIComponent(kakaoMapMatch[1]),
      source: 'kakao',
      isMapLink: true,
    };
  }

  // Apple Maps: ?q=Place+Name
  const appleMapsMatch = url.match(/maps\.apple\.com.*[?&](?:q|address)=([^&#]+)/);
  if (appleMapsMatch) {
    return {
      name: decodeURIComponent(appleMapsMatch[1].replace(/\+/g, ' ')),
      source: 'apple',
      isMapLink: true,
    };
  }

  // Apple Maps: ?ll=lat,lng (coordinates only)
  const appleCoordMatch = url.match(/maps\.apple\.com.*[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (appleCoordMatch) {
    return {
      coordinates: { lat: parseFloat(appleCoordMatch[1]), lng: parseFloat(appleCoordMatch[2]) },
      source: 'apple',
      isMapLink: true,
    };
  }

  // Short URLs - just mark as map link, user enters name
  return {
    source,
    isMapLink: true,
  };
}

export function formatPlaceTitle(info: PlaceInfo): string {
  if (info.name) {
    return info.name;
  }
  if (info.coordinates) {
    return `📍 ${info.coordinates.lat.toFixed(4)}, ${info.coordinates.lng.toFixed(4)}`;
  }
  return '';
}

export function getMapSourceEmoji(source: PlaceInfo['source']): string {
  switch (source) {
    case 'google': return '🗺️';
    case 'naver': return '🇰🇷';
    case 'kakao': return '🟡';
    case 'apple': return '🍎';
    default: return '📍';
  }
}
