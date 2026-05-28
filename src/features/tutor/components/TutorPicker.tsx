import { Check, ChevronDown, Play, Search } from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  personalityColors,
  personalityLabels,
  personalityOptions,
  type AgentSettings,
} from "@/features/tutor/domain/settings";

type TutorPersonality = AgentSettings["personality"];

type TutorPickerProps = {
  value: TutorPersonality;
  disabled?: boolean;
  onValueChange: (value: TutorPersonality) => void;
};

const tutorDescriptions: Record<TutorPersonality, string> = {
  athena: "Strategic answer upgrades.",
  apollo: "Calm, tidy explanations.",
  hermes: "Fast prompts and recall.",
  socrates: "Questions first, answers earned.",
  hestia: "Gentle, steady support.",
  ares: "Direct challenge drills.",
};

export function TutorPicker({ value, disabled = false, onValueChange }: TutorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selectedColors = personalityColors[value];
  const selectedLabel = personalityLabels[value];

  const filteredTutors = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return personalityOptions;

    return personalityOptions.filter((personality) => {
      const label = personalityLabels[personality].toLowerCase();
      const description = tutorDescriptions[personality].toLowerCase();
      return label.includes(normalized) || description.includes(normalized);
    });
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  useEffect(() => {
    if (disabled) {
      setIsOpen(false);
    }
  }, [disabled]);

  return (
    <div className="tutor-picker" ref={wrapperRef}>
      <button
        type="button"
        className="tutor-picker__trigger"
        onClick={() => setIsOpen((current) => !current)}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Choose tutor. Current tutor: ${selectedLabel}`}
      >
        <span
          className="tutor-picker__orb"
          aria-hidden="true"
          style={{
            "--tutor-picker-a": selectedColors[0],
            "--tutor-picker-b": selectedColors[1],
          } as CSSProperties}
        />
        <span className="tutor-picker__copy">
          <strong>{selectedLabel}</strong>
          <span>Tutor</span>
        </span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="tutor-picker__popover" role="dialog" aria-label="Pick your tutor">
          <label className="tutor-picker__search">
            <Search size={15} aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tutors"
              autoComplete="off"
              spellCheck={false}
            />
          </label>

          <div className="tutor-picker__list" role="listbox" aria-label="Available tutors">
            {filteredTutors.map((personality) => {
              const colors = personalityColors[personality];
              const isSelected = personality === value;

              return (
                <button
                  key={personality}
                  type="button"
                  className={`tutor-picker__option ${isSelected ? "is-selected" : ""}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onValueChange(personality);
                    setIsOpen(false);
                    setQuery("");
                  }}
                >
                  <span
                    className="tutor-picker__orb"
                    aria-hidden="true"
                    style={{
                      "--tutor-picker-a": colors[0],
                      "--tutor-picker-b": colors[1],
                    } as CSSProperties}
                  />
                  <span className="tutor-picker__option-copy">
                    <strong>{personalityLabels[personality]}</strong>
                    <span>{tutorDescriptions[personality]}</span>
                  </span>
                  <span className="tutor-picker__preview" aria-hidden="true">
                    {isSelected ? <Check size={15} /> : <Play size={13} />}
                  </span>
                </button>
              );
            })}
            {filteredTutors.length === 0 && (
              <p className="tutor-picker__empty">No tutor found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
