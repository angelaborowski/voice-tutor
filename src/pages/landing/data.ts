import { personalityColors, type AgentSettings } from "@/features/tutor/domain/settings";

export const landingTutorPalettes: Array<[string, string]> = [
  ["#ffffff", "#7a7482"],
  personalityColors.athena,
  personalityColors.apollo,
  personalityColors.hermes,
  personalityColors.socrates,
  personalityColors.hestia,
  personalityColors.ares,
];
export const landingTutorBackgroundHues = [0, 128, 214, 42, 272, 92, 18] as const;

export type LandingInfoPageKey = "problem" | "tutors" | "pack";
export type TutorOption = {
  title: string;
  body: string;
  personality: AgentSettings["personality"];
  signal: string;
};

export const landingNavItems = [
  ["Start Chat", "01", "start"],
  ["The Problem", "02", "/problem"],
  ["Meet Tutors", "03", "/tutors"],
  ["Study Pack", "04", "/study-pack"],
] as const;

export const infoPages: Record<LandingInfoPageKey, {
  kicker: string;
  title: string;
  body: string;
  proof: string[];
  cards: Array<{ title: string; body: string }>;
}> = {
  problem: {
    kicker: "At home",
    title: "Private tutoring works. The price is the problem.",
    body: "One-to-one help is useful, but regular tutoring is still sold by the hour. The cost makes a weekly learning habit hard to keep.",
    proof: ["voice practice", "lower monthly cost", "study support"],
    cards: [
      { title: "Price", body: "Regular help quickly becomes too expensive for ordinary homework nights." },
      { title: "Timing", body: "Questions come up between sessions, not just inside a booked hour." },
      { title: "Confidence", body: "When a student gets stuck alone, small gaps turn into bigger hesitation." },
    ],
  },
  tutors: {
    kicker: "Meet our tutors",
    title: "Which one would you choose?",
    body: "Swipe through the agents and pick the tutor that fits how you want to learn.",
    proof: [],
    cards: [
      { title: "Athena", body: "The strategist: precise answer upgrades and stronger subject language." },
      { title: "Apollo", body: "The explainer: calm, tidy explanations when a concept needs to make sense." },
      { title: "Hermes", body: "The momentum coach: fast prompts and energetic recall practice." },
      { title: "Socrates", body: "The questioner: guided discovery through one sharp question at a time." },
      { title: "Hestia", body: "The supportive tutor: gentle, low-pressure help when confidence is shaky." },
      { title: "Ares", body: "The challenger: direct drills and pressure tests for exam-ready answers." },
    ],
  },
  pack: {
    kicker: "Study Agent",
    title: "The background agent keeps the work.",
    body: "While the tutor teaches, Teach Me turns the conversation into notes, flashcards, quiz prompts, next actions, and a stronger answer.",
    proof: ["notes", "gap cards", "quiz prompts", "model answer"],
    cards: [
      { title: "Clean Notes", body: "The messy conversation, cleaned into the points that matter." },
      { title: "Gap Cards", body: "Facts, definitions, and weak spots you missed." },
      { title: "Quick-Fire Quiz", body: "Short questions to test the answer again." },
      { title: "Model Answer", body: "A sharper version, plus the next step to practise." },
    ],
  },
};

export const problemCostStats = [
  {
    label: "Typical private tutor",
    value: "£35-£60/hr",
    detail: "Useful feedback, but priced like a scarce appointment.",
    scale: 0.92,
  },
  {
    label: "Weekly support",
    value: "£140-£240/mo",
    detail: "One hour a week becomes a bill many families cannot absorb.",
    scale: 1,
  },
  {
    label: "A fairer unit",
    value: "minutes",
    detail: "Let learners buy access to practice, not panic-book expensive hours.",
    scale: 0.44,
  },
];

export const problemCostComparison = [
  { label: "Private tutor", value: "£40/hr", detail: "A simple midpoint from current UK tutoring ranges." },
  { label: "Weekly habit", value: "£160/mo", detail: "One hour a week becomes four paid sessions every month." },
  { label: "Teach Me", value: "from £9/mo", detail: "Voice practice, correction, and study outputs without booking an hourly slot." },
] as const;

export const problemLifestyleEquivalents = [
  { value: "~32", label: "takeaway coffees" },
  { value: "~3", label: "budget gym memberships" },
  { value: "~2", label: "petrol fill-ups" },
] as const;

export const problemAccessTiers = [
  { label: "Light", price: "£9/mo", access: "~60 voice minutes", note: "Quick homework check-ins, spoken correction, and session notes." },
  { label: "Core", price: "£15/mo", access: "~120 voice minutes", note: "Regular weekly practice with notes, flashcards, quizzes, and next steps." },
  { label: "Sprint", price: "£25/mo", access: "~240 voice minutes", note: "Revision bursts before a deadline, with more room for repeated practice." },
] as const;

export const studyPackArtifacts = [
  ["Extracted", "clean notes"],
  ["Weak spots", "gap cards"],
  ["Recall", "quick-fire quiz"],
  ["Target", "model answer"],
];

export const problemLoopSteps = [
  ["01", "Read"],
  ["02", "Say"],
  ["03", "Correct"],
  ["04", "Repeat"],
] as const;

export const tutorOptions: TutorOption[] = [
  {
    title: "Athena",
    body: "Sharper answers with stronger subject language.",
    personality: "athena",
    signal: "strategist",
  },
  {
    title: "Apollo",
    body: "Calm explanations when ideas feel messy.",
    personality: "apollo",
    signal: "explainer",
  },
  {
    title: "Hermes",
    body: "Fast prompts and energetic recall.",
    personality: "hermes",
    signal: "momentum",
  },
  {
    title: "Socrates",
    body: "One sharp question at a time.",
    personality: "socrates",
    signal: "questioner",
  },
  {
    title: "Hestia",
    body: "Gentle support when confidence dips.",
    personality: "hestia",
    signal: "support",
  },
  {
    title: "Ares",
    body: "Direct drills and pressure tests.",
    personality: "ares",
    signal: "challenge",
  },
];

export const tutorPersonalities = tutorOptions.map((mode) => mode.personality);
