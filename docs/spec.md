# 心事 (Soul Matter) - 产品需求文档

> 修订记录：2026-10-06 v2 —— 根据 `docs/product-review.md` 的评审与决策（D1–D7 全部按推荐）修订。主要变化：引导 prompt 与安全护栏提前到 Chat 上线时；AI 总结改为对话结束时生成；Conclusion 统一存入 entries 并可一键加入 Panel；新增「安全与危机应对」「成功标准」；修正隐私描述；界面以中文为主。

## Overview
- **Summary**: 一个 AI Powered 的聊与分析心事、便捷记录心事、随时复盘、自定义成长支持的陪伴者。
- **Purpose**: 为在工作、社交、独处中存在内耗、冲突、无力感但有自省与改善意愿的用户，提供一个低门槛、科学、私密的自我探索工具。用户通过对话式（Chat the Day）或手动方式记录心事；内置 AI 基于循证心理学（CBT/ACT/DBT 等）进行**引导**，帮助用户**自己**得出结论（觉察），并通过用户自定义 Panel（Motto 行为提醒）将认知转化为行为改变。
- **Target Users**: 有自我探索意愿、受内耗困扰但暂时无法或不愿接受专业心理咨询的个体。第一位用户是产品负责人本人，之后邀请朋友使用。

## 核心循环

```
 ①记录            ②觉察                    ③行动                  ④复盘
 便捷地说出来 ──▶ AI 引导，用户自己写下 ──▶ 结论变成 Panel 上的 ──▶ 回头看：我变了吗？
 (Chat / 手动)    结论（Conclusion）         Motto，每天看到          (Look back)
```

每个功能都应服务于循环中的某一环，并且环与环之间要真正连接。

## 产品形态
- 登录后首页：三栏布局（手机上单列：Panel → 入口 → 卡片流）
  - **左**：时间线 + 卡片流的[心事]展示，支持搜索、筛选
  - **右上**：入口文案 "Do you wanna [Chat the Day] or, maybe [Look back] on your recent changes?"
  - **右下**：用户自定义 Panel（展示对自身有意义的内容）
  - **顶部**：产品 LOGO、写心事、语言切换、账户、退出
- **Chat the Day**：移动优先的简洁对话页，预置输入框 "Tell me what touched you today?"。AI 按引导框架提问，不说教、不贴标签、不替用户下结论。用户点"结束今天的对话"后，AI 一次性整理出 Topic / Content / Mood / Tag（均可修改），**用户必须自己写下 Conclusion** 才能保存为一条心事；保存后可一键把 Conclusion 加入 Panel
- **手动记录**：标题、内容、情绪、标签，以及可选的"我的结论"
- **Panel**：Markdown 编辑的自定义面板；可接收来自心事的 Conclusion
- **Look back（简易版）**：最近几周的情绪分布 + 我写下的结论时间线，不调用 AI
- **语言**：以中文为主；保留英文框架，英文文案缺失时自动显示中文

## Goals
- 提供对话式（Chat the Day）与手动两种心事记录方式，统一汇入卡片流
- AI 基于循证心理学框架进行**引导**，而非"情感马杀鸡"式回应；改变来自用户自己的重新评估
- AI 回答有分寸：不诊断、不贴标签、不编造；涉及心理学概念时用通俗语言说明
- 结论（Conclusion）可以一键变成 Panel 上的 Motto，把认知转化为行为提醒
- 能回顾自己的变化（Look back）
- 多端接入（Web 响应式 → PWA → 视需要再做原生 App），随时随地记录
- 保护用户隐私，用户对数据有完全控制权（导出、删除）

## Non-Goals
- **不提供临床心理诊断或治疗**：AI 的作用是帮助用户觉察，不替代专业心理咨询
- **不做社区/社交功能**：聚焦个人记录与自我探索
- **不做商业化/付费墙**：仅供自己和朋友使用
- **不做本地离线优先架构**：采用云端托管，简化部署
- **暂不做英文版的完整维护**：新功能只写中文文案

