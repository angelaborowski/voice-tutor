export const chemistryTopic = {
  topic: "Rates of reaction",
  examPhrases: [
    "kinetic energy",
    "collision frequency",
    "successful collisions",
    "activation energy",
    "rate of reaction",
  ],
  checklist: [
    "Reactant particles have more kinetic energy.",
    "Particles move faster.",
    "Collisions happen more frequently.",
    "A greater proportion of collisions have enough energy to overcome activation energy.",
    "There are more successful collisions per second.",
    "The rate of reaction increases.",
  ],
};

export type TopicHint = {
  id: string;
  label: string;
  keywords: string[];
  explain: string;
  coach: string;
  question: string;
};

export const topicHints: TopicHint[] = [
  {
    id: "temperature",
    label: "temperature",
    keywords: ["temperature", "hot", "heat", "heated", "warmer", "cold", "cool"],
    explain:
      "Higher temperature gives particles more kinetic energy, so they move faster, collide more often, and a greater proportion of collisions overcome activation energy.",
    coach:
      "Use this chain: temperature increases, kinetic energy increases, particles move faster, collisions are more frequent, more are successful.",
    question: "What exam phrase can you use instead of saying the particles are just 'hotter'?",
  },
  {
    id: "concentration",
    label: "concentration",
    keywords: ["concentration", "concentrated", "dilute", "solution"],
    explain:
      "A higher concentration means more reactant particles in the same volume, so collisions happen more frequently and the reaction rate increases.",
    coach:
      "For concentration, focus on particle number per volume, then link that to collision frequency and rate.",
    question: "If there are more particles in the same volume, what happens to collision frequency?",
  },
  {
    id: "surface-area",
    label: "surface area",
    keywords: ["surface area", "powder", "lump", "small pieces", "chips", "marble chips"],
    explain:
      "Increasing surface area exposes more reactant particles, so there are more places for collisions to happen and the rate increases.",
    coach:
      "For surface area, mention exposed particles, more collision sites, more frequent successful collisions, faster rate.",
    question: "Why does a powder usually react faster than one large lump?",
  },
  {
    id: "catalyst",
    label: "catalysts",
    keywords: ["catalyst", "enzyme", "catalyse"],
    explain:
      "A catalyst provides an alternative reaction pathway with a lower activation energy, so more collisions are successful at the same temperature.",
    coach:
      "For catalysts, say lower activation energy, alternative pathway, not used up, faster rate.",
    question: "What does a catalyst do to activation energy?",
  },
  {
    id: "activation-energy",
    label: "activation energy",
    keywords: ["activation", "minimum energy", "energy barrier", "threshold"],
    explain:
      "Activation energy is the minimum energy particles need for a collision to be successful and form products.",
    coach:
      "Link activation energy to successful collisions: if more particles meet or exceed it, the reaction happens faster.",
    question: "What makes a collision successful in precise Chemistry wording?",
  },
  {
    id: "collision-theory",
    label: "collision theory",
    keywords: ["collision", "collide", "successful", "frequency", "particles"],
    explain:
      "Collision theory says reactions happen when particles collide with enough energy and the correct conditions to form products.",
    coach:
      "Most rate answers need two links: how often particles collide, and whether enough collisions are successful.",
    question: "What are the two things a collision needs to be successful?",
  },
];

export type SubjectHint = {
  id: string;
  label: string;
  keywords: string[];
  explain: string;
  quiz: string;
  modelAnswer: string;
  keyTerms: string[];
  recommendedActivity: string[];
};

export const subjectHints: SubjectHint[] = [
  {
    id: "biology",
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
    id: "maths",
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
    id: "physics",
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
    id: "history",
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
    id: "english",
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
    id: "coding",
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
    id: "business",
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
