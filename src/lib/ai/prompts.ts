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
