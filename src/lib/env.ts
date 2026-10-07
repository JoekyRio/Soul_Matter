import { z } from "zod";

// 服务端环境变量校验：缺少或格式不对时给出清楚的报错，而不是运行到一半才出错
const serverEnvSchema = z.object({
  DEEPSEEK_API_KEY: z.string().min(1, "缺少 DEEPSEEK_API_KEY（在 Vercel 项目的 Environment Variables 中配置）"),
  DEEPSEEK_BASE_URL: z.url().default("https://api.deepseek.com"),
  DEEPSEEK_MODEL: z.string().min(1).default("deepseek-chat"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function getServerEnv(): ServerEnv {
  const parsed = serverEnvSchema.safeParse({
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
    DEEPSEEK_BASE_URL: process.env.DEEPSEEK_BASE_URL || undefined,
    DEEPSEEK_MODEL: process.env.DEEPSEEK_MODEL || undefined,
  });
  if (!parsed.success) {
    throw new Error(
      `环境变量配置错误：${parsed.error.issues.map((i) => i.message).join("；")}`,
    );
  }
  return parsed.data;
}
