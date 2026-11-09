import { createServer, type Server } from "node:http";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { MIMO_VOICES } from "../../shared/mimo-voice.ts";
import type { AppConfig } from "../config.ts";
import * as mimo from "./mimo.ts";
import * as tts from "./index.ts";

const MP3_A = Buffer.from([0xff, 0xfb, 0x90, 0x00, 0x11, 0x22, 0x33, 0x44]);
const MP3_B = Buffer.from([0xff, 0xfb, 0x92, 0x00, 0x55, 0x66, 0x77, 0x88]);

let server: Server;
let base = "";
const seen: Array<{ method: string; url: string; headers: Record<string, string>; body: Record<string, unknown> }> = [];
let refuse: { status: number } | null = null;
let modelsStatus = 200;

beforeAll(async () => {
  server = createServer((req, res) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      const body = raw ? JSON.parse(raw) : {};
      seen.push({ method: req.method ?? "", url: req.url ?? "", headers: req.headers as Record<string, string>, body });
      // A closing socket keeps a cancelled error response from poisoning the next test's request.
      const send = (status: number, payload: unknown) => {
        res.writeHead(status, { "content-type": "application/json", connection: "close" });
        res.end(JSON.stringify(payload));
      };
      if (refuse) return send(refuse.status, { error: { message: "refused", api_key: "must-not-leak" } });
      if (req.url === "/v1/models") {
        return send(modelsStatus, modelsStatus === 200 ? { data: [{ id: "mimo-v2.5-tts" }] } : { error: "nope" });
      }
      if (req.url === "/v1/chat/completions") {
        const messages = body.messages as Array<{ content?: string }> | undefined;
        const text = messages?.[0]?.content ?? "";
        if (text.includes("没有声音")) return send(200, { choices: [{ message: { content: "", audio: { data: "" } } }] });
        if (text.includes("第二句")) {
          return send(200, { choices: [{ message: { content: "", audio: { data: MP3_B.toString("base64") } } }] });
        }
        return send(200, { choices: [{ message: { content: "", audio: { data: MP3_A.toString("base64") } } }] });
      }
      send(404, { error: "unknown" });
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  base = `http://127.0.0.1:${port}/v1`;
  process.env.OMB_MIMO_API = base;
});

afterAll(() => {
  server.close();
  delete process.env.OMB_MIMO_API;
});

beforeEach(() => {
  seen.length = 0;
  refuse = null;
  modelsStatus = 200;
  process.env.OMB_MIMO_API = base;
});

const cfg = (ttsPatch: NonNullable<AppConfig["tts"]>): AppConfig => ({ ...({} as AppConfig), tts: ttsPatch });

describe("MiMo voices", () => {
  it("ships the documented presets and needs no network to list them", () => {
    const voices = mimo.listVoices();
    expect(voices.map((voice) => voice.id)).toEqual(MIMO_VOICES.map((voice) => voice.id));
    expect(voices[0]).toMatchObject({ id: "冰糖", label: expect.stringContaining("中文") });
    expect(seen).toHaveLength(0);
  });

  it("accepts only its own presets as a configured voice", () => {
    expect(mimo.isMimoVoice("冰糖")).toBe(true);
    expect(mimo.isMimoVoice("苏打")).toBe(true);
    expect(mimo.isMimoVoice("alloy")).toBe(false);
    expect(mimo.isMimoVoice(undefined)).toBe(false);
  });

  it("reports ready only with both a key and a preset voice", () => {
    expect(tts.voiceReady(cfg({ provider: "mimo", mimoKey: "k" }))).toBe(false);
    expect(tts.voiceReady(cfg({ provider: "mimo", mimoKey: "k", voice: "alloy" }))).toBe(false);
    expect(tts.voiceReady(cfg({ provider: "mimo", mimoKey: "k", voice: "白桦" }))).toBe(true);
  });

  it("lists presets through the harness only when a key is saved", async () => {
    expect(await tts.listVoices(cfg({ provider: "mimo" }))).toEqual([]);
    expect(await tts.listVoices(cfg({ provider: "mimo", mimoKey: "k" }))).toHaveLength(MIMO_VOICES.length);
  });
});

describe("MiMo key check", () => {
  it("verifies against /models with the key in a header, never the URL", async () => {
    expect(await mimo.verifyKey("mimo-secret")).toEqual({ ok: true });
    expect(seen[0]).toMatchObject({ method: "GET", url: "/v1/models" });
    expect(seen[0]!.headers["api-key"]).toBe("mimo-secret");
    expect(seen[0]!.url).not.toContain("mimo-secret");
  });

  it("says the key was refused in Chinese without echoing the service's body", async () => {
    modelsStatus = 401;
    const result = await mimo.verifyKey("bad-key");
    expect(result).toMatchObject({ ok: false });
    expect(result.ok === false && result.message).toContain("MiMo 拒绝了这把密钥");
    expect(result.ok === false && result.message).not.toContain("must-not-leak");
  });

  it("reports an unreachable service in Chinese", async () => {
    process.env.OMB_MIMO_API = "http://127.0.0.1:1";
    const result = await mimo.verifyKey("k");
    expect(result).toMatchObject({ ok: false });
    expect(result.ok === false && result.message).toContain("连不上 MiMo");
  });
});

describe("MiMo speech", () => {
  it("sends the chat-completions shape MiMo documents and returns the decoded mp3", async () => {
    const audio = await mimo.synthesize("夜已经深了，城市还在呼吸。", "冰糖", "mimo-secret");
    expect(audio.mime).toBe("audio/mpeg");
    expect(Buffer.from(audio.bytes)).toEqual(MP3_A);
    const request = seen[0]!;
    expect(request.url).toBe("/v1/chat/completions");
    expect(request.headers["api-key"]).toBe("mimo-secret");
    expect(request.headers["authorization"]).toBeUndefined();
    expect(request.body).toMatchObject({
      model: "mimo-v2.5-tts",
      messages: [{ role: "assistant", content: "夜已经深了，城市还在呼吸。" }],
      audio: { format: "mp3", voice: "冰糖" },
      stream: false,
    });
  });

  it("does not use OpenAI's audio/speech endpoint", async () => {
    await mimo.synthesize("你好。", "冰糖", "k");
    expect(seen.map((entry) => entry.url)).not.toContain("/v1/audio/speech");
  });

  it("reads long text in sentence-sized requests and joins the audio", async () => {
    const text = `${"第一句话很长。".repeat(250)}第二句话。`;
    const audio = await mimo.synthesize(text, "茉莉", "k");
    expect(seen).toHaveLength(2);
    expect(Buffer.from(audio.bytes)).toEqual(Buffer.concat([MP3_A, MP3_B]));
    const sent = seen.map((entry) => String((entry.body.messages as Array<{ content: string }>)[0]!.content));
    expect(sent.join("")).toBe(text);
  });

  it("refuses a rejected key in Chinese", async () => {
    refuse = { status: 401 };
    await expect(mimo.synthesize("你好。", "冰糖", "k")).rejects.toThrow("MiMo 拒绝了这把密钥");
  });

  it("names an empty balance in Chinese and points at the price page", async () => {
    refuse = { status: 402 };
    await expect(mimo.synthesize("你好。", "冰糖", "k")).rejects.toThrow("余额不足");
  });

  it("tells the person when the free period may be over", async () => {
    refuse = { status: 429 };
    await expect(mimo.synthesize("你好。", "冰糖", "k")).rejects.toThrow("限时免费");
  });

  it("explains a content refusal and a service outage in Chinese", async () => {
    refuse = { status: 421 };
    await expect(mimo.synthesize("你好。", "冰糖", "k")).rejects.toThrow("拦截");
    refuse = { status: 503 };
    await expect(mimo.synthesize("你好。", "冰糖", "k")).rejects.toThrow("暂时不可用");
  });

  it("reports a network failure instead of going silent", async () => {
    process.env.OMB_MIMO_API = "http://127.0.0.1:1";
    await expect(mimo.synthesize("你好。", "冰糖", "k")).rejects.toThrow("连不上 MiMo 语音服务");
  });

  it("refuses a missing key and a foreign voice with clear words", async () => {
    await expect(mimo.synthesize("你好。", "冰糖", "")).rejects.toThrow("还没有填写 MiMo 密钥");
    await expect(mimo.synthesize("你好。", "alloy", "k")).rejects.toThrow("不是 MiMo 的预设音色");
  });

  it("reports empty audio instead of playing nothing", async () => {
    await expect(mimo.synthesize("没有声音。", "冰糖", "k")).rejects.toThrow("没有返回音频");
  });

  it("stops text too long for one synthesis in Chinese", async () => {
    await expect(mimo.synthesize("很".repeat(7201), "冰糖", "k")).rejects.toThrow("太长了");
  });

  it("splits at sentence boundaries", () => {
    expect(mimo.splitForMimo("短句。".repeat(500)).length).toBeGreaterThan(1);
    expect(mimo.splitForMimo("一句话。")[0]).toBe("一句话。");
  });

  it("speaks through the harness using the saved MiMo key and voice", async () => {
    const audio = await tts.speak(cfg({ provider: "mimo", mimoKey: "mimo-secret", voice: "苏打" }), "读这一段。");
    expect(Buffer.from(audio.bytes)).toEqual(MP3_A);
    expect(seen[0]!.body.audio).toMatchObject({ voice: "苏打" });
  });
});