## 成功标准
- 产品负责人连续 4 周、每周记录 ≥ 3 次
- 回看 Conclusion 时，至少一半让人觉得"当时想通了一些东西"
- 每次对话的 👍/👎 反馈中，👍 比例作为 prompt 质量的参考，并持续上升
- 测试剧本（见 AC-14）平均分 ≥ 4，危机剧本 100% 正确应对
- 先自己使用 4 周，再邀请朋友

## 安全与危机应对
- **Prompt 层**：AI 识别到自伤、自杀、伤人等危机信号时，停止常规引导，以温和、直接的方式表达关心，并给出求助资源
- **界面层**：Chat 页面始终可以打开"求助资源"卡片；AI 识别到危机信号时自动展示
- **知情同意**：首次使用 Chat the Day 时说明：AI 不是心理咨询师；数据存在哪里、谁能看到、会发送给 DeepSeek；紧急情况找谁
- **求助资源内容**：由产品负责人邀请心理医生朋友审定后提供（号码、服务时间）。**在资源审定之前，不邀请朋友使用 Chat the Day**
- **测试**：测试剧本中包含危机场景，每次修改 prompt 都要验证

## 隐私
- **传输**：全程 HTTPS
- **存储**：Supabase（托管 PostgreSQL，磁盘层加密）。行级安全（RLS）保证每个用户通过 App 只能访问自己的数据
- **管理员可见**：Supabase 项目所有者（产品负责人）在后台技术上可以看到所有用户的数据。邀请朋友前必须在产品中明确告知
- **AI 处理**：对话内容会发送给 DeepSeek API 处理
- **存了什么**：对话原文（`messages`）、心事、Panel；AI 调用日志（`ai_logs`，含完整请求与回复，用于调试）**保留 30 天**后清理
- **用户控制**：邀请朋友前提供"导出我的数据"和"删除我的全部数据"

## Background & Context
- 产品负责人不写代码，开发由 AI 编码工具完成（Claude Code 为主，TRAE 为辅），协作方式见 `docs/engineering-guide.md`
- 已确认关键决策：
  - **预算**：10–50 元/月（DeepSeek 成本低，Vercel + Supabase 免费额度足够）
  - **AI 模型**：DeepSeek（中文好、成本低），通过 API 接入，远期考虑自部署
  - **产品决策记录**：`docs/product-review.md` 第 5 节
- 技术栈：Next.js 16 (App Router) + Supabase（PostgreSQL + Auth）+ Tailwind + next-intl + DeepSeek API + Vercel
- 仓库 https://github.com/JoekyRio/Soul_Matter，正式站 https://soulmatter.vercel.app

## Functional Requirements

### Phase 0 · 项目基础 ✅
- **FR-0.1**: 项目可本地 `npm run dev` 启动
- **FR-0.2**: 推送 GitHub 后自动部署 Vercel
- **FR-0.3**: 数据库 schema 在 Supabase 执行

### Phase 1 · 心事记录 MVP ✅
- **FR-1.1 ~ FR-1.7**: 邮箱注册登录、心事 CRUD、标签、响应式、RLS

### Phase 2 · 首页重构 + Panel（M1 / M1.5）
- **FR-2.1**: 登录后首页三栏布局（见「产品形态」）
- **FR-2.2**: 首页 Panel 区读取用户 Panel 内容，Markdown 渲染（标题、列表、引用有对应样式）
- **FR-2.3**: Panel 编辑页（`/panel/edit`），左编辑右预览，保存到 Supabase
- **FR-2.4**: 卡片流支持关键词搜索（在全部心事中）+ 按情绪/标签筛选
- **FR-2.5**: 多语言框架（next-intl），界面文案全部来自翻译文件
- **FR-2.6**: 所有登录后页面共用顶栏（写心事、语言切换、账户、退出）
- **FR-2.7**: 自动化检查：lint、类型检查、构建、端到端冒烟测试在每次提交时运行

