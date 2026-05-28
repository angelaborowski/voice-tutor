import { createElement, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  RotateCcw,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";

import { GlassEffect } from "@/components/ui/glass-effect";
import { ShimmeringText } from "@/components/ui/shimmering-text";
import type { StudyPackTab } from "@/features/tutor/domain/settings";
import type { StudyNote } from "@/features/tutor/domain/types";

const NOTES_LORD_ICON = "https://cdn.lordicon.com/vysppwvq.json";
const WORDS_LORD_ICON = "https://cdn.lordicon.com/mdimxkjg.json";
const FLASHCARDS_LORD_ICON = "https://cdn.lordicon.com/egadjbrf.json";
const QUIZ_LORD_ICON = "https://cdn.lordicon.com/qdoxjemx.json";
type FlashcardRating = "again" | "good" | "easy";
export type StudyPackVariant = "editorial" | "console" | "studio" | "pocket" | "three-mode";

export function StudyPackDrawer({
  note,
  isPending,
  activeTab,
  onTabChange,
  onClose,
  variant = "editorial",
  variantSwitcher,
}: {
  note: StudyNote | null;
  isPending: boolean;
  activeTab: StudyPackTab;
  onTabChange: (tab: StudyPackTab) => void;
  onClose: () => void;
  variant?: StudyPackVariant;
  variantSwitcher?: ReactNode;
}) {
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [activeQuizIndex, setActiveQuizIndex] = useState(0);
  const [activeKeywordIndex, setActiveKeywordIndex] = useState(0);
  const [flashcardMarks, setFlashcardMarks] = useState<Record<number, FlashcardRating>>({});
  const [revealedQuizAnswers, setRevealedQuizAnswers] = useState<Set<number>>(new Set());
  const [quizMarks, setQuizMarks] = useState<Record<number, boolean>>({});
  const tabs: Array<{ id: StudyPackTab; label: string; lordIconSrc: string }> = [
    { id: "summary", label: "Notes", lordIconSrc: NOTES_LORD_ICON },
    { id: "keywords", label: "Words", lordIconSrc: WORDS_LORD_ICON },
    { id: "flashcards", label: "Cards", lordIconSrc: FLASHCARDS_LORD_ICON },
    { id: "quiz", label: "Quiz", lordIconSrc: QUIZ_LORD_ICON },
  ];
  const visibleTabs = variant === "three-mode"
    ? tabs.filter((tab) => tab.id !== "keywords")
    : tabs;
  const keyTerms = note?.keyTerms?.length ? note.keyTerms : note?.examPhrases ?? [];
  const flashcards = note?.flashcards ?? [];
  const quizItems = note?.quickFireQuiz ?? [];
  const activeCard = flashcards[activeCardIndex];
  const activeQuizItem = quizItems[activeQuizIndex];
  const activeKeyword = keyTerms[activeKeywordIndex];
  const flashcardMarkedCount = Object.keys(flashcardMarks).length;
  const flashcardAgainCount = Object.values(flashcardMarks).filter((rating) => rating === "again").length;
  const flashcardGoodCount = Object.values(flashcardMarks).filter((rating) => rating === "good").length;
  const flashcardEasyCount = Object.values(flashcardMarks).filter((rating) => rating === "easy").length;
  const quizAnsweredCount = Object.keys(quizMarks).length;
  const quizCorrectCount = Object.values(quizMarks).filter(Boolean).length;
  const isQuizComplete = quizItems.length > 0 && quizAnsweredCount === quizItems.length;
  const summaryPoints = note ? splitSentences(note.summary) : [];

  useEffect(() => {
    setActiveCardIndex(0);
    setIsCardFlipped(false);
    setActiveQuizIndex(0);
    setActiveKeywordIndex(0);
    setFlashcardMarks({});
    setRevealedQuizAnswers(new Set());
    setQuizMarks({});
  }, [note?.topic]);

  useEffect(() => {
    setIsCardFlipped(false);
  }, [activeCardIndex]);

  useEffect(() => {
    if (variant === "three-mode" && activeTab === "keywords") {
      onTabChange("summary");
    }
  }, [activeTab, onTabChange, variant]);

  const goToCard = (direction: 1 | -1) => {
    if (!flashcards.length) return;
    setActiveCardIndex((index) => (index + direction + flashcards.length) % flashcards.length);
  };

  const goToQuizItem = (direction: 1 | -1) => {
    if (!quizItems.length) return;
    setActiveQuizIndex((index) => (index + direction + quizItems.length) % quizItems.length);
  };

  const revealQuizAnswer = () => {
    setRevealedQuizAnswers((answers) => new Set(answers).add(activeQuizIndex));
  };

  const markFlashcard = (rating: FlashcardRating) => {
    if (!isCardFlipped) return;
    setFlashcardMarks((marks) => ({ ...marks, [activeCardIndex]: rating }));
  };

  const markQuizItem = (gotIt: boolean) => {
    setQuizMarks((marks) => ({ ...marks, [activeQuizIndex]: gotIt }));
  };

  return (
    <aside
      data-lenis-prevent
      className={`study-pack study-pack--${variant} ${variantSwitcher ? "has-variant-switcher" : ""}`}
      aria-label="Learning pack"
    >
      <GlassEffect />
      <header className="study-pack__header">
        <div>
          <span>Generated from your session</span>
          <strong>{note?.topic ?? "Learning pack"}</strong>
        </div>
        <button type="button" onClick={onClose} aria-label="Close learning pack">
          <X size={17} />
        </button>
      </header>

      {variantSwitcher && (
        <div className="study-pack__variant-switcher">
          {variantSwitcher}
        </div>
      )}

      <nav className="study-pack__tabs" aria-label="Learning pack sections">
        {visibleTabs.map(({ id, label, lordIconSrc }) => (
          <button
            key={id}
            type="button"
            className={activeTab === id ? "is-active" : ""}
            onClick={() => onTabChange(id)}
          >
            <span className="study-pack__tab-icon" aria-hidden="true">
              <LordIcon src={lordIconSrc} />
            </span>
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {isPending && !note ? (
        <div data-lenis-prevent className="study-pack__loading">
          <ShimmeringText
            text="Building your learning pack..."
            duration={1.15}
            repeatDelay={0.1}
            startOnView={false}
            spread={3}
            color="rgba(23, 18, 17, 0.34)"
            shimmerColor="#171211"
          />
        </div>
      ) : note ? (
        <div data-lenis-prevent className="study-pack__body">
          {activeTab === "summary" && (
            <section className="study-pack__section">
              <article className="study-pack-note">
                <header>
                  <h2>{note.topic}</h2>
                  <p>{note.definition}</p>
                </header>

                <div className="study-pack-note__block study-pack-note__block--summary">
                  <h3>Summary notes</h3>
                  <ul className="study-pack-note__summary-list">
                    {(summaryPoints.length ? summaryPoints : [note.summary]).map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>

                <div className="study-pack-note__block">
                  <h3>Key points</h3>
                  <ol className="study-pack-note__points">
                    {note.covered.map((item, index) => (
                      <li key={item}>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <p>{item}</p>
                      </li>
                    ))}
                  </ol>
                </div>

                {note.gaps.length > 0 && (
                  <div className="study-pack-note__block">
                    <h3>Watch-outs</h3>
                    <ul className="study-pack-note__watchouts">
                      {note.gaps.map((gap) => (
                        <li key={gap}>{gap}</li>
                      ))}
                    </ul>
                  </div>
                )}

              </article>
            </section>
          )}

          {activeTab === "keywords" && (
            <section className="study-pack__section">
              {activeKeyword ? (
                <div className="study-pack-keywords">
                  <header className="study-pack-keywords__header">
                    <span>Word bank</span>
                    <h2>Key terms</h2>
                    <p>Terms from the conversation, shown with the sentence they belong to.</p>
                  </header>

                  <div className="study-pack-keyword-list" aria-label="Key word bank">
                    {keyTerms.map((term, index) => (
                      <button
                        type="button"
                        key={term}
                        className={`study-pack-keyword-row ${index === activeKeywordIndex ? "is-active" : ""}`}
                        onClick={() => setActiveKeywordIndex(index)}
                      >
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <strong>{term}</strong>
                        <p>{contextForKeyword(term, note.modelAnswer)}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="study-pack__loading">No key words generated yet.</div>
              )}
            </section>
          )}

          {activeTab === "flashcards" && (
            <section className="study-pack__section">
              {activeCard ? (
                <div className="study-pack-flashcards" aria-label="Flashcard practice">
                  <div className="study-pack-practice__toolbar">
                    <span>
                      Card {activeCardIndex + 1} of {flashcards.length}
                    </span>
                    {flashcardMarkedCount > 0 && (
                      <strong>
                        {flashcardMarkedCount}/{flashcards.length} marked
                      </strong>
                    )}
                    {flashcardMarks[activeCardIndex] && (
                      <strong className={`is-${flashcardMarks[activeCardIndex]}`}>
                        {flashcardRatingLabel(flashcardMarks[activeCardIndex])}
                      </strong>
                    )}
                    <button type="button" onClick={() => setIsCardFlipped(false)}>
                      <RotateCcw size={14} />
                      Reset
                    </button>
                  </div>

                  <button
                    type="button"
                    className={`study-pack-flashcard ${isCardFlipped ? "is-flipped" : ""}`}
                    onClick={() => setIsCardFlipped((flipped) => !flipped)}
                    aria-label={isCardFlipped ? "Showing answer. Tap to show prompt." : "Showing prompt. Tap to reveal answer."}
                  >
                    <span className="study-pack-flashcard__face study-pack-flashcard__front" aria-hidden={isCardFlipped}>
                      <span className="study-pack-flashcard__meta">
                        <small>Prompt</small>
                        {activeCard.type && <b>{flashcardTypeLabel(activeCard.type)}</b>}
                        {activeCard.difficulty && <b>{activeCard.difficulty}</b>}
                      </span>
                      <strong>{activeCard.front}</strong>
                      <em>
                        <Eye size={15} />
                        Tap to reveal
                      </em>
                    </span>
                    <span className="study-pack-flashcard__face study-pack-flashcard__back" aria-hidden={!isCardFlipped}>
                      {isCardFlipped && (
                        <>
                          <span className="study-pack-flashcard__meta">
                            <small>Answer</small>
                            {activeCard.keyword && <b>{activeCard.keyword}</b>}
                          </span>
                          <strong>{activeCard.back}</strong>
                        </>
                      )}
                    </span>
                  </button>

                  <div
                    className={`study-pack-flashcard__ratings ${isCardFlipped ? "is-ready" : ""}`}
                    role="group"
                    aria-label="Rate your recall"
                  >
                    <button
                      type="button"
                      className={flashcardMarks[activeCardIndex] === "again" ? "is-selected" : ""}
                      onClick={() => markFlashcard("again")}
                      disabled={!isCardFlipped}
                      aria-label="Struggled with this card"
                    >
                      <XCircle size={15} />
                      Struggled
                    </button>
                    <button
                      type="button"
                      className={flashcardMarks[activeCardIndex] === "good" ? "is-selected" : ""}
                      onClick={() => markFlashcard("good")}
                      disabled={!isCardFlipped}
                      aria-label="Got this card"
                    >
                      <CheckCircle2 size={15} />
                      Got it
                    </button>
                    <button
                      type="button"
                      className={flashcardMarks[activeCardIndex] === "easy" ? "is-selected" : ""}
                      onClick={() => markFlashcard("easy")}
                      disabled={!isCardFlipped}
                      aria-label="This card was easy"
                    >
                      <Sparkles size={15} />
                      Easy
                    </button>
                  </div>

                  {flashcardMarkedCount > 0 && (
                    <div className="study-pack-flashcard__summary" aria-label="Flashcard rating summary">
                      <span>{flashcardAgainCount} struggled</span>
                      <span>{flashcardGoodCount} got it</span>
                      <span>{flashcardEasyCount} easy</span>
                    </div>
                  )}

                  <div className="study-pack-practice__nav">
                    <button type="button" onClick={() => goToCard(-1)} aria-label="Previous flashcard">
                      <ChevronLeft size={17} />
                    </button>
                    <div aria-hidden="true">
                      {flashcards.map((card, index) => (
                        <span
                          key={card.front}
                          className={[
                            index === activeCardIndex ? "is-active" : "",
                            flashcardMarks[index] === "again" ? "is-missed" : "",
                            flashcardMarks[index] === "good" ? "is-good" : "",
                            flashcardMarks[index] === "easy" ? "is-easy" : "",
                          ].join(" ")}
                        />
                      ))}
                    </div>
                    <button type="button" onClick={() => goToCard(1)} aria-label="Next flashcard">
                      <ChevronRight size={17} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="study-pack__loading">No flashcards generated yet.</div>
              )}
            </section>
          )}

          {activeTab === "quiz" && (
            <section className="study-pack__section">
              {activeQuizItem ? (
                <div className="study-pack-quiz" aria-label="Quick-fire quiz">
                  <div className="study-pack-practice__toolbar">
                    <span>
                      Question {activeQuizIndex + 1} of {quizItems.length}
                    </span>
                    {quizAnsweredCount > 0 && (
                      <strong className={isQuizComplete ? "is-correct" : ""}>
                        {quizCorrectCount}/{quizAnsweredCount} so far
                      </strong>
                    )}
                    {typeof quizMarks[activeQuizIndex] === "boolean" && (
                      <strong className={quizMarks[activeQuizIndex] ? "is-correct" : "is-missed"}>
                        {quizMarks[activeQuizIndex] ? "Got it" : "Review"}
                      </strong>
                    )}
                  </div>

                  <article className="study-pack-quiz__card">
                    <h3>Quick check</h3>
                    <p>{activeQuizItem.question}</p>

                    {revealedQuizAnswers.has(activeQuizIndex) ? (
                      <div className="study-pack-quiz__answer">
                        <span>Answer</span>
                        <p>{activeQuizItem.answer}</p>
                      </div>
                    ) : (
                      <button type="button" onClick={revealQuizAnswer}>
                        <Eye size={15} />
                        Reveal answer
                      </button>
                    )}

                    {revealedQuizAnswers.has(activeQuizIndex) && (
                      <div className="study-pack-quiz__marks">
                        <button type="button" onClick={() => markQuizItem(true)}>
                          <CheckCircle2 size={16} />
                          Got it
                        </button>
                        <button type="button" onClick={() => markQuizItem(false)}>
                          <XCircle size={16} />
                          Not quite
                        </button>
                      </div>
                    )}
                  </article>

                  {isQuizComplete && (
                    <div className="study-pack-quiz__score" aria-live="polite">
                      <span>Final score</span>
                      <strong>
                        {quizCorrectCount}/{quizItems.length}
                      </strong>
                      <p>
                        {quizCorrectCount === quizItems.length
                          ? "Clean sweep. Move on to the flashcards."
                          : "Review the missed questions, then try the quiz again."}
                      </p>
                    </div>
                  )}

                  <div className="study-pack-practice__nav">
                    <button type="button" onClick={() => goToQuizItem(-1)} aria-label="Previous quiz question">
                      <ChevronLeft size={17} />
                    </button>
                    <div aria-hidden="true">
                      {quizItems.map((item, index) => (
                        <span
                          key={item.question}
                          className={[
                            index === activeQuizIndex ? "is-active" : "",
                            quizMarks[index] === true ? "is-correct" : "",
                            quizMarks[index] === false ? "is-missed" : "",
                          ].join(" ")}
                        />
                      ))}
                    </div>
                    <button type="button" onClick={() => goToQuizItem(1)} aria-label="Next quiz question">
                      <ChevronRight size={17} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="study-pack__loading">No quiz questions generated yet.</div>
              )}
            </section>
          )}
        </div>
      ) : (
        <div data-lenis-prevent className="study-pack__loading">Start a conversation to generate a pack.</div>
      )}
    </aside>
  );
}

function contextForKeyword(term: string, modelAnswer: string) {
  const fallback = `Use ${term} accurately in the next spoken answer.`;
  const sentences = splitSentences(modelAnswer);
  const match = sentences.find((sentence) =>
    sentence.toLowerCase().includes(term.toLowerCase()),
  );

  return match ?? fallback;
}

function splitSentences(text: string) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function flashcardTypeLabel(type: NonNullable<StudyNote["flashcards"][number]["type"]>) {
  return type
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function flashcardRatingLabel(rating: FlashcardRating) {
  if (rating === "again") return "Struggled";
  if (rating === "easy") return "Easy";
  return "Got it";
}

function LordIcon({ src }: { src: string }) {
  return createElement("lord-icon", {
    src,
    trigger: "hover",
    stroke: "bold",
    colors: "primary:#171211,secondary:#171211",
    style: {
      width: "1.48rem",
      height: "1.48rem",
    },
  });
}
