import { expect, test } from '@playwright/test';
import { createEntry, login, register, uniqueEmail } from './helpers';

// 冒烟测试：覆盖 M1 的核心流程，对应 docs/acceptance/M1.md

test.describe('未登录', () => {
  test('访问首页会跳到登录页', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('button', { name: '登录' })).toBeVisible();
  });

  test('登录页和注册页可以互相跳转', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: '注册' }).click();
    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByRole('button', { name: '注册' })).toBeVisible();

    await page.getByRole('link', { name: '登录' }).click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('需要登录的页面都会跳到登录页', async ({ page }) => {
    for (const path of ['/entries/new', '/panel/edit', '/entries/123', '/en/panel/edit']) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login$/);
    }
  });

  test('英文登录页显示英文，错误提示也是英文', async ({ page }) => {
    await page.goto('/en/login');
    await page.getByLabel('Email').fill(uniqueEmail('nobody'));
    await page.getByLabel('Password').fill('wrong-password');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/\/en\/login\?error=invalidCredentials$/);
    await expect(
      page.getByRole('alert').filter({ hasText: 'Incorrect email or password' }),
    ).toBeVisible();

    await page.getByRole('link', { name: 'Sign up' }).click();
    await expect(page).toHaveURL(/\/en\/register$/);
  });

  test('密码错误时显示提示', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('邮箱').fill(uniqueEmail('nobody'));
    await page.getByLabel('密码').fill('wrong-password');
    await page.getByRole('button', { name: '登录' }).click();
    await expect(page.getByRole('alert').filter({ hasText: '邮箱或密码不正确' })).toBeVisible();
  });
});