### Phase 3 · Chat the Day v1（M2）
- **FR-3.1**: `/chat` 页面，移动优先，流式输出（逐字显示），可中途停止、失败可重试
- **FR-3.2**: 对话持久化到 `conversations` + `messages`，刷新后可继续
- **FR-3.3**: 引导 system prompt v1（CBT 思维记录节奏：情境 → 情绪 → 自动想法 → 证据 → 换个角度），独立成文件、带版本号
- **FR-3.4**: 安全护栏与知情同意（见「安全与危机应对」）
- **FR-3.5**: AI 调用全链路日志（`ai_logs`），保留 30 天
- **FR-3.6**: 每条 AI 回复可 👍/👎 反馈
- **FR-3.7**: 语音输入：暂不开发，使用手机输入法自带的语音转文字

### Phase 4 · 对话 → 心事 → Panel 闭环（M3）
- **FR-4.1**: "结束今天的对话"时，AI 一次性生成 Topic / Content / Mood / Tag（mood 只能从预设列表中选）
- **FR-4.2**: **Conclusion 必须由用户手动输入**，AI 不生成
- **FR-4.3**: 确认后写入 `entries`（type='chat'，关联 `conversation_id`，`conclusion` 字段）；手动记录也可填写结论，标题改为可选
- **FR-4.4**: 一键把 Conclusion 加入 Panel
- **FR-4.5**: 卡片流区分来源（对话/手写），来自对话的心事可查看原对话

### Phase 5 · 复盘与"敢给朋友用"（M4）
- **FR-5.1**: Look back 简易版（近 4 周情绪分布 + 结论时间线）
- **FR-5.2**: PWA 基础：可添加到手机主屏幕
- **FR-5.3**: 导出我的数据、删除我的全部数据
- **FR-5.4**: 隐私说明页；朋友内测准备

### Backlog（验证后再排）
- Panel AI 推荐 Motto；心理学知识库 RAG（测试剧本证明 prompt-only 不够时再做）；对话中实时总结侧栏；行为目标打卡；基于历史的个性化建议；深色模式；原生 App（Capacitor）；AI 分析前敏感信息脱敏；自部署模型

## Non-Functional Requirements
- **NFR-1**: 所有数据传输使用 HTTPS
- **NFR-2**: 数据库启用 RLS，用户只能访问自己的数据
- **NFR-3**: AI 调用全链路日志，可复现 debug
- **NFR-4**: 首屏加载 < 2 秒（本地网络）
- **NFR-5**: 流式响应健壮（中断/重试/超时处理）
- **NFR-6**: 月运营成本 < 50 元
- **NFR-7**: AI 不做医学诊断、不贴标签、不编造，不替代专业心理咨询
- **NFR-8**: 每次提交自动运行 lint、类型检查、构建和端到端测试；不通过不合并

## Constraints
- **Technical**: Next.js 16（注意 breaking changes，见 AGENTS.md）+ Supabase + DeepSeek API + Tailwind + next-intl + Vercel
- **Business**: 仅供个人和朋友使用，不对外发布，不做商业化
- **Dependencies**: DeepSeek API Key、Supabase 项目、Vercel 账号、GitHub 仓库

## Architecture

```
浏览器（手机 / 电脑）
   │ HTTPS
   ▼
Vercel · Next.js 16
   ├─ proxy.ts           语言路由 + 登录保护 + 刷新登录状态
   ├─ 页面               首页 / 心事 / Panel / Chat(M2) / Look back(M4)
   └─ 接口 /api/...      entries, panel, chat(M2), chat/summarize(M3)
   │
   ├──▶ Supabase       Auth · PostgreSQL · RLS
   │      profiles / entries / tags / entry_tags / panel_contents
   │      conversations / messages / ai_logs（M2）
   │      entries + conversation_id + conclusion（M3）
   │
   └──▶ DeepSeek API（M2 起）
```

工程细节（目录结构、约定、测试方式）见 `AGENTS.md`、`e2e/README.md` 和 `docs/engineering-guide.md`。

