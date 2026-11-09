/** MiMo's preset voices for `mimo-v2.5-tts`. The API has no voice-list endpoint, so this is the documented set. */
export const MIMO_VOICES = [
  { id: "冰糖", label: "冰糖 · 中文女声", description: "温和自然的中文女声" },
  { id: "茉莉", label: "茉莉 · 中文女声", description: "明亮轻快的中文女声" },
  { id: "苏打", label: "苏打 · 中文男声", description: "沉稳的中文男声" },
  { id: "白桦", label: "白桦 · 中文男声", description: "清朗的中文男声" },
  { id: "mimo_default", label: "默认音色", description: "中国集群为冰糖，其他集群为 Mia" },
  { id: "Mia", label: "Mia · English female" },
  { id: "Chloe", label: "Chloe · English female" },
  { id: "Milo", label: "Milo · English male" },
  { id: "Dean", label: "Dean · English male" },
] as const;

export const DEFAULT_MIMO_VOICE = "冰糖";

export function isMimoVoice(voice: string | undefined): boolean {
  return MIMO_VOICES.some((preset) => preset.id === voice);
}
