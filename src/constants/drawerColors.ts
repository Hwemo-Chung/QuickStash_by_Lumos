import type { DrawerType } from '../types';

export interface DrawerColorConfig {
  bg: string;
  bgHover: string;
  text: string;
  accent: string;
  border: string;
}

export const DRAWER_COLORS: Record<DrawerType, DrawerColorConfig> = {
  contacts: {
    bg: 'bg-sky-100',
    bgHover: 'hover:bg-sky-200',
    text: 'text-sky-700',
    accent: 'bg-sky-500',
    border: 'border-sky-300',
  },
  money: {
    bg: 'bg-emerald-100',
    bgHover: 'hover:bg-emerald-200',
    text: 'text-emerald-700',
    accent: 'bg-emerald-500',
    border: 'border-emerald-300',
  },
  watch: {
    bg: 'bg-rose-100',
    bgHover: 'hover:bg-rose-200',
    text: 'text-rose-700',
    accent: 'bg-rose-500',
    border: 'border-rose-300',
  },
  read: {
    bg: 'bg-amber-100',
    bgHover: 'hover:bg-amber-200',
    text: 'text-amber-700',
    accent: 'bg-amber-500',
    border: 'border-amber-300',
  },
  dev: {
    bg: 'bg-violet-100',
    bgHover: 'hover:bg-violet-200',
    text: 'text-violet-700',
    accent: 'bg-violet-500',
    border: 'border-violet-300',
  },
  schedule: {
    bg: 'bg-blue-100',
    bgHover: 'hover:bg-blue-200',
    text: 'text-blue-700',
    accent: 'bg-blue-500',
    border: 'border-blue-300',
  },
  recipes: {
    bg: 'bg-orange-100',
    bgHover: 'hover:bg-orange-200',
    text: 'text-orange-700',
    accent: 'bg-orange-500',
    border: 'border-orange-300',
  },
  places: {
    bg: 'bg-teal-100',
    bgHover: 'hover:bg-teal-200',
    text: 'text-teal-700',
    accent: 'bg-teal-500',
    border: 'border-teal-300',
  },
  ideas: {
    bg: 'bg-yellow-100',
    bgHover: 'hover:bg-yellow-200',
    text: 'text-yellow-700',
    accent: 'bg-yellow-500',
    border: 'border-yellow-300',
  },
  notes: {
    bg: 'bg-slate-100',
    bgHover: 'hover:bg-slate-200',
    text: 'text-slate-700',
    accent: 'bg-slate-500',
    border: 'border-slate-300',
  },
  shopping: {
    bg: 'bg-pink-100',
    bgHover: 'hover:bg-pink-200',
    text: 'text-pink-700',
    accent: 'bg-pink-500',
    border: 'border-pink-300',
  },
  inbox: {
    bg: 'bg-gray-100',
    bgHover: 'hover:bg-gray-200',
    text: 'text-gray-700',
    accent: 'bg-gray-500',
    border: 'border-gray-300',
  },
} as const;

export function getDrawerColor(drawer: DrawerType): DrawerColorConfig {
  return DRAWER_COLORS[drawer];
}