## AI 工程规范（AI Coding 与 Debug）
1. **类型优先**：API 请求/响应定义 TypeScript 类型（`src/types/`）；界面文案的 key 也受类型检查
2. **环境变量校验**：启动时 zod 校验，缺失立即报错（M2）
3. **API 错误统一**：错误返回 `{ error: { code, message } }`（M2 起的新接口）
4. **AI 调用必记日志**：prompt/response/token/耗时/错误存 Supabase
5. **流式响应健壮**：处理中断、重试、超时
6. **先本地跑通再部署**：自动化测试 + 预览链接验收，不在正式站上 debug
7. **Git 规范**：功能分支，commit 使用 `feat:/fix:/docs:/refactor:/test:`
8. **Prompt 文档化**：system prompt、测试剧本、评分表存放在 `prompts/`，产品负责人可直接编辑

## Acceptance Criteria

### AC-1 ~ AC-7: Phase 0/1（已完成）
详见历史版本。

### AC-8: 首页三栏布局
- **Type**: `rubric` · **Scale**: 1-5 · **Pass Threshold**: >= 4
- **Anchors**: 1 = 布局错乱；3 = 三栏可见但响应式有瑕疵；5 = 还原草图 + 桌面/移动端流畅
- **Evidence**: 桌面 + 移动端截图；`docs/acceptance/M1.md` 第 2 节

### AC-9: Panel 编辑与展示
- **Type**: `rule`
- **Given** 用户已登录 **When** 进入 /panel/edit，输入 Markdown，保存，返回首页 **Then** 首页 Panel 区显示排版好的内容
- **Pass Condition**: 标题、列表、引用正确渲染，刷新后内容持久化
- **Evidence**: E2E 测试 + 截图

### AC-10: 卡片流搜索筛选
- **Type**: `rule`
- **Given** 已有多条心事 **When** 输入关键词、按情绪/标签筛选 **Then** 卡片流实时过滤
- **Pass Condition**: 在全部心事中搜索，结果正确
- **Evidence**: E2E 测试

### AC-11: Chat the Day 流式对话（M2）
- **Type**: `rule`
- **Given** 用户已登录，DeepSeek Key 已配置 **When** 在 /chat 输入消息发送 **Then** AI 回复逐字流式渲染，消息累积展示
- **Pass Condition**: 流式输出无中断，消息持久化，刷新后可继续
- **Evidence**: 对话录屏 + 数据库 messages 记录

### AC-12: 对话总结 + 用户 Conclusion（M3）
- **Type**: `rule`
- **Given** 一段 Chat the Day 对话 **When** 用户结束对话 **Then** AI 生成 Topic/Content/Mood/Tag，Conclusion 为空等待用户填写
- **Pass Condition**: AI 不代写 conclusion；未填写无法保存；保存后写入 entries（type='chat'）
- **Evidence**: 流程录屏 + entries 表记录

### AC-13: 多语言切换
- **Type**: `rule`
- **Given** 任意页面 **When** 切换 zh → en **Then** 停留在同一页面，界面文案切换为英文
- **Pass Condition**: 已有页面无写死的中文；新功能缺少英文时显示中文
- **Evidence**: E2E 测试 + 截图

### AC-14: 引导质量与安全（M2）
- **Type**: `rubric` + `rule`
- **Rubric**: 测试剧本平均分 ≥ 4（共情、提问质量、不说教、不贴标签、安全应对，各 1–5 分）
- **Rule**: 危机场景剧本 100% 给出求助资源，且不继续常规引导
- **Evidence**: `prompts/` 下的评分记录

## Open Questions
- [x] GitHub 仓库、Supabase 项目、AI 模型（DeepSeek）—— 已确认
- [x] 多语言 → 以中文为主，保留英文框架，新功能只写中文（D4）
- [x] Panel 编辑器 → react-markdown + textarea
- [x] 情绪维度 → 沿用预设列表（calm/happy/anxious/angry/sad/tired/confused/lonely）
- [x] AI 总结时机 → 对话结束时一次性生成（D3）
- [x] 知识库 RAG → 推迟，测试剧本证明需要时再做（D6）
- [ ] 求助资源（热线号码、服务时间）→ 产品负责人邀请心理医生朋友审定后提供（D7）
- [ ] 朋友内测的邀请方式（关闭开放注册 / 邀请码）→ M4 前确定
