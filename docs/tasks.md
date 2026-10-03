# 心事 (Soul Matter) - 实施计划

> Phase 0 + Phase 1 已完成并部署。当前进入 **Phase 2:首页重构 + Chat the Day + Panel**。
> 本计划按"最小可用增量"推进,每个里程碑只交付一类产物。
> M1 不涉及 AI,先做 UI + Panel + 多语言框架。

---

## Phase 2 · 首页重构 + Chat the Day + Panel

### M1 · 首页重构(不含 AI)— P0 当前里程碑

#### Task 10: 数据库 schema 扩展(Panel + entries.type)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None(独立于代码)
- **Description**:
  - 在 `supabase/schema.sql` 追加:
    - `entries` 表加字段 `type text not null default 'manual'`(取值 'manual' | 'chat')
    - 新表 `panel_contents` (id, user_id, content text, created_at, updated_at),RLS 仅本人读写
  - 在 Supabase SQL Editor 执行
- **Acceptance Criteria**: AC-9
- **Test Requirements**:
  - `rule` TR-10.1: schema.sql 增量部分执行无报错
  - `rule` TR-10.2: 用两个用户验证 RLS,B 读不到 A 的 panel_contents
- **Completion Evidence**: Supabase Table Editor 截图,表结构正确

#### Task 11: 多语言框架接入(next-intl)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 安装 `next-intl`,配置 `src/i18n/`
  - 起步翻译范围:顶部 LOGO/Slogan、导航(写心事、退出、登录、注册)、首页入口文案(Chat the Day / Look back / Design your panel)、Panel 占位提示
  - 首期支持 `zh` `en`,默认 `zh`
  - 语言切换器放顶部(用户草图所示位置)
- **Acceptance Criteria**: AC-13
- **Test Requirements**:
  - `rule` TR-11.1: 切换 zh → en,导航/按钮文案全部切换
  - `rule` TR-11.2: `npm run build` 通过
- **Completion Evidence**: 中英文截图对比

#### Task 12: Panel API + 编辑页
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 10
- **Description**:
  - `GET /api/panel` — 读取当前用户最新 Panel
  - `PUT /api/panel` — upsert Panel 内容(Markdown 字符串)
  - `/panel/edit` 页面:
    - 用 `react-markdown` + `textarea` 起步(简单可靠,后期再换富文本)
    - 左侧 textarea,右侧实时预览
    - 保存按钮 → PUT /api/panel → 跳回首页
- **Acceptance Criteria**: AC-9
- **Test Requirements**:
  - `rule` TR-12.1: 编辑保存后,首页 Panel 区显示渲染后内容
  - `rule` TR-12.2: 刷新后内容持久化
  - `rule` TR-12.3: 未登录访问 /panel/edit 重定向到 /login
- **Completion Evidence**: 编辑 + 首页展示截图

#### Task 13: 首页三栏布局重构
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 11, Task 12
- **Description**:
  - 重写 `src/app/page.tsx`:不再 redirect,改为直接渲染三栏布局(已登录)
  - 顶部 Header:LOGO + Slogan + 账户(头像/邮箱) + 语言切换 + 退出
  - 主体 grid(桌面 12 列):
    - 左 5 列:时间线 + 卡片流(沿用 entries 数据)
    - 右 7 列内再分上下:
      - 右上:双入口文案 [Chat the Day] / [Look back](Look back 灰显 disabled)
      - 右下:Panel 展示区 + 右下角 [Design your panel] 按钮
  - 移动端:三栏堆叠为单列,Panel 在最上,卡片流在中间,入口在下
  - 删除原 `/entries` 列表页(整合进首页),`/entries/[id]` 详情页保留
- **Acceptance Criteria**: AC-8
- **Test Requirements**:
  - `rubric` TR-13.1: 桌面 + 移动端布局还原草图,评分 >= 4
  - `rule` TR-13.2: 卡片流可上下滚动,点击进入详情
- **Completion Evidence**: 桌面 + 移动端截图对比草图

#### Task 14: 卡片流搜索 + 筛选
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 13
- **Description**:
  - 左侧卡片流顶部加搜索框 + 情绪/标签筛选器
  - 客户端过滤(数据量小)或服务端查询(数据量大),起步用客户端过滤即可
  - 搜索匹配标题 + 内容
  - 筛选支持多选情绪 + 多选标签
- **Acceptance Criteria**: AC-10
- **Test Requirements**:
  - `rule` TR-14.1: 关键词搜索结果正确
  - `rule` TR-14.2: 情绪/标签筛选结果正确
- **Completion Evidence**: 操作截图

#### Task 15: M1 联调 + 构建 + 部署验证
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 10 ~ Task 14
- **Description**:
  - `npm run build` 通过,无 TS / lint 错误
  - `npm run dev` 本地全流程走通:登录 → 首页三栏 → 编辑 Panel → 搜索筛选
  - 提交到 GitHub `feature/phase2-m1` 分支,PR 合并 main
  - Vercel 自动部署,线上验证
- **Acceptance Criteria**: AC-8, AC-9, AC-10, AC-13
- **Test Requirements**:
  - `rule` TR-15.1: build + lint 0 错误
  - `rule` TR-15.2: 线上 https://soulmatter.vercel.app 可访问,功能正常
- **Completion Evidence**: Vercel 部署 Ready 截图 + 线上首页截图

---

### M2 · Chat the Day 基础对话(P0,M1 完成后)

