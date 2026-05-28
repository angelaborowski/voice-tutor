import { chemistryTopic, subjectHints, topicHints, type SubjectHint } from "./tutorData";
import type { TutorMessage } from "./types";

const localPersonalityOpeners: Record<string, string> = {
  athena: "Good.",
  apollo: "Clear.",
  hermes: "Nice, we're live.",
  socrates: "Good question.",
  hestia: "No pressure.",
  ares: "Ready.",
};

export function buildLocalTutorReply(input: string, history: TutorMessage[], personality = "athena") {
  const normalized = input.toLowerCase();
  const opener = localPersonalityOpeners[personality] ?? localPersonalityOpeners.athena;
  const studentTurns = history.filter((message) => message.role === "student").length;
  const transcript = history.map((message) => message.text).join(" ").toLowerCase();
  const topic = findTopic(normalized) ?? findTopic(transcript);
  const hasKinetic = normalized.includes("kinetic");
  const hasCollision = normalized.includes("collision") || normalized.includes("collide");
  const hasActivation = normalized.includes("activation");
  const hasTemperature = normalized.includes("temperature") || normalized.includes("hot");
  const isTesting =
    normalized.includes("testing") ||
    normalized.includes("one two three") ||
    normalized.includes("1 2 3");
  const asksForModel =
    normalized.includes("model answer") ||
    normalized.includes("exam answer") ||
    normalized.includes("full answer") ||
    normalized.includes("mark scheme");
  const asksForQuiz =
    normalized.includes("quiz") ||
    normalized.includes("test me") ||
    normalized.includes("question me");
  const asksForExplain =
    normalized.includes("explain") ||
    normalized.includes("what is") ||
    normalized.includes("how does") ||
    normalized.includes("why");
  const hasConfusion =
    normalized.includes("don't get") ||
    normalized.includes("dont get") ||
    normalized.includes("do not get") ||
    normalized.includes("do not understand") ||
    normalized.includes("confused") ||
    normalized.includes("no idea") ||
    normalized.includes("stuck") ||
    normalized.includes("help");
  const isGreeting = isGreetingOnly(normalized);
  const isFiller = isFillerOnly(normalized);

  if (isTesting) {
    return `${opener} Loud and clear. What would you like to practise?`;
  }

  if (isFiller) {
    return `${opener} I didn’t catch an answer yet. Tell me the subject and level, or say “quiz me” and the topic.`;
  }

  if (isGreeting) {
    return `${opener} What subject, level, and goal are we working on: explain, quiz, improve an answer, or build a learning pack?`;
  }

  if (!topic) {
    const subject = findSubject(normalized) ?? findSubject(transcript);
    const genericTopic = inferGenericTopic(normalized);
    const specificReply = subject ? specificTutorReply(normalized, subject) : null;

    if (asksForQuiz) {
      if (subject) {
        return specificReply?.quiz ?? subject.quiz;
      }

      if (genericTopic !== "Study session") {
        return genericQuizForTopic(genericTopic);
      }

      return "Absolutely. What subject, level, and topic should I quiz you on?";
    }

    if (asksForModel) {
      if (subject) {
        return `${specificReply?.modelAnswer ?? subject.modelAnswer} Say your rough answer and I’ll shape it into that structure.`;
      }

      return "I can help with that. Paste or say your rough answer first, and I’ll turn it into a stronger model answer.";
    }

    if (asksForExplain || hasConfusion) {
      if (subject) {
        return specificReply?.explain ?? subject.explain;
      }

      if (genericTopic !== "Study session") {
        return `Let's make ${genericTopic.toLowerCase()} simple. Tell me the exact topic, then I’ll explain it in one small step.`;
      }

      return "Tell me the subject and the exact bit that feels stuck, and I’ll break it into one small step.";
    }

    if (subject) {
      return `I’ve got ${subject.label}. What level is this, and do you want me to explain it, quiz you, improve an answer, or make a learning pack?`;
    }

    if (normalized.includes("surprise me")) {
      return "Love it. Let’s do a 30-second explanation drill. Pick any topic you studied recently and tell me the core idea in one sentence.";
    }

    if (genericTopic !== "Study session") {
      return `I’ve got ${genericTopic.toLowerCase()}. Do you want me to explain it, quiz you, or improve a rough answer?`;
    }

    if (normalized.length < 24) {
      return "Tell me the subject, level, and topic first, then choose: explain, quiz, improve an answer, or build a learning pack.";
    }

    return "Got it. I’ll help you tighten that. What subject and level is this for, and do you want a quick explanation, quiz, or model answer?";
  }

  if (asksForQuiz) {
    return `Let's do a quick check. ${topic.question}`;
  }

  if (asksForModel) {
    return modelAnswerForTopic(topic.id);
  }

  if (asksForExplain && !hasConfusion && studentTurns <= 1) {
    return `${topic.explain} Now try saying that back in one sentence.`;
  }

  if (hasConfusion || normalized.length < 24) {
    return `Let's make it simple. For ${topic.label}, start with particles. ${topic.question}`;
  }

  if (hasTemperature && !hasKinetic) {
    return "Good start. Replace 'hotter' with the exam phrase: particles have more kinetic energy. Say that, then link it to collisions.";
  }

  if (hasKinetic && !hasCollision) {
    return "Nice. Now add the next link: more kinetic energy means particles move faster and collide more often.";
  }

  if (hasCollision && !hasActivation) {
    return "That is nearly there. Add activation energy: a greater proportion of collisions have enough energy to be successful.";
  }

  if (hasKinetic && hasCollision && hasActivation) {
    return "Strong answer. Keep it in that chain: kinetic energy, faster movement, more frequent collisions, more successful collisions, faster rate. Want to try it as a six-mark style answer?";
  }

  if (studentTurns > 2) {
    const missing = missingExamPhrase(transcript);
    return missing
      ? `Good progress. The missing exam phrase is "${missing}". Add that, then say the answer again as a clean chain.`
      : "Let's turn that into a model answer. Use one clear chain: particles, collisions, activation energy, successful collisions, rate.";
  }

  return `${topic.coach} Which part should we tighten: the particle idea, the collision link, or the final exam sentence?`;
}


