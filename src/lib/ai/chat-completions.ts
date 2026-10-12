// OpenAI 兼容的对话接口（DeepSeek、硅基流动等），流式返回
import type { ServerEnv } from "@/lib/env";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type ChatUsage = { promptTokens: number; completionTokens: number };

export class AIError extends Error {
  constructor(
    public code: "upstream_error" | "timeout" | "aborted",
    message: string,
    public status?: number,
  ) {
    super(message);
  }
}

// 等待 AI 服务开始响应的最长时间；开始响应之后，两段数据之间最长可以间隔多久。
// 注意不能限制整个回复的总时长：推理模型会先"思考"很久再回答
const CONNECT_TIMEOUT_MS = 30_000;
const IDLE_TIMEOUT_MS = 60_000;

type Connection = {
  res: Response;
  timedOut: () => boolean;
  touch: () => void;
  done: () => void;
};

async function connect(env: ServerEnv, body: unknown, signal: AbortSignal): Promise<Connection> {
  const controller = new AbortController();
  let timedOut = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const arm = (ms: number) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, ms);
  };
  const onUserAbort = () => controller.abort();
  signal.addEventListener("abort", onUserAbort, { once: true });
  const done = () => {
    clearTimeout(timer);
    signal.removeEventListener("abort", onUserAbort);
  };

  arm(CONNECT_TIMEOUT_MS);
  const res = await fetch(`${env.AI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.AI_API_KEY}`,
    },
    body: JSON.stringify(body),
    signal: controller.signal,
  }).catch((err: unknown) => {
    done();
    if (signal.aborted) throw new AIError("aborted", "用户已取消");
    if (timedOut) throw new AIError("timeout", "AI 服务响应超时");
    throw new AIError("upstream_error", `无法连接 AI 服务：${String(err)}`);
  });
  if (!res.ok || !res.body) {
    done();
    const detail = await res.text().catch(() => "");
    throw new AIError("upstream_error", `AI 服务返回 ${res.status}：${detail.slice(0, 300)}`, res.status);
  }
  arm(IDLE_TIMEOUT_MS);
  return { res, timedOut: () => timedOut, touch: () => arm(IDLE_TIMEOUT_MS), done };
}

// 逐段产出 AI 回复的文字；结束时通过 onUsage 返回 token 用量
export async function* streamChat(
  env: ServerEnv,
  messages: ChatMessage[],
  options: { signal: AbortSignal; onUsage?: (usage: ChatUsage) => void },
): AsyncGenerator<string> {
  const body = {
    model: env.AI_MODEL,
    messages,
    stream: true,
    stream_options: { include_usage: true },
    temperature: 0.7,
    // 推理模型的"思考"也计入 max_tokens，留足余量；回复长短由 prompt 控制
    max_tokens: 4096,
  };

  // 连接失败重试一次；用户取消则不重试。
  // 个别服务不支持 stream_options（返回 4xx），重试时去掉它（只是拿不到 token 用量）
  let conn: Connection;
  try {
    conn = await connect(env, body, options.signal);
  } catch (err) {
    if (err instanceof AIError && err.code === "aborted") throw err;
    const rejected = err instanceof AIError && err.status !== undefined && err.status < 500;
    const { stream_options: _ignored, ...withoutUsage } = body;
    void _ignored;
    conn = await connect(env, rejected ? withoutUsage : body, options.signal);
  }

  const reader = conn.res.body!.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  try {
    while (true) {
      let read: ReadableStreamReadResult<string>;
      try {
        read = await reader.read();
      } catch (err) {
        if (options.signal.aborted) throw new AIError("aborted", "用户已取消");
        if (conn.timedOut()) throw new AIError("timeout", "AI 服务长时间没有新内容");
        throw new AIError("upstream_error", `AI 回复中断：${String(err)}`);
      }
      if (read.done) break;
      conn.touch(); // 收到任何数据（包括推理模型的"思考"内容）都算还在响应
      buffer += read.value;
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const data = line.replace(/^data:\s*/, "").trim();
        if (!data || !line.startsWith("data:")) continue;
        if (data === "[DONE]") return;
        const chunk = JSON.parse(data);
        // 只取正式回复 content；推理模型的 reasoning_content 不显示给用户
        const delta: string | undefined = chunk.choices?.[0]?.delta?.content;
        if (delta) yield delta;
        if (chunk.usage) {
          options.onUsage?.({
            promptTokens: chunk.usage.prompt_tokens ?? 0,
            completionTokens: chunk.usage.completion_tokens ?? 0,
          });
        }
      }
    }
  } finally {
    conn.done();
    reader.cancel().catch(() => {});
  }
}
