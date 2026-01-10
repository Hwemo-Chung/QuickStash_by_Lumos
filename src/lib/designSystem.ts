export type ElevationLevel = 'sm' | 'md' | 'lg' | 'xl';
export type FocusRingVariant = 'default' | 'primary' | 'error';
export type ColorCategory = 'text' | 'bg' | 'interactive';

export const ELEVATION_SHADOWS: Record<ElevationLevel, string> = {
  sm: '0px 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0px 4px 6px rgba(0, 0, 0, 0.07)',
  lg: '0px 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0px 20px 25px rgba(0, 0, 0, 0.15)',
} as const;

export const FOCUS_RING_STYLES: Record<FocusRingVariant, string> = {
  default:
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2',
  primary:
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
  error:
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2',
} as const;

export const ANIMATION_KEYFRAMES = {
  shimmer: `
    from { transform: translateX(-100%); }
    to { transform: translateX(100%); }
  `,
  staggerIn: `
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  `,
  glow: `
    0%, 100% { box-shadow: 0 0 4px rgba(99, 102, 241, 0.4); opacity: 1; }
    50% { box-shadow: 0 0 16px rgba(99, 102, 241, 0.8); opacity: 0.9; }
  `,
} as const;

export const REDUCED_MOTION_CLASSES = {
  safe: 'motion-safe:animate-[var(--animation)]',
  reduce: 'motion-reduce:animate-none motion-reduce:transition-none',
  durationVar: '--animation-duration',
} as const;

export const WCAG_CONTRAST_COLORS = {
  text: {
    primary: 'text-slate-900',
    secondary: 'text-slate-600',
    muted: 'text-slate-500',
  },
  bg: {
    primary: 'bg-white',
    secondary: 'bg-slate-50',
  },
  interactive: {
    default: 'text-indigo-600',
    hover: 'hover:text-indigo-700',
    focus: 'focus:text-indigo-800',
  },
} as const;

export function getElevationShadow(level: ElevationLevel): string {
  return ELEVATION_SHADOWS[level];
}

export function getFocusRingClass(variant: FocusRingVariant): string {
  return FOCUS_RING_STYLES[variant];
}

type TextColorKey = keyof typeof WCAG_CONTRAST_COLORS.text;
type BgColorKey = keyof typeof WCAG_CONTRAST_COLORS.bg;
type InteractiveColorKey = keyof typeof WCAG_CONTRAST_COLORS.interactive;

export function getContrastColor(
  category: 'text',
  key: TextColorKey
): string;
export function getContrastColor(
  category: 'bg',
  key: BgColorKey
): string;
export function getContrastColor(
  category: 'interactive',
  key: InteractiveColorKey
): string;
export function getContrastColor(
  category: ColorCategory,
  key: string
): string {
  const colors = WCAG_CONTRAST_COLORS[category];
  return (colors as Record<string, string>)[key];
}
