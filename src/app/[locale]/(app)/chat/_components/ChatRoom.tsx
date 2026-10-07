'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import type { ChatMessageRow, ChatStreamEvent } from '@/types/chat';
import ConsentDialog from './ConsentDialog';
import FeedbackButtons from './FeedbackButtons';
import SafetyCard from './SafetyCard';

type UiMessage = ChatMessageRow & {
  // 数据库里的 id（新消息在服务端返回 meta 后才知道；id 字段始终作为界面上的 key）
  dbId?: string;
  // 回复还在生成中
  streaming?: boolean;
  // 用户点了"停止"
  stopped?: boolean;
  // 这条回复失败了，可以重试
  failed?: { code: string; text: string };
};

const ERROR_CODES = ['unauthorized', 'config_error', 'upstream_error', 'timeout', 'network'] as const;
type ErrorCode = (typeof ERROR_CODES)[number] | 'generic';
const toErrorCode = (code: string): ErrorCode =>
  (ERROR_CODES as readonly string[]).includes(code) ? (code as ErrorCode) : 'generic';

// 已保存到数据库、生成完成的 AI 回复才能反馈
function feedbackId(m: UiMessage) {
  if (m.role !== 'assistant' || m.streaming || m.failed || !m.content) return null;
  return m.dbId ?? (m.id.startsWith('temp-') ? null : m.id);
}

function tempId() {
  return `temp-${Math.random().toString(36).slice(2)}`;
}

export default function ChatRoom({
  initialConversationId,
  initialMessages,
}: {
  initialConversationId: string | null;
  initialMessages: ChatMessageRow[];
}) {
  const t = useTranslations('chat');
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [messages, setMessages] = useState<UiMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  const updateMessage = (id: string, patch: (m: UiMessage) => Partial<UiMessage>) =>
    setMessages((list) => list.map((m) => (m.id === id ? { ...m, ...patch(m) } : m)));

  async function send(text: string, retryUserMessageId: string | null = null) {
    if (busy || !text.trim()) return;
    setBusy(true);

    const userTempId = retryUserMessageId ? null : tempId();
    const assistantId = tempId();
    const now = new Date().toISOString();
    setMessages((list) => [
      ...list,
      ...(userTempId
        ? [{ id: userTempId, role: 'user' as const, content: text, feedback: null, created_at: now }]
        : []),
      { id: assistantId, role: 'assistant', content: '', feedback: null, created_at: now, streaming: true },
    ]);

    const controller = new AbortController();
    abortRef.current = controller;
    const fail = (code: string) =>
      updateMessage(assistantId, () => ({
        streaming: false,
        failed: { code, text },
      }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, message: text, retryUserMessageId }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        fail(data?.error?.code ?? 'generic');
        return;
      }

      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = '';
      let finished = false;
      while (!finished) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += value;
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as ChatStreamEvent;
          if (event.type === 'meta') {
            setConversationId(event.conversationId);
            setMessages((list) =>
              list.map((m) => {
                if (m.id === assistantId) return { ...m, dbId: event.assistantMessageId };
                if (m.id === userTempId) return { ...m, dbId: event.userMessageId };
                return m;
              }),
            );
          } else if (event.type === 'safety') {
            setSafetyOpen(true);
          } else if (event.type === 'delta') {
            updateMessage(assistantId, (m) => ({ content: m.content + event.text }));
          } else if (event.type === 'error') {
            fail(event.code);
            finished = true;
          } else if (event.type === 'done') {
            updateMessage(assistantId, () => ({ streaming: false }));
            finished = true;
          }
        }
      }
    } catch (err) {
      if (controller.signal.aborted) {
        updateMessage(assistantId, () => ({ streaming: false, stopped: true }));
      } else {
        console.error(err);
        fail('network');
      }
    } finally {
      abortRef.current = null;
      setBusy(false);
    }
  }

  function submit() {
    const text = input.trim();
    if (!text) return;
    setInput('');
    void send(text);
  }

  function retry(message: UiMessage) {
    if (!message.failed) return;
    // 找到这条回复对应的用户消息：已经保存过就只重新生成回复，否则连同消息一起重新发送
    const index = messages.findIndex((m) => m.id === message.id);
    const userMessage = messages.slice(0, index).reverse().find((m) => m.role === 'user');
    const userDbId = userMessage?.dbId ?? null;
    setMessages((list) =>
      list.filter((m) => m.id !== message.id && (userDbId || m.id !== userMessage?.id)),
    );
    void send(message.failed.text, userDbId);
  }

  function newChat() {
    abortRef.current?.abort();
    setConversationId(null);
    setMessages([]);
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-3.5rem)] max-w-3xl flex-col px-4">
      <ConsentDialog />

      <div className="flex items-center justify-between gap-3 py-3">
        <h1 className="text-lg font-semibold text-slate-900">{t('title')}</h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSafetyOpen(true)}
            className="text-sm font-medium text-rose-600 hover:underline"
          >
            {t('safety.open')}
          </button>
          <button
            type="button"
            onClick={newChat}
            disabled={busy || messages.length === 0}
            className="rounded-lg px-3 py-1.5 text-sm text-slate-600 ring-1 ring-slate-200 hover:bg-white disabled:opacity-40"
          >
            {t('newChat')}
          </button>
        </div>
      </div>

      {safetyOpen && <SafetyCard onClose={() => setSafetyOpen(false)} />}

      <div className="flex-1 overflow-y-auto pb-4" aria-live="polite">
        {messages.length === 0 ? (
          <p className="mt-16 text-center text-slate-500">{t('emptyHint')}</p>
        ) : (
          <ul className="space-y-4">
            {messages.map((m) => (
              <li
                key={m.id}
                data-testid={m.role === 'user' ? 'user-message' : 'assistant-message'}
                className={m.role === 'user' ? 'flex justify-end' : 'flex flex-col items-start'}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-200'
                  }`}
                >
                  {m.content || (m.streaming ? <span className="text-slate-400">{t('thinking')}</span> : null)}
                  {m.stopped && <span className="text-slate-400"> {t('stopped')}</span>}
                </div>
                {m.failed && (
                  <div role="alert" className="mt-1 flex items-center gap-2 text-sm text-red-600">
                    <span>{t(`errors.${toErrorCode(m.failed.code)}`)}</span>
                    {m.failed.code !== 'unauthorized' && m.failed.code !== 'config_error' && (
                      <button type="button" onClick={() => retry(m)} className="font-medium underline">
                        {t('retry')}
                      </button>
                    )}
                  </div>
                )}
                {feedbackId(m) && <FeedbackButtons messageId={feedbackId(m)!} initial={m.feedback} />}
              </li>
            ))}
          </ul>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex items-end gap-2 border-t border-slate-200 py-3"
      >
        <textarea
          aria-label={t('inputLabel')}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            // 电脑上 Enter 发送、Shift+Enter 换行；输入法选字时不发送；手机上回车换行
            const coarse = window.matchMedia?.('(pointer: coarse)').matches;
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && !coarse) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={t('placeholder')}
          rows={2}
          className="max-h-40 flex-1 resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-[15px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
        {busy ? (
          <button
            type="button"
            onClick={() => abortRef.current?.abort()}
            className="rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50"
          >
            {t('stop')}
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-40"
          >
            {t('send')}
          </button>
        )}
      </form>
    </div>
  );
}
