export type TutorRole = "student" | "tutor" | "system";

export type TutorMessage = {
  id: string;
  role: TutorRole;
  text: string;
  at: string;
};

export type FlashcardType =
  | "definition"
  | "process"
  | "application"
  | "misconception"
  | "answer-building";

export type FlashcardDifficulty = "easy" | "medium" | "hard";

export type StudyNote = {
  topic: string;
  definition: string;
  summary: string;
  covered: string[];
  gaps: string[];
  nextStep: string;
  keyTerms: string[];
  examPhrases?: string[];
  recommendedActivity: string[];
  flashcards: Array<{
    front: string;
    back: string;
    type?: FlashcardType;
    difficulty?: FlashcardDifficulty;
    keyword?: string;
  }>;
  quickFireQuiz: Array<{
    question: string;
    answer: string;
  }>;
  modelAnswer: string;
};

export type RevisionSession = {
  id: string;
  title: string;
  preview: string;
  createdAt: number;
  updatedAt: number;
  messages: TutorMessage[];
  studyNote: StudyNote | null;
};

export type HealthStatus = {
  ok: boolean;
  elevenLabsConfigured: boolean;
  speechEngineConfigured: boolean;
  openAiConfigured: boolean;
  llm?: string;
  webSocketPath?: string;
  tokenPath?: string;
  error?: string;
};
