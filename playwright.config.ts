import { defineConfig, devices } from '@playwright/test';

// 端到端（E2E）测试：像真人一样打开浏览器操作网站。
// 运行前需要：1) 本地测试数据库 npm run e2e:db:start
//            2) 用测试数据库的地址和 key 构建网站 npm run build
// 详见 e2e/README.md
const PORT = Number(process.env.E2E_PORT ?? 3100);

export default defineConfig({
  testDir: './e2e',
  // 测试之间共享同一个数据库，按顺序执行更容易排查问题
  workers: 1,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    ...devices['Desktop Chrome'],
    launchOptions: {
      // 本地容器里可用 PLAYWRIGHT_CHROMIUM_PATH 指定预装的浏览器；CI 中留空
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
    },
  },
  webServer: {
    command: `npm run start -- -p ${PORT}`,
    url: `http://127.0.0.1:${PORT}/login`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
