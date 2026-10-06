import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// 站内跳转一律使用这里导出的 Link / redirect / useRouter / usePathname，
// 它们会自动加上（或省略）语言前缀，不要手写 /zh/...
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
