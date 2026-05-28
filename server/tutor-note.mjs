import { SUBJECT_HINTS } from "./tutor-data.mjs";

const FLASHCARD_TYPES = new Set([
  "definition",
  "process",
  "application",
  "misconception",
  "answer-building",
]);
const FLASHCARD_DIFFICULTIES = new Set(["easy", "medium", "hard"]);

export function localStudyNote(history) {
  const transcript = history.map((message) => String(message?.text ?? "")).join(" ").toLowerCase();
  const topic = detectTopic(transcript);

  return normalizeNote(
    {
      topic: topic.title,
      definition: topic.definition,
      summary:
        `Teach Me turned your spoken ${topic.label} practice into a focused pack with what you covered, what still needs tightening, and what to practise next.`,
      covered: ["Conversation transcript captured", `${topic.title} practice identified`, "Learning pack generated from the session"],
      gaps: topic.gaps,
      nextStep: `Say the full ${topic.label} answer out loud in one chain.`,
      keyTerms: topic.keyTerms,
      recommendedActivity: topic.recommendedActivity,
      flashcards: topic.flashcards,
      quickFireQuiz: topic.quickFireQuiz,
      modelAnswer: topic.modelAnswer,
    },
    history,
  );
}

export function normalizeNote(note, history) {
  const fallback = detectTopic(
    history.map((message) => String(message?.text ?? "")).join(" ").toLowerCase(),
  );

  return {
    topic: stringOr(note.topic, fallback.title),
    definition: stringOr(note.definition, fallback.definition),
    summary: stringOr(
      note.summary,
      "The tutor saved the conversation transcript and generated a learning pack.",
    ),
    covered: arrayOfStrings(note.covered, ["Conversation transcript captured"]),
    gaps: arrayOfStrings(note.gaps, fallback.gaps),
    nextStep: stringOr(note.nextStep, "Answer one follow-up question out loud."),
    keyTerms: arrayOfStrings(note.keyTerms ?? note.examPhrases, fallback.keyTerms),
    recommendedActivity: arrayOfStrings(note.recommendedActivity, fallback.recommendedActivity),
    flashcards: Array.isArray(note.flashcards)
      ? note.flashcards.slice(0, 20).map(normalizeFlashcard)
      : localStudyNoteMinimalFlashcards(),
    quickFireQuiz: Array.isArray(note.quickFireQuiz)
      ? note.quickFireQuiz.slice(0, 5).map((item) => ({
          question: stringOr(item.question, "What was the key idea?"),
          answer: stringOr(item.answer, "Review the saved transcript."),
        }))
      : fallback.quickFireQuiz,
    modelAnswer: stringOr(
      note.modelAnswer,
      history.length
        ? "Use the saved transcript to build a full model answer."
        : "Start a conversation to generate a model answer.",
    ),
  };
}

function localStudyNoteMinimalFlashcards() {
  return [
    {
      front: "What did the tutor capture?",
      back: "The spoken transcript from the study session.",
    },
  ];
}

function normalizeFlashcard(card) {
  const type = flashcardTypeOr(card.type);
  const difficulty = flashcardDifficultyOr(card.difficulty);
  const keyword = optionalString(card.keyword);

  return {
    front: stringOr(card.front, "What was the key idea?"),
    back: stringOr(card.back, "Review the saved transcript."),
    ...(type ? { type } : {}),
    ...(difficulty ? { difficulty } : {}),
    ...(keyword ? { keyword } : {}),
  };
}

function stringOr(value, fallback) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function arrayOfStrings(value, fallback) {
  return Array.isArray(value)
    ? value.filter((item) => typeof item === "string" && item.trim()).slice(0, 6)
    : fallback;
}

function optionalString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function flashcardTypeOr(value) {
  const normalized = optionalString(value).toLowerCase();
  return FLASHCARD_TYPES.has(normalized) ? normalized : "";
}

function flashcardDifficultyOr(value) {
  const normalized = optionalString(value).toLowerCase();
  return FLASHCARD_DIFFICULTIES.has(normalized) ? normalized : "";
}

export function parseJsonObject(value) {
  const text = String(value ?? "{}").trim();
  const unfenced = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  return JSON.parse(unfenced || "{}");
}

