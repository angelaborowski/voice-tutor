import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import express from "express";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import OpenAI from "openai";
import {
  isMeaningfulSpeechText,
  localTutorReply,
  normalizeChatHistory,
} from "./tutor-content.mjs";
import {
  localStudyNote,
  normalizeNote,
  parseJsonObject,
} from "./tutor-note.mjs";
import {
  normalizePersonality,
  tutorInstructions,
} from "./tutor-prompts.mjs";
import { addWaitlistEmail } from "./waitlist.mjs";

const PORT = Number(process.env.PORT ?? 3001);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://127.0.0.1:5174";
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
const ELEVENLABS_SPEECH_ENGINE_ID = process.env.ELEVENLABS_SPEECH_ENGINE_ID;
const SPEECH_ENGINE_DEBUG = process.env.SPEECH_ENGINE_DEBUG === "true";
const WAITLIST_PATH = process.env.WAITLIST_PATH
  ?? fileURLToPath(new URL("../data/waitlist.csv", import.meta.url));
let currentPersonality = "athena";

const studyPackInstructions = `Return only valid JSON for a learning pack generated from a spoken tutoring transcript.
It can be any subject and any level, so do not force school exam framing unless the transcript asks for it.
Infer the subject, level, learner goal, and the main content discussed.
Keys: topic, definition, summary, covered, gaps, nextStep, keyTerms, recommendedActivity, flashcards, quickFireQuiz, modelAnswer.
topic must be the clean note title/topic name, not an activity name; use titles like Photosynthesis, Quadratic equations, or The Cold War, not Photosynthesis answer drill or Quiz practice.
definition must be one clear student-friendly definition of the main topic, written as a revision note, not as feedback.
summary must be a concise factual overview of what was spoken about, not feedback on performance. Write it in a warm first-person-plural voice when natural, such as "We focused on..." rather than "The tutor focused on...".
covered must be 4-7 clear summary-note bullets explaining the topic/content from the conversation. Prefer useful lesson-note points such as definition details, process steps, examples, formulas, causes, effects, misconceptions, and key links. Do not include meta bullets like transcript captured or learning pack generated.
gaps should be 2-4 separate improvement points or missing ideas for future practice.
keyTerms should be 4-8 useful terms.
recommendedActivity should be 2-4 concrete activities.
flashcards must be exactly 20 cards in this shape: {front, back, type, difficulty, keyword}.
Design the flashcard deck as 5 definition cards, 5 process/sequence cards, 4 application cards, 3 misconception cards, and 3 exam/answer-building cards.
Use exact type values: definition, process, application, misconception, answer-building.
Use exact difficulty values: easy, medium, hard.
keyword should be the main term tested by the card when there is a useful one; otherwise use an empty string.
Each flashcard must test one idea only.
The front must be an active recall prompt, not a vague title.
The back should be concise but complete.
Avoid duplicate cards.
Avoid yes/no questions unless they reveal a misconception.
Include the exact key term where useful.
Prefer why, how, and what happens if prompts over simple recognition.
If the transcript is too thin for 20 distinct cards, still produce 20 by covering useful prerequisite ideas and sensible next-step recall checks for the inferred topic.
quickFireQuiz should be 3-5 {question, answer} checks.
modelAnswer should be a polished answer or answer plan based on the learner's topic and transcript, separate from the summary notes.
If maths or formulas are relevant, use simple LaTeX such as $x^2 + 5x + 6$ sparingly.
If the transcript is too thin, still make a useful starter pack and set nextStep to the next question the tutor should ask.`;

const app = express();
const httpServer = createServer(app);
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const elevenlabs = process.env.ELEVENLABS_API_KEY
  ? new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY })
  : null;

app.use(express.json({ limit: "1mb" }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", CLIENT_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    elevenLabsConfigured: Boolean(elevenlabs),
    speechEngineConfigured: Boolean(ELEVENLABS_SPEECH_ENGINE_ID),
    openAiConfigured: Boolean(openai),
    llm: openai ? OPENAI_MODEL : "local fallback",
    webSocketPath: "/ws",
    tokenPath: "/api/token",
    personality: currentPersonality,
  });
});

app.post("/api/personality", (req, res) => {
  const requestedPersonality = normalizePersonality(req.body?.personality);
  if (requestedPersonality) {
    currentPersonality = requestedPersonality;
  }

  res.json({ personality: currentPersonality });
});

