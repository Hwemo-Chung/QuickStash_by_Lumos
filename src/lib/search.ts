import type { StashItem, DrawerType } from '../types';
import { getAllTranslations, type Locale } from '../i18n';
import { isChosungOnly, matchesChosung } from './koreanSearch';

export interface HighlightPosition {
  start: number;
  end: number;
}

export interface SearchHighlights {
  content: HighlightPosition[];
  title: HighlightPosition[];
}

export interface SearchResult {
  item: StashItem;
  score: number;
  matchType: 'category' | 'title' | 'content' | 'tag';
  highlights: SearchHighlights;
}

const DRAWER_ALIASES: Record<DrawerType, string[]> = {
  contacts: ['contact', 'phone', 'tel', '전화', '번호', '사람'],
  money: ['finance', 'bank', 'payment', '돈', '계좌', '송금', '입금', '출금'],
  watch: ['video', 'movie', 'youtube', 'netflix', '동영상', '유튜브', '넷플릭스', '영화'],
  read: ['article', 'blog', 'news', '기사', '블로그', '뉴스', '글'],
  dev: ['code', 'github', 'programming', '코드', '깃허브', '프로그래밍'],
  schedule: ['event', 'calendar', 'meeting', '약속', '미팅', '캘린더', '예약'],
  recipes: ['recipe', 'cook', 'food', '요리', '음식', '조리법'],
  places: ['place', 'location', 'map', '위치', '지도', '주소'],
  ideas: ['idea', 'thought', '생각', '떠오른'],
  notes: ['note', 'memo', '노트', '필기'],
  shopping: ['shop', 'buy', 'product', '구매', '상품', '물건'],
  inbox: ['etc', 'other', '기타', '나머지'],
};

function getDrawerLabelsForAllLocales(): Record<DrawerType, string[]> {
  const locales: Locale[] = ['ko', 'en', 'ja', 'es'];
  const allTranslations = getAllTranslations();
  const result: Record<DrawerType, string[]> = {
    contacts: [], money: [], watch: [], read: [], dev: [], schedule: [],
    recipes: [], places: [], ideas: [], notes: [], shopping: [], inbox: [],
  };

  for (const locale of locales) {
    const translations = allTranslations[locale];
    for (const [drawer, label] of Object.entries(translations.drawers)) {
      if (drawer !== 'all' && drawer in result) {
        result[drawer as DrawerType].push(label.toLowerCase());
      }
    }
  }

  return result;
}

function matchesDrawer(query: string, drawer: DrawerType): boolean {
  const queryLower = query.toLowerCase();
  const labels = getDrawerLabelsForAllLocales();
  const aliases = DRAWER_ALIASES[drawer] || [];
  
  const allTerms = [...labels[drawer], ...aliases, drawer];
  
  return allTerms.some(term => 
    term.toLowerCase().includes(queryLower) || queryLower.includes(term.toLowerCase())
  );
}

function findHighlightPositions(text: string, query: string): HighlightPosition[] {
  if (!query.trim()) return [];
  
  // 입력 검증: 길이 제한
  const MAX_QUERY_LENGTH = 500;
  const MAX_MATCHES = 100;
  const trimmedQuery = query.trim().substring(0, MAX_QUERY_LENGTH);
  
  const positions: HighlightPosition[] = [];
  const textLower = text.toLowerCase();
  const queryLower = trimmedQuery.toLowerCase();
  
  // 특수 문자 이스케이프 (ReDoS 방지) - 향후 정규식 사용 시를 위해 준비
  void (queryLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  
  let matchCount = 0;
  
  // 정확한 쿼리 매칭
  if (textLower.includes(queryLower)) {
    let startIndex = 0;
    let foundIndex = textLower.indexOf(queryLower, startIndex);
    
    while (foundIndex !== -1 && matchCount < MAX_MATCHES) {
      positions.push({ start: foundIndex, end: foundIndex + trimmedQuery.length });
      startIndex = foundIndex + 1;
      foundIndex = textLower.indexOf(queryLower, startIndex);
      matchCount++;
    }
  } else {
    // 단어 단위 매칭
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 0);
    
    for (const word of queryWords) {
      if (matchCount >= MAX_MATCHES) break;
      
      let startIndex = 0;
      let foundIndex = textLower.indexOf(word, startIndex);
      
      while (foundIndex !== -1 && matchCount < MAX_MATCHES) {
        positions.push({ start: foundIndex, end: foundIndex + word.length });
        startIndex = foundIndex + 1;
        foundIndex = textLower.indexOf(word, startIndex);
        matchCount++;
      }
    }
  }
  
  return positions.sort((a, b) => a.start - b.start);
}