function detectTopic(transcript) {
  const hasChemistryTopic =
    transcript.includes("catalyst") ||
    transcript.includes("concentration") ||
    transcript.includes("surface area") ||
    transcript.includes("powder") ||
    transcript.includes("activation") ||
    transcript.includes("collision") ||
    transcript.includes("reaction rate") ||
    transcript.includes("rate of reaction");
  const subject = hasChemistryTopic ? null : findSubject(transcript);
  if (subject) {
    return {
      label: subject.label.toLowerCase(),
      title: subject.label,
      definition: `${subject.label} is the main topic from the study session.`,
      gaps: ["Say one complete answer out loud", "Add precise subject vocabulary", "Answer one follow-up question without notes"],
      keyTerms: subject.keyTerms,
      recommendedActivity: subject.recommendedActivity,
      flashcards: [
        {
          front: `How do you start a strong ${subject.label} answer?`,
          back: subject.modelAnswer,
        },
        {
          front: `What keywords matter for ${subject.label}?`,
          back: subject.keyTerms.join(", "),
        },
      ],
      quickFireQuiz: [
        {
          question: subject.quiz.replace(/^Quick [^:]+ check:\s*/i, ""),
          answer: "Answer out loud first, then ask Teach Me to tighten the wording.",
        },
        {
          question: `Which ${subject.label} keyword should appear in your answer?`,
          answer: subject.keyTerms[0] ?? "Use precise subject vocabulary.",
        },
      ],
      modelAnswer: subject.modelAnswer,
    };
  }

  if (transcript.includes("catalyst")) {
    return {
      label: "catalysts",
      title: "Catalysts",
      definition: "A catalyst is a substance that increases the rate of a reaction without being used up.",
      gaps: ["Mention alternative pathway", "Mention lower activation energy", "Say the catalyst is not used up"],
      keyTerms: ["alternative pathway", "lower activation energy", "successful collisions", "not used up"],
      recommendedActivity: [
        "Say a 30-second catalyst explanation from memory.",
        "Draw the energy profile and label the lower activation energy.",
        "Answer two catalyst quiz questions without notes.",
      ],
      flashcards: [
        {
          front: "What does a catalyst provide?",
          back: "An alternative reaction pathway with a lower activation energy.",
        },
        {
          front: "Why does a catalyst increase rate?",
          back: "More particles have enough energy for successful collisions.",
        },
      ],
      quickFireQuiz: [
        {
          question: "What does a catalyst provide?",
          answer: "An alternative reaction pathway with lower activation energy.",
        },
        {
          question: "What happens to the catalyst?",
          answer: "It is not used up.",
        },
      ],
      modelAnswer:
        "A catalyst provides an alternative reaction pathway with a lower activation energy. More particles have enough energy for successful collisions, so the rate of reaction increases. The catalyst is not used up.",
    };
  }

  if (transcript.includes("concentration")) {
    return {
      label: "concentration",
      title: "Concentration",
      definition: "Concentration is the amount of a substance in a given volume.",
      gaps: ["Mention more particles per volume", "Use collision frequency", "Link to successful collisions"],
      keyTerms: ["particles per unit volume", "collision frequency", "successful collisions", "rate"],
      recommendedActivity: [
        "Explain concentration using particles per unit volume.",
        "Practise replacing vague wording with collision frequency.",
        "Try one exam-style concentration question aloud.",
      ],
      flashcards: [
        {
          front: "Why does higher concentration increase rate?",
          back: "There are more particles in the same volume, so collisions happen more frequently.",
        },
        {
          front: "What is the exam phrase for more collisions?",
          back: "Increased collision frequency.",
        },
      ],
      quickFireQuiz: [
        {
          question: "What increases when concentration increases?",
          answer: "The number of reactant particles per unit volume.",
        },
        {
          question: "What happens to collisions?",
          answer: "They happen more frequently.",
        },
      ],
      modelAnswer:
        "A higher concentration means there are more reactant particles in the same volume. This increases collision frequency, so there are more successful collisions per second and the rate of reaction increases.",
    };
  }

  if (transcript.includes("surface area") || transcript.includes("powder")) {
    return {
      label: "surface area",
      title: "Surface Area",
      definition: "Surface area is the amount of reactant surface exposed for collisions.",
      gaps: ["Mention exposed particles", "Mention more collision sites", "Link to successful collisions"],
      keyTerms: ["surface area", "exposed particles", "collision sites", "collision frequency"],
      recommendedActivity: [
        "Compare powder and lump reactions in one spoken answer.",
        "Sketch particle exposure for low and high surface area.",
        "Repeat the answer using collision sites and successful collisions.",
      ],
      flashcards: [
        {
          front: "Why does powder react faster than a lump?",
          back: "It has a larger surface area, so more particles are exposed for collisions.",
        },
        {
          front: "What does larger surface area increase?",
          back: "Collision frequency.",
        },
      ],
      quickFireQuiz: [
        {
          question: "Why does powder react faster than a lump?",
          answer: "It has a larger surface area, so more particles are exposed.",
        },
        {
          question: "What does larger surface area increase?",
          answer: "Collision frequency.",
        },
      ],
      modelAnswer:
        "Increasing surface area exposes more reactant particles. This gives particles more places to collide, so collision frequency increases and there are more successful collisions per second. The reaction rate increases.",
    };
  }

  return {
    label: "study session",
    title: inferGenericTitle(transcript),
    definition: "This note captures the main idea discussed in the spoken study session.",
    gaps: ["Name the exact topic", "Use subject-specific keywords", "Say one complete answer out loud"],
    keyTerms: ["definition", "keyword", "example", "because", "therefore"],
    recommendedActivity: [
      "Run a 10-minute focused session on one exact topic.",
      "Answer the quick-fire quiz, then repeat missed answers out loud.",
      "Ask Teach Me for one harder follow-up question.",
    ],
    flashcards: localStudyNoteMinimalFlashcards(),
    quickFireQuiz: [
      {
        question: "What topic are you practising?",
        answer: "Say the subject and exact topic first.",
      },
      {
        question: "How do you improve a rough answer?",
        answer: "Add one precise keyword and explain the link.",
      },
    ],
    modelAnswer:
      "A strong answer names the topic, uses the correct subject vocabulary, explains the key link clearly, and finishes with the final answer or judgement.",
  };
}

function inferGenericTitle(transcript) {
  if (transcript.includes("math") || transcript.includes("quadratic") || transcript.includes("equation")) {
    return "Maths Practice";
  }
  if (transcript.includes("history") || transcript.includes("source") || transcript.includes("war")) {
    return "History Practice";
  }
  if (transcript.includes("biology") || transcript.includes("cell") || transcript.includes("photosynthesis")) {
    return "Biology Practice";
  }
  if (transcript.includes("physics") || transcript.includes("force") || transcript.includes("energy")) {
    return "Physics Practice";
  }
  if (
    transcript.includes("chemistry") ||
    transcript.includes("reaction") ||
    transcript.includes("temperature") ||
    transcript.includes("activation")
  ) {
    return "Chemistry Practice";
  }
  return "Study Session";
}

function findSubject(text) {
  return SUBJECT_HINTS.find((subject) =>
    subject.keywords.some((keyword) => hasKeyword(text, keyword)),
  );
}

function hasKeyword(text, keyword) {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i").test(text);
}
