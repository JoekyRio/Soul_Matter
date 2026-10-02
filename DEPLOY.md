# 心事 (Soul Matter) 部署指南

> 本指南面向非技术用户，手把手教你把"心事"部署到网上，随时随地使用。

## 你需要准备的账号

1. **GitHub** — 存放代码
2. **Supabase** — 数据库和用户登录
3. **Vercel** — 网站托管（免费）

---

## 第一步：创建 Supabase 项目

1. 打开 [supabase.com](https://supabase.com)，注册/登录
2. 点击 **New Project**
3. 填写：
   - Name: `soul-matter`（随便起）
   - Database Password: 设置一个密码（记下来）
   - Region: 选离你近的（如 Singapore）
4. 点击 **Create new project**，等待 1-2 分钟
5. 进入项目后，点击左侧 **SQL Editor**
6. 把 `supabase/schema.sql` 文件里的全部内容复制粘贴进去，点击 **Run**
   - 看到 "Success. No rows returned" 就表示成功了
7. 点击左侧 **Project Settings** → **API**，记录下两个值：
   - **Project URL**（类似 `https://xxxx.supabase.co`）
   - **anon public** key（一长串字符串）

---

## 第二步：把代码推送到 GitHub

1. 在 GitHub 上创建一个新仓库（或用你已有的 `soul-matter` 仓库）
2. 在本地项目目录执行：
   ```bash
   git init
   git add .
   git commit -m "初始化心事项目"
   git remote add origin https://github.com/你的用户名/soul-matter.git
   git push -u origin main
   ```

---

## 第三步：在 Vercel 上部署

1. 打开 [vercel.com](https://vercel.com)，用 GitHub 账号登录
2. 点击 **Add New...** → **Project**
3. 选择你的 `soul-matter` 仓库，点击 **Import**
4. 在 **Environment Variables** 部分，添加：
   - `NEXT_PUBLIC_SUPABASE_URL` = 你记录的 Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = 你记录的 anon key
5. 点击 **Deploy**，等待 1-2 分钟
6. 部署成功后，你会得到一个网址（类似 `https://soul-matter-xxxx.vercel.app`）

---

## 第四步：配置 Supabase 认证重定向

1. 回到 Supabase 控制台，点击 **Authentication** → **URL Configuration**
2. 在 **Site URL** 填入你的 Vercel 网址（如 `https://soul-matter-xxxx.vercel.app`）
3. 在 **Redirect URLs** 添加：`https://soul-matter-xxxx.vercel.app/auth/callback`

---

## 第五步：开始使用

1. 打开你的 Vercel 网址
2. 点击 **注册**，用邮箱和密码创建账号
3. 开始记录心事吧！

---

## 常见问题

**Q: 注册后收不到确认邮件？**
A: 在 Supabase → Authentication → Providers → Email 里，把 "Confirm email" 关掉（个人使用可以这样）。

**Q: 想换个域名？**
A: 在 Vercel 项目设置 → Domains 里添加你自己的域名。

**Q: 数据安全吗？**
A: 数据存储在 Supabase，启用了行级安全，每个用户只能访问自己的数据。传输全程 HTTPS 加密。
