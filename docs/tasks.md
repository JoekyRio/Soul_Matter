# 心事 (Soul Matter) - 实施计划 v2

> **v2 草案 · 2026-10-06**：根据 `docs/product-review.md` 重新梳理。标 ❓ 的地方取决于评审文档第 5 节的决策（D1–D7），确认后去掉 ❓。
>
> 原则：
> 1. 每个里程碑交付一个**用户能感受到的变化**，并且服务于"记录 → 觉察 → 行动 → 复盘"循环中的某一环
> 2. 每个里程碑以 **CI 全绿 + 你在 Vercel 预览链接上按验收清单走一遍** 结束；"完成"不由写代码的一方自己宣布
> 3. 任务大小：S = 一次对话内完成；M = 1–2 次；L = 需要拆分
>
> 历史：Phase 0 + 1（Task 1–9）与 M1（Task 10–14）的原始记录见本文末尾和 git 历史。

---

## 总览

```
M1.5 修复与质量地基 ──▶ M2 Chat the Day v1 ──▶ M3 对话→心事→Panel 闭环 ──▶ M4 复盘与"敢给朋友用"
   (地基)                 (①记录 + ②觉察)          (②觉察 → ③行动)               (④复盘 + 信任)
```

| 里程碑 | 任务 | 状态 |
|---|---|---|
| M1.5 修复与质量地基 | Task 15–19 | `pending`（下一步） |
| M2 Chat the Day v1 | Task 20–25 | `pending` |
| M3 对话 → 心事 → Panel 闭环 | Task 26–29 | `pending` |
| M4 复盘与"敢给朋友用" | Task 30–33 | `pending` |
| Backlog | 见文末 | 验证后再排 |

---

## M1.5 · 修复与质量地基

> 目标：M1 的功能全部真正可用；从此以后每次改动都有自动检查把关。
> 背景：见 `product-review.md` 第 3 节（B1–B10）。

#### Task 15: 路由与中间件修复（B1、B8）
- **Status**: `pending`
- **Priority**: high · **Size**: M
- **Depends On**: None
- **Description**:
  - 按 Next.js 16 约定，`middleware.ts` → `proxy.ts`（导出函数名 `proxy`），先读 `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`
  - 在 proxy 中真正调用 next-intl 中间件，并与 Supabase 会话刷新合并（保留 Supabase 写入的 cookie）
  - 修复"无语言前缀的路径都被当作 `/`"的判断
  - 新建 `src/i18n/navigation.ts`（next-intl 的 `createNavigation`），全站内部跳转改用其导出的 `Link` / `redirect` / `useRouter`，不再手写 `/zh/...`
  - 删除旧 `/entries` 列表页与根 `src/app/page.tsx` 的重定向；已登录访问 `/login`、认证回调成功后都进入新首页
- **Acceptance Criteria**: AC-8, AC-13
- **Test Requirements**:
  - `rule` TR-15.1: 已登录时，首页点卡片 → 详情页；详情页 编辑/删除/返回 都正常
  - `rule` TR-15.2: 未登录时，登录页点"注册"能进入注册页
  - `rule` TR-15.3: `/` 和 `/en` 都进入对应语言的新首页
- **Completion Evidence**: 冒烟测试（Task 18）全部通过

#### Task 16: 布局与导航修复（B2、B3、B5、B10）
- **Status**: `pending`
- **Priority**: high · **Size**: M
- **Depends On**: Task 15
- **Description**:
  - 只保留一层 `<html><body>`（根 layout 与 `[locale]` layout 二选一）
  - 抽出共享的 `AppHeader`：LOGO + **写心事** + 语言切换（复用 `LocaleSwitcher`）+ 账户 + 退出；首页与所有内页共用
  - 退出按钮改用已有的 `signOut` Server Action
  - 内页统一容器宽度和边距
  - 移动端顺序：Panel → 入口（Chat the Day）→ 卡片流
- **Acceptance Criteria**: AC-8
- **Test Requirements**:
  - `rule` TR-16.1: 首页和每个内页都能看到导航栏，能"写心事"、能退出
  - `rubric` TR-16.2: 手机（≈375px 宽）与电脑上布局整齐，评分 ≥ 4
- **Completion Evidence**: 手机 + 电脑截图

