import type { TutorMessage } from "./types";

export const STORAGE_KEY = "teach-me:sessions:v1";

export function createId(prefix = "teach-me") {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getTimeLabel(date = new Date()) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

const STARTER_MESSAGES = [
  "Hey, let's talk.",
  "Call me when you're ready.",
  "Ready when you are.",
  "Let's work it through.",
  "Tell me what you're thinking.",
];

export function createBlankSession() {
  const now = Date.now();
  return {
    id: createId("session"),
    title: "New chat",
    preview: "Voice session ready.",
    createdAt: now,
    updatedAt: now,
    messages: [],
    studyNote: null,
  };
}

export function createStarterSession() {
  const session = createBlankSession();
  const message: TutorMessage = {
    id: createId("starter"),
    role: "tutor",
    text: STARTER_MESSAGES[Math.floor(Math.random() * STARTER_MESSAGES.length)],
    at: getTimeLabel(),
  };

  return {
    ...session,
    preview: message.text,
    messages: [message],
  };
}

export function titleFromMessages(messages: TutorMessage[]) {
  const firstStudent =
    messages.find((message) => message.role === "student" && isUsefulTitleSeed(message.text)) ??
    messages.find((message) => message.role === "student");
  if (!firstStudent) return "New chat";

  return truncate(firstStudent.text.replace(/[?.!,]+$/g, ""), 48);
}

export function previewFromMessages(messages: TutorMessage[]) {
  const latest = [...messages]
    .reverse()
    .find((message) => message.role === "student" || message.role === "tutor");
  return latest ? truncate(latest.text, 78) : "Ready for a spoken learning session.";
}

export function truncate(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1).trim()}...` : value;
}

function isUsefulTitleSeed(text: string) {
  const normalized = text.toLowerCase().trim();
  if (isGreetingOnly(normalized) || isFillerOnly(normalized)) return false;
  if (normalized.includes("testing") || normalized.includes("one two three") || normalized.includes("1 2 3")) {
    return false;
  }

  return normalized.length > 2;
}

function isGreetingOnly(text: string) {
  return /^(hi|hey|hello|hiya|yo|morning|afternoon|evening|ready|ok|okay)[\s.!?]*$/i.test(text.trim());
}

function isFillerOnly(text: string) {
  const compact = text.trim().replace(/[.\s,!?-]/g, "");
  return !compact || /^(um+|uh+|erm+|hmm+|mmm+|ah+)$/.test(compact);
}
