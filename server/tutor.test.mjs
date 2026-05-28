import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { localTutorReply, normalizeChatHistory } from "./tutor-content.mjs";
import { PERSONALITIES } from "./tutor-data.mjs";
import { localStudyNote, normalizeNote, parseJsonObject } from "./tutor-note.mjs";
import { normalizePersonality, tutorInstructions } from "./tutor-prompts.mjs";
import {
  addWaitlistEmail,
  createWaitlistEntry,
  normalizeWaitlistEmail,
  postWaitlistWebhook,
  waitlistEntryToCsv,
} from "./waitlist.mjs";

test("normalizes supported tutor personalities", () => {
  for (const personality of PERSONALITIES) {
    assert.equal(normalizePersonality(titleCase(personality)), personality);
  }

  assert.equal(normalizePersonality("unknown"), null);
  assert.equal(normalizePersonality(""), null);
  assert.equal(normalizePersonality(null), null);
});

test("local tutor fallback gives subject-specific practice prompts", () => {
  const reply = localTutorReply("quiz me on photosynthesis", "athena");

  assert.match(reply, /photosynthesis/i);
  assert.match(reply, /raw materials/i);
});

test("local study note infers a useful subject pack", () => {
  const note = localStudyNote([
    { role: "student", text: "I don't get photosynthesis", at: "10:00" },
    { role: "tutor", text: "Photosynthesis uses carbon dioxide and water.", at: "10:01" },
  ]);

  assert.equal(note.topic, "Biology");
  assert.ok(note.flashcards.length > 0);
  assert.ok(note.quickFireQuiz.length > 0);
});

test("normalizes thin model output into a complete note shape", () => {
  const note = normalizeNote(
    { topic: "Python", flashcards: [{ front: "Input?", back: "A value." }] },
    [{ role: "student", text: "quiz me on python functions" }],
  );

  assert.equal(note.topic, "Python");
  assert.ok(Array.isArray(note.covered));
  assert.ok(Array.isArray(note.gaps));
  assert.ok(note.modelAnswer.length > 0);
});

test("normalizes up to twenty generated flashcards", () => {
  const note = normalizeNote(
    {
      topic: "Biology",
      flashcards: Array.from({ length: 24 }, (_, index) => ({
        front: `Question ${index + 1}?`,
        back: `Answer ${index + 1}.`,
        type: index === 0 ? "definition" : index === 1 ? "not-a-type" : "process",
        difficulty: index === 0 ? "easy" : index === 1 ? "expert" : "medium",
        keyword: index === 0 ? "photosynthesis" : "",
      })),
    },
    [{ role: "student", text: "quiz me on photosynthesis" }],
  );

  assert.equal(note.flashcards.length, 20);
  assert.equal(note.flashcards.at(-1).front, "Question 20?");
  assert.equal(note.flashcards[0].type, "definition");
  assert.equal(note.flashcards[0].difficulty, "easy");
  assert.equal(note.flashcards[0].keyword, "photosynthesis");
  assert.equal(note.flashcards[1].type, undefined);
  assert.equal(note.flashcards[1].difficulty, undefined);
});

test("parses fenced JSON and preserves latest chat turn", () => {
  assert.deepEqual(parseJsonObject("```json\n{\"topic\":\"Maths\"}\n```"), { topic: "Maths" });

  const history = normalizeChatHistory([{ role: "tutor", text: "Ready" }], "quiz me");
  assert.deepEqual(history.at(-1), { role: "student", text: "quiz me" });
});

test("prompt instructions include every supported personality", () => {
  for (const personality of PERSONALITIES) {
    assert.match(tutorInstructions(personality), new RegExp(`Personality: ${titleCase(personality)}\\.`));
  }
});

test("prompt instructions safely fall back for invalid personalities", () => {
  const invalidPersonalities = ["unknown", "", "   ", null, undefined, 42, { name: "hades" }];

  for (const personality of invalidPersonalities) {
    assert.match(tutorInstructions(personality), /Personality: Athena\./);
  }
});

test("normalizes and validates waitlist emails", () => {
  assert.equal(normalizeWaitlistEmail("  HELLO@EXAMPLE.COM "), "hello@example.com");
  assert.equal(normalizeWaitlistEmail("not-an-email"), "");
});

test("formats waitlist entries as escaped csv", () => {
  assert.equal(
    waitlistEntryToCsv({
      createdAt: "2026-05-28T09:00:00.000Z",
      email: "hello@example.com",
      name: 'Ada "Test"',
      source: "landing",
      userAgent: 'Browser "Test"',
    }),
    '"2026-05-28T09:00:00.000Z","hello@example.com","Ada ""Test""","landing","Browser ""Test"""',
  );
});

test("adds waitlist emails once", async () => {
  const dir = await mkdtemp(join(tmpdir(), "teachme-waitlist-"));
  const filePath = join(dir, "waitlist.csv");

  const first = await addWaitlistEmail({
    filePath,
    email: "Hello@Example.com",
    name: "Ada",
    now: new Date("2026-05-28T09:00:00.000Z"),
  });
  const second = await addWaitlistEmail({
    filePath,
    email: "hello@example.com",
    now: new Date("2026-05-28T09:05:00.000Z"),
  });

  const csv = await readFile(filePath, "utf8");
  assert.deepEqual(first, { ok: true, email: "hello@example.com", alreadyJoined: false });
  assert.deepEqual(second, { ok: true, email: "hello@example.com", alreadyJoined: true });
  assert.equal(csv.match(/hello@example.com/g)?.length, 1);
  assert.match(csv, /createdAt,email,name,source,userAgent/);
  assert.match(csv, /"Ada"/);
});

test("posts waitlist entries to webhook with shared secret", async () => {
  const entry = createWaitlistEntry({
    email: "Ada@Example.com",
    name: "Ada",
    source: "landing-want-in",
    userAgent: "node-test",
    now: new Date("2026-05-28T09:00:00.000Z"),
  });

  let request;
  const result = await postWaitlistWebhook({
    webhookUrl: "https://script.google.test/exec",
    secret: "shared-secret",
    entry,
    fetchImpl: async (url, options) => {
      request = { url, options };
      return {
        ok: true,
        json: async () => ({ ok: true, alreadyJoined: false }),
      };
    },
  });

  assert.deepEqual(result, { ok: true, alreadyJoined: false });
  assert.equal(request.url, "https://script.google.test/exec");
  assert.equal(request.options.headers["Content-Type"], "text/plain;charset=utf-8");
  assert.deepEqual(JSON.parse(request.options.body), {
    secret: "shared-secret",
    createdAt: "2026-05-28T09:00:00.000Z",
    email: "ada@example.com",
    name: "Ada",
    source: "landing-want-in",
    userAgent: "node-test",
  });
});

function titleCase(value) {
  return value[0].toUpperCase() + value.slice(1);
}
