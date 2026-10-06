# 心事 (Soul Matter) - 产品需求文档

## Overview
- **Summary**: 一个 AI Powered 的聊与分析心事、便捷记录心事、随时复盘、自定义成长支持的陪伴者。
- **Purpose**: 为在工作、社交、独处中存在内耗、冲突、无力感但有自省与改善意愿的用户,提供一个低门槛、科学、私密的自我探索工具。用户通过对话式(Chat the Day)或手动方式记录心事,内置 AI 基于循证心理学(CBT/ACT/DBT 等)进行科学引导与诊断,并通过用户自定义 Panel(Motto 行为提醒)将认知转化为行为改变。
- **Target Users**: 有自我探索意愿、受内耗困扰但暂时无法或不愿接受专业心理咨询的个体。

## 产品形态(2026-10 修订)
- 登录后首页:三栏布局
  - **左**:时间线 + 卡片流的[心事]展示,支持搜索、筛选、上下滑动
  - **右上**:入口文案 "Do you wanna [Chat the Day] or, Maybe [Look back] your changes recently"
  - **右下**:用户自定义 Panel(展示对自身有意义的内容)
  - **顶部**:产品 LOGO、账户信息、语言选项
- **Chat the Day**:简洁对话框,预置输入框 "Tell me what touched you today?",支持打字/语音,左侧实时总结(Topic/Content/Mood/Tag),用户必填自己写 Conclusion
- **Panel**:Markdown 编辑的自定义面板,可由 AI 根据对话历史推荐
- **Look back**:本期不开发

## Goals
- 提供对话式(Chat the Day)与手动两种心事记录方式,统一汇入卡片流
- 通过 AI 基于循证心理学框架进行科学引导,而非"情感马杀鸡"式回应
- AI 回答有据可依:基于心理学知识库 RAG,不编造、不贴标签
- Panel 以自我设计的 Motto 形式,将认知转化为行为提醒/安抚/未来描述
- 多端接入(Web 响应式 → PWA → 原生 App),随时随地记录
- 多语言支持(起步:中文/英文)
- 保护用户隐私,用户对数据有完全控制权

## Non-Goals
- **不提供临床心理诊断或治疗**:AI 分析为自我洞察参考,不替代专业心理咨询
- **不做社区/社交功能**:聚焦个人记录与自我分析
- **不做商业化/付费墙**:仅供自己和朋友使用
- **不做本地离线优先架构**:采用云端托管,简化部署
- **本期不做 Look back**:Look back 功能暂缓

## Background & Context
- 用户为非技术人员,使用托管服务降低运维门槛
- 已确认关键决策:
  - **预算**:10-50 元/月(DeepSeek 成本低,Vercel + Supabase 免费额度足够)
  - **隐私**:HTTPS 传输加密 + 数据库存储加密;AI 分析的结构化结果可持久化,原始心事正文用于检索但脱敏处理
  - **AI 模型**:DeepSeek(中文好、成本低),通过 API 接入,远期考虑自部署
  - **开发工具**:方案讨论期用对话窗口,实现期转 **TraeCode IDE**(支持 AI Coding Agent / SOLO 模式,能跑终端、构建、Git)
- 技术栈:Next.js 16 (App Router) + Supabase(PostgreSQL + pgvector + Auth) + Tailwind + DeepSeek API + Vercel
- 用户已有 GitHub 仓库 https://github.com/JoekyRio/Soul_Matter,Phase 1 MVP 已部署在 https://soulmatter.vercel.app

## Functional Requirements

### Phase 0 · 项目基础 ✅ 已完成
- **FR-0.1**: 项目可本地 `npm run dev` 启动
- **FR-0.2**: 推送 GitHub 后一键部署 Vercel
- **FR-0.3**: 数据库 schema 在 Supabase 执行

### Phase 1 · 心事记录 MVP ✅ 已完成并部署
- **FR-1.1 ~ FR-1.7**: 邮箱注册登录、心事 CRUD、标签、响应式、RLS

### Phase 2 · 首页重构 + Chat the Day + Panel(当前迭代)

#### M1 · 首页重构(不含 AI,P0)
- **FR-2.1**: 登录后首页改为三栏布局
  - 左:时间线 + 卡片流(沿用 entries 数据,支持搜索 + 筛选 + 滚动)
  - 右上:双入口文案区 [Chat the Day] / [Look back](Look back 灰显占位)
  - 右下:用户自定义 Panel 展示区,右下角 [Design your panel] 入口
  - 顶部:产品 LOGO + 账户信息 + 语言选项(起步 zh/en,默认中文)
- **FR-2.2**: Panel 展示页读取用户最新 Panel 内容,Markdown 渲染
- **FR-2.3**: Panel 编辑页(`/panel/edit`)用 Markdown 编辑器,保存到 Supabase
- **FR-2.4**: 卡片流支持关键词搜索 + 按情绪/标签筛选
- **FR-2.5**: 多语言框架接入(next-intl),首期翻译导航/按钮文案

