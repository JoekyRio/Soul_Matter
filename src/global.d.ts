import type zh from '../messages/zh.json';
import type { routing } from './i18n/routing';

// 让 TypeScript 检查文案 key：t('home.typo') 这类拼写错误会在类型检查时报错
declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof zh;
  }
}
