import { OpenAiLogo } from "@phosphor-icons/react/ssr";
import {
  siClaude,
  siGithubcopilot,
  siGoogle,
  siGooglegemini,
  siPerplexity,
} from "simple-icons";
import type { Engine } from "@/lib/data";

const simple = {
  perplexity: siPerplexity,
  gemini: siGooglegemini,
  google: siGoogle,
  claude: siClaude,
  copilot: siGithubcopilot,
};

export const engineNames: Record<Engine, string> = {
  chatgpt: "ChatGPT",
  perplexity: "Perplexity",
  gemini: "Gemini",
  google: "Google AI Overviews",
  claude: "Claude",
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
  if (engine === "chatgpt") {
    return <OpenAiLogo size={size} weight="fill" aria-hidden />;
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
