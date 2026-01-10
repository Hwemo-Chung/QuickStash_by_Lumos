import type { DrawerType } from '../types';
import { getDrawerInputConfig, type DrawerType as I18nDrawerType } from '../i18n';

export function generateDatePrefix(drawer: DrawerType): string {
  const config = getDrawerInputConfig(drawer as I18nDrawerType);
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  if (config.autoDateTimePrefix) {
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `[${month}/${day} ${hours}:${minutes}] `;
  }

  if (config.autoDatePrefix) {
    return `[${month}/${day}] `;
  }

  return '';
}

export function shouldAutoPrefix(drawer: DrawerType): boolean {
  const config = getDrawerInputConfig(drawer as I18nDrawerType);
  return config.autoDatePrefix === true || config.autoDateTimePrefix === true;
}