test.describe('登录后', () => {
  test('心事的完整流程：写 → 首页 → 详情 → 编辑 → 搜索筛选 → 删除', async ({ page }) => {
    await register(page, uniqueEmail('flow'));

    // 首页有顶栏和空状态
    await expect(page.getByRole('link', { name: '+ 写心事' })).toBeVisible();
    await expect(page.getByRole('button', { name: '退出' })).toBeVisible();
    await expect(page.getByText('还没有心事记录')).toBeVisible();

    // 写一条心事 → 进入详情页
    await createEntry(page, {
      title: '开会被否定',
      content: '方案被当众否了，一句话都没说出来。',
      mood: '焦虑',
      tag: '工作',
    });
    await expect(page).toHaveURL(/\/entries\/[0-9a-f-]+$/);

    // 返回首页，能看到卡片，点卡片进入详情
    await page.getByRole('link', { name: '← 返回首页' }).click();
    const card = page.getByRole('link', { name: /开会被否定/ });
    await expect(card).toBeVisible();
    await card.click();
    await expect(page.getByRole('heading', { level: 1, name: '开会被否定' })).toBeVisible();

    // 编辑标题
    await page.getByRole('link', { name: '编辑' }).click();
    await expect(page.getByRole('heading', { name: '编辑心事' })).toBeVisible();
    await page.getByLabel('标题').fill('开会被否定之后');
    await page.getByRole('button', { name: '更新心事' }).click();
    await expect(page.getByRole('heading', { level: 1, name: '开会被否定之后' })).toBeVisible();

    // 再写一条，用于验证搜索和筛选
    await createEntry(page, { title: '周末独处', content: '一个人散步，很平静。', mood: '平静' });
    await page.getByRole('link', { name: '← 返回首页' }).click();

    const search = page.getByRole('searchbox');
    await search.fill('散步');
    await expect(page.getByRole('link', { name: /周末独处/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /开会被否定之后/ })).toBeHidden();
    await search.fill('不存在的关键词');
    await expect(page.getByText('没有找到匹配的心事')).toBeVisible();
    await page.getByRole('button', { name: '清除筛选' }).click();

    await page.getByRole('button', { name: '焦虑', exact: true }).click();
    await expect(page.getByRole('link', { name: /开会被否定之后/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /周末独处/ })).toBeHidden();
    await page.getByRole('button', { name: '清除筛选' }).click();

    await page.getByRole('button', { name: '工作', exact: true }).click();
    await expect(page.getByRole('link', { name: /开会被否定之后/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /周末独处/ })).toBeHidden();
    await page.getByRole('button', { name: '清除筛选' }).click();

    // 删除
    await page.getByRole('link', { name: /周末独处/ }).click();
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: '删除' }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('link', { name: /周末独处/ })).toHaveCount(0);
    await expect(page.getByRole('link', { name: /开会被否定之后/ })).toBeVisible();
  });

  test('编辑 Panel 后首页显示排版好的 Markdown', async ({ page }) => {
    await register(page, uniqueEmail('panel'));
    const panel = page.getByTestId('panel');
    await expect(panel.getByText('还没有自定义 Panel')).toBeVisible();

    await panel.getByRole('link', { name: 'Design your panel' }).click();
    await expect(page.getByRole('heading', { name: '编辑 Panel' })).toBeVisible();
    await page.getByLabel('编辑').fill('# 我的提醒\n\n- 先照顾好情绪\n- 不必让每个人满意');
    await expect(page.getByTestId('panel-preview').getByRole('heading', { name: '我的提醒' })).toBeVisible();
    await page.getByRole('button', { name: '保存' }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(panel.getByRole('heading', { name: '我的提醒' })).toBeVisible();
    await expect(panel.getByRole('listitem')).toHaveCount(2);
    // Markdown 样式生效：标题比正文大
    const headingSize = await panel.getByRole('heading', { name: '我的提醒' }).evaluate(
      (el) => parseFloat(getComputedStyle(el).fontSize),
    );
    const itemSize = await panel.getByRole('listitem').first().evaluate(
      (el) => parseFloat(getComputedStyle(el).fontSize),
    );
    expect(headingSize).toBeGreaterThan(itemSize);

    // 刷新后仍然存在
    await page.reload();
    await expect(panel.getByRole('heading', { name: '我的提醒' })).toBeVisible();
  });

  test('切换语言后停留在同一页面，文案变为英文', async ({ page }) => {
    await register(page, uniqueEmail('i18n'));
    await createEntry(page, { title: 'Language test', content: 'content' });
    const detailPath = new URL(page.url()).pathname;

    await page.getByRole('button', { name: 'EN' }).click();
    await expect(page).toHaveURL(new RegExp(`/en${detailPath}$`));
    await expect(page.getByRole('link', { name: '+ New entry' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Edit' })).toBeVisible();

    await page.getByRole('link', { name: '← Back to home' }).click();
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.getByRole('heading', { name: 'My entries' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'My Panel' })).toBeVisible();

    await page.getByRole('button', { name: '中文' }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { name: '我的心事' })).toBeVisible();
  });

  test('退出后回到登录页，不能再访问首页', async ({ page }) => {
    const email = uniqueEmail('signout');
    await register(page, email);
    await page.getByRole('button', { name: '退出' }).click();
    await expect(page).toHaveURL(/\/login$/);
    await page.goto('/');
    await expect(page).toHaveURL(/\/login$/);

    // 已登录时访问登录页会回到首页
    await login(page, email);
    await page.goto('/login');
    await expect(page).toHaveURL(/\/$/);
  });

  test('旧地址 /entries 跳到首页，不存在的地址显示 404 页面', async ({ page }) => {
    await register(page, uniqueEmail('legacy'));
    await page.goto('/entries');
    await expect(page).toHaveURL(/\/$/);
    await page.goto('/this-page-does-not-exist');
    await expect(page.getByRole('heading', { name: '页面不存在' })).toBeVisible();
  });

  test('隐私：看不到别人的心事', async ({ browser }) => {
    const alice = await browser.newPage();
    await register(alice, uniqueEmail('alice'));
    await createEntry(alice, { title: 'Alice 的秘密', content: '只有我自己能看到' });
    const alicePath = new URL(alice.url()).pathname;

    const bob = await (await browser.newContext()).newPage();
    await register(bob, uniqueEmail('bob'));
    await expect(bob.getByText('Alice 的秘密')).toHaveCount(0);
    await bob.goto(alicePath);
    await expect(bob.getByText('这条心事不存在或不属于你')).toBeVisible();
    await expect(bob.getByText('只有我自己能看到')).toHaveCount(0);
  });
});

test.describe('手机布局', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('Panel 在最上面，卡片流在最下面', async ({ page }) => {
    await register(page, uniqueEmail('mobile'));
    const panelBox = await page.getByTestId('panel').boundingBox();
    const entriesBox = await page.getByRole('heading', { name: '我的心事' }).boundingBox();
    expect(panelBox && entriesBox && panelBox.y < entriesBox.y).toBeTruthy();

    // 顶栏的主要按钮在手机上可见
    await expect(page.getByRole('link', { name: '+ 写心事' })).toBeVisible();
    await expect(page.getByRole('button', { name: '退出' })).toBeVisible();
  });
});
