const NETFLIX_GENRES: Record<string, string> = {
  '1365': 'action',
  '7424': 'anime',
  '6548': 'comedy',
  '6839': 'documentary',
  '5763': 'drama',
  '8711': 'horror',
  '1701': 'music',
  '8883': 'romance',
  '1492': 'scifi',
  '8933': 'thriller',
  '783': 'kids',
  '6721': 'fantasy',
  '31574': 'classic',
  '10673': 'sports',
  '2243108': 'kpop',
};

export type GenreTag = string;

export function extractGenreFromUrl(url: string): GenreTag | null {
  const netflixMatch = url.match(/netflix\.com\/browse\/genre\/(\d+)/);
  if (netflixMatch) {
    const code = netflixMatch[1];
    return NETFLIX_GENRES[code] || null;
  }

  if (/music\.youtube\.com/i.test(url)) return 'music';
  if (/gaming\.youtube\.com/i.test(url)) return 'gaming';

  return null;
}

export function getAvailableGenres(): string[] {
  return [
    'action', 'anime', 'comedy', 'documentary', 'drama',
    'horror', 'music', 'romance', 'scifi', 'thriller',
    'kids', 'fantasy', 'classic', 'sports', 'gaming',
    'kpop', 'jpop', 'hiphop', 'jazz', 'rock',
  ];
}