function specificTutorReply(text: string, _subject: SubjectHint) {
  if (hasKeyword(text, "photosynthesis")) {
    return {
      explain:
        "Photosynthesis is how plants use light energy to make glucose. The raw materials are carbon dioxide and water; chlorophyll in chloroplasts absorbs the light. Quick check: what are the two raw materials?",
      quiz: "Quick photosynthesis check: what are the two raw materials, and what useful product does the plant make?",
      modelAnswer:
        "Photosynthesis uses light energy absorbed by chlorophyll in chloroplasts to convert carbon dioxide and water into glucose and oxygen.",
    };
  }

  if (hasKeyword(text, "quadratic") || hasKeyword(text, "quadratics")) {
    return {
      explain:
        "A quadratic has an x squared term. First decide the method: factorise, formula, or complete the square. If it looks like x² + 5x + 6, find two numbers that multiply to 6 and add to 5. What are they?",
      quiz: "Quick quadratic check: in x² + 5x + 6, which two numbers multiply to 6 and add to 5?",
      modelAnswer:
        "To solve a factorisable quadratic, put it equal to zero, find two numbers that multiply to the constant and add to the x coefficient, factorise, then set each bracket to zero.",
    };
  }

  if (hasKeyword(text, "strategy") || hasKeyword(text, "product")) {
    return {
      explain:
        "Product strategy is choosing which user problem to solve, why it matters now, and what trade-offs you will make. Start with user, problem, bet, metric. Who is the user?",
      quiz: "Quick strategy check: who is the user, what problem hurts, and what metric proves the bet worked?",
      modelAnswer:
        "A clear product strategy names the target user, the painful problem, the bet you are making, the trade-offs you accept, and the metric that will show progress.",
    };
  }

  if (hasKeyword(text, "source")) {
    return {
      explain:
        "For a History source, use three checks: content, provenance, and purpose. Say what it shows, who made it, and why that affects usefulness. What does the source actually say?",
      quiz: "Quick source check: what does the source show, who made it, and why might that matter?",
      modelAnswer:
        "A strong source answer uses content, provenance, and purpose to judge usefulness, then links that judgement back to the question.",
    };
  }

  if (hasKeyword(text, "quote") || hasKeyword(text, "essay")) {
    return {
      explain:
        "For an English answer, use point, evidence, method, effect. Pick one word from the quote, name the method if you can, then explain the effect on the reader. Which word feels most important?",
      quiz: "Quick English check: what is your point, what quote proves it, and which word will you analyse?",
      modelAnswer:
        "A strong English paragraph makes a clear point, embeds a short quote, analyses a specific word or method, and links the effect back to the question.",
    };
  }

  if (hasKeyword(text, "python") || hasKeyword(text, "function")) {
    return {
      explain:
        "For coding, say the input, the transformation, and the output. In Python, a function is a reusable block that takes values and returns a result. What should your function receive?",
      quiz: "Quick coding check: what is the input, what should happen to it, and what output should come back?",
      modelAnswer:
        "A strong coding explanation names the input, walks through the logic step by step, and checks the output with one example.",
    };
  }

  return null;
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

function modelAnswerForTopic(topicId: string) {
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

function genericQuizForTopic(topicName: string) {
  if (topicName === "Biology practice") {
    return "Absolutely. Quick biology check: in photosynthesis, what two raw materials does the plant need to make glucose?";
  }

  if (topicName === "Maths practice") {
    return "Absolutely. Quick maths check: what is the first step you would take to solve this type of problem?";
  }

  if (topicName === "History practice") {
    return "Absolutely. Quick history check: can you name one cause, one event, and one consequence for this topic?";
  }

  if (topicName === "Physics practice") {
    return "Absolutely. Quick physics check: what key equation, force, or energy transfer is involved here?";
  }

  if (topicName === "English practice") {
    return "Absolutely. Quick English check: what quote or technique would you use as your evidence?";
  }

  if (topicName === "Coding practice") {
    return "Absolutely. Quick coding check: what should the program receive, do, and return?";
  }

  if (topicName === "Business practice") {
    return "Absolutely. Quick business check: who is the user, what problem do they have, and what choice are you making?";
  }

  return `Absolutely. Quick check on ${topicName.toLowerCase()}: what is the key idea in one sentence?`;
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
function isGreetingOnly(text: string) {
  return /^(hi|hey|hello|hiya|yo|morning|afternoon|evening|ready|ok|okay)[\s.!?]*$/i.test(text.trim());
}

function isFillerOnly(text: string) {
  const compact = text.trim().replace(/[.\s,!?-]/g, "");
  return !compact || /^(um+|uh+|erm+|hmm+|mmm+|ah+)$/.test(compact);
}
