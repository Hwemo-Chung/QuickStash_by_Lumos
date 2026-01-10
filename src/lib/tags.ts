const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
  'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'this', 'that',
  'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what',
  'which', 'who', 'when', 'where', 'why', 'how', 'all', 'each', 'every',
  'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'not',
  'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'also',
  'over', 'after', 'before', 'under', 'between', 'out', 'through',
]);

const URL_PATTERN = /https?:\/\/([^/\s]+)/;

export function extractTags(text: string, maxTags: number = 5): string[] {
  if (!text.trim()) {
    return [];
  }

  const tags: string[] = [];
  const seen = new Set<string>();

  const urlMatch = text.match(URL_PATTERN);
  if (urlMatch) {
    const domain = urlMatch[1].toLowerCase();
    if (!seen.has(domain)) {
      tags.push(domain);
      seen.add(domain);
    }
  }

  const words = text
    .toLowerCase()
    .replace(/https?:\/\/[^\s]+/g, '')
    .replace(/[^\w\s\u3131-\uD79D]/g, ' ')
    .split(/\s+/)
    .filter(word => {
      if (word.length < 3 || word.length > 20) return false;
      if (STOP_WORDS.has(word)) return false;
      if (/^\d+$/.test(word)) return false;
      return true;
    });

  const freq: Record<string, number> = {};
  for (const word of words) {
    freq[word] = (freq[word] || 0) + 1;
  }

  const sorted = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word);

  for (const word of sorted) {
    if (tags.length >= maxTags) break;
    if (!seen.has(word)) {
      tags.push(word);
      seen.add(word);
    }
  }

  return tags;
}
