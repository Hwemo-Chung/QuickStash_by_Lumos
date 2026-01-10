import { describe, it, expect } from 'vitest';
import { search, searchWithFilters, type SearchFilters, type SortOption } from '../lib/search';
import type { StashItem } from '../types';

const createItem = (overrides: Partial<StashItem>): StashItem => ({
  id: 'test-id',
  content: 'test content',
  drawer: 'inbox',
  tags: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
  accessCount: 0,
  ...overrides,
});

describe('search', () => {
  describe('exact phrase matching', () => {
    it('should find item with exact phrase match', () => {
      const items = [
        createItem({ id: '1', content: 'React hooks tutorial' }),
        createItem({ id: '2', content: 'Vue composition API' }),
      ];

      const results = search('React hooks', items);

      expect(results.length).toBe(1);
      expect(results[0].item.id).toBe('1');
    });

    it('should be case insensitive', () => {
      const items = [
        createItem({ id: '1', content: 'REACT HOOKS tutorial' }),
      ];

      const results = search('react hooks', items);

      expect(results.length).toBe(1);
    });
  });

  describe('word matching', () => {
    it('should find items matching individual words', () => {
      const items = [
        createItem({ id: '1', content: 'Learn React today' }),
        createItem({ id: '2', content: 'React is awesome' }),
        createItem({ id: '3', content: 'Vue framework' }),
      ];

      const results = search('React', items);

      expect(results.length).toBe(2);
    });

    it('should rank exact phrase match higher than word match', () => {
      const items = [
        createItem({ id: '1', content: 'React is a library' }),
        createItem({ id: '2', content: 'React hooks guide' }),
      ];

      const results = search('React hooks', items);

      expect(results[0].item.id).toBe('2');
    });
  });

  describe('tag matching', () => {
    it('should find items by tag', () => {
      const items = [
        createItem({ id: '1', content: 'Some content', tags: ['javascript', 'react'] }),
        createItem({ id: '2', content: 'Other content', tags: ['python'] }),
      ];

      const results = search('react', items);

      expect(results.length).toBe(1);
      expect(results[0].item.id).toBe('1');
    });

    it('should rank tag matches highly', () => {
      const items = [
        createItem({ id: '1', content: 'react mentioned here', tags: [] }),
        createItem({ id: '2', content: 'something else', tags: ['react'] }),
      ];

      const results = search('react', items);

      expect(results[0].item.id).toBe('2');
    });
  });

  describe('title matching', () => {
    it('should find items by title', () => {
      const items = [
        createItem({ id: '1', content: 'http://example.com', title: '프로젝트 회의록' }),
        createItem({ id: '2', content: 'some other content', title: '점심 메뉴' }),
      ];

      const results = search('회의록', items);

      expect(results.length).toBe(1);
      expect(results[0].item.id).toBe('1');
    });

    it('should rank title match higher than content match', () => {
      const items = [
        createItem({ id: '1', content: 'This mentions 회의록 in content' }),
        createItem({ id: '2', content: 'Some link', title: '회의록' }),
      ];

      const results = search('회의록', items);

      expect(results[0].item.id).toBe('2');
    });
  });

  describe('category/drawer matching', () => {
    it('should find all items in contacts drawer when searching 연락처', () => {
      const items = [
        createItem({ id: '1', content: '010-1234-5678', drawer: 'contacts' }),
        createItem({ id: '2', content: '02-123-4567', drawer: 'contacts' }),
        createItem({ id: '3', content: 'random note', drawer: 'notes' }),
      ];

      const results = search('연락처', items);

      expect(results.length).toBe(2);
      expect(results.every(r => r.item.drawer === 'contacts')).toBe(true);
    });

    it('should find items in money drawer when searching 금융', () => {
      const items = [
        createItem({ id: '1', content: '110-123-456789', drawer: 'money' }),
        createItem({ id: '2', content: 'random note', drawer: 'notes' }),
      ];

      const results = search('금융', items);

      expect(results.length).toBe(1);
      expect(results[0].item.drawer).toBe('money');
    });

    it('should find items using English drawer name', () => {
      const items = [
        createItem({ id: '1', content: '010-1234-5678', drawer: 'contacts' }),
        createItem({ id: '2', content: 'note', drawer: 'notes' }),
      ];

      const results = search('contacts', items);

      expect(results.length).toBe(1);
      expect(results[0].item.drawer).toBe('contacts');
    });

    it('should find items using Japanese drawer label', () => {
      const items = [
        createItem({ id: '1', content: '010-1234-5678', drawer: 'contacts' }),
        createItem({ id: '2', content: 'note', drawer: 'notes' }),
      ];

      const results = search('連絡先', items);

      expect(results.length).toBe(1);
      expect(results[0].item.drawer).toBe('contacts');
    });

    it('should find items using drawer alias', () => {
      const items = [
        createItem({ id: '1', content: '010-1234-5678', drawer: 'contacts' }),
        createItem({ id: '2', content: 'note', drawer: 'notes' }),
      ];

      const results = search('전화', items);

      expect(results.length).toBe(1);
      expect(results[0].item.drawer).toBe('contacts');
    });

    it('should rank category match higher than content match', () => {
      const items = [
        createItem({ id: '1', content: '연락처 정보 메모', drawer: 'notes' }),
        createItem({ id: '2', content: '010-1234-5678', drawer: 'contacts' }),
      ];

      const results = search('연락처', items);

      expect(results[0].item.id).toBe('2');
      expect(results[0].matchType).toBe('category');
    });
  });

  describe('scoring and ranking', () => {
    it('should return results sorted by score descending', () => {
      const items = [
        createItem({ id: '1', content: 'react' }),
        createItem({ id: '2', content: 'react react react', tags: ['react'] }),
        createItem({ id: '3', content: 'react tutorial' }),
      ];

      const results = search('react', items);

      expect(results[0].item.id).toBe('2');
    });

    it('should boost frequently accessed items', () => {
      const items = [
        createItem({ id: '1', content: 'react docs', accessCount: 0 }),
        createItem({ id: '2', content: 'react docs', accessCount: 10 }),
      ];

      const results = search('react docs', items);

      expect(results[0].item.id).toBe('2');
    });
  });

  describe('empty and edge cases', () => {
    it('should return empty array for no matches', () => {
      const items = [
        createItem({ id: '1', content: 'Hello world' }),
      ];

      const results = search('xyz123', items);

      expect(results.length).toBe(0);
    });

    it('should handle empty query', () => {
      const items = [
        createItem({ id: '1', content: 'Hello world' }),
      ];

      const results = search('', items);

      expect(results.length).toBe(0);
    });

    it('should handle empty items array', () => {
      const results = search('test', []);

      expect(results.length).toBe(0);
    });
  });

  describe('matchType field', () => {
    it('should set matchType to category when matching drawer', () => {
      const items = [
        createItem({ id: '1', content: '010-1234-5678', drawer: 'contacts' }),
      ];

      const results = search('연락처', items);

      expect(results[0].matchType).toBe('category');
    });

    it('should set matchType to title when matching title', () => {
      const items = [
        createItem({ id: '1', content: 'link', title: '중요한 메모' }),
      ];

      const results = search('중요한', items);

      expect(results[0].matchType).toBe('title');
    });

    it('should set matchType to tag when matching tag', () => {
      const items = [
        createItem({ id: '1', content: 'content', tags: ['important'] }),
      ];

      const results = search('important', items);

      expect(results[0].matchType).toBe('tag');
    });

    it('should set matchType to content when matching content only', () => {
      const items = [
        createItem({ id: '1', content: 'Hello world' }),
      ];

      const results = search('Hello', items);

      expect(results[0].matchType).toBe('content');
    });
  });

  describe('highlight positions', () => {
    it('should return highlight positions for content match', () => {
      const items = [
        createItem({ id: '1', content: 'Hello React world' }),
      ];

      const results = search('React', items);

      expect(results[0].highlights).toBeDefined();
      expect(results[0].highlights?.content).toBeDefined();
      expect(results[0].highlights?.content?.length).toBeGreaterThan(0);
      expect(results[0].highlights?.content?.[0]).toEqual({ start: 6, end: 11 });
    });

    it('should return highlight positions for title match', () => {
      const items = [
        createItem({ id: '1', content: 'link', title: '프로젝트 회의록' }),
      ];

      const results = search('회의록', items);

      expect(results[0].highlights?.title).toBeDefined();
      expect(results[0].highlights?.title?.length).toBeGreaterThan(0);
    });

    it('should return multiple highlight positions for multiple matches', () => {
      const items = [
        createItem({ id: '1', content: 'React is great. I love React!' }),
      ];

      const results = search('React', items);

      expect(results[0].highlights?.content?.length).toBe(2);
    });

    it('should handle case insensitive highlights', () => {
      const items = [
        createItem({ id: '1', content: 'REACT framework' }),
      ];

      const results = search('react', items);

      expect(results[0].highlights?.content?.[0]).toEqual({ start: 0, end: 5 });
    });

    it('should return empty highlights array when no direct text match', () => {
      const items = [
        createItem({ id: '1', content: '010-1234-5678', drawer: 'contacts' }),
      ];

      const results = search('연락처', items);

      expect(results[0].highlights?.content).toEqual([]);
    });
  });
});

  describe('Korean consonant (초성) search', () => {
    it('should find items by Korean initial consonants', () => {
      const items = [
        createItem({ id: '1', content: '프로젝트 회의록', title: '회의록' }),
        createItem({ id: '2', content: '점심 메뉴 추천' }),
      ];

      const results = search('ㅎㅇㄹ', items);

      expect(results.length).toBe(1);
      expect(results[0].item.id).toBe('1');
    });

    it('should find items with mixed Korean consonants in content', () => {
      const items = [
        createItem({ id: '1', content: '김치찌개 레시피' }),
        createItem({ id: '2', content: '된장찌개 만들기' }),
      ];

      const results = search('ㄱㅊㅉㄱ', items);

      expect(results.length).toBe(1);
      expect(results[0].item.id).toBe('1');
    });

    it('should support partial consonant matching', () => {
      const items = [
        createItem({ id: '1', content: '안녕하세요' }),
        createItem({ id: '2', content: '안녕히가세요' }),
      ];

      const results = search('ㅇㄴ', items);

      expect(results.length).toBe(2);
    });

    it('should work with consonants in title', () => {
      const items = [
        createItem({ id: '1', content: 'link', title: '개발 노트' }),
        createItem({ id: '2', content: 'link', title: '디자인 노트' }),
      ];

      const results = search('ㄱㅂ', items);

      expect(results.length).toBe(1);
      expect(results[0].item.id).toBe('1');
    });
  });