#### M2 · Chat the Day 基础对话(P0,接入 DeepSeek)
- **FR-2.6**: `/chat` 页面,简洁输入框预置 "Tell me what touched you today?"
- **FR-2.7**: 支持打字输入(语音输入延后)
- **FR-2.8**: 接入 DeepSeek API,流式输出(SSE),token 逐字渲染
- **FR-2.9**: 对话消息在输入框下方累积展示(常见对话 UI)
- **FR-2.10**: 对话内容持久化到 `conversations` + `messages` 表

#### M3 · AI 实时总结(P1)
- **FR-2.11**: 对话进行中,AI 实时/按轮次生成总结写入 `conversation_summaries`
  - Topic Summarized
  - Content Summarized
  - Mood
  - Tag
- **FR-2.12**: **Your conclusion 字段必须用户手动输入**,AI 不生成
- **FR-2.13**: 总结完成后写入 `entries` 表(type='chat'),首页卡片流展示

#### M4 · Panel AI 推荐(P2)
- **FR-2.14**: Panel 编辑页 [AI Recommend] 按钮,基于用户全部对话历史生成 Motto 候选
- **FR-2.15**: 用户从候选中挑选或自己编辑,最终保存为自己的 Panel

### Phase 3 · 心理学知识库 RAG(P2)
- **FR-3.1**: 建立 `knowledge_documents` + `knowledge_chunks` 表,启用 pgvector
- **FR-3.2**: 收录 CBT/ACT/DBT 等循证疗法资料,切片 + 向量化
- **FR-3.3**: Chat the Day 对话时,向量 + BM25 混合检索相关片段注入 prompt
- **FR-3.4**: 科学引导 system prompt 体系(苏格拉底式提问、不贴标签、可落地行动建议)
- **FR-3.5**: AI 调用全链路日志(prompt/response/token/耗时)存 Supabase,便于 debug

### Phase 4 · 行为改变跟踪(后续)
- **FR-4.1**: 用户设定行为改变目标并打卡
- **FR-4.2**: AI 基于历史数据提供个性化建议、安抚、鼓励、客观反馈
- **FR-4.3**: 诊断模型随数据持续迭代
- **FR-4.4**: Look back 功能(回顾近期变化)

### Phase 5 · 多端与 App(后续)
- **FR-5.1**: PWA 支持,可添加到桌面
- **FR-5.2**: Capacitor 打包 iOS/Android App
- **FR-5.3**: 多设备数据同步

### Phase 6 · 隐私安全(后续)
- **FR-6.1**: 数据一键导出
- **FR-6.2**: 数据一键删除
- **FR-6.3**: AI 分析前敏感内容脱敏

## Non-Functional Requirements
- **NFR-1**: 所有数据传输使用 HTTPS
- **NFR-2**: 数据库启用 RLS,用户只能访问自己数据
- **NFR-3**: AI 调用全链路日志,可复现 debug
- **NFR-4**: 首屏加载 < 2 秒(本地网络)
- **NFR-5**: 流式响应健壮(中断/重试/超时处理)
- **NFR-6**: 月运营成本 < 50 元
- **NFR-7**: AI 不做医学诊断,不替代专业心理咨询;回答必须基于知识库,不编造

## Constraints
- **Technical**: Next.js 16 (App Router, 注意 breaking changes,见 AGENTS.md) + Supabase + pgvector + DeepSeek API + Tailwind + next-intl + Vercel
- **Business**: 仅供个人和朋友使用,不对外发布,不做商业化
- **Dependencies**: DeepSeek API Key、Supabase 项目、Vercel 账号、GitHub 仓库

## Architecture(2026-10 修订)

```
前端: Next.js 16 App Router + TypeScript + Tailwind + next-intl
  ├─ 三栏布局首页 (/)
  ├─ Chat the Day (/chat) — 流式对话
  ├─ Panel (/panel, /panel/edit) — Markdown 展示/编辑
  └─ 心事详情 (/entries/[id])

布局策略:
  - 全局 Navbar 保留给内页使用(entries/new, entries/[id]/edit 等)
  - 首页 (/) 在 M1 Task 13 中内联 Header,不再使用全局 Navbar
  - middleware.ts 需同步保护 / 路径(M1 完成后)

后端: Next.js Route Handlers
  ├─ /api/entries            心事 CRUD(已有)
  ├─ /api/chat               流式对话(M2)
  ├─ /api/chat/summarize     AI 总结(M3)
  ├─ /api/panel              Panel CRUD(M1)
  ├─ /api/conversations      会话管理(M2)
  └─ /api/messages           消息管理(M2)

数据库: Supabase PostgreSQL + pgvector
  ├─ profiles / entries / tags / entry_tags(已有,保留)
  ├─ entries 表加 type 字段: 'manual' | 'chat'
  ├─ conversations           对话会话
  ├─ messages                对话消息
  ├─ conversation_summaries  AI 总结 + 用户 conclusion
  ├─ panel_contents          Panel 内容(Markdown)
  ├─ knowledge_documents     知识库文档(P3)
  └─ knowledge_chunks        知识库切片 + 向量(P3)

AI 层:
  ├─ 起步: DeepSeek-V3 API(M2)
  ├─ 知识库 RAG: pgvector + 混合检索(P3)
  ├─ 科学引导 system prompt 体系(P3)
  └─ 远期: 自部署模型 + Agent 工具调用(P5+)
```