export function search(query: string, items: StashItem[]): SearchResult[] {
  if (!query.trim() || items.length === 0) {
    return [];
  }

  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 0);
  const isChosungSearch = isChosungOnly(query);

  const results: SearchResult[] = [];

  for (const item of items) {
    let score = 0;
    let matchType: SearchResult['matchType'] = 'content';
    
    const contentLower = item.content.toLowerCase();
    const titleLower = (item.title || '').toLowerCase();

    if (matchesDrawer(queryLower, item.drawer)) {
      score += 200;
      matchType = 'category';
    }

    if (isChosungSearch) {
      if (item.title && matchesChosung(item.title, query)) {
        score += 160;
        if (matchType !== 'category') matchType = 'title';
      }
      if (matchesChosung(item.content, query)) {
        score += 80;
        if (matchType !== 'category' && matchType !== 'title') matchType = 'content';
      }
    }

    if (titleLower && titleLower.includes(queryLower)) {
      score += 180;
      if (matchType !== 'category') matchType = 'title';
    } else if (titleLower) {
      for (const word of queryWords) {
        if (titleLower.includes(word)) {
          score += 40;
          if (matchType !== 'category') matchType = 'title';
        }
      }
    }

    if (contentLower.includes(queryLower)) {
      score += 100;
      if (matchType !== 'category' && matchType !== 'title') matchType = 'content';
    } else {
      for (const word of queryWords) {
        if (contentLower.includes(word)) {
          score += 20;
        }
      }
    }

    for (const tag of item.tags) {
      const tagLower = tag.toLowerCase();
      for (const word of queryWords) {
        if (tagLower.includes(word)) {
          score += 150;
          if (matchType !== 'category') matchType = 'tag';
        }
      }
    }

    score += Math.min(item.accessCount, 10);

    if (score > 0) {
      const highlights: SearchHighlights = {
        content: findHighlightPositions(item.content, query),
        title: findHighlightPositions(item.title || '', query),
      };
      results.push({ item, score, matchType, highlights });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

export type DateRange = 'all' | 'today' | 'week' | 'month' | 'custom';
export type SortOption = 'relevance' | 'newest' | 'oldest' | 'mostAccessed';

export interface SearchFilters {
  dateRange?: DateRange;
  startDate?: number;
  endDate?: number;
}

function filterByDate(items: StashItem[], filters: SearchFilters): StashItem[] {
  const { dateRange, startDate, endDate } = filters;
  
  if (!dateRange || dateRange === 'all') {
    return items;
  }

  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  let filterStart: number;
  let filterEnd: number = now;

  switch (dateRange) {
    case 'today': {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      filterStart = startOfDay.getTime();
      break;
    }
    case 'week': {
      filterStart = now - 7 * oneDay;
      break;
    }
    case 'month': {
      filterStart = now - 30 * oneDay;
      break;
    }
    case 'custom': {
      filterStart = startDate ?? 0;
      filterEnd = endDate ?? now;
      break;
    }
    default:
      return items;
  }

  return items.filter(item => 
    item.createdAt >= filterStart && item.createdAt <= filterEnd
  );
}

function sortResults(results: SearchResult[], sortOption: SortOption): SearchResult[] {
  const sorted = [...results];

  switch (sortOption) {
    case 'relevance':
      return sorted.sort((a, b) => b.score - a.score);
    case 'newest':
      return sorted.sort((a, b) => b.item.createdAt - a.item.createdAt);
    case 'oldest':
      return sorted.sort((a, b) => a.item.createdAt - b.item.createdAt);
    case 'mostAccessed':
      return sorted.sort((a, b) => b.item.accessCount - a.item.accessCount);
    default:
      return sorted;
  }
}

export function searchWithFilters(
  query: string,
  items: StashItem[],
  filters: SearchFilters = {},
  sortOption: SortOption = 'newest'
): SearchResult[] {
  const filteredItems = filterByDate(items, filters);
  const searchResults = search(query, filteredItems);
  
  return sortOption === 'relevance' 
    ? searchResults 
    : sortResults(searchResults, sortOption);
}
