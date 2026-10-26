import { OpenAiLogo, WindowsLogo } from "@phosphor-icons/react/ssr";
import {
  siClaude,
  siDeepseek,
  siGoogle,
  siGooglegemini,
  siMeta,
  siMistralai,
  siPerplexity,
  siQwen,
  siX,
} from "simple-icons";
import type { Engine } from "@/lib/data";

const simple = {
  perplexity: siPerplexity,
  gemini: siGooglegemini,
  google: siGoogle,
  claude: siClaude,
  grok: siX,
  llama: siMeta,
  mistral: siMistralai,
  deepseek: siDeepseek,
  qwen: siQwen,
};

export const engineNames: Record<Engine, string> = {
  chatgpt: "ChatGPT",
  chatgpt_search: "ChatGPT Search",
  perplexity: "Perplexity",
  gemini: "Gemini",
  google: "Google AI Overviews",
  claude: "Claude",
  grok: "Grok",
  llama: "Llama",
  mistral: "Mistral AI",
  deepseek: "DeepSeek",
  qwen: "Qwen",
  copilot: "Copilot",
};

export function EngineIcon({
  engine,
  size = 14,
  mono = false,
}: {
  engine: Engine;
  size?: number;
  mono?: boolean;
}) {
  if (engine === "chatgpt" || engine === "chatgpt_search") {
    return <OpenAiLogo size={size} weight="fill" aria-hidden />;
  }
  if (engine === "copilot") {
    return <WindowsLogo size={size} weight="fill" aria-hidden />;
  }
  const icon = simple[engine];
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={mono ? "currentColor" : `#${icon.hex}`}
      aria-hidden
    >
      <path d={icon.path} />
    </svg>
  );
}
