import type { RevisionSession } from "./types";
import { STORAGE_KEY } from "./tutorContent";

declare global {
  interface Window {
    Cookies?: {
      get: (name: string) => string | undefined;
      set: (name: string, value: string, options?: { expires?: number }) => void;
    };
  }
}

export type AgentSettings = {
  userName: string;
  personality: "athena" | "apollo" | "hermes" | "socrates" | "hestia" | "ares";
};

export type StudyPackTab = "summary" | "keywords" | "flashcards" | "quiz";
export type StudioBackdrop = "void" | "paper" | "aurora" | "blueprint" | "sunrise" | "fabric" | "shadow";
export type StudioTheme = "light" | "dark";

export const AGENT_SETTINGS_STORAGE_KEY = "teach-me:agent-settings:v1";
export const STUDIO_BACKDROP_STORAGE_KEY = "teach-me:studio-backdrop:v2";

export const personalityLabels: Record<AgentSettings["personality"], string> = {
  athena: "Athena",
  apollo: "Apollo",
  hermes: "Hermes",
  socrates: "Socrates",
  hestia: "Hestia",
  ares: "Ares",
};

export const personalityColors: Record<AgentSettings["personality"], [string, string]> = {
  athena: ["#8BE4C2", "#F0B98A"],
  apollo: ["#8FB8FF", "#F0C18F"],
  hermes: ["#FFD84D", "#FF7F6E"],
  socrates: ["#B59BFF", "#86DFFF"],
  hestia: ["#F3A8CB", "#AFE18F"],
  ares: ["#EBA783", "#AFC7FF"],
};

export const personalityOptions = Object.keys(personalityLabels) as AgentSettings["personality"][];

export const studioBackdropOptions: Array<{ id: StudioBackdrop; label: string; colors: [string, string] }> = [
  { id: "void", label: "Void", colors: ["#030303", "#1a1a1a"] },
  { id: "paper", label: "Paper", colors: ["#f2f1ee", "#cddcff"] },
  { id: "aurora", label: "Aurora", colors: ["#b9f5df", "#d7c4ff"] },
  { id: "blueprint", label: "Blueprint", colors: ["#b8d8ff", "#f2f8ff"] },
  { id: "sunrise", label: "Sunrise", colors: ["#ffd7b0", "#f4bdd0"] },
  { id: "fabric", label: "Fabric", colors: ["#211f17", "#8f846f"] },
  { id: "shadow", label: "Shadow", colors: ["#171717", "#777168"] },
];

const env = import.meta.env as Record<string, string | undefined>;
const personalityVoiceIds: Partial<Record<AgentSettings["personality"], string>> = {
  athena: env.VITE_TEACHME_VOICE_ATHENA ?? env.VITE_OUTLOUD_VOICE_ATHENA ?? "uIZsnBL0YK1S5j69bAih",
  apollo: env.VITE_TEACHME_VOICE_APOLLO ?? env.VITE_OUTLOUD_VOICE_APOLLO,
  hermes: env.VITE_TEACHME_VOICE_HERMES ?? env.VITE_OUTLOUD_VOICE_HERMES,
  socrates: env.VITE_TEACHME_VOICE_SOCRATES ?? env.VITE_OUTLOUD_VOICE_SOCRATES,
  hestia: env.VITE_TEACHME_VOICE_HESTIA ?? env.VITE_OUTLOUD_VOICE_HESTIA,
  ares: env.VITE_TEACHME_VOICE_ARES ?? env.VITE_OUTLOUD_VOICE_ARES,
};

export function getPersonalityVoiceId(personality: AgentSettings["personality"]) {
  const voiceId = personalityVoiceIds[personality]?.trim();
  return voiceId || undefined;
}

export function readStoredSessions(): RevisionSession[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as RevisionSession[]) : [];
  } catch {
    return [];
  }
}

export function readAgentSettings(): AgentSettings {
  try {
    const parsed = JSON.parse(localStorage.getItem(AGENT_SETTINGS_STORAGE_KEY) ?? "{}");
    return {
      userName: typeof parsed.userName === "string" && parsed.userName.trim()
        ? parsed.userName.trim()
        : "Learner",
      personality: personalityOptions.includes(parsed.personality)
        ? parsed.personality
        : "athena",
    };
  } catch {
    return {
      userName: "Learner",
      personality: "athena",
    };
  }
}

export function readStudioBackdrop(): StudioBackdrop {
  const options = studioBackdropOptions.map((option) => option.id);

  try {
    const stored = localStorage.getItem(STUDIO_BACKDROP_STORAGE_KEY);
    return stored && options.includes(stored as StudioBackdrop) ? (stored as StudioBackdrop) : "void";
  } catch {
    return "void";
  }
}

export function readStudioTheme(): StudioTheme {
  try {
    const cookieTheme = window.Cookies?.get("theme") ?? document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("theme="))
      ?.split("=")[1];

    return cookieTheme === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function isMeaningfulSpeechText(value: string) {
  const normalized = value.trim();
  if (!normalized) return false;

  return /[\p{L}\p{N}]/u.test(normalized);
}

export function hasLearnerTurn(session: RevisionSession) {
  return session.messages.some((message) => message.role === "student" && isMeaningfulSpeechText(message.text));
}
