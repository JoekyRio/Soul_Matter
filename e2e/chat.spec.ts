import { expect, type Page, test } from '@playwright/test';
import { register, uniqueEmail } from './helpers';

// Chat the Day：使用 e2e/mock-deepseek.mjs 模拟 AI，对应 docs/acceptance/M2.md
const MOCK_AI = `http://127.0.0.1:${process.env.MOCK_DEEPSEEK_PORT ?? 3199}`;

async function openChat(page: Page) {
  await page.getByRole('link', { name: '[Chat the Day]' }).click();
  await expect(page).toHaveURL(/\/chat$/);
  // 第一次进入会看到说明
  const dialog = page.getByRole('dialog', { name: '开始之前，请了解' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: '我知道了' }).click();
  await expect(dialog).toBeHidden();
}

async function say(page: Page, text: string) {
  await page.getByLabel('输入消息').fill(text);
  await page.getByRole('button', { name: '发送' }).click();
}

test.describe('Chat the Day', () => {
  test('对话：逐字回复、刷新后继续、带上 system prompt 和历史', async ({ page }) => {
    await register(page, uniqueEmail('chat'));
    await openChat(page);
    await expect(page.getByLabel('输入消息')).toHaveAttribute('placeholder', 'Tell me what touched you today?');

    await say(page, '今天开会被否定了');
    const replies = page.getByTestId('assistant-message');
    await expect(replies.first()).toContainText('那一刻你心里冒出的第一个念头是什么？');
    await expect(page.getByRole('button', { name: '发送' })).toBeVisible(); // 生成结束

    await say(page, '我觉得我总是搞砸');
    await expect(replies.nth(1)).toContainText('我觉得我总是搞砸');

    // 发给 AI 的内容：system prompt + 完整历史
    const last = await (await page.request.get(`${MOCK_AI}/last-request`)).json();
    const sent = last.body.messages as { role: string; content: string }[];
    expect(sent[0].role).toBe('system');
    expect(sent[0].content).toContain('你是「心事」里的陪伴者');
    expect(sent[0].content).not.toContain('version:'); // 注释不会发给 AI
    expect(sent.slice(1).map((m) => m.role)).toEqual(['user', 'assistant', 'user']);
    expect(last.authorization).toBe('Bearer test-key');

    // 刷新后对话还在，说明不再弹出
    await page.reload();
    await expect(page.getByTestId('user-message')).toHaveCount(2);
    await expect(replies).toHaveCount(2);
    await expect(page.getByRole('dialog')).toHaveCount(0);

    // 新对话
    await page.getByRole('button', { name: '新对话' }).click();
    await expect(page.getByTestId('user-message')).toHaveCount(0);
  });

  test('反馈：👍 / 👎 保存，刷新后保持', async ({ page }) => {
    await register(page, uniqueEmail('feedback'));
    await openChat(page);
    await say(page, '今天有点累');
    await expect(page.getByRole('button', { name: '有帮助' })).toBeVisible();

    await page.getByRole('button', { name: '没帮助' }).click();
    await page.getByLabel('哪里不好？（选填，帮助改进）').fill('问题太多了');
    await page.getByRole('button', { name: '提交' }).click();
    await expect(page.getByText('谢谢反馈')).toBeVisible();

    await page.reload();
    await expect(page.getByRole('button', { name: '没帮助' })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: '有帮助' }).click();
    await expect(page.getByRole('button', { name: '有帮助' })).toHaveAttribute('aria-pressed', 'true');
    await page.reload();
    await expect(page.getByRole('button', { name: '有帮助' })).toHaveAttribute('aria-pressed', 'true');
  });

  test('安全：危机信号会显示求助信息；求助信息随时可以打开', async ({ page }) => {
    await register(page, uniqueEmail('safety'));
    await openChat(page);

    await page.getByRole('button', { name: '需要帮助？' }).click();
    const card = page.getByTestId('safety-card');
    await expect(card).toContainText('120');
    await card.getByRole('button', { name: '关闭' }).click();
    await expect(card).toBeHidden();

    await say(page, '最近真的不想活了');
    await expect(card).toBeVisible();
    const reply = page.getByTestId('assistant-message').first();
    await expect(reply).toContainText('我很担心你');
    await expect(reply).not.toContainText('[[SAFETY]]'); // 标记不会显示给用户
  });

  test('停止生成，以及 AI 出错后可以重试', async ({ page }) => {
    await register(page, uniqueEmail('stop'));
    await openChat(page);

    await say(page, '请你慢慢说');
    await expect(page.getByTestId('assistant-message').first()).toContainText('很长');
    await page.getByRole('button', { name: '停止' }).click();
    await expect(page.getByText('（已停止）')).toBeVisible();
    await expect(page.getByRole('button', { name: '发送' })).toBeVisible();

    await say(page, '这句会触发错误');
    await expect(page.getByRole('alert').filter({ hasText: 'AI 暂时没有回应' })).toBeVisible();
    await page.getByRole('button', { name: '重试' }).click();
    await expect(page.getByTestId('assistant-message').nth(1)).toContainText('这句会触发错误');

    // 重试不会重复保存用户消息
    await page.reload();
    await expect(page.getByTestId('user-message')).toHaveCount(2);
  });

  test('隐私：看不到别人的对话', async ({ browser }) => {
    const alice = await browser.newPage();
    await register(alice, uniqueEmail('chat-alice'));
    await openChat(alice);
    await say(alice, 'Alice 的心事');
    await expect(alice.getByTestId('assistant-message')).toHaveCount(1);
    await expect(alice.getByRole('button', { name: '发送' })).toBeVisible();

    const bob = await (await browser.newContext()).newPage();
    await register(bob, uniqueEmail('chat-bob'));
    await openChat(bob);
    await expect(bob.getByText('Alice 的心事')).toHaveCount(0);
  });
});