#### Task 17: 文案国际化补全 + Markdown 样式 + 深色模式（B4、B6、B7、B9）
- **Status**: `pending`
- **Priority**: medium · **Size**: M
- **Depends On**: Task 16
- **Description**:
  - 首页、登录/注册、卡片流、筛选器、情绪标签、心事表单、详情页的文案全部移入 `messages/*.json` ❓（D4：若不需要英文，仍走翻译文件，但英文可暂时与中文相同）
  - 安装 `@tailwindcss/typography`，让 Panel 的 Markdown 正确显示标题、列表、引用
  - 深色模式：本阶段统一为浅色主题（移除不完整的深色变量），深色模式放入 Backlog
  - 首页卡片流：搜索改为在全部心事中进行（服务端查询或加载全部，按数据量定）
- **Acceptance Criteria**: AC-9, AC-10, AC-13
- **Test Requirements**:
  - `rule` TR-17.1: 切换 EN 后，首页、登录页、导航中不再出现写死的中文（用户输入内容除外）
  - `rule` TR-17.2: Panel 中 `# 标题`、`- 列表`、`> 引用` 显示为对应样式
  - `rule` TR-17.3: 手机开启深色模式时，所有文字清晰可读
- **Completion Evidence**: 中英文截图；Panel 截图

#### Task 18: 质量门禁（CI + 冒烟测试）
- **Status**: `pending`
- **Priority**: high · **Size**: M
- **Depends On**: Task 15（可与 16、17 并行）
- **Description**:
  - 修复全部 lint 错误，`npm run lint` 0 错误
  - 新增 `npm run typecheck`
  - 新增 GitHub Actions：每次推送/PR 自动运行 lint + typecheck + build，失败则 PR 上显示红叉
  - 新增 Playwright 冒烟测试：未登录路径（登录、注册、重定向）；如果提供了**测试专用** Supabase 项目和测试账号，再覆盖登录后的核心流程（写心事 → 首页可见 → 详情 → 编辑 → 删除；编辑 Panel → 首页可见）
  - 首页卡片流 loading 状态；接口失败时显示友好提示，不白屏
  - 新增 `docs/acceptance/M1.md`：给你用的人工验收清单
- **Acceptance Criteria**: 原 TR-15.1 ~ TR-15.4
- **Test Requirements**:
  - `rule` TR-18.1: 故意引入一个类型错误，CI 会变红（验证后撤销）
  - `rule` TR-18.2: 冒烟测试在本地和 CI 中都能运行
- **Completion Evidence**: PR 上 CI 绿色对勾截图

#### Task 19: M1 验收与上线
- **Status**: `pending`
- **Priority**: high · **Size**: S
- **Depends On**: Task 15 ~ 18
- **Description**:
  - 你在 Vercel 预览链接上（手机 + 电脑）按 `docs/acceptance/M1.md` 走一遍，发现的问题记为 GitHub Issue
  - 问题修复后合并到 `main`，Vercel 自动部署正式站，再做一次 5 分钟冒烟检查
  - 更新 README（项目结构、隐私说明）
- **Acceptance Criteria**: AC-8, AC-9, AC-10, AC-13
- **Completion Evidence**: 验收清单全部勾选；正式站截图

---

## M2 · Chat the Day v1（有引导、有护栏的对话）

> 目标：能和一个"会提问、不说教、不贴标签、有安全意识"的 AI 聊今天发生的事。
> ❓ D2：引导 prompt 与安全护栏从 Phase 3 提前到这里。

#### Task 20: 对话数据表（conversations / messages / ai_logs）
- **Status**: `pending`
- **Priority**: high · **Size**: S
- **Depends On**: Task 19
- **Description**:
  - 新迁移 `supabase/migrations/002_chat.sql`，并同步更新 `schema.sql`：
    - `conversations` (id, user_id, title, status 'active'|'ended', created_at, updated_at)
    - `messages` (id, conversation_id, user_id, role 'user'|'assistant', content, feedback smallint null, created_at)
    - `ai_logs` (id, user_id, endpoint, model, prompt_version, request jsonb, response text, prompt_tokens, completion_tokens, duration_ms, error, created_at)
  - 三张表都开启 RLS，只能访问自己的数据（`messages` 冗余 `user_id` 以简化策略）
  - ❓ D5：`ai_logs` 保留 30 天（定时清理或查询时过滤，二选一）
  - 迁移由你在 Supabase SQL Editor 执行（附操作步骤）
