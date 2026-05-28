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

export type LandingInfoPageKey = "problem" | "tutors";
export type TutorOption = {
  title: string;
  body: string;
  personality: AgentSettings["personality"];
  signal: string;
};
export type TutorPricingPlan = {
  name: string;
  price: string;
  hours: string;
  summary: string;
  includes: string[];
  featured?: boolean;
};

export const landingNavItems = [
  ["Start Chat", "01", "start"],
  ["The Problem", "02", "/problem"],
  ["Meet Tutors", "03", "/tutors"],
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
    title: "Tutoring works. Access does not.",
    body: "The evidence is not the problem. Regular, targeted help can move learning, but private tutoring is still priced like a scarce appointment.",
    proof: ["voice practice", "lower monthly cost", "study support"],
    cards: [
      { title: "Price", body: "Regular help quickly becomes too expensive for ordinary homework nights." },
      { title: "Timing", body: "Questions come up between sessions, not just inside a booked hour." },
      { title: "Confidence", body: "When a student gets stuck alone, small gaps turn into bigger hesitation." },
    ],
  },
  tutors: {
    kicker: "Meet our tutors",
    title: "Who would you choose?",
    body: "Swipe through our tutors and tap to hear how each one sounds.",
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

export const problemProofStats = [
  {
    label: "Fact 1",
    value: "+5 months",
    body: "One-to-one tuition adds around five months of progress on average.",
    source: "Education Endowment Foundation",
    href: "https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/one-to-one-tuition",
  },
  {
    label: "Fact 2",
    value: "£35-£55/hr",
    body: "Common UK GCSE private tutoring rates for experienced tutors.",
    source: "TutorLab UK cost guide",
    href: "https://www.tutorlab.uk/blog/how-much-does-a-private-tutor-cost-uk",
  },
  {
    label: "Fact 3",
    value: "£140-£220/mo",
    body: "One hour a week turns into a monthly bill before exam extras.",
    source: "Derived from TutorLab rates",
    href: "https://www.tutorlab.uk/blog/how-much-does-a-private-tutor-cost-uk",
  },
  {
    label: "Fact 4",
    value: "29%",
    body: "Secondary pupils in England and Wales who have had private tutoring.",
    source: "Sutton Trust",
    href: "https://www.suttontrust.com/wp-content/uploads/2026/02/Private-Tutoring-2026.pdf",
  },
  {
    label: "Fact 5",
    value: "25%",
    body: "Year 11 pupils are the most likely year group to have tutoring.",
    source: "Sutton Trust",
    href: "https://www.suttontrust.com/wp-content/uploads/2026/02/Private-Tutoring-2026.pdf",
  },
  {
    label: "Fact 6",
    value: "23% vs 30%",
    body: "Worst-off households access private tutoring less than the best-off.",
    source: "Sutton Trust",
    href: "https://www.suttontrust.com/wp-content/uploads/2026/02/Private-Tutoring-2026.pdf",
  },
] as const;

export const problemCostComparison = [
  { label: "Private tutor", value: "£40/hr", detail: "A typical hour of one-to-one help." },
  { label: "Weekly tutor", value: "£160/mo", detail: "One hour a week, four times a month." },
  { label: "Teach Me", value: "from £29/mo", detail: "Weekly AI tutor access without booking a private hour." },
] as const;

export const problemLifestyleEquivalents = [
  { value: "~32", label: "takeaway coffees" },
  { value: "~3", label: "budget gym memberships" },
  { value: "~2", label: "petrol fill-ups" },
] as const;

export const problemAccessTiers = [
  { label: "Starter", price: "£29/mo", access: "1 hr/week", note: "A weekly homework reset with spoken correction and session notes." },
  { label: "Core", price: "£79/mo", access: "3 hrs/week", note: "Regular subject support with revision plans, quizzes, and weak-spot tracking." },
  { label: "Exam", price: "£149/mo", access: "6 hrs/week", note: "Revision bursts before a deadline, with more room for repeated practice." },
] as const;

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

export const tutorPricingPlans: TutorPricingPlan[] = [
  {
    name: "Starter",
    price: "£29/mo",
    hours: "1 tutor hour/week",
    summary: "For a weekly homework reset, confidence, and study rhythm.",
    includes: ["All 6 tutors", "Voice lessons", "Session summaries"],
  },
  {
    name: "Core",
    price: "£79/mo",
    hours: "3 tutor hours/week",
    summary: "The main plan for regular support across subjects and revision.",
    includes: ["All 6 tutors", "Revision plans", "Quizzes and weak spots"],
    featured: true,
  },
  {
    name: "Exam",
    price: "£149/mo",
    hours: "6 tutor hours/week",
    summary: "For exam season, pressure practice, and deeper feedback loops.",
    includes: ["All 6 tutors", "Practice tests", "Detailed study plans"],
  },
];

export const tutorPersonalities = tutorOptions.map((mode) => mode.personality);
