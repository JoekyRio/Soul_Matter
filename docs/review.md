# 心事 (Soul Matter) - 独立审查

- [x] CP-R1: 项目构建通过，无 TypeScript 错误
  - **Type**: `rule`
  - **Covers**: AC-1, TR-1.2, TR-9.1
  - **Evidence**: `npm run build` 成功，9 路由生成；`npm run lint` 0 errors 0 warnings

- [x] CP-R2: 认证重定向逻辑正确（未登录访问受保护路由 → /login；已登录访问 /login → /entries）
  - **Type**: `rule`
  - **Covers**: AC-2, TR-3.2
  - **Evidence**: 浏览器验证 /entries → 307 /login；/ → /entries → /login

- [x] CP-R3: 心事 CRUD API 校验用户身份，未登录返回 401
  - **Type**: `rule`
  - **Covers**: AC-3, AC-6, TR-4.4
  - **Evidence**: 所有 API handler 调用 getUser()，未登录返回 401；user_id 取自 session

- [x] CP-R4: 数据库 RLS 策略完备，UPDATE 操作有 WITH CHECK 防止越权
  - **Type**: `rule`
  - **Covers**: AC-6, TR-2.2
  - **Evidence**: schema.sql 中 entries/tags/profiles 的 UPDATE 策略均含 WITH CHECK (auth.uid() = user_id)

- [x] CP-U1: 代码质量与安全规范
  - **Type**: `rubric`
  - **Covers**: AC-1 ~ AC-7
  - **Scale**: 1-5
  - **Score**: 4
  - **Rationale**: 高危 RLS 漏洞和中危开放重定向已修复；API 输入校验完善；lint 0 错误。扣分点：API 路由未在 proxy 层做纵深防御（API 自身已校验），孤儿标签无清理入口（MVP 可接受）。
  - **Pass Threshold**: >= 4
  - **Evidence**: build + lint 通过；schema.sql 含完整 RLS；auth/callback 校验 next 参数

## 审查历史

### Review R1
- **Result**: `fail`
- **Evidence**: 独立审查发现 1 个高危（RLS UPDATE 缺 WITH CHECK）、1 个中危（开放重定向）、多个低危问题
- **Findings**:
  - I-1 (高): entries/tags UPDATE 策略缺 WITH CHECK
  - I-2 (中): auth/callback 的 next 参数未校验
  - I-3 (低): API request.json() 无异常处理
  - I-4 (低): mood 无枚举校验、tagNames 无类型校验
  - I-5 (低): PATCH 允许空标题/内容
  - I-6 (低): decodeURIComponent(error) 无 try/catch
  - I-7 (低): navbar.tsx try/catch 内构造 JSX

### Review R2（修复后复审）
- **Result**: `pass`
- **Evidence**:
  - I-1 ✅: entries/tags/profiles UPDATE 策略已添加 WITH CHECK
  - I-2 ✅: auth/callback 校验 next 必须以 "/" 开头且不以 "//" 开头
  - I-3 ✅: POST/PATCH 包裹 request.json() 于 try/catch
  - I-4 ✅: mood 枚举校验 + tagNames Array.isArray 校验
  - I-5 ✅: PATCH 添加 title/content 非空校验
  - I-6 ✅: login/register 用 safeDecode 包裹 decodeURIComponent
  - I-7 ✅: navbar 重构，try/catch 仅包裹数据获取，JSX 在外部
  - Lint: 0 errors, 0 warnings
  - Build: 成功
- **Blocked By**: 无
- **Resume When**: N/A