- **Acceptance Criteria**: AC-11
- **Test Requirements**:
  - `rule` TR-20.1: 迁移执行无报错
  - `rule` TR-20.2: 用两个账号验证：B 读不到 A 的对话和消息
- **Completion Evidence**: Supabase Table Editor 截图

#### Task 21: DeepSeek 接入层 + `/api/chat` 流式接口
- **Status**: `pending`
- **Priority**: high · **Size**: M
- **Depends On**: Task 20
- **Description**:
  - `src/lib/env.ts`：用 zod 校验环境变量，缺失时立即给出清楚的报错
  - `src/lib/ai/deepseek.ts`：封装对话调用（流式），包含超时、用户中断、失败重试一次
  - `POST /api/chat`：校验登录 → 保存用户消息 → 拼接 system prompt + 历史 → 流式返回 → 结束后保存 AI 回复 → 写 `ai_logs`
  - 统一错误格式 `{ error: { code, message } }`
  - 在 Vercel 配置 `DEEPSEEK_API_KEY`（仅服务端，**不加** `NEXT_PUBLIC_` 前缀）
- **Acceptance Criteria**: AC-11
- **Test Requirements**:
  - `rule` TR-21.1: 本地调用能逐字返回
  - `rule` TR-21.2: 每次调用都有一条 `ai_logs`（含失败的调用）
  - `rule` TR-21.3: 未登录调用返回 401
- **Completion Evidence**: ai_logs 记录截图

#### Task 22: 引导 Prompt v1 + 测试剧本集
- **Status**: `pending`
- **Priority**: high · **Size**: M
- **Depends On**: None（可与 Task 20、21 并行；**由你和 AI 共同完成**）
- **Description**:
  - `prompts/chat-guide.md`：system prompt 独立成文件，带版本号
    - 角色：温和、好奇的陪伴者，不是咨询师
    - 节奏：参考 CBT 思维记录——情境 → 情绪（强度）→ 自动想法 → 证据 → 换个角度
    - 规则：一次只问一个问题；多问少说；不诊断、不贴标签；不替用户下结论；回应长度适合手机阅读
    - 安全协议：识别到自伤/自杀/伤人信号时停止常规引导，表达关心并提供求助资源
  - `prompts/test-scripts.md`：10–15 个测试剧本（工作冲突、社交内耗、独处的无力感、家庭矛盾……以及 2–3 个危机场景）
  - `prompts/rubric.md`：评分表（共情、提问质量、不说教、不贴标签、安全应对，各 1–5 分）
  - 每次修改 prompt：跑一遍剧本、记录分数，分数不降才上线
- **Acceptance Criteria**: AC-14（新增，见下）
- **Test Requirements**:
  - `rubric` TR-22.1: 剧本平均分 ≥ 4；危机剧本 100% 给出求助资源
- **Completion Evidence**: 剧本评分记录

#### Task 23: `/chat` 页面
- **Status**: `pending`
- **Priority**: high · **Size**: M
- **Depends On**: Task 21
- **Description**:
  - **移动优先**的对话界面：输入框占位文字 "Tell me what touched you today?"，消息逐字出现
  - 发送中禁用重复发送；可中途停止；网络失败可重试
  - 刷新页面后继续当前对话；首页 [Chat the Day] 入口点亮
  - 键盘弹起时输入框不被遮挡（iOS Safari）
- **Acceptance Criteria**: AC-11
- **Test Requirements**:
  - `rule` TR-23.1: 流式输出无中断，刷新后历史消息仍在
  - `rubric` TR-23.2: 手机上单手可用，评分 ≥ 4
- **Completion Evidence**: 手机对话录屏

#### Task 24: 安全护栏与知情同意
- **Status**: `pending`
- **Priority**: high · **Size**: S
- **Depends On**: Task 22, Task 23
- **Description**:
  - 求助资源卡片：在 /chat 页面始终可以打开；AI 识别到危机信号时自动展示
  - ❓ D7：热线号码与服务时间由你核实后提供
  - 首次进入 /chat 时的一屏说明：AI 不是咨询师；数据存储在哪里、谁能看到、会发送给 DeepSeek；紧急情况找谁。点"我知道了"后不再显示
- **Acceptance Criteria**: AC-14
- **Test Requirements**:
  - `rule` TR-24.1: 危机测试剧本触发资源卡片
- **Completion Evidence**: 截图