#### Task 16: 对话表 schema + DeepSeek 接入
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 15
- **Description**:
  - 新表 `conversations` (id, user_id, title, created_at, updated_at)
  - 新表 `messages` (id, conversation_id, role, content, model, token_count, created_at)
  - 在 Vercel 加环境变量 `DEEPSEEK_API_KEY`(Secret,仅 Production + Preview,后端用,**不加 NEXT_PUBLIC_ 前缀**)
  - `src/lib/deepseek.ts`:封装 chat completions 调用,流式返回
- **Acceptance Criteria**: AC-11
- **Test Requirements**:
  - `rule` TR-16.1: schema 执行无错
  - `rule` TR-16.2: 本地 `npm run dev` 调 DeepSeek API 返回流式 token
- **Completion Evidence**: 本地 curl 调通 DeepSeek 截图

#### Task 17: /chat 页面 + 流式对话 UI
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 16
- **Description**:
  - `/chat` 页面:简洁输入框(预置 placeholder "Tell me what touched you today?")
  - 客户端用 `fetch` + `ReadableStream` 逐字渲染 AI 回复
  - 消息列表在输入框下方累积
  - 对话持久化到 conversations + messages
- **Acceptance Criteria**: AC-11
- **Test Requirements**:
  - `rule` TR-17.1: 流式输出无中断,token 逐字出现
  - `rule` TR-17.2: 刷新页面后历史消息能加载
- **Completion Evidence**: 对话截图 + 数据库 messages 记录

#### Task 18: AI 调用日志
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 17
- **Description**:
  - 新表 `ai_logs` (id, user_id, endpoint, prompt, response, model, prompt_tokens, completion_tokens, duration_ms, error, created_at)
  - 所有 AI 调用前后写入日志,debug 可复现
- **Acceptance Criteria**: AC-11
- **Test Requirements**:
  - `rule` TR-18.1: 每次 AI 调用都有对应日志记录
- **Completion Evidence**: Supabase ai_logs 表查询截图

---

### M3 · AI 实时总结(P1)

#### Task 19: 总结 schema + summarize API
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 18
- **Description**:
  - 新表 `conversation_summaries` (id, conversation_id, topic, content_summary, mood, tags jsonb, user_conclusion text, created_at)
  - `POST /api/chat/summarize`:传 conversation_id,调 DeepSeek 生成 Topic/Content/Mood/Tag
  - **user_conclusion 字段返回时强制为空**,等用户填
- **Acceptance Criteria**: AC-12
- **Test Requirements**:
  - `rule` TR-19.1: AI 不代写 conclusion
  - `rule` TR-19.2: 总结写入 entries(type='chat')
- **Completion Evidence**: 总结面板截图

#### Task 20: /chat 页面左侧总结面板
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 19
- **Description**:
  - /chat 页面布局调整:左总结面板 + 右对话区
  - 总结面板展示 Topic/Content/Mood/Tag + 用户 conclusion 输入框
  - 用户填完 conclusion → 保存 → 写入 entries → 跳回首页
- **Acceptance Criteria**: AC-12
- **Test Requirements**:
  - `rule` TR-20.1: 首页卡片流能看到该 chat 类型 entry
- **Completion Evidence**: 首页卡片流截图

---

### M4 · Panel AI 推荐(P2,后续)

#### Task 21: Panel AI 推荐
- **Status**: `pending`
- **Priority**: low
- **Depends On**: Task 20
- **Description**:
  - /panel/edit 加 [AI Recommend] 按钮
  - 后端 `POST /api/panel/recommend`:读用户全部对话历史 + entries,生成 Motto 候选
  - 前端展示候选,用户挑选/编辑后保存
- **Acceptance Criteria**: FR-2.14, FR-2.15
- **Test Requirements**:
  - `rule` TR-21.1: 推荐基于用户历史,不空泛
- **Completion Evidence**: 推荐候选截图

---

## Phase 3 · 心理学知识库 RAG(P2,后续)

#### Task 22: pgvector 启用 + 知识库 schema
#### Task 23: 知识库内容收录 + 切片向量化
#### Task 24: 混合检索(向量 + BM25)注入 prompt
#### Task 25: 科学引导 system prompt 体系
> 详细任务待 M3 完成后细化

---

## Phase 4 · 行为改变跟踪(后续)
> 待 Look back 与行为目标设计细化后补任务

---

## Phase 5 · 多端 App(后续)
> 待 PWA / Capacitor 决策后补任务

---

## Phase 6 · 隐私安全(后续)
> 待数据导出/删除策略决策后补任务

---

## 依赖关系图(Phase 2)

```
M1 首页重构(不含 AI)
  Task 10 (schema: panel + entries.type)
  Task 11 (i18n)              ─┐
  Task 12 (Panel API + 编辑页) ─┤─ Task 13 (三栏布局) ─ Task 14 (搜索筛选) ─ Task 15 (M1 联调)
                                │
M2 Chat the Day 基础
  Task 15 ─ Task 16 (对话 schema + DeepSeek) ─ Task 17 (/chat 流式 UI) ─ Task 18 (AI 日志)

M3 AI 实时总结
  Task 18 ─ Task 19 (总结 API) ─ Task 20 (总结面板)

M4 Panel AI 推荐
  Task 20 ─ Task 21
```

---

## 历史任务(Phase 0 + 1,已完成)

### Task 1 ~ Task 9: 详见历史版本
- 项目骨架、Supabase 集成、认证、CRUD API、列表/详情页、创建/编辑页、标签、响应式布局、部署配置
- 全部 `completed`,MVP 已部署在 https://soulmatter.vercel.app
- 审查记录见 `review.md`
