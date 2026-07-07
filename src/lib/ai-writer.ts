// Client-safe types & presets for the AI writing studio.

export type ProviderType =
  | "openai"
  | "openrouter"
  | "gemini"
  | "deepseek"
  | "claude"
  | "custom";

/** Provider row as returned to the admin UI — api_key is masked, never the raw value. */
export type AiProvider = {
  id: string;
  name: string;
  provider_type: ProviderType;
  base_url: string;
  model: string;
  api_key_preview: string; // e.g. "••••1234"
  enabled: boolean;
  is_default: boolean;
};

export type ProviderPreset = {
  type: ProviderType;
  label: string;
  base_url: string;
  exampleModel: string;
  keyHint: string;
  /** custom lets the admin edit the base URL freely */
  editableBaseUrl: boolean;
};

export const PROVIDER_PRESETS: ProviderPreset[] = [
  {
    type: "openai",
    label: "OpenAI",
    base_url: "https://api.openai.com/v1",
    exampleModel: "gpt-4o-mini",
    keyHint: "sk-...",
    editableBaseUrl: false,
  },
  {
    type: "openrouter",
    label: "OpenRouter",
    base_url: "https://openrouter.ai/api/v1",
    exampleModel: "openai/gpt-4o-mini",
    keyHint: "sk-or-...",
    editableBaseUrl: false,
  },
  {
    type: "gemini",
    label: "Google Gemini",
    base_url: "https://generativelanguage.googleapis.com/v1beta/openai",
    exampleModel: "gemini-2.0-flash",
    keyHint: "AIza...",
    editableBaseUrl: false,
  },
  {
    type: "deepseek",
    label: "DeepSeek",
    base_url: "https://api.deepseek.com/v1",
    exampleModel: "deepseek-chat",
    keyHint: "sk-...",
    editableBaseUrl: false,
  },
  {
    type: "claude",
    label: "Anthropic Claude",
    base_url: "https://api.anthropic.com/v1",
    exampleModel: "claude-3-5-sonnet-latest",
    keyHint: "sk-ant-...",
    editableBaseUrl: false,
  },
  {
    type: "custom",
    label: "Custom (OpenAI-compatible)",
    base_url: "",
    exampleModel: "model-name",
    keyHint: "your API key",
    editableBaseUrl: true,
  },
];

export function presetFor(type: ProviderType): ProviderPreset {
  return PROVIDER_PRESETS.find((p) => p.type === type) ?? PROVIDER_PRESETS[PROVIDER_PRESETS.length - 1];
}

export function providerLabel(type: ProviderType): string {
  return presetFor(type).label;
}

export type ConversationSummary = {
  id: string;
  title: string;
  updated_at: string;
  expires_at: string;
};
