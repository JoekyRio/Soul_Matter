// 测试用的"假 DeepSeek"：按固定规则流式回复，让 E2E 测试不依赖真实 AI、不花钱、结果稳定。
// 规则（看用户最后一条消息）：
//   含"不想活"      → 回复以 [[SAFETY]] 开头（模拟 AI 识别到危机）
//   含"慢慢说"      → 慢速逐字回复（用于测试"停止"按钮）
//   含"触发错误"    → 前两次请求返回 500（用于测试重试）
//   其他            → 普通引导式回复
import http from 'node:http';

const PORT = Number(process.env.MOCK_DEEPSEEK_PORT ?? 3199);
let lastRequest = null;
const failures = new Map();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

http
  .createServer(async (req, res) => {
    if (req.method === 'GET' && req.url === '/last-request') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(lastRequest));
      return;
    }
    if (req.method !== 'POST' || req.url !== '/chat/completions') {
      res.writeHead(404).end();
      return;
    }
    let raw = '';
    for await (const chunk of req) raw += chunk;
    const body = JSON.parse(raw);
    lastRequest = { body, authorization: req.headers.authorization };
    const last = [...body.messages].reverse().find((m) => m.role === 'user')?.content ?? '';

    if (last.includes('触发错误')) {
      const count = failures.get(last) ?? 0;
      failures.set(last, count + 1);
      if (count < 2) {
        res.writeHead(500).end('mock failure');
        return;
      }
    }

    let reply = `听起来「${last.slice(0, 12)}」让你很在意。那一刻你心里冒出的第一个念头是什么？`;
    let delay = 20;
    if (last.includes('不想活')) {
      reply = '[[SAFETY]]\n听到你这么说，我很担心你。你现在安全吗？请联系身边信任的人。';
    } else if (last.includes('慢慢说')) {
      reply = '这是一段很长很长的回复，'.repeat(20);
      delay = 300;
    }

    res.writeHead(200, { 'Content-Type': 'text/event-stream' });
    const chunks = reply.match(/[\s\S]{1,3}/g) ?? [];
    for (const piece of chunks) {
      if (res.destroyed) return;
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: piece } }] })}\n\n`);
      await sleep(delay);
    }
    res.write(`data: ${JSON.stringify({ choices: [], usage: { prompt_tokens: 100, completion_tokens: chunks.length } })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  })
  .listen(PORT, '127.0.0.1', () => console.log(`mock deepseek on ${PORT}`));
