# 端到端（E2E）测试

这里的测试会像真人一样打开浏览器操作网站：注册、写心事、编辑、搜索、删除、编辑 Panel、切换语言、退出，以及"看不到别人的心事"。

Chat the Day 的测试使用 `e2e/mock-deepseek.mjs` 这个"假 DeepSeek"（按固定规则回复），不调用真实 AI、不花钱。测试连接的是一个**临时的本地 Supabase**（用 Docker 运行，配置在 `e2e/supabase/config.toml`），**不会碰线上数据库**。每次推送代码，GitHub Actions 都会自动跑一遍（见 `.github/workflows/ci.yml`），结果显示在 PR 页面上。

## 本地运行（需要 Docker）

```bash
# 1. 启动本地测试数据库并导入 supabase/schema.sql（第一次会下载镜像，需要几分钟）
npm run e2e:db:start

# 2. 用本地数据库的地址构建网站
#    地址和 key 可以用 npx supabase status --workdir e2e 查看
export NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
export NEXT_PUBLIC_SUPABASE_ANON_KEY=<上一步显示的 ANON_KEY>
npm run build

# 3. 运行测试（会自动启动网站）
npm run test:e2e

# 清空测试数据重新开始 / 用完关掉
npm run e2e:db:reset
npm run e2e:db:stop
```

## 新增功能时

- 每个里程碑的人工验收清单在 `docs/acceptance/`，能自动化的条目尽量写成这里的测试
- 修改 `supabase/schema.sql` 后，测试数据库会按新的结构创建，所以 schema.sql 必须始终和线上数据库保持一致
