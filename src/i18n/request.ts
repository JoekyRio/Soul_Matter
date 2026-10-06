import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import zh from '../../messages/zh.json';
import { routing } from './routing';

type MessageTree = { [key: string]: unknown };

// 其他语言缺少的文案回退到中文：新功能可以只写中文，英文以后再补
function withFallback(base: MessageTree, override: MessageTree): MessageTree {
  const result: MessageTree = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const baseValue = base[key];
    result[key] =
      isTree(value) && isTree(baseValue) ? withFallback(baseValue, value) : value;
  }
  return result;
}

function isTree(value: unknown): value is MessageTree {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const messages =
    locale === routing.defaultLocale
      ? zh
      : (withFallback(
          zh,
          (await import(`../../messages/${locale}.json`)).default,
        ) as typeof zh);

  return {
    locale,
    messages,
    // 用户都在中国：服务端和浏览器统一按北京时间显示日期，避免两边不一致
    timeZone: 'Asia/Shanghai',
  };
});
