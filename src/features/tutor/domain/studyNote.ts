import { chemistryTopic, subjectHints, topicHints, type SubjectHint } from "./tutorData";
import type { StudyNote, TutorMessage } from "./types";

export function buildLocalStudyNote(messages: TutorMessage[]): StudyNote {
  const transcript = messages.map((message) => message.text).join(" ").toLowerCase();
  const topic = findTopic(transcript);

  if (!topic) {
    const subject = findSubject(transcript);
    if (subject) {
      return {
        topic: subject.label,
        definition: `${subject.label} is the main subject identified from the spoken tutoring session.`,
        summary:
          `Teach Me turned your spoken ${subject.label.toLowerCase()} practice into a focused learning pack: what you covered, what still needs tightening, and what to practise next.`,
        covered: [
          `${subject.label} practice was captured from the conversation.`,
          "The tutor identified the likely subject and learning goal.",
          "The session is ready to turn into recall practice.",
        ],
        gaps: [
          "Say one complete answer out loud.",
          "Add precise subject vocabulary.",
          "Answer one follow-up question without notes.",
        ],
        nextStep: `Do a 5-minute ${subject.label.toLowerCase()} drill: rough answer, correction, then repeat from memory.`,
        keyTerms: subject.keyTerms,
        recommendedActivity: subject.recommendedActivity,
        flashcards: subjectFlashcards(subject),
        quickFireQuiz: subjectQuickFireQuiz(subject),
        modelAnswer: subject.modelAnswer,
      };
    }

    const topicName = inferGenericTopic(transcript);
    return {
      topic: topicName,
      definition: `This note captures the main idea discussed in the spoken ${topicName.toLowerCase()} session.`,
      summary:
        "Teach Me captured the spoken tutoring session and prepared a starter learning pack with notes, practice prompts, and the next question to answer.",
      covered: [
        "The conversation transcript was saved.",
        "The learner started a spoken tutoring session.",
        "The next step is to name the subject, level, and topic clearly.",
      ],
      gaps: [
        "Name the exact subject, level, and topic.",
        "Say one full answer out loud.",
        "Add subject-specific keywords.",
      ],
      nextStep: `Start a 5-minute drill on ${topicName.toLowerCase()}: explain the idea once, then answer one follow-up question.`,
      keyTerms: ["topic", "definition", "example", "reasoning", "final answer"],
      recommendedActivity: [
        "Set a 10-minute timer and explain the topic without notes.",
        "Answer the quick-fire questions, then repeat the weakest one out loud.",
        "Ask Teach Me for one harder follow-up question on the same topic.",
      ],
      flashcards: genericFlashcards(topicName),
      quickFireQuiz: genericQuickFireQuiz(topicName),
      modelAnswer:
        `A strong ${topicName.toLowerCase()} answer starts by naming the key idea, explains one clear reason or method, uses the correct subject vocabulary, and finishes with the final answer or judgement.`,
    };
  }

  const checklist = checklistForTopic(topic.id);
  const covered = checklist.filter((point) => {
    const normalized = point.toLowerCase();
    if (normalized.includes("kinetic")) return transcript.includes("kinetic");
    if (normalized.includes("faster")) return transcript.includes("faster") || transcript.includes("move");
    if (normalized.includes("frequently")) return transcript.includes("often") || transcript.includes("frequen");
    if (normalized.includes("activation")) return transcript.includes("activation");
    if (normalized.includes("successful")) return transcript.includes("successful");
    if (normalized.includes("concentration")) return transcript.includes("concentration");
    if (normalized.includes("surface area")) return transcript.includes("surface area") || transcript.includes("powder");
    if (normalized.includes("catalyst")) return transcript.includes("catalyst");
    if (normalized.includes("alternative")) return transcript.includes("alternative");
    if (normalized.includes("exposed")) return transcript.includes("exposed") || transcript.includes("surface");
    return transcript.includes("rate");
  });
  const gaps = checklist.filter((point) => !covered.includes(point));

  return {
    topic: titleCase(topic.label),
    definition: definitionForTopic(topic.id),
    summary:
      `Teach Me turned your spoken ${topic.label} practice into a focused pack with the key wording, missing links, recall cards, and a stronger model answer.`,
    covered: covered.length ? covered : ["The conversation has started and the transcript is saved."],
    gaps: gaps.slice(0, 3),
    nextStep:
      gaps[0] ??
      `Practise saying the full ${topic.label} explanation in one clean chain.`,
    keyTerms: chemistryTopic.examPhrases,
    recommendedActivity: [
      `Do a 5-minute spoken drill on ${topic.label}.`,
      "Answer the quiz questions once without looking at the notes.",
      "Say the model answer out loud, then try again from memory.",
    ],
    flashcards: flashcardsForTopic(topic.id),
    quickFireQuiz: quickFireQuizForTopic(topic.id),
    modelAnswer: modelAnswerForTopic(topic.id),
  };
}

