# 心事 · Soul Matter

一个帮助你记录心事、通过 AI 科学地认识自己、并持续跟踪行为改变的个人成长应用。

## 功能

- ✅ 心事记录：写心事、打标签、标记情绪
- ✅ 用户系统：邮箱注册登录，数据私密
- ✅ 多端响应式：手机和电脑浏览器都能用
- ✅ 数据安全：行级安全策略，只能访问自己的数据
- 🚧 AI 科学诊断（开发中）
- 🚧 行为改变跟踪（开发中）
- 🚧 移动端 App（开发中）

## 技术栈

- **前端/后端**: Next.js 16 (App Router) + TypeScript
- **数据库/认证**: Supabase
- **样式**: Tailwind CSS
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

## 项目结构

```
src/
├── app/
│   ├── entries/          # 心事页面（列表、详情、新建、编辑）
│   ├── api/entries/      # 心事 API
│   ├── auth/             # 认证相关
│   ├── login/            # 登录页
│   ├── register/         # 注册页
│   └── layout.tsx        # 全局布局
├── components/           # 组件
├── lib/supabase/         # Supabase 客户端
├── types/                # 类型定义
└── proxy.ts              # 认证代理（中间件）
supabase/
└── schema.sql            # 数据库表结构
```

## 隐私说明

- 所有数据通过 HTTPS 加密传输
- 数据库启用行级安全（RLS），用户只能访问自己的数据
- AI 分析的原始心事内容不持久化存储

## 免责声明

本应用的 AI 分析仅供自我探索参考，不构成任何医疗诊断或治疗建议。如有心理困扰，请寻求专业心理咨询师的帮助。