describe('searchWithFilters', () => {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const oneWeek = 7 * oneDay;
  const oneMonth = 30 * oneDay;

  const createTestItems = () => [
    createItem({ id: '1', content: 'React tutorial', createdAt: now, accessCount: 5 }),
    createItem({ id: '2', content: 'React hooks guide', createdAt: now - 2 * oneDay, accessCount: 10 }),
    createItem({ id: '3', content: 'React patterns', createdAt: now - oneWeek - oneDay, accessCount: 3 }),
    createItem({ id: '4', content: 'React old docs', createdAt: now - oneMonth - oneDay, accessCount: 1 }),
  ];

  describe('date filtering', () => {
    it('should filter items by today', () => {
      const items = createTestItems();
      const filters: SearchFilters = { dateRange: 'today' };

      const results = searchWithFilters('React', items, filters);

      expect(results.length).toBe(1);
      expect(results[0].item.id).toBe('1');
    });

    it('should filter items by this week', () => {
      const items = createTestItems();
      const filters: SearchFilters = { dateRange: 'week' };

      const results = searchWithFilters('React', items, filters);

      expect(results.length).toBe(2);
      expect(results.map(r => r.item.id)).toContain('1');
      expect(results.map(r => r.item.id)).toContain('2');
    });

    it('should filter items by this month', () => {
      const items = createTestItems();
      const filters: SearchFilters = { dateRange: 'month' };

      const results = searchWithFilters('React', items, filters);

      expect(results.length).toBe(3);
    });

    it('should filter items by custom date range', () => {
      const items = createTestItems();
      const filters: SearchFilters = {
        dateRange: 'custom',
        startDate: now - 3 * oneDay,
        endDate: now,
      };

      const results = searchWithFilters('React', items, filters);

      expect(results.length).toBe(2);
    });

    it('should return all items when dateRange is all', () => {
      const items = createTestItems();
      const filters: SearchFilters = { dateRange: 'all' };

      const results = searchWithFilters('React', items, filters);

      expect(results.length).toBe(4);
    });
  });

  describe('sorting', () => {
    it('should sort by newest first (default)', () => {
      const items = createTestItems();
      const sortOption: SortOption = 'newest';

      const results = searchWithFilters('React', items, {}, sortOption);

      expect(results[0].item.id).toBe('1');
      expect(results[3].item.id).toBe('4');
    });

    it('should sort by oldest first', () => {
      const items = createTestItems();
      const sortOption: SortOption = 'oldest';

      const results = searchWithFilters('React', items, {}, sortOption);

      expect(results[0].item.id).toBe('4');
      expect(results[3].item.id).toBe('1');
    });

    it('should sort by most accessed', () => {
      const items = createTestItems();
      const sortOption: SortOption = 'mostAccessed';

      const results = searchWithFilters('React', items, {}, sortOption);

      expect(results[0].item.id).toBe('2');
      expect(results[0].item.accessCount).toBe(10);
    });

    it('should sort by relevance when query exists', () => {
      const items = [
        createItem({ id: '1', content: 'React', createdAt: now - oneDay }),
        createItem({ id: '2', content: 'React tutorial', tags: ['react'], createdAt: now }),
      ];
      const sortOption: SortOption = 'relevance';

      const results = searchWithFilters('React', items, {}, sortOption);

      expect(results[0].item.id).toBe('2');
    });
  });

  describe('combined filters and sorting', () => {
    it('should apply date filter and sorting together', () => {
      const items = createTestItems();
      const filters: SearchFilters = { dateRange: 'week' };
      const sortOption: SortOption = 'mostAccessed';

      const results = searchWithFilters('React', items, filters, sortOption);

      expect(results.length).toBe(2);
      expect(results[0].item.id).toBe('2');
    });
  });
});
