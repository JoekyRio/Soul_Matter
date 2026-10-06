# 心事 · Soul Matter

一个帮助你记录心事、通过 AI 科学地认识自己、并持续跟踪行为改变的个人成长应用。

## 功能

- ✅ 心事记录：写心事、打标签、标记情绪
- ✅ 首页三栏：心事卡片流（搜索 + 筛选）、入口、自定义 Panel（Markdown）
- ✅ 用户系统：邮箱注册登录，数据私密
- ✅ 多端响应式：手机和电脑浏览器都能用
- ✅ 数据安全：行级安全策略，只能访问自己的数据
- ✅ 多语言框架：中文为主，可切换英文
- 🚧 Chat the Day：AI 引导式对话（M2）
- 🚧 对话 → 心事 → Panel 闭环（M3）
- 🚧 Look back 复盘、添加到主屏幕、数据导出/删除（M4）

## 技术栈

- **前端/后端**: Next.js 16 (App Router) + TypeScript
- **数据库/认证**: Supabase
- **样式**: Tailwind CSS
- **多语言**: next-intl
- **测试**: Playwright（E2E）+ GitHub Actions（CI）
- **部署**: Vercel

## 快速开始

### 1. 准备

- 注册 [Supabase](https://supabase.com) 账号，创建一个项目
- 注册 [Vercel](https://vercel.com) 账号（用于部署）
- 注册 [GitHub](https://github.com) 账号（代码托管）

### 2. 本地运行

```bash
# 安装依赖
npm install

# 复制环境变量模板并填入你的 Supabase 信息
cp .env.local.example .env.local
# 编辑 .env.local，填入 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY

# 在 Supabase SQL Editor 中执行 supabase/schema.sql 创建数据表

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000 即可使用。

### 3. 部署

详见 [DEPLOY.md](./DEPLOY.md)。

## 文档

- [产品规格 spec.md](./docs/spec.md) — 做什么、为什么、不做什么
- [实施计划 tasks.md](./docs/tasks.md) — 里程碑、任务、验收标准
- [产品评审 product-review.md](./docs/product-review.md) — 目标对齐评审与待决策问题
- [工程化入门指南 engineering-guide.md](./docs/engineering-guide.md) — 写给不写代码的产品负责人
- [代码审查记录 review.md](./docs/review.md)
- 问题反馈：GitHub Issues → New issue，选择 Bug / 体验问题 / AI 回复质量 / 新想法 模板

## 项目结构

```
src/
├── app/
│   ├── [locale]/            # 页面（中文不带前缀，英文为 /en/...）
│   │   ├── (app)/           #   登录后的页面：首页、心事、Panel
│   │   ├── login/           #   登录
│   │   └── register/        #   注册
│   ├── api/                 # 接口：entries、panel
│   └── auth/                # 登录/注册/退出动作、邮箱确认回调
├── components/              # 顶栏、登录卡片、语言切换
├── i18n/                    # 多语言路由与配置
├── lib/                     # Supabase 客户端、心事查询
├── types/                   # 类型定义
└── proxy.ts                 # 语言路由 + 登录保护
messages/                    # 界面文案（zh.json / en.json）
supabase/                    # 数据库结构 schema.sql 与迁移脚本
e2e/                         # 端到端测试（见 e2e/README.md）
```

## 常用命令

```bash
npm run dev        # 本地开发
npm run check      # 代码检查 + 类型检查
npm run build      # 构建
npm run test:e2e   # 端到端测试（需要先启动本地测试数据库，见 e2e/README.md）
```

## 隐私说明

- 所有数据通过 HTTPS 加密传输
- 数据存储在 Supabase；数据库启用行级安全（RLS），用户通过应用只能访问自己的数据
- Supabase 项目管理员在后台技术上可以看到所有数据
- Chat the Day 上线后，对话内容会发送给 DeepSeek 处理，并保存对话记录；AI 调用日志保留 30 天
- 详见 `docs/spec.md` 的「隐私」一节

## 免责声明

本应用的 AI 分析仅供自我探索参考，不构成任何医疗诊断或治疗建议。如有心理困扰，请寻求专业心理咨询师的帮助。
