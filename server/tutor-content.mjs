import { PERSONALITY_PROFILES, SUBJECT_HINTS } from "./tutor-data.mjs";
import { normalizePersonality } from "./tutor-prompts.mjs";

export function localTutorReply(input, personality = "athena") {
  const normalized = input.toLowerCase();
  const opener = localPersonalityOpener(personality);
  const isTesting =
    normalized.includes("testing") ||
    normalized.includes("one two three") ||
    normalized.includes("1 2 3");
  const isGreeting = isGreetingOnly(normalized);
  const isFiller = isFillerOnly(normalized);
  const asksForQuiz = normalized.includes("quiz") || normalized.includes("test me") || normalized.includes("question me");
  const asksForModel =
    normalized.includes("model answer") ||
    normalized.includes("exam answer") ||
    normalized.includes("full answer") ||
    normalized.includes("mark scheme");
  const asksForExplain =
    normalized.includes("explain") ||
    normalized.includes("what is") ||
    normalized.includes("how does") ||
    normalized.includes("why");
  const isConfused =
    normalized.includes("don't get") ||
    normalized.includes("dont get") ||
    normalized.includes("do not get") ||
    normalized.includes("do not understand") ||
    normalized.includes("confused") ||
    normalized.includes("no idea") ||
    normalized.includes("stuck") ||
    normalized.includes("help");
  const isChemistry = [
    "rate",
    "reaction",
    "chemistry",
    "particle",
    "collision",
    "activation",
    "kinetic",
    "temperature",
    "catalyst",
    "concentration",
    "surface area",
    "powder",
  ].some((keyword) => hasKeyword(normalized, keyword));

  if (isTesting) {
    return `${opener} Loud and clear. What would you like to practise?`;
  }

  if (isFiller) {
    return `${opener} I didn't catch an answer yet. Tell me the subject and level, or say “quiz me” and the topic.`;
  }

  if (isGreeting) {
    return `${opener} Ready when you are. What subject, level, and goal are we working on: explain, quiz, improve an answer, or build a learning pack?`;
  }

  if (!isChemistry) {
    const genericTopic = inferGenericTitle(normalized);
    const subject = findSubject(normalized);
    const specificReply = subject ? specificTutorReply(normalized, subject, opener) : null;

    if (asksForQuiz) {
      if (subject) {
        return `${opener} ${specificReply?.quiz ?? subject.quiz}`;
      }

      if (genericTopic !== "Study Session") {
        return `${opener} ${genericQuizForTitle(genericTopic)}`;
      }

      return `${opener} What subject, level, and topic should I quiz you on?`;
    }

    if (asksForModel) {
      if (subject) {
        return `${opener} ${specificReply?.modelAnswer ?? subject.modelAnswer} Say your rough answer and I’ll shape it into that structure.`;
      }

      return `${opener} Say or type your rough answer first, and I’ll turn it into a stronger model answer.`;
    }

    if (asksForExplain || isConfused) {
      if (subject) {
        return `${opener} ${specificReply?.explain ?? subject.explain}`;
      }

      if (genericTopic !== "Study Session") {
        return `${opener} Let's make ${genericTopic.toLowerCase()} simple. Tell me the exact topic, then I’ll explain it in one small step.`;
      }

      return `${opener} Tell me the subject and the exact bit that feels stuck, and I’ll break it into one small step.`;
    }

    if (subject) {
      return `${opener} I’ve got ${subject.label}. What level is this, and do you want me to explain it, quiz you, improve an answer, or make a learning pack?`;
    }

    if (genericTopic !== "Study Session") {
      return `${opener} I’ve got ${genericTopic.toLowerCase()}. Do you want me to explain it, quiz you, or improve a rough answer?`;
    }

    return `${opener} What subject and level is this for, and would you like an explanation, a quiz, or help improving an answer?`;
  }

  if (asksForQuiz) {
    return "Quick check: what phrase means the minimum energy particles need for a successful collision?";
  }
  if (asksForModel) {
    if (normalized.includes("concentration")) {
      return "A higher concentration means there are more reactant particles in the same volume. This increases collision frequency, so there are more successful collisions per second and the rate of reaction increases.";
    }
    if (normalized.includes("surface area") || normalized.includes("powder")) {
      return "Increasing surface area exposes more reactant particles. This gives particles more places to collide, so collision frequency increases and there are more successful collisions per second. The reaction rate increases.";
    }
    if (normalized.includes("catalyst")) {
      return "A catalyst provides an alternative reaction pathway with a lower activation energy. More particles have enough energy for successful collisions, so the rate of reaction increases. The catalyst is not used up.";
    }
    return "Increasing temperature gives reactant particles more kinetic energy, so they move faster and collide more often. A greater proportion of collisions have enough energy to overcome activation energy, so there are more successful collisions per second and the rate increases.";
  }
  if (normalized.includes("catalyst")) {
    return "A catalyst gives an alternative pathway with lower activation energy. That means more collisions are successful. What happens to the rate?";
  }
  if (normalized.includes("concentration")) {
    return "Higher concentration means more particles in the same volume, so collisions happen more often. What exam phrase could we use for 'happen more often'?";
  }
  if (normalized.includes("surface area") || normalized.includes("powder")) {
    return "More surface area exposes more particles, giving more collision sites. Why would that make the reaction faster?";
  }
  if (normalized.includes("activation")) {
    return "Exactly. Activation energy is the threshold. Now link it: at higher temperature, more particles have enough energy to overcome it.";
  }
  if (normalized.includes("kinetic")) {
    return "Good. Kinetic energy is the right phrase. Add the next link: particles move faster, so collisions happen more often.";
  }
  if (normalized.includes("collision")) {
    return "Good direction. Make it exam-ready by saying more collisions are successful because more particles overcome activation energy.";
  }
  return "Let's start simply. When temperature increases, particles gain kinetic energy. What does that do to how often they collide?";
}

