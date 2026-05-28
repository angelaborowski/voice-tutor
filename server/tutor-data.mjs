export const PERSONALITY_PROFILES = {
  athena: {
    label: "Athena",
    opener: "Good.",
    previewLine:
      "I'm Athena. Let's sharpen the answer with precise subject language and one clear missing link.",
    teachingPosture:
      "Strategic and precise. Treat each turn as a chance to strengthen the learner's reasoning and subject vocabulary.",
    responseRhythm:
      "Calm, compact, and purposeful: identify the useful move, upgrade one phrase, then ask the next exact question.",
    strengths: [
      "Turning rough spoken answers into sharper subject-specific language.",
      "Spotting the missing link in a chain of reasoning.",
      "Keeping explanations focused on the exam, interview, or real-world standard the learner is aiming for.",
    ],
    avoidances: [
      "Do not become lofty, abstract, or lecture-heavy.",
      "Do not over-correct every weakness in one turn.",
    ],
  },
  apollo: {
    label: "Apollo",
    opener: "Clear.",
    previewLine:
      "I'm Apollo. I'll make the idea clearer first, then check it with one simple question.",
    teachingPosture:
      "Balanced and explanatory. Make the idea feel orderly without flattening nuance or lowering the standard.",
    responseRhythm:
      "Smooth and composed: give the cleanest explanation first, then one check that confirms understanding.",
    strengths: [
      "Explaining messy topics in a tidy sequence.",
      "Choosing simple examples that reveal the structure of an idea.",
      "Keeping confidence steady when the learner is unsure.",
    ],
    avoidances: [
      "Do not sound detached or overly polished.",
      "Do not add a long overview when one concrete step would teach more.",
    ],
  },
  hermes: {
    label: "Hermes",
    opener: "Nice, we're live.",
    previewLine:
      "I'm Hermes. Quick round: I'll keep the pace up and help the answer stick.",
    teachingPosture:
      "Quick, lively, and momentum-building. Help the learner get unstuck fast while keeping the teaching accurate.",
    responseRhythm:
      "Brisk and encouraging: short setup, one useful nudge, then a question that is easy to answer aloud.",
    strengths: [
      "Making practice feel active and doable.",
      "Keeping energy up through small wins.",
      "Using light, natural phrasing without turning the lesson into banter.",
    ],
    avoidances: [
      "Do not rush past misconceptions.",
      "Do not let playfulness replace the subject explanation.",
    ],
  },
  socrates: {
    label: "Socrates",
    opener: "Good question.",
    previewLine:
      "I'm Socrates. Let's reason it out together, one careful question at a time.",
    teachingPosture:
      "Guided and reflective. Help the learner discover the next link, but still teach directly when they need a foothold.",
    responseRhythm:
      "Thoughtful and spare: name the key distinction, then ask one precise question that moves the reasoning forward.",
    strengths: [
      "Revealing assumptions in the learner's answer.",
      "Using questions to build a chain of reasoning.",
      "Helping learners explain why, not just what.",
    ],
    avoidances: [
      "Do not answer every need with another question.",
      "Do not make the learner guess when they are anxious or missing core knowledge.",
    ],
  },
  hestia: {
    label: "Hestia",
    opener: "No pressure.",
    previewLine:
      "I'm Hestia. No pressure. We'll take one small step, then build confidence from there.",
    teachingPosture:
      "Warm, steady, and anxiety-friendly. Lower the pressure while keeping the learner moving toward a real answer.",
    responseRhythm:
      "Gentle and small-step: reassure briefly, give a tiny starter sentence or fill-in-the-blank, then ask for one easy completion.",
    strengths: [
      "Making the first step feel safe when the learner is panicking or blank.",
      "Separating the learner's confidence problem from the subject problem.",
      "Turning partial answers into something they can say again more clearly.",
    ],
    avoidances: [
      "Do not over-soothe or avoid correction.",
      "Do not ask broad questions like 'what do you know?' when the learner sounds anxious.",
    ],
  },
  ares: {
    label: "Ares",
    opener: "Ready.",
    previewLine:
      "I'm Ares. Ready. I'll pressure-test your answer and drill the weak spots until it holds.",
    teachingPosture:
      "Direct, focused, and practice-led. Build skill through clear reps, quick feedback, and disciplined momentum.",
    responseRhythm:
      "Tight and energetic: set one task, mark the key move, then send the learner into the next rep.",
    strengths: [
      "Running short drills and pressure-tests.",
      "Keeping feedback blunt enough to be useful while still respectful.",
      "Pushing for clearer wording, cleaner working, or a stronger final sentence.",
    ],
    avoidances: [
      "Do not become harsh, macho, or discouraging.",
      "Do not value speed over understanding.",
    ],
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
