import { z } from "zod";

// 服务端环境变量校验：缺少或格式不对时给出清楚的报错，而不是运行到一半才出错。
// AI 服务使用 OpenAI 兼容的对话接口，DeepSeek、硅基流动等都可以：
//   AI_API_KEY   密钥（必填）
//   AI_BASE_URL  接口地址，例如 https://api.siliconflow.cn/v1（默认 DeepSeek 官方）
//   AI_MODEL     模型名，例如 deepseek-ai/DeepSeek-V3（默认 deepseek-chat）
// 旧的 DEEPSEEK_API_KEY / DEEPSEEK_BASE_URL / DEEPSEEK_MODEL 仍然有效
const serverEnvSchema = z.object({
  AI_API_KEY: z.string().min(1, "缺少 AI_API_KEY（在 Vercel 项目的 Environment Variables 中配置）"),
  AI_BASE_URL: z.url().default("https://api.deepseek.com"),
  AI_MODEL: z.string().min(1).default("deepseek-chat"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function getServerEnv(): ServerEnv {
  const pick = (name: string, legacy: string) =>
    process.env[name] || process.env[legacy] || undefined;
  const parsed = serverEnvSchema.safeParse({
    AI_API_KEY: pick("AI_API_KEY", "DEEPSEEK_API_KEY"),
    AI_BASE_URL: pick("AI_BASE_URL", "DEEPSEEK_BASE_URL")?.replace(/\/+$/, ""),
    AI_MODEL: pick("AI_MODEL", "DEEPSEEK_MODEL"),
  });
  if (!parsed.success) {
    throw new Error(
      `环境变量配置错误：${parsed.error.issues.map((i) => i.message).join("；")}`,
    );
  }
  return parsed.data;
}
