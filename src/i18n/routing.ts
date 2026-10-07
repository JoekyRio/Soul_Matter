import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['zh', 'en'],
  defaultLocale: 'zh',
  localePrefix: 'as-needed', // 默认语言（中文）不带前缀：/entries；英文带前缀：/en/entries
  // 不根据浏览器语言或 cookie 自动切换：默认始终中文，用户可手动切到英文
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];