#### Task 25: 对话反馈 👍 / 👎
- **Status**: `pending`
- **Priority**: medium · **Size**: S
- **Depends On**: Task 23
- **Description**:
  - 每条 AI 回复可点 👍/👎（👎 可选填一句原因），存入 `messages.feedback`
  - 这是你迭代 prompt 的数据来源
- **Test Requirements**:
  - `rule` TR-25.1: 反馈写入数据库，刷新后保持
- **Completion Evidence**: 截图

---

## M3 · 对话 → 心事 → Panel 闭环

> 目标：聊完生成一张心事卡片，写下**自己的**结论，一键钉到 Panel。
> ❓ D3：总结在"结束对话"时一次性生成；不建 `conversation_summaries` 表。

#### Task 26: 结束对话 → AI 整理
- **Status**: `pending`
- **Priority**: high · **Size**: M
- **Depends On**: Task 25
- **Description**:
  - 新迁移 `003_entry_conclusion.sql`：`entries` 加 `conversation_id uuid null`、`conclusion text null`
  - `POST /api/chat/summarize`：读取整段对话，让 AI 以 JSON 输出 topic / content / mood / tags
    - mood 只能从现有 8 个预设中选
    - **不生成 conclusion**
  - 失败时允许用户手动填写
  - 独立的 prompt 文件 `prompts/summarize.md`
- **Acceptance Criteria**: AC-12
- **Test Requirements**:
  - `rule` TR-26.1: 输出字段齐全，mood 在预设范围内
  - `rule` TR-26.2: 响应中不包含任何 conclusion 内容
- **Completion Evidence**: 示例输出截图

#### Task 27: 心事确认卡 + 必填 Conclusion
- **Status**: `pending`
- **Priority**: high · **Size**: M
- **Depends On**: Task 26
- **Description**:
  - 确认卡：显示 AI 整理的标题/内容/情绪/标签（都可修改）+ "我的结论"输入框（必填）
  - 保存 → 写入 `entries`（type='chat'，关联 conversation_id）→ 对话状态改为 ended → 回到首页
  - 手动写心事的表单也增加可选的"我的结论"字段；标题改为可选（留空取内容第一句）
- **Acceptance Criteria**: AC-12
- **Test Requirements**:
  - `rule` TR-27.1: 未填结论无法保存
  - `rule` TR-27.2: 首页卡片流出现这条心事
- **Completion Evidence**: 流程录屏

#### Task 28: Conclusion 一键加入 Panel
- **Status**: `pending`
- **Priority**: high · **Size**: S
- **Depends On**: Task 27
- **Description**:
  - 保存心事后（以及在心事详情页）提供"把这句结论加到我的 Panel"
  - 追加到 Panel 末尾（Markdown 列表项），可回到 Panel 编辑页调整
- **Test Requirements**:
  - `rule` TR-28.1: 加入后首页 Panel 立即可见
- **Completion Evidence**: 截图

#### Task 29: 卡片流区分来源 + 查看原对话
- **Status**: `pending`
- **Priority**: medium · **Size**: S
- **Depends On**: Task 27
- **Description**:
  - 卡片上用小图标区分"对话"和"手写"；卡片显示结论（如有）
  - 来自对话的心事，详情页可展开原对话
  - 筛选器增加"来源"筛选
- **Test Requirements**:
  - `rule` TR-29.1: 两种来源都能正确显示和筛选
- **Completion Evidence**: 截图

---

## M4 · 复盘与"敢给朋友用"

> 目标：能看到自己的变化；能装到手机主屏幕；朋友使用前，隐私和数据控制到位。

#### Task 30: Look back 简易版
- **Status**: `pending`
- **Priority**: medium · **Size**: M
- **Depends On**: Task 29
- **Description**:
  - `/look-back`：最近 4 周的情绪分布（按周）+ 你写下的结论时间线
  - 不调用 AI；首页 [Look back] 入口点亮
- **Acceptance Criteria**: FR-4.4（简易版）
- **Test Requirements**:
  - `rule` TR-30.1: 数据与实际记录一致
- **Completion Evidence**: 截图

#### Task 31: PWA 基础（添加到主屏幕）
- **Status**: `pending`
- **Priority**: medium · **Size**: S
- **Depends On**: Task 19
- **Description**:
  - Web App Manifest、应用图标、主题色；iOS / Android "添加到主屏幕" 后全屏打开
  - 不做离线功能
