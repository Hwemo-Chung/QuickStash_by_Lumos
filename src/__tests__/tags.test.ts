import { describe, it, expect } from 'vitest';
import { extractTags } from '../lib/tags';

describe('extractTags', () => {
  it('should extract meaningful words from text', () => {
    const tags = extractTags('Learn React hooks and useState');
    expect(tags).toContain('react');
    expect(tags).toContain('hooks');
  });

  it('should filter out common stop words', () => {
    const tags = extractTags('The quick brown fox jumps over the lazy dog');
    expect(tags).not.toContain('the');
    expect(tags).not.toContain('over');
    expect(tags).toContain('quick');
    expect(tags).toContain('brown');
  });

  it('should limit number of tags', () => {
    const text = 'apple banana cherry date elderberry fig grape honeydew';
    const tags = extractTags(text, 3);
    expect(tags.length).toBeLessThanOrEqual(3);
  });

  it('should extract domain from URL', () => {
    const tags = extractTags('https://github.com/user/repo');
    expect(tags).toContain('github.com');
  });

  it('should handle empty string', () => {
    const tags = extractTags('');
    expect(tags).toEqual([]);
  });

  it('should be case insensitive', () => {
    const tags = extractTags('REACT React react');
    expect(tags.filter(t => t === 'react').length).toBe(1);
  });

  it('should filter short words', () => {
    const tags = extractTags('I am a test of the system');
    expect(tags).not.toContain('i');
    expect(tags).not.toContain('am');
    expect(tags).not.toContain('a');
  });

  it('should handle Korean text', () => {
    const tags = extractTags('오늘 리액트 공부하기 프로젝트');
    expect(tags.length).toBeGreaterThan(0);
  });
});
