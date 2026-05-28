import { useState } from "react";

import { StudyPackDrawer } from "@/features/tutor/components/StudyPackDrawer";
import type { StudyPackTab } from "@/features/tutor/domain/settings";
import type { StudyNote } from "@/features/tutor/domain/types";

const demoStudyNote: StudyNote = {
  topic: "Photosynthesis",
  definition:
    "Photosynthesis is the process plants use to make glucose from carbon dioxide and water using light energy.",
  summary:
    "We focused on how plants turn raw materials into glucose, where the process happens, and why chlorophyll and chloroplasts matter.",
  covered: [
    "Carbon dioxide and water are converted into glucose and oxygen.",
    "Light energy is absorbed by chlorophyll in chloroplasts.",
    "Glucose stores chemical energy for the plant.",
    "Glucose can be used for respiration, growth, or stored as starch.",
    "Oxygen is released as a by-product.",
  ],
  gaps: [
    "Name chlorophyll as the pigment that absorbs light.",
    "Link glucose to respiration, growth, or storage as starch.",
    "Keep the answer in one clean cause-and-effect chain.",
  ],
  nextStep: "Flip the cards once, self-mark the quiz, then say the weakest answer out loud again.",
  keyTerms: ["photosynthesis", "chlorophyll", "chloroplast", "glucose", "oxygen"],
  recommendedActivity: [
    "Answer each flashcard before revealing it.",
    "Self-mark the quick-fire quiz without looking at the notes.",
    "Repeat the model answer from memory in under 30 seconds.",
  ],
  flashcards: [
    {
      front: "What is photosynthesis?",
      back: "The process plants use to make glucose from carbon dioxide and water using light energy.",
      type: "definition",
      difficulty: "easy",
      keyword: "photosynthesis",
    },
    {
      front: "What absorbs the light energy?",
      back: "Chlorophyll absorbs light energy inside chloroplasts.",
      type: "definition",
      difficulty: "easy",
      keyword: "chlorophyll",
    },
    {
      front: "What are the raw materials?",
      back: "Carbon dioxide from the air and water absorbed by the roots.",
      type: "definition",
      difficulty: "easy",
      keyword: "raw materials",
    },
    {
      front: "Why is glucose useful?",
      back: "It stores chemical energy and can be used for respiration, growth, or stored as starch.",
      type: "application",
      difficulty: "medium",
      keyword: "glucose",
    },
    {
      front: "What is the word equation for photosynthesis?",
      back: "Carbon dioxide + water -> glucose + oxygen.",
      type: "definition",
      difficulty: "medium",
      keyword: "word equation",
    },
    {
      front: "What happens first when a plant photosynthesises?",
      back: "Chlorophyll in chloroplasts absorbs light energy.",
      type: "process",
      difficulty: "easy",
      keyword: "chlorophyll",
    },
    {
      front: "How does carbon dioxide get into the leaf?",
      back: "It diffuses into the leaf through small openings called stomata.",
      type: "process",
      difficulty: "medium",
      keyword: "stomata",
    },
    {
      front: "How does water reach the leaves?",
      back: "Roots absorb water from the soil and xylem vessels carry it to the leaves.",
      type: "process",
      difficulty: "medium",
      keyword: "xylem",
    },
    {
      front: "What happens to oxygen made during photosynthesis?",
      back: "It is released from the plant as a by-product.",
      type: "process",
      difficulty: "easy",
      keyword: "oxygen",
    },
    {
      front: "What happens to some glucose after photosynthesis?",
      back: "Some is used in respiration, some supports growth, and some is stored as starch.",
      type: "process",
      difficulty: "medium",
      keyword: "glucose",
    },
    {
      front: "A plant is kept in the dark. What happens to the rate of photosynthesis?",
      back: "It falls sharply because there is little or no light energy for chlorophyll to absorb.",
      type: "application",
      difficulty: "medium",
      keyword: "light",
    },
    {
      front: "If carbon dioxide is limited, why can light stop increasing the rate?",
      back: "Because carbon dioxide becomes the limiting factor, so extra light cannot be fully used.",
      type: "application",
      difficulty: "hard",
      keyword: "limiting factor",
    },
    {
      front: "Why might a plant store glucose as starch?",
      back: "Starch is insoluble, so it is a safer storage form inside cells.",
      type: "application",
      difficulty: "hard",
      keyword: "starch",
    },
    {
      front: "How would you test whether photosynthesis has happened in a leaf?",
      back: "Test the leaf for starch; a positive result suggests glucose was made and stored as starch.",
      type: "application",
      difficulty: "hard",
      keyword: "starch test",
    },
    {
      front: "Misconception check: do plants get their food from the soil?",
      back: "No. Plants make glucose by photosynthesis; soil supplies water and minerals.",
      type: "misconception",
      difficulty: "medium",
      keyword: "glucose",
    },
    {
      front: "Misconception check: is oxygen the main product plants need from photosynthesis?",
      back: "No. Glucose is the useful product for the plant; oxygen is a by-product.",
      type: "misconception",
      difficulty: "medium",
      keyword: "oxygen",
    },
    {
      front: "Misconception check: does photosynthesis happen in every part of a plant cell?",
      back: "No. It happens in chloroplasts, where chlorophyll absorbs light.",
      type: "misconception",
      difficulty: "easy",
      keyword: "chloroplast",
    },
    {
      front: "Build a stronger spoken answer: what three ideas should come in order?",
      back: "Light is absorbed by chlorophyll, carbon dioxide and water are converted, then glucose and oxygen are made.",
      type: "answer-building",
      difficulty: "medium",
      keyword: "answer structure",
    },
    {
      front: "What sentence links chlorophyll to glucose clearly?",
      back: "Chlorophyll absorbs light energy, which is used to convert carbon dioxide and water into glucose.",
      type: "answer-building",
      difficulty: "medium",
      keyword: "chlorophyll",
    },
    {
      front: "How could you finish a full-mark photosynthesis answer?",
      back: "Explain that glucose stores chemical energy and can be used for respiration, growth, or stored as starch.",
      type: "answer-building",
      difficulty: "hard",
      keyword: "glucose",
    },
  ],
  quickFireQuiz: [
    {
      question: "Name the two raw materials for photosynthesis.",
      answer: "Carbon dioxide and water.",
    },
    {
      question: "Where does photosynthesis happen in a plant cell?",
      answer: "In chloroplasts.",
    },
    {
      question: "Which pigment absorbs light energy?",
      answer: "Chlorophyll.",
    },
    {
      question: "What useful substance does the plant make?",
      answer: "Glucose.",
    },
  ],
  modelAnswer:
    "Photosynthesis is the process where plants use light energy absorbed by chlorophyll to convert carbon dioxide and water into glucose and oxygen. The glucose stores chemical energy and can be used for respiration, growth, or stored as starch.",
};

export function StudyPackDemoPage() {
  const [activeTab, setActiveTab] = useState<StudyPackTab>("flashcards");

  return (
    <main className="study-pack-demo workspace workspace--aurora">
      <section className="chat" aria-label="Study pack demo">
        <div className="study-pack-demo__copy">
          <span>Demo pack</span>
          <h1>Voice session to smart revision</h1>
          <p>
            Open the Cards and Quiz tabs to test the borrowed Revise Right-style practice flow.
          </p>
        </div>
        <StudyPackDrawer
          note={demoStudyNote}
          isPending={false}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onClose={() => undefined}
          variant="editorial"
        />
      </section>
    </main>
  );
}
