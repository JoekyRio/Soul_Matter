// 安全护栏的两道保险：
// 1. AI 按 prompts/chat-guide.md 的规则，在回复第一行写 [[SAFETY]]
// 2. 用户消息中出现明显的危机词时，即使 AI 没标记，也显示求助信息
export const SAFETY_MARKER = "[[SAFETY]]";

const CRISIS_PATTERNS = [
  /自杀/, /轻生/, /不想活/, /活不下去/, /想死/, /去死/, /结束(自己的)?生命/, /结束这一切/,
  /割腕/, /跳楼/, /安眠药/, /撑不下去/, /消失算了/, /不用醒来/,
  /kill myself/i, /suicid/i, /end my life/i, /want to die/i, /self[- ]?harm/i,
];

export function looksLikeCrisis(text: string) {
  return CRISIS_PATTERNS.some((pattern) => pattern.test(text));
}
