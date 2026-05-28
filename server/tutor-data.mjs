export const PERSONALITY_PROFILES = {
  athena: {
    label: "Athena",
    opener: "Good.",
    instructions:
      "Personality: Athena. Be wise, strategic, precise, and learning-focused. Upgrade answers into strong subject language.",
  },
  apollo: {
    label: "Apollo",
    opener: "Clear.",
    instructions:
      "Personality: Apollo. Be clear, composed, balanced, and explanatory. Give tidy explanations with calm confidence.",
  },
  hermes: {
    label: "Hermes",
    opener: "Nice, we're live.",
    instructions:
      "Personality: Hermes. Be quick, playful, energetic, and motivating. Keep momentum high while staying useful.",
  },
  socrates: {
    label: "Socrates",
    opener: "Good question.",
    instructions:
      "Personality: Socrates. Lead through thoughtful questions. Prefer guided discovery and ask one precise question at a time.",
  },
  hestia: {
    label: "Hestia",
    opener: "No pressure.",
    instructions:
      "Personality: Hestia. Be gentle, warm, reassuring, and anxiety-friendly. Lower pressure and make the next step feel manageable.",
  },
  ares: {
    label: "Ares",
    opener: "Ready.",
    instructions:
      "Personality: Ares. Run focused practice drills. Be direct, concise, and high-energy, but never rude or discouraging.",
  },
};

export const PERSONALITIES = new Set(Object.keys(PERSONALITY_PROFILES));

export const SUBJECT_HINTS = [
  {
    label: "Biology",
    keywords: ["biology", "photosynthesis", "respiration", "cell", "enzyme", "osmosis", "diffusion"],
    explain:
      "Let’s do Biology out loud: start with the process, name the key substances or structures, then explain the because link.",
    quiz: "Quick Biology check: can you define the process and name one factor that affects it?",
    modelAnswer:
      "A strong Biology answer names the process, uses the correct keyword, explains what changes and why, then links it back to the organism or system.",
    keyTerms: ["process", "structure", "function", "factor", "because"],
    recommendedActivity: [
      "Explain the process once without notes.",
      "Draw or imagine the system, then label the key parts out loud.",
      "Answer one why question using the word because.",
    ],
  },
  {
    label: "Maths",
    keywords: ["math", "maths", "quadratic", "equation", "algebra", "fraction", "graph", "geometry", "calculus"],
    explain:
      "Let’s do Maths out loud: name the method, do the first step, then explain why that step is allowed.",
    quiz: "Quick Maths check: what is the first operation or method you would try here?",
    modelAnswer:
      "A strong Maths answer shows the method step by step, keeps working clear, checks signs or units, and ends with the final value or statement.",
    keyTerms: ["method", "step", "working", "check", "final answer"],
    recommendedActivity: [
      "Say the method before doing any working.",
      "Work one example slowly and explain each step.",
      "Redo the weakest step without looking.",
    ],
  },
  {
    label: "Physics",
    keywords: ["physics", "force", "energy", "electricity", "circuit", "wave", "velocity", "acceleration", "momentum"],
    explain:
      "Let’s do Physics out loud: identify the quantity, choose the equation or rule, then explain what changes.",
    quiz: "Quick Physics check: what quantity, equation, or energy transfer is involved?",
    modelAnswer:
      "A strong Physics answer names the quantities, uses the right equation or principle, substitutes carefully, and explains the physical link.",
    keyTerms: ["quantity", "equation", "unit", "energy transfer", "relationship"],
    recommendedActivity: [
      "List the known quantities and units out loud.",
      "Choose the equation before calculating.",
      "Explain the result in words, not just numbers.",
    ],
  },
  {
    label: "History",
    keywords: ["history", "source", "war", "revolution", "empire", "treaty", "cause", "consequence"],
    explain:
      "Let’s do History out loud: make a point, support it with evidence, then explain why it mattered.",
    quiz: "Quick History check: can you give one cause, one event, and one consequence?",
    modelAnswer:
      "A strong History answer makes a clear point, uses precise evidence, explains significance, and links back to the question.",
    keyTerms: ["cause", "evidence", "consequence", "significance", "judgement"],
    recommendedActivity: [
      "Say one point-evidence-explain chain.",
      "Add a date, event, or named example.",
      "Finish with why it mattered.",
    ],
  },
  {
    label: "English",
    keywords: ["english", "quote", "essay", "poem", "language", "structure", "character", "theme", "writer"],
    explain:
      "Let’s do English out loud: make an interpretation, use a quote or detail, then explain the effect.",
    quiz: "Quick English check: what quote, technique, or structural choice would you use as evidence?",
    modelAnswer:
      "A strong English answer gives an interpretation, embeds evidence, analyses the writer’s method, and links the effect back to the question.",
    keyTerms: ["interpretation", "evidence", "method", "effect", "context"],
    recommendedActivity: [
      "Say one point and one quote from memory.",
      "Name the writer’s method.",
      "Explain the effect on the reader.",
    ],
  },
  {
    label: "Coding",
    keywords: ["coding", "programming", "python", "javascript", "typescript", "react", "function", "variable", "algorithm"],
    explain:
      "Let’s do Coding out loud: name the concept, describe what the code should do, then walk through one small example.",
    quiz: "Quick Coding check: what should the program receive, do, and return?",
    modelAnswer:
      "A strong Coding answer explains the goal, names the concept or pattern, walks through the logic step by step, and checks the output.",
    keyTerms: ["input", "output", "logic", "function", "example"],
    recommendedActivity: [
      "Explain the code in plain English before writing it.",
      "Trace one small input through the logic.",
      "Say what could go wrong and how you would test it.",
    ],
  },
  {
    label: "Business",
    keywords: ["business", "strategy", "product", "marketing", "customer", "startup", "market", "pricing", "sales"],
    explain:
      "Let’s do Business out loud: define the goal, name the audience or market, then explain the trade-off.",
    quiz: "Quick Business check: who is the user, what problem do they have, and what choice are you making?",
    modelAnswer:
      "A strong Business answer names the goal, identifies the customer or market, explains the trade-off, and ends with a clear recommendation.",
    keyTerms: ["customer", "problem", "market", "trade-off", "recommendation"],
    recommendedActivity: [
      "State the user problem in one sentence.",
      "Name the trade-off behind the decision.",
      "Finish with a recommendation and why.",
    ],
  },
];
