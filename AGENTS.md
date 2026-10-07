<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Soul Matter 项目规则（所有 AI 工具共用）

## 开工前先读
- `docs/spec.md`（做什么、为什么、不做什么）和 `docs/tasks.md`（当前任务、验收标准）
- 产品决策记录在 `docs/product-review.md` 第 5 节；面向产品负责人的说明在 `docs/engineering-guide.md`

## 约定
- **文案**：界面文字一律写在 `messages/zh.json`（必填）和 `messages/en.json`（可选，缺失时自动回退中文），不要在组件里写死
- **站内跳转**：使用 `@/i18n/navigation` 导出的 `Link` / `redirect` / `useRouter`，不要手写 `/zh/...` 前缀
- **数据库变更**：写成 `supabase/migrations/NNN_描述.sql`（供线上执行），并同步更新 `supabase/schema.sql`（新建项目和测试数据库都用它）
- **密钥**：只在服务端使用的变量不加 `NEXT_PUBLIC_` 前缀；不要提交任何密钥
- **提交信息**：`feat:` / `fix:` / `docs:` / `refactor:` / `test:` 前缀

## 完成的定义
一个任务只有满足以下全部条件才能在 `docs/tasks.md` 标记为 `completed`：
1. `npm run check`（lint + 类型检查）通过，`npm run build` 通过
2. 相关的 E2E 测试已补充并通过（`e2e/`，运行方式见 `e2e/README.md`），CI 全绿
3. 产品负责人在 Vercel 预览链接上按 `docs/acceptance/` 中的清单验收通过
4. 文档已同步更新（tasks.md 状态、迁移步骤、README 等）
