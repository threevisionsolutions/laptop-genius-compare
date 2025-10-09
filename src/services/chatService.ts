/**
 * Chat service: clean, typed wrapper around the LLM for assistant responses.
 *
 * This file intentionally keeps logic small and testable:
 * - buildSystemPrompt(userType) -> string
 * - normalizeMessages(messages) -> ChatMessage[]
 * - generateChatResponse(messages, userType) -> Promise<ChatResponse>
 *
 * It expects an OpenAI wrapper at ./openaiService with a function `callOpenAI`
 * that accepts { messages, maxTokens, temperature } and returns { text, usage }.
 *
 * If callOpenAI is not available at runtime, it will fall back to a deterministic
 * local summarizer so the app still runs for local/dev.
 */

import { v4 as uuidv4 } from 'uuid';

type Role = 'system' | 'user' | 'assistant';

export type ChatMessage = {
  role: Role;
  content: string;
};

export type ChatResponse = {
  id: string;
  assistantMessage: ChatMessage;
  raw?: any;
  tokensUsed?: number;
};

/**
 * Try to import your OpenAI wrapper. If it's missing at runtime, we keep a null
 * value and use fallback behavior.
 */
let callOpenAI: undefined | ((opts: {
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
}) => Promise<{ text: string; usage?: { total_tokens?: number } }>) = undefined;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const openai = require('./openaiService');
  if (openai && typeof openai.callOpenAI === 'function') {
    callOpenAI = openai.callOpenAI;
  }
} catch (err) {
  // Module not found or other runtime issue — we'll fall back below.
}

/**
 * Create a concise system prompt depending on userType (persona).
 * Exported so you can unit-test the mapping easily.
 */
export function buildSystemPrompt(userType?: string): string {
  const base = [
    'You are a concise technical assistant that explains laptop comparisons.',
    'When asked, produce short (40–100 words) rationales, 3 pros, and 1 short con.',
    'Be factual and avoid inventing specs not present in the provided structured fields.'
  ].join(' ');

  if (!userType) return base;

  const map: Record<string, string> = {
    gaming:
      'Prioritize GPU, CPU single-thread performance, and thermals. Mention FPS expectations only if explicit GPU model present.',
    creative:
      'Prioritize CPU performance, RAM, storage speed, and color-accurate displays. Mention that external GPUs or eGPUs may be required if GPU is weak.',
    programming:
      'Prioritize CPU multi-core performance, RAM, battery life, and keyboard comfort. Favor sustained workloads and thermal throttling awareness.',
    student:
      'Prioritize battery life, portability, and price. Favor lightweight models and long battery estimates.',
    portable:
      'Prioritize weight, battery life, and screen size. Mention trade-offs in port selection and cooling.'
  };

  const normalized = (userType || '').toLowerCase().trim();
  if (map[normalized]) return `${base} ${map[normalized]}`;

  // fallback for unknown user types
  return `${base} Focus on the user's described needs: ${userType}.`;
}

/**
 * Ensure messages are safe and normalized.
 */
export function normalizeMessages(messages: ChatMessage[]): ChatMessage[] {
  if (!Array.isArray(messages)) return [];
  return messages
    .map(m => ({
      role: m && m.role ? (m.role as Role) : 'user',
      content: typeof m?.content === 'string' ? m.content.trim() : ''
    }))
    .filter(m => m.content.length > 0);
}

/**
 * Main exported function:
 * - builds a system message
 * - calls your LLM wrapper
 * - falls back to a deterministic generator if LLM isn't available
 */
export async function generateChatResponse(
  messages: ChatMessage[],
  userType?: string
): Promise<ChatResponse> {
  const normalized = normalizeMessages(messages);
  const systemPrompt = buildSystemPrompt(userType);

  const payloadMessages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...normalized
  ];

  // If OpenAI wrapper is configured, call it. Keep parameters conservative.
  if (typeof callOpenAI === 'function') {
    try {
      const result = await callOpenAI({
        messages: payloadMessages,
        maxTokens: 200,
        temperature: 0.15
      });

      const assistantText = typeof result?.text === 'string' ? result.text.trim() : '';

      const response: ChatResponse = {
        id: uuidv4(),
        assistantMessage: {
          role: 'assistant',
          content: assistantText || 'Sorry, I could not generate an answer right now.'
        },
        raw: result,
        tokensUsed: result?.usage?.total_tokens
      };

      return response;
    } catch (err) {
      // Keep error handling friendly: return fallback text instead of throwing
      const errorMsg =
        (err instanceof Error ? err.message : 'Unknown error') || 'LLM call failed — using fallback answer';
      // eslint-disable-next-line no-console
      console.warn('generateChatResponse LLM error:', errorMsg, err);

      return fallbackResponse(normalized, userType, errorMsg);
    }
  }

  // If no LLM wrapper present, return deterministic fallback
  return fallbackResponse(normalized, userType, 'no LLM configured');
}

/**
 * Deterministic local fallback to avoid crashing in dev without API keys.
 * It uses the last user message and returns a small, predictable reply.
 */
function fallbackResponse(
  normalizedMessages: ChatMessage[],
  userType?: string,
  reason?: string
): ChatResponse {
  const lastUser = [...normalizedMessages].reverse().find(m => m.role === 'user') || {
    content: 'No user message provided.'
  };

  const assistantText = [
    `Fallback assistant response (${reason || 'fallback'}).`,
    `Persona: ${userType || 'general'}.`,
    `You asked: "${lastUser.content.slice(0, 240)}"`,
    'I would recommend comparing GPU, CPU, RAM, storage, and battery for this use-case.'
  ].join(' ');

  return {
    id: uuidv4(),
    assistantMessage: {
      role: 'assistant',
      content: assistantText
    },
    tokensUsed: 0
  };
}

export default generateChatResponse;
