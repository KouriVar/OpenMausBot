// Voice synthesis through Xiaomi's MiMo TTS model. The key stays on the harness; the renderer gets voices and audio.
// MiMo is OpenAI-chat-shaped for speech: POST /chat/completions carries the words as an assistant message and answers
// with base64 audio in choices[0].message.audio.data (there is no /audio/speech endpoint).
import { MIMO_VOICES, isMimoVoice } from "../../shared/mimo-voice.ts";

export { isMimoVoice };
import type { Audio, Voice } from "./elevenlabs.ts";

export const MIMO_MODEL = "mimo-v2.5-tts";
const DEFAULT_API = "https://api.xiaomimimo.com/v1";
const MAX_AUDIO_BYTES = 8 * 1024 * 1024;
/** One request stays far below the model's 8K-token window while fitting a whole voice note. */
const CHUNK_CHARS = 1200;
const MAX_CHARS = 7200;

export type VerifyResult = { ok: true } | { ok: false; message: string };

/** Read per call so a test or a self-hosted relay can point MiMo elsewhere without reloading this module. */
export function mimoApi(env: NodeJS.ProcessEnv = process.env): string {
  return (env.OMB_MIMO_API || DEFAULT_API).replace(/\/+$/, "");
}

function refusal(status: number): string {
  if (status === 400) return "MiMo 认为这个请求有问题（HTTP 400）：请在设置里重新选择音色，或把文本缩短后再试。";
  if (status === 401 || status === 403) {
    return "MiMo 拒绝了这把密钥。请到 MiMo 控制台确认密钥有效，并确认它不是 Token Plan 专用的密钥（两者不能混用）。";
  }
  if (status === 402) return "MiMo 账户余额不足，无法合成语音。请到 MiMo 控制台充值后再试。";
  if (status === 404) return "MiMo 找不到这个模型或音色。请重新选择音色；如果仍然失败，可能是模型已下线。";
  if (status === 421) return "MiMo 拦截了这段文本（内容审核），没有生成语音。换一种说法再试。";
  if (status === 429) {
    return "MiMo 请求过于频繁，或限时免费的额度已经用完。稍等一会儿再试；如果一直这样，请到 MiMo 控制台确认限时免费是否已结束、是否需要按量付费。";
  }
  if (status >= 500) return `MiMo 语音服务暂时不可用（HTTP ${status}）。稍后再试。`;
  return `MiMo 语音合成失败（HTTP ${status}）。稍后再试。`;
}

function unreachable(): string {
  return "连不上 MiMo 语音服务，请检查网络或代理设置。";
}

export function listVoices(): Voice[] {
  return MIMO_VOICES.map((voice) => ({
    id: voice.id,
    label: voice.label,
    ...("description" in voice ? { description: voice.description } : {}),
  }));
}

/** Sentence-aware split: MiMo reads each request on its own, and the pieces concatenate back into one mp3. */
export function splitForMimo(text: string): string[] {
  if (text.length > MAX_CHARS) throw new Error("这段文字太长了，MiMo 一次合成不完。请分几次朗读。");
  const sentences = text.match(/[^。！？!?…；;\n]+[。！？!?…；;\n]*/g) ?? [text];
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    if (sentence.length > CHUNK_CHARS) {
      if (current) chunks.push(current);
      current = "";
      for (let index = 0; index < sentence.length; index += CHUNK_CHARS) chunks.push(sentence.slice(index, index + CHUNK_CHARS));
      continue;
    }
    if (current.length + sentence.length > CHUNK_CHARS) {
      chunks.push(current);
      current = "";
    }
    current += sentence;
  }
  if (current.trim()) chunks.push(current);
  return chunks.filter((chunk) => chunk.trim());
}

async function askMiMo(text: string, voiceId: string, key: string, signal?: AbortSignal): Promise<Uint8Array> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60_000);
  const cancel = () => controller.abort();
  signal?.addEventListener("abort", cancel, { once: true });
  let response: Response;
  try {
    response = await fetch(`${mimoApi()}/chat/completions`, {
      method: "POST",
      headers: { "api-key": key, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        model: MIMO_MODEL,
        messages: [{ role: "assistant", content: text }],
        audio: { format: "mp3", voice: voiceId },
        stream: false,
      }),
      redirect: "error",
      signal: controller.signal,
    });
  } catch (error) {
    if (signal?.aborted) throw new Error("语音已取消。");
    // undici retries a 421 once with the body already consumed, so the status never arrives: recognize the retry's
    // failure and report what 421 means to MiMo.
    if ((error as { cause?: { code?: string } } | null)?.cause?.code === "UND_ERR_REQ_CONTENT_LENGTH_MISMATCH") {
      throw new Error(refusal(421));
    }
    if (controller.signal.aborted) throw new Error("MiMo 语音合成超时了，这一段没有播放。");
    throw new Error(unreachable());
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", cancel);
  }
  if (!response.ok) {
    await response.body?.cancel();
    // Remote error bodies can echo credentials or the request text: report the status, never the body.
    throw new Error(refusal(response.status));
  }
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error("MiMo 返回了无法识别的语音数据。");
  }
  const choice = (body as { choices?: Array<{ message?: { audio?: { data?: unknown }; content?: unknown }; finish_reason?: unknown }> } | null)?.choices?.[0];
  if (choice?.finish_reason === "content_filter") throw new Error("MiMo 拦截了这段文本（内容审核），没有生成语音。换一种说法再试。");
  const data = choice?.message?.audio?.data;
  if (typeof data !== "string" || !data) throw new Error("MiMo 没有返回音频，请重新选择音色后再试。");
  if (data.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(data)) throw new Error("MiMo 返回了无法识别的语音数据。");
  const bytes = new Uint8Array(Buffer.from(data, "base64"));
  if (!bytes.byteLength) throw new Error("MiMo 没有返回音频，请重新选择音色后再试。");
  return bytes;
}

export async function synthesize(text: string, voiceId: string, key: string, signal?: AbortSignal): Promise<Audio> {
  if (!key.trim()) throw new Error("还没有填写 MiMo 密钥，请先在设置里填入。");
  if (!MIMO_VOICES.some((voice) => voice.id === voiceId)) throw new Error("这个音色不是 MiMo 的预设音色，请在设置里重新选择。");
  if (signal?.aborted) throw new Error("语音已取消。");
  const chunks = splitForMimo(text.trim());
  if (chunks.length === 0) return { bytes: new Uint8Array(), mime: "audio/mpeg" };
  const parts: Uint8Array[] = [];
  let size = 0;
  for (const chunk of chunks) {
    const part = await askMiMo(chunk, voiceId, key, signal);
    size += part.byteLength;
    if (size > MAX_AUDIO_BYTES) throw new Error("这段语音超过了可播放的大小上限，已停止。");
    parts.push(part);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) {
    bytes.set(part, offset);
    offset += part.byteLength;
  }
  return { bytes, mime: "audio/mpeg" };
}

export async function verifyKey(key: string): Promise<VerifyResult> {
  if (!key.trim()) return { ok: false, message: "请先填入 MiMo 密钥。" };
  try {
    const response = await fetch(`${mimoApi()}/models`, {
      headers: { "api-key": key },
      redirect: "error",
      signal: AbortSignal.timeout(20_000),
    });
    await response.body?.cancel();
    return response.ok ? { ok: true } : { ok: false, message: refusal(response.status) };
  } catch {
    return { ok: false, message: "连不上 MiMo 来检查这把密钥，请检查网络或代理设置。" };
  }
}
