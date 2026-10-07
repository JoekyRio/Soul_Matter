import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // AI 接口运行时读取 prompts/*.md，部署时需要把这些文件一起带上
  outputFileTracingIncludes: {
    '/api/chat': ['./prompts/**/*.md'],
  },
};

export default withNextIntl(nextConfig);