function findTopic(text: string) {
  return topicHints.find((topic) =>
    topic.keywords.some((keyword) => hasKeyword(text, keyword)),
  );
}

function findSubject(text: string) {
  return subjectHints.find((subject) =>
    subject.keywords.some((keyword) => hasKeyword(text, keyword)),
  );
}

function hasKeyword(text: string, keyword: string) {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i").test(text);
}

function missingExamPhrase(transcript: string) {
  return chemistryTopic.examPhrases.find((phrase) => !transcript.includes(phrase));
}

export function modelAnswerForTopic(topicId: string) {
  if (topicId === "concentration") {
    return "A higher concentration means there are more reactant particles in the same volume. This increases collision frequency, so there are more successful collisions per second and the rate of reaction increases.";
  }
  if (topicId === "surface-area") {
    return "Increasing surface area exposes more reactant particles. This gives particles more places to collide, so collision frequency increases and there are more successful collisions per second. The reaction rate increases.";
  }
  if (topicId === "catalyst") {
    return "A catalyst provides an alternative reaction pathway with a lower activation energy. More particles have enough energy for successful collisions, so the rate of reaction increases. The catalyst is not used up.";
  }
  if (topicId === "activation-energy") {
    return "Activation energy is the minimum energy particles need for a successful collision. If more particles have at least this energy, more collisions are successful and the reaction rate increases.";
  }
  return chemistryTopic.checklist.join(" ");
}

function definitionForTopic(topicId: string) {
  if (topicId === "concentration") {
    return "Concentration is the amount of a substance in a given volume.";
  }
  if (topicId === "surface-area") {
    return "Surface area is the amount of reactant surface exposed for collisions.";
  }
  if (topicId === "catalyst") {
    return "A catalyst is a substance that increases the rate of a reaction without being used up.";
  }
  return "This note captures the main idea from the spoken tutoring session.";
}

function checklistForTopic(topicId: string) {
  if (topicId === "concentration") {
    return [
      "Concentration means particles per unit volume.",
      "Higher concentration means more particles in the same volume.",
      "Collision frequency increases.",
      "There are more successful collisions per second.",
      "The rate of reaction increases.",
    ];
  }
  if (topicId === "surface-area") {
    return [
      "Increasing surface area exposes more reactant particles.",
      "There are more collision sites.",
      "Collision frequency increases.",
      "There are more successful collisions per second.",
      "The rate of reaction increases.",
    ];
  }
  if (topicId === "catalyst") {
    return [
      "A catalyst provides an alternative reaction pathway.",
      "The alternative pathway has a lower activation energy.",
      "More particles have enough energy for successful collisions.",
      "The catalyst is not used up.",
      "The rate of reaction increases.",
    ];
  }
  return chemistryTopic.checklist;
}

function flashcardsForTopic(topicId: string) {
  if (topicId === "concentration") {
    return [
      {
        front: "Why does higher concentration increase rate?",
        back: "There are more reactant particles in the same volume, so collisions happen more frequently.",
      },
      {
        front: "What phrase upgrades 'more crashes'?",
        back: "Increased collision frequency.",
      },
      {
        front: "How do you finish a concentration answer?",
        back: "More successful collisions per second, so the rate of reaction increases.",
      },
    ];
  }
  if (topicId === "surface-area") {
    return [
      {
        front: "Why does powder react faster than a lump?",
        back: "It has a larger surface area, exposing more particles for collisions.",
      },
      {
        front: "What does larger surface area increase?",
        back: "Collision frequency, because there are more collision sites.",
      },
      {
        front: "How do you finish a surface area answer?",
        back: "More successful collisions per second, so the rate increases.",
      },
    ];
  }
  if (topicId === "catalyst") {
    return [
      {
        front: "What does a catalyst provide?",
        back: "An alternative reaction pathway with a lower activation energy.",
      },
      {
        front: "Why does a catalyst increase rate?",
        back: "More particles can overcome the lower activation energy, so more collisions are successful.",
      },
      {
        front: "What happens to the catalyst?",
        back: "It is not used up in the reaction.",
      },
    ];
  }
  return [
    {
      front: "What does increasing temperature do to particles?",
      back: "It gives particles more kinetic energy, so they move faster.",
    },
    {
      front: "Why does a higher temperature increase reaction rate?",
      back: "Particles collide more often and more collisions have enough energy to be successful.",
    },
    {
      front: "What is activation energy?",
      back: "The minimum energy particles need for a successful collision and reaction.",
    },
  ];
}

