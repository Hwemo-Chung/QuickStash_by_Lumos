export type DrawerType =
  | 'contacts'
  | 'money'
  | 'watch'
  | 'read'
  | 'dev'
  | 'schedule'
  | 'recipes'
  | 'places'
  | 'ideas'
  | 'notes'
  | 'shopping'
  | 'inbox';

export interface StashItem {
  id: string;
  content: string;
  drawer: DrawerType;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  accessCount: number;
  title?: string;
  thumbnail?: string;
  description?: string;
  genre?: string;
}

export interface LearningRule {
  id: string;
  pattern: string;
  targetDrawer: DrawerType;
  confidence: number;
  createdAt: number;
}

export interface SecuritySettings {
  id: string;
  pinHash: string | null;
  pinSalt: string | null;
  failedAttempts: number;
  isEnabled: boolean;
}

export interface AppSettings {
  id: string;
  theme: 'light' | 'dark' | 'system';
  isPro: boolean;
}

export interface DrawerMeta {
  type: DrawerType;
  icon: string;
  label: string;
}

export const DRAWER_META: DrawerMeta[] = [
  { type: 'contacts', icon: '📞', label: 'Contacts' },
  { type: 'money', icon: '💰', label: 'Money' },
  { type: 'watch', icon: '🎬', label: 'Watch' },
  { type: 'read', icon: '📰', label: 'Read' },
  { type: 'dev', icon: '💻', label: 'Dev' },
  { type: 'schedule', icon: '📅', label: 'Schedule' },
  { type: 'recipes', icon: '🍳', label: 'Recipes' },
  { type: 'places', icon: '📍', label: 'Places' },
  { type: 'ideas', icon: '💡', label: 'Ideas' },
  { type: 'notes', icon: '📝', label: 'Notes' },
  { type: 'shopping', icon: '🛒', label: 'Shopping' },
  { type: 'inbox', icon: '📦', label: 'Inbox' },
];
