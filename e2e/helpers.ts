import { expect, type Page } from '@playwright/test';

export const PASSWORD = 'test-password-123';

export function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
}

// 通过注册页创建账号。本地测试数据库关闭了邮箱确认，注册后直接进入首页
export async function register(page: Page, email: string) {
  await page.goto('/register');
  await page.getByLabel('邮箱').fill(email);
  await page.getByLabel('密码').fill(PASSWORD);
  await page.getByRole('button', { name: '注册' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { name: '我的心事' })).toBeVisible();
}

export async function login(page: Page, email: string) {
  await page.goto('/login');
  await page.getByLabel('邮箱').fill(email);
  await page.getByLabel('密码').fill(PASSWORD);
  await page.getByRole('button', { name: '登录' }).click();
  await expect(page.getByRole('heading', { name: '我的心事' })).toBeVisible();
}

export async function createEntry(
  page: Page,
  entry: { title: string; content: string; mood?: string; tag?: string },
) {
  await page.getByRole('link', { name: '+ 写心事' }).click();
  await expect(page.getByRole('heading', { name: '写心事' })).toBeVisible();
  await page.getByLabel('标题').fill(entry.title);
  await page.getByLabel('内容').fill(entry.content);
  if (entry.mood) await page.getByRole('button', { name: entry.mood, exact: true }).click();
  if (entry.tag) await page.getByRole('button', { name: entry.tag, exact: true }).click();
  await page.getByRole('button', { name: '保存心事' }).click();
  await expect(page.getByRole('heading', { level: 1, name: entry.title })).toBeVisible();
}