function quickFireQuizForTopic(topicId: string) {
  if (topicId === "concentration") {
    return [
      {
        question: "What increases when concentration is higher?",
        answer: "The number of reactant particles per unit volume.",
      },
      {
        question: "What happens to collision frequency?",
        answer: "It increases because particles collide more often.",
      },
      {
        question: "How should the answer end?",
        answer: "More successful collisions per second, so rate increases.",
      },
    ];
  }

  if (topicId === "surface-area") {
    return [
      {
        question: "Why does powder react faster?",
        answer: "It has a larger surface area and exposes more particles.",
      },
      {
        question: "What does larger surface area create?",
        answer: "More collision sites.",
      },
      {
        question: "What is the rate link?",
        answer: "More frequent successful collisions increase the rate.",
      },
    ];
  }

  if (topicId === "catalyst") {
    return [
      {
        question: "What pathway does a catalyst provide?",
        answer: "An alternative pathway with lower activation energy.",
      },
      {
        question: "Why does that increase rate?",
        answer: "More particles have enough energy for successful collisions.",
      },
      {
        question: "Is the catalyst used up?",
        answer: "No, it is not used up in the reaction.",
      },
    ];
  }

  return [
    {
      question: "What does temperature increase in particles?",
      answer: "Kinetic energy.",
    },
    {
      question: "What happens to collisions?",
      answer: "They happen more often.",
    },
    {
      question: "What phrase links this to rate?",
      answer: "More successful collisions per second.",
    },
  ];
}

function genericFlashcards(topic: string) {
  return [
    {
      front: `What is the core idea in ${topic}?`,
      back: "State the key definition or rule in one clear sentence.",
    },
    {
      front: "How do you make a spoken answer stronger?",
      back: "Use a precise keyword, explain the link, then give an example or final judgement.",
    },
    {
      front: "What should you do if you are stuck?",
      back: "Say the part you know first, then ask for one small follow-up question.",
    },
  ];
}

function subjectFlashcards(subject: SubjectHint) {
  return [
    {
      front: `How do you start a strong ${subject.label} answer?`,
      back: subject.modelAnswer,
    },
    {
      front: `What keywords matter for ${subject.label}?`,
      back: subject.keyTerms.join(", "),
    },
    {
      front: "What should you do after a rough spoken answer?",
      back: "Upgrade one keyword, explain one because link, then repeat the answer.",
    },
  ];
}

function subjectQuickFireQuiz(subject: SubjectHint) {
  return [
    {
      question: subject.quiz.replace(/^Quick [^:]+ check:\s*/i, ""),
      answer: "Answer out loud first, then ask Teach Me to tighten the wording.",
    },
    {
      question: `Which ${subject.label} keyword should appear in your answer?`,
      answer: subject.keyTerms[0] ?? "Use precise subject vocabulary.",
    },
    {
      question: "How do you make the answer stronger?",
      answer: "Add evidence, a method, or a because link depending on the subject.",
    },
  ];
}

function genericQuickFireQuiz(topic: string) {
  return [
    {
      question: `Can you define ${topic.toLowerCase()} in one sentence?`,
      answer: "Give the shortest correct definition you can, then refine the wording.",
    },
    {
      question: "What keyword must appear in a strong answer?",
      answer: "Use the exact subject vocabulary from the lesson or mark scheme.",
    },
    {
      question: "What is the next step after a rough answer?",
      answer: "Add the missing link: because, therefore, so, or this means.",
    },
  ];
}

function inferGenericTopic(transcript: string) {
  if (transcript.includes("math") || transcript.includes("quadratic") || transcript.includes("equation")) {
    return "Maths practice";
  }
  if (transcript.includes("history") || transcript.includes("war") || transcript.includes("source")) {
    return "History practice";
  }
  if (transcript.includes("biology") || transcript.includes("photosynthesis") || transcript.includes("cell")) {
    return "Biology practice";
  }
  if (transcript.includes("physics") || transcript.includes("force") || transcript.includes("energy")) {
    return "Physics practice";
  }
  if (transcript.includes("english") || transcript.includes("quote") || transcript.includes("essay")) {
    return "English practice";
  }
  if (transcript.includes("coding") || transcript.includes("programming") || transcript.includes("python")) {
    return "Coding practice";
  }
  if (transcript.includes("business") || transcript.includes("strategy") || transcript.includes("product")) {
    return "Business practice";
  }
  return "Study session";
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
