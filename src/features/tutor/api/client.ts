import {
  buildLocalStudyNote,
  buildLocalTutorReply,
} from "@/features/tutor/domain/tutorContent";
import type { HealthStatus, StudyNote, TutorMessage } from "@/features/tutor/domain/types";

export async function fetchHealth(): Promise<HealthStatus> {
  const response = await fetch("/api/health");
  if (!response.ok) {
    throw new Error(`Health check failed (${response.status})`);
  }
  return (await response.json()) as HealthStatus;
}

export async function sendTutorMessage(
  history: TutorMessage[],
  input: string,
  personality?: string,
): Promise<string> {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history, input, personality }),
    });

    if (!response.ok) {
      throw new Error(`Tutor request failed (${response.status})`);
    }

    const data = (await response.json()) as { reply?: string };
    return data.reply?.trim() || buildLocalTutorReply(input, history, personality);
  } catch {
    return buildLocalTutorReply(input, history, personality);
  }
}

export async function syncTutorPersonality(personality: string): Promise<void> {
  await fetch("/api/personality", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ personality }),
  }).catch(() => {
    // Text fallback still works if the local server is not running.
  });
}

export async function generateStudyNote(
  history: TutorMessage[],
): Promise<StudyNote> {
  try {
    const response = await fetch("/api/note", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history }),
    });

    if (!response.ok) {
      throw new Error(`Study note request failed (${response.status})`);
    }

    const data = (await response.json()) as { note?: StudyNote };
    return data.note ?? buildLocalStudyNote(history);
  } catch {
    return buildLocalStudyNote(history);
  }
}

export async function getVoiceToken(): Promise<string> {
  const response = await fetch("/api/token");
  if (!response.ok) {
    throw new Error(`Voice token request failed (${response.status})`);
  }

  const data = (await response.json()) as { token?: string };
  if (!data.token) {
    throw new Error("Voice token response did not include a token.");
  }

  return data.token;
}