app.post("/api/waitlist", async (req, res) => {
  try {
    const result = await addWaitlistEmail({
      filePath: WAITLIST_PATH,
      email: req.body?.email,
      name: String(req.body?.name ?? "").slice(0, 120),
      source: String(req.body?.source ?? "landing").slice(0, 80),
      userAgent: String(req.get("user-agent") ?? "").slice(0, 240),
    });

    if (!result.ok) {
      res.status(400).json({ error: "Please enter a valid email address." });
      return;
    }

    res.json({
      ok: true,
      alreadyJoined: result.alreadyJoined,
      message: result.alreadyJoined
        ? "You're already on the list."
        : "You're on the list.",
    });
  } catch (error) {
    console.error("Waitlist error", error);
    res.status(500).json({ error: "Could not save that email right now." });
  }
});

app.get("/api/token", async (_req, res) => {
  if (!elevenlabs || !ELEVENLABS_SPEECH_ENGINE_ID) {
    res.status(503).json({
      error: "ElevenLabs API key and Speech Engine ID are required for live voice.",
    });
    return;
  }

  try {
    const response =
      await elevenlabs.conversationalAi.conversations.getWebrtcToken({
        agentId: ELEVENLABS_SPEECH_ENGINE_ID,
      });
    res.json({ token: response.token });
  } catch (error) {
    console.error("Token error", error);
    res.status(500).json({ error: "Failed to create ElevenLabs token." });
  }
});

app.post("/api/chat", async (req, res) => {
  const input = String(req.body?.input ?? "").trim();
  const history = Array.isArray(req.body?.history) ? req.body.history : [];
  const requestedPersonality = normalizePersonality(req.body?.personality);
  const personality = requestedPersonality ?? currentPersonality;
  if (!input) {
    res.status(400).json({ error: "Missing input." });
    return;
  }

  if (!openai) {
    res.json({ reply: localTutorReply(input, personality) });
    return;
  }

  try {
    const transcript = normalizeChatHistory(history, input);
    const response = await openai.responses.create({
      model: OPENAI_MODEL,
      instructions: tutorInstructions(personality),
      input: transcript.map((message) => ({
        role: message.role === "tutor" ? "assistant" : "user",
        content: String(message.text ?? ""),
      })),
    });
    res.json({ reply: response.output_text?.trim() || localTutorReply(input, personality) });
  } catch (error) {
    console.error("Chat error", error);
    res.json({ reply: localTutorReply(input, personality) });
  }
});

app.post("/api/note", async (req, res) => {
  const history = Array.isArray(req.body?.history) ? req.body.history : [];
  if (!openai || history.length < 2) {
    res.json({ note: localStudyNote(history) });
    return;
  }

  try {
    const response = await openai.responses.create({
      model: OPENAI_MODEL,
      instructions: studyPackInstructions,
      input: [
        {
          role: "user",
          content: JSON.stringify(history.map(({ role, text }) => ({ role, text }))),
        },
      ],
    });
    const note = parseJsonObject(response.output_text);
    res.json({ note: normalizeNote(note, history) });
  } catch (error) {
    console.error("Note error", error);
    res.json({ note: localStudyNote(history) });
  }
});

if (elevenlabs && ELEVENLABS_SPEECH_ENGINE_ID && openai) {
  try {
    await elevenlabs.speechEngine.attach(
      ELEVENLABS_SPEECH_ENGINE_ID,
      httpServer,
      "/ws",
      {
        debug: SPEECH_ENGINE_DEBUG,
        onInit(conversationId) {
          if (SPEECH_ENGINE_DEBUG) {
            console.log("Speech Engine session started:", conversationId);
          }
        },
        async onTranscript(transcript, signal, session) {
          const latestUserMessage = [...transcript]
            .reverse()
            .find((message) => message.role === "user");
          if (!latestUserMessage || !isMeaningfulSpeechText(latestUserMessage.content)) {
            return;
          }

          const response = await openai.responses.create(
            {
              model: OPENAI_MODEL,
              instructions: tutorInstructions(currentPersonality),
              input: transcript
                .filter((message) => isMeaningfulSpeechText(message.content))
                .map((message) => ({
                  role: message.role === "agent" ? "assistant" : message.role,
                  content: message.content,
                })),
              stream: true,
            },
            { signal },
          );
          session.sendResponse(response);
        },
        onClose(session) {
          if (SPEECH_ENGINE_DEBUG) {
            console.log("Speech Engine session ended:", session.conversationId);
          }
        },
        onError(error) {
          console.error("Speech Engine error:", error);
        },
      },
    );
  } catch (error) {
    console.error("Could not attach Speech Engine. Text endpoints still work.", error);
  }
}

httpServer.listen(PORT, () => {
  console.log(`Teach Me server listening on http://127.0.0.1:${PORT}`);
});
