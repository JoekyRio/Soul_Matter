# prompts · AI 的"说明书"

这个文件夹里都是纯文字，**你可以直接编辑**（在 GitHub 网页上点文件 → 右上角铅笔图标），这是你参与 AI 质量最直接的方式。

| 文件 | 作用 |
|---|---|
| `chat-guide.md` | A 版：Chat the Day 里 AI 的人设和规则（system prompt） |
| `chat-guide-b.md` | B 版：根据你的真实聊天偏好写的规则，用来和 A 版对比 |
| `preferences.md` | 从你和 AI 的聊天中归纳的沟通偏好（B 版的依据） |
| `test-scripts.md` | 测试剧本（17 个）：每次改规则后，扮演用户跑一遍 |
| `rubric.md` | 评分表和评分记录 |

在对话页开新对话前可以选 A 版 / B 版 / 随机，同一段对话固定使用一版。

修改流程：改规则文件 → 第一行 version 加 1 → 在预览链接上跑剧本 → 在 `rubric.md` 记分 → 分数不降才合并上线。
