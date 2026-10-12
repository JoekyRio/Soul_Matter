import { readFileSync } from "node:fs";
import path from "node:path";

// prompts/*.md 是给人编辑的纯文字文件；这里读取并去掉 HTML 注释
// （next.config.ts 的 outputFileTracingIncludes 保证部署时带上这些文件）
export function loadPrompt(name: string) {
  const raw = readFileSync(path.join(process.cwd(), "prompts", `${name}.md`), "utf8");
  const version = raw.match(/<!--\s*version:\s*([\w.-]+)\s*-->/)?.[1] ?? "unknown";
  const text = raw.replace(/<!--[\s\S]*?-->/g, "").trim();
  return { name, version: `${name}@${version}`, text };
}

// Chat the Day 的两版规则，用于 A/B 对比
export const PROMPT_VARIANTS = ["a", "b"] as const;
export type PromptVariant = (typeof PROMPT_VARIANTS)[number];

const VARIANT_FILES: Record<PromptVariant, string> = {
  a: "chat-guide",
  b: "chat-guide-b",
};

export function loadChatGuide(variant: PromptVariant) {
  return loadPrompt(VARIANT_FILES[variant]);
}

// 附在规则后面的实时信息：当前时间（北京时间），以及历史是否被截断，避免 AI 假装记得
export function chatContext(options: { now: Date; omittedMessages: number }) {
  const time = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(options.now);
  const lines = [`## 当前信息`, `- 现在是 ${time}（北京时间）`];
  if (options.omittedMessages > 0) {
    lines.push(
      `- 这段对话比较长，更早的 ${options.omittedMessages} 条消息没有发给你。不要假装记得那部分内容；需要时请用户再说一下。`,
    );
  }
  return lines.join("\n");
}