## AI 工程规范(AI Coding 与 Debug)
1. **类型优先**:所有 API 请求/响应定义 TypeScript 类型,前后端共享(`src/types/`)
2. **环境变量校验**:启动时 zod 校验,缺失立即报错
3. **API 错误统一**:所有错误返回 `{ error: { code, message } }`
4. **AI 调用必记日志**:prompt/response/token/耗时/错误存 Supabase,debug 可复现
5. **流式响应健壮**:处理中断、重试、超时
6. **先本地跑通再部署**:`npm run dev` 验证,不在 Vercel 上 debug
7. **Git 规范**:功能分支 `feature/xxx`,commit `feat:/fix:/refactor:`
8. **Prompt 文档化**:AI system prompt 单独存文件,便于迭代

## Acceptance Criteria

### AC-1 ~ AC-7: Phase 0/1(已完成,保留)
详见历史版本。MVP 已部署在 https://soulmatter.vercel.app

### AC-8: 首页三栏布局(M1)
- **Type**: `rubric`
- **Dimension**: 三栏布局还原度 + 响应式 + 卡片流交互
- **Scale**: 1-5
- **Anchors**: 1 = 布局错乱;3 = 三栏可见但响应式有瑕疵;5 = 还原草图 + 桌面/移动端流畅
- **Pass Threshold**: >= 4
- **Evidence**: 桌面 + 移动端截图对比草图

### AC-9: Panel 编辑与展示(M1)
- **Type**: `rule`
- **Given**: 用户已登录
- **When**: 进入 /panel/edit,输入 Markdown,保存;返回首页
- **Then**: 首页右下 Panel 区显示渲染后的内容
- **Pass Condition**: Markdown 正确渲染,刷新后内容持久化
- **Evidence**: 编辑 + 首页展示截图

### AC-10: 卡片流搜索筛选(M1)
- **Type**: `rule`
- **Given**: 已有多条心事
- **When**: 输入关键词、按情绪/标签筛选
- **Then**: 卡片流实时过滤
- **Pass Condition**: 搜索/筛选结果正确
- **Evidence**: 操作截图

### AC-11: Chat the Day 流式对话(M2)
- **Type**: `rule`
- **Given**: 用户已登录,DeepSeek Key 已配置
- **When**: 在 /chat 输入消息发送
- **Then**: AI 回复逐字流式渲染,消息累积展示
- **Pass Condition**: 流式输出无中断,消息持久化
- **Evidence**: 对话截图 + 数据库 messages 记录

### AC-12: AI 实时总结 + 用户 conclusion(M3)
- **Type**: `rule`
- **Given**: 一段 Chat the Day 对话
- **When**: 触发总结
- **Then**: AI 生成 Topic/Content/Mood/Tag,Conclusion 字段为空等用户填
- **Pass Condition**: AI 不代写 conclusion,总结写入 entries(type='chat')
- **Evidence**: 总结面板截图 + entries 表记录

### AC-13: 多语言切换(M1)
- **Type**: `rule`
- **Given**: 首页已加载
- **When**: 切换语言 zh → en
- **Then**: 顶部/导航/按钮文案切换为英文
- **Pass Condition**: 起码导航与入口文案翻译完成
- **Evidence**: 中英文截图对比

## Open Questions
- [x] GitHub 仓库:https://github.com/JoekyRio/Soul_Matter(已确认)
- [x] Supabase 项目:已创建,Phase 1 已部署
- [x] AI 模型:DeepSeek(已确认)
- [x] 开发工具:实现期转 TraeCode IDE(已确认)
- [x] 多语言:首期翻译范围(导航/按钮 / 全部)? → 首期翻译范围: 导航/按钮/首页入口文案(Task 11 已确认)
- [x] Panel Markdown 编辑器组件选型(react-markdown + textarea / Monaco / 其他)? → react-markdown + textarea(Task 12 已确认)
- [x] 心事情绪维度:沿用预设列表还是情绪轮? → 沿用现有预设列表(calm/happy/anxious/angry/sad/tired/confused/lonely)