- **Acceptance Criteria**: FR-5.1
- **Test Requirements**:
  - `rule` TR-31.1: iPhone Safari 与 Android Chrome 均可添加并以独立窗口打开
- **Completion Evidence**: 手机主屏幕截图

#### Task 32: 导出我的数据 + 删除我的全部数据
- **Status**: `pending`
- **Priority**: high · **Size**: M
- **Depends On**: Task 27
- **Description**:
  - 设置页：导出全部心事、对话、Panel（JSON + 可读的 Markdown）
  - 删除全部数据（二次确认），包括 `ai_logs`
- **Acceptance Criteria**: FR-6.1, FR-6.2
- **Test Requirements**:
  - `rule` TR-32.1: 导出文件包含全部数据；删除后数据库中查不到该用户的数据
- **Completion Evidence**: 导出文件示例

#### Task 33: 隐私说明 + 朋友内测准备
- **Status**: `pending`
- **Priority**: high · **Size**: S
- **Depends On**: Task 24, Task 32
- **Description**:
  - 隐私说明页：存了什么、谁能看到（含"项目管理员技术上可见"）、发送给了谁（DeepSeek）、如何导出和删除
  - 修正 README 与 spec 中不准确的隐私描述
  - 内测准备：邀请方式（关闭开放注册或使用邀请码 ❓）、反馈渠道、Supabase 免费版"7 天无访问自动暂停"的应对
- **Completion Evidence**: 隐私页截图；内测邀请说明

---

## Backlog（验证后再排）

| 条目 | 原位置 | 什么时候考虑 |
|---|---|---|
| Panel AI 推荐 Motto | M4 / Task 21 | Conclusion → Panel 用了一段时间后，看是否还需要 |
| 心理学知识库 RAG | Phase 3 | 测试剧本显示 prompt-only 在"准确性/有据可依"上明显不足时 ❓ D6 |
| 对话中实时总结侧栏 | M3 / FR-2.11 | 电脑端使用较多时 |
| 行为目标设定与打卡 | Phase 4 | M4 之后 |
| AI 个性化建议 / 基于历史的反馈 | Phase 4 | 积累足够记录后 |
| 语音输入 | FR-2.7 | 先用手机输入法自带的语音输入 |
| 深色模式 | — | Task 17 后 |
| 原生 App（Capacitor） | Phase 5 | PWA 不够用时 |
| AI 分析前敏感信息脱敏 | Phase 6 | 朋友内测反馈后 |
| 自部署模型 / Agent 工具调用 | P5+ | 远期 |

---

## 新增验收标准（待合并进 spec）

### AC-14: 引导质量与安全
- **Type**: `rubric` + `rule`
- **Rubric**: 测试剧本平均分 ≥ 4（共情、提问质量、不说教、不贴标签、安全应对）
- **Rule**: 危机场景剧本 100% 给出求助资源，且不继续常规引导
- **Evidence**: `prompts/` 下的评分记录

---

## 依赖关系图

```
M1.5   Task 15 ─┬─ Task 16 ─ Task 17 ─┐
                └─ Task 18 ───────────┴─ Task 19 (验收上线)

M2     Task 19 ─ Task 20 ─ Task 21 ─ Task 23 ─┬─ Task 24
                 Task 22 (prompt, 可并行) ─────┘   Task 25

M3     Task 25 ─ Task 26 ─ Task 27 ─┬─ Task 28
                                    └─ Task 29

M4     Task 29 ─ Task 30            Task 19 ─ Task 31
       Task 27 ─ Task 32 ─┬─ Task 33
       Task 24 ───────────┘
```

---

## 历史任务

### Phase 0 + 1（Task 1–9）· `completed`
项目骨架、Supabase 集成、认证、CRUD API、列表/详情页、创建/编辑页、标签、响应式布局、部署配置。审查记录见 `review.md`。

### Phase 2 · M1 首页重构（Task 10–14）· 代码已合并，验收未通过
- Task 10 数据库 schema 扩展（Panel + entries.type）
- Task 11 多语言框架接入（next-intl）
- Task 12 Panel API + 编辑页
- Task 13 首页三栏布局重构
- Task 14 卡片流搜索 + 筛选
- 原 Task 15（M1 联调）的内容已并入 M1.5（Task 15–19）。核查结果见 `product-review.md` 第 3 节
- 原 M2–M4 的 Task 16–21 已按新编号重新拆分，原始描述见 git 历史中的 `docs/tasks.md`
