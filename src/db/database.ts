import Dexie, { type Table } from 'dexie';
import type { StashItem, LearningRule, SecuritySettings, AppSettings } from '../types';

export class QuickStashDB extends Dexie {
  items!: Table<StashItem, string>;
  learningRules!: Table<LearningRule, string>;
  security!: Table<SecuritySettings, string>;
  settings!: Table<AppSettings, string>;

  constructor() {
    super('QuickStashDB');
    this.version(1).stores({
      items: 'id, drawer, createdAt, *tags',
      learningRules: 'id, targetDrawer, createdAt',
      security: 'id',
      settings: 'id',
    });
  }
}

export const db = new QuickStashDB();
