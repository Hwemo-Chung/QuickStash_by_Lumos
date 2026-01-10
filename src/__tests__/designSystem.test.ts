import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import {
  ELEVATION_SHADOWS,
  FOCUS_RING_STYLES,
  ANIMATION_KEYFRAMES,
  WCAG_CONTRAST_COLORS,
  REDUCED_MOTION_CLASSES,
  getElevationShadow,
  getFocusRingClass,
  getContrastColor,
} from '../lib/designSystem';

const cssContent = readFileSync(resolve(__dirname, '../index.css'), 'utf-8');

describe('Design System', () => {
  describe('Elevation Shadows', () => {
    it('should have sm, md, lg, xl elevation levels', () => {
      expect(ELEVATION_SHADOWS).toHaveProperty('sm');
      expect(ELEVATION_SHADOWS).toHaveProperty('md');
      expect(ELEVATION_SHADOWS).toHaveProperty('lg');
      expect(ELEVATION_SHADOWS).toHaveProperty('xl');
    });

    it('should have valid CSS shadow values', () => {
      Object.values(ELEVATION_SHADOWS).forEach((shadow) => {
        expect(shadow).toMatch(/^(\d+px\s+\d+px\s+\d+px|0)/);
      });
    });

    it('should return correct shadow for each level via helper', () => {
      expect(getElevationShadow('sm')).toBe(ELEVATION_SHADOWS.sm);
      expect(getElevationShadow('md')).toBe(ELEVATION_SHADOWS.md);
      expect(getElevationShadow('lg')).toBe(ELEVATION_SHADOWS.lg);
      expect(getElevationShadow('xl')).toBe(ELEVATION_SHADOWS.xl);
    });

    it('should have increasing shadow intensity from sm to xl', () => {
      const extractBlur = (shadow: string) => {
        const match = shadow.match(/\d+px\s+\d+px\s+(\d+)px/);
        return match ? parseInt(match[1], 10) : 0;
      };

      const smBlur = extractBlur(ELEVATION_SHADOWS.sm);
      const mdBlur = extractBlur(ELEVATION_SHADOWS.md);
      const lgBlur = extractBlur(ELEVATION_SHADOWS.lg);
      const xlBlur = extractBlur(ELEVATION_SHADOWS.xl);

      expect(smBlur).toBeLessThan(mdBlur);
      expect(mdBlur).toBeLessThan(lgBlur);
      expect(lgBlur).toBeLessThan(xlBlur);
    });
  });

  describe('Focus-Visible States', () => {
    it('should have focus ring styles defined', () => {
      expect(FOCUS_RING_STYLES).toBeDefined();
      expect(FOCUS_RING_STYLES).toHaveProperty('default');
      expect(FOCUS_RING_STYLES).toHaveProperty('primary');
      expect(FOCUS_RING_STYLES).toHaveProperty('error');
    });

    it('should have ring-related classes in focus styles', () => {
      Object.values(FOCUS_RING_STYLES).forEach((style) => {
        expect(style).toMatch(/ring/);
        expect(style).toMatch(/focus-visible/);
      });
    });

    it('should return correct focus ring class via helper', () => {
      expect(getFocusRingClass('default')).toBe(FOCUS_RING_STYLES.default);
      expect(getFocusRingClass('primary')).toBe(FOCUS_RING_STYLES.primary);
      expect(getFocusRingClass('error')).toBe(FOCUS_RING_STYLES.error);
    });

    it('should have offset for better visibility', () => {
      Object.values(FOCUS_RING_STYLES).forEach((style) => {
        expect(style).toMatch(/ring-offset/);
      });
    });
  });

  describe('Animation Keyframes', () => {
    it('should have shimmer, stagger-in, and glow keyframes', () => {
      expect(ANIMATION_KEYFRAMES).toHaveProperty('shimmer');
      expect(ANIMATION_KEYFRAMES).toHaveProperty('staggerIn');
      expect(ANIMATION_KEYFRAMES).toHaveProperty('glow');
    });

    it('should have valid keyframe structure with from/to or percentage', () => {
      Object.values(ANIMATION_KEYFRAMES).forEach((keyframe) => {
        const hasFromTo = keyframe.includes('from') || keyframe.includes('to');
        const hasPercentage = /\d+%/.test(keyframe);
        expect(hasFromTo || hasPercentage).toBe(true);
      });
    });

    it('shimmer should include translateX transform', () => {
      expect(ANIMATION_KEYFRAMES.shimmer).toMatch(/translateX/);
    });

    it('glow should include box-shadow or opacity', () => {
      const hasGlowEffect =
        ANIMATION_KEYFRAMES.glow.includes('box-shadow') ||
        ANIMATION_KEYFRAMES.glow.includes('opacity');
      expect(hasGlowEffect).toBe(true);
    });

    it('staggerIn should include opacity and transform', () => {
      expect(ANIMATION_KEYFRAMES.staggerIn).toMatch(/opacity/);
      expect(ANIMATION_KEYFRAMES.staggerIn).toMatch(/transform/);
    });
  });

  describe('Reduced Motion Support', () => {
    it('should have motion-safe and motion-reduce classes', () => {
      expect(REDUCED_MOTION_CLASSES).toHaveProperty('safe');
      expect(REDUCED_MOTION_CLASSES).toHaveProperty('reduce');
    });

    it('motion-safe should allow animations', () => {
      expect(REDUCED_MOTION_CLASSES.safe).toMatch(/motion-safe/);
    });

    it('motion-reduce should disable or simplify animations', () => {
      expect(REDUCED_MOTION_CLASSES.reduce).toMatch(/motion-reduce/);
    });

    it('should have CSS custom properties for animation duration', () => {
      expect(REDUCED_MOTION_CLASSES).toHaveProperty('durationVar');
      expect(REDUCED_MOTION_CLASSES.durationVar).toMatch(/--/);
    });
  });

  describe('WCAG Contrast Colors', () => {
    it('should have high contrast text colors defined', () => {
      expect(WCAG_CONTRAST_COLORS).toHaveProperty('text');
      expect(WCAG_CONTRAST_COLORS.text).toHaveProperty('primary');
      expect(WCAG_CONTRAST_COLORS.text).toHaveProperty('secondary');
      expect(WCAG_CONTRAST_COLORS.text).toHaveProperty('muted');
    });

    it('should have accessible background colors', () => {
      expect(WCAG_CONTRAST_COLORS).toHaveProperty('bg');
      expect(WCAG_CONTRAST_COLORS.bg).toHaveProperty('primary');
      expect(WCAG_CONTRAST_COLORS.bg).toHaveProperty('secondary');
    });

    it('should have interactive element colors', () => {
      expect(WCAG_CONTRAST_COLORS).toHaveProperty('interactive');
      expect(WCAG_CONTRAST_COLORS.interactive).toHaveProperty('default');
      expect(WCAG_CONTRAST_COLORS.interactive).toHaveProperty('hover');
      expect(WCAG_CONTRAST_COLORS.interactive).toHaveProperty('focus');
    });

    it('should return correct color via helper', () => {
      expect(getContrastColor('text', 'primary')).toBe(
        WCAG_CONTRAST_COLORS.text.primary
      );
      expect(getContrastColor('bg', 'secondary')).toBe(
        WCAG_CONTRAST_COLORS.bg.secondary
      );
    });

    it('should use Tailwind classes that meet AA contrast ratio', () => {
      // Primary text should be dark enough (slate-900, gray-900, etc.)
      expect(WCAG_CONTRAST_COLORS.text.primary).toMatch(/(slate|gray|zinc)-[89]00/);
      // Secondary text should be reasonably dark (600-800)
      expect(WCAG_CONTRAST_COLORS.text.secondary).toMatch(/(slate|gray|zinc)-[678]00/);
    });
  });

  describe('Design System Integration', () => {
    it('should export all required constants', () => {
      expect(ELEVATION_SHADOWS).toBeDefined();
      expect(FOCUS_RING_STYLES).toBeDefined();
      expect(ANIMATION_KEYFRAMES).toBeDefined();
      expect(WCAG_CONTRAST_COLORS).toBeDefined();
      expect(REDUCED_MOTION_CLASSES).toBeDefined();
    });

    it('should export all helper functions', () => {
      expect(typeof getElevationShadow).toBe('function');
      expect(typeof getFocusRingClass).toBe('function');
      expect(typeof getContrastColor).toBe('function');
    });
  });

  describe('CSS File Utilities', () => {
    it('should have shimmer keyframes defined in CSS', () => {
      expect(cssContent).toMatch(/@keyframes shimmer/);
    });

    it('should have stagger-in keyframes defined in CSS', () => {
      expect(cssContent).toMatch(/@keyframes stagger-in/);
    });

    it('should have glow keyframes defined in CSS', () => {
      expect(cssContent).toMatch(/@keyframes glow/);
    });

    it('should have elevation shadow utilities in CSS', () => {
      expect(cssContent).toMatch(/\.shadow-elevation-sm/);
      expect(cssContent).toMatch(/\.shadow-elevation-md/);
      expect(cssContent).toMatch(/\.shadow-elevation-lg/);
      expect(cssContent).toMatch(/\.shadow-elevation-xl/);
    });

    it('should have focus-ring utilities in CSS', () => {
      expect(cssContent).toMatch(/\.focus-ring-default/);
      expect(cssContent).toMatch(/\.focus-ring-primary/);
      expect(cssContent).toMatch(/\.focus-ring-error/);
    });

    it('should have prefers-reduced-motion media query', () => {
      expect(cssContent).toMatch(/@media.*prefers-reduced-motion:\s*reduce/);
    });

    it('should disable animations in reduced motion mode', () => {
      expect(cssContent).toMatch(/animation-duration:\s*0\.01ms/);
      expect(cssContent).toMatch(/animation:\s*none/);
    });

    it('should have animate classes for new keyframes', () => {
      expect(cssContent).toMatch(/\.animate-shimmer/);
      expect(cssContent).toMatch(/\.animate-stagger-in/);
      expect(cssContent).toMatch(/\.animate-glow/);
    });
  });
});
