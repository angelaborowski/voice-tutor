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
  personality: TutorPersonalityId;
};

export type StudyPackTab = "summary" | "keywords" | "flashcards" | "quiz";
export type StudioBackdrop = "void" | "paper" | "aurora" | "blueprint" | "sunrise" | "fabric" | "shadow";
export type StudioTheme = "light" | "dark";
export type TutorPersonalityPalette = [string, string];
export type TutorPersonalityProfile = {
  label: string;
  shortDescription: string;
  opener: string;
  colors: TutorPersonalityPalette;
  voiceId?: string;
};

export const AGENT_SETTINGS_STORAGE_KEY = "teach-me:agent-settings:v1";
export const STUDIO_BACKDROP_STORAGE_KEY = "teach-me:studio-backdrop:v2";

const env = import.meta.env as Record<string, string | undefined>;

export const tutorPersonalityProfiles = {
  athena: {
    label: "Athena",
    shortDescription: "Strategic answer upgrades.",
    opener: "Good.",
    colors: ["#8BE4C2", "#F0B98A"],
    voiceId: env.VITE_TEACHME_VOICE_ATHENA ?? env.VITE_OUTLOUD_VOICE_ATHENA ?? "uIZsnBL0YK1S5j69bAih",
  },
  apollo: {
    label: "Apollo",
    shortDescription: "Calm, tidy explanations.",
    opener: "Clear.",
    colors: ["#8FB8FF", "#F0C18F"],
    voiceId: env.VITE_TEACHME_VOICE_APOLLO ?? env.VITE_OUTLOUD_VOICE_APOLLO,
  },
  hermes: {
    label: "Hermes",
    shortDescription: "Fast prompts and recall.",
    opener: "Nice, we're live.",
    colors: ["#FFD84D", "#FF7F6E"],
    voiceId: env.VITE_TEACHME_VOICE_HERMES ?? env.VITE_OUTLOUD_VOICE_HERMES,
  },
  socrates: {
    label: "Socrates",
    shortDescription: "Questions first, answers earned.",
    opener: "Good question.",
    colors: ["#B59BFF", "#86DFFF"],
    voiceId: env.VITE_TEACHME_VOICE_SOCRATES ?? env.VITE_OUTLOUD_VOICE_SOCRATES,
  },
  hestia: {
    label: "Hestia",
    shortDescription: "Gentle, steady support.",
    opener: "No pressure.",
    colors: ["#F3A8CB", "#AFE18F"],
    voiceId: env.VITE_TEACHME_VOICE_HESTIA ?? env.VITE_OUTLOUD_VOICE_HESTIA,
  },
  ares: {
    label: "Ares",
    shortDescription: "Direct challenge drills.",
    opener: "Ready.",
    colors: ["#EBA783", "#AFC7FF"],
    voiceId: env.VITE_TEACHME_VOICE_ARES ?? env.VITE_OUTLOUD_VOICE_ARES,
  },
} satisfies Record<string, TutorPersonalityProfile>;

export type TutorPersonalityId = keyof typeof tutorPersonalityProfiles;

export const DEFAULT_TUTOR_PERSONALITY: TutorPersonalityId = "athena";
export const tutorPersonalityOptions = Object.keys(tutorPersonalityProfiles) as TutorPersonalityId[];

function mapTutorPersonalityProfiles<Value>(
  selectValue: (profile: TutorPersonalityProfile) => Value,
): Record<TutorPersonalityId, Value> {
  return Object.fromEntries(
    tutorPersonalityOptions.map((personality) => [
      personality,
      selectValue(tutorPersonalityProfiles[personality]),
    ]),
  ) as Record<TutorPersonalityId, Value>;
}

export const personalityOptions = tutorPersonalityOptions;
export const personalityLabels = mapTutorPersonalityProfiles((profile) => profile.label);
export const personalityDescriptions = mapTutorPersonalityProfiles((profile) => profile.shortDescription);
export const personalityColors = mapTutorPersonalityProfiles((profile) => profile.colors);

export const studioBackdropOptions: Array<{ id: StudioBackdrop; label: string; colors: [string, string] }> = [
  { id: "void", label: "Void", colors: ["#030303", "#1a1a1a"] },
  { id: "paper", label: "Paper", colors: ["#f2f1ee", "#cddcff"] },
  { id: "aurora", label: "Aurora", colors: ["#b9f5df", "#d7c4ff"] },
  { id: "blueprint", label: "Blueprint", colors: ["#b8d8ff", "#f2f8ff"] },
  { id: "sunrise", label: "Sunrise", colors: ["#ffd7b0", "#f4bdd0"] },
  { id: "fabric", label: "Fabric", colors: ["#211f17", "#8f846f"] },
  { id: "shadow", label: "Shadow", colors: ["#171717", "#777168"] },
];

export function isTutorPersonalityId(value: unknown): value is TutorPersonalityId {
  return typeof value === "string" && value in tutorPersonalityProfiles;
}

export function getPersonalityVoiceId(personality: TutorPersonalityId) {
  const voiceId = tutorPersonalityProfiles[personality].voiceId?.trim();
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
      personality: isTutorPersonalityId(parsed.personality)
        ? parsed.personality
        : DEFAULT_TUTOR_PERSONALITY,
    };
  } catch {
    return {
      userName: "Learner",
      personality: DEFAULT_TUTOR_PERSONALITY,
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