function specificTutorReply(text, subject, opener) {
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

function isGreetingOnly(text) {
  return /^(hi|hey|hello|hiya|yo|morning|afternoon|evening|ready|ok|okay)[\s.!?]*$/i.test(text.trim());
}

function isFillerOnly(text) {
  const compact = text.trim().replace(/[.\s,!?-]/g, "");
  return !compact || /^(um+|uh+|erm+|hmm+|mmm+|ah+)$/.test(compact);
}

function localPersonalityOpener(personality) {
  const normalized = normalizePersonality(personality) ?? "athena";
  return PERSONALITY_PROFILES[normalized].opener;
}

export function isMeaningfulSpeechText(value) {
  return typeof value === "string" && /[\p{L}\p{N}]/u.test(value.trim());
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

function genericQuizForTitle(topicTitle) {
  switch (topicTitle) {
    case "Biology Practice":
      return "Quick biology check: in photosynthesis, what two raw materials does the plant need to make glucose?";
    case "Maths Practice":
      return "Quick maths check: what is the first step you would take to solve this type of problem?";
    case "History Practice":
      return "Quick history check: can you name one cause, one event, and one consequence for this topic?";
    case "Physics Practice":
      return "Quick physics check: what key equation, force, or energy transfer is involved here?";
    case "English Practice":
      return "Quick English check: what quote or technique would you use as your evidence?";
    default:
      return `Quick check on ${topicTitle.toLowerCase()}: what is the key idea in one sentence?`;
  }
}

export function normalizeChatHistory(history, input) {
  const cleaned = history
    .filter((message) => message && typeof message.text === "string")
    .map((message) => ({
      role: message.role === "tutor" ? "tutor" : "student",
      text: message.text.trim(),
    }))
    .filter((message) => message.text);

  const latest = cleaned.at(-1);
  if (!latest || latest.role !== "student" || latest.text !== input) {
    cleaned.push({ role: "student", text: input });
  }

  return cleaned.slice(-12);
}
