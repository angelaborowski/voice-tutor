import { Check, ChevronDown, Play, Search } from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  tutorPersonalityOptions,
  tutorPersonalityProfiles,
  type TutorPersonalityId,
} from "@/features/tutor/domain/settings";

type TutorPickerProps = {
  value: TutorPersonalityId;
  disabled?: boolean;
  onValueChange: (value: TutorPersonalityId) => void;
};

export function TutorPicker({ value, disabled = false, onValueChange }: TutorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selectedTutor = tutorPersonalityProfiles[value];

  const filteredTutors = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return tutorPersonalityOptions;

    return tutorPersonalityOptions.filter((personality) => {
      const tutor = tutorPersonalityProfiles[personality];
      return (
        tutor.label.toLowerCase().includes(normalized) ||
        tutor.shortDescription.toLowerCase().includes(normalized)
      );
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
        aria-label={`Choose tutor. Current tutor: ${selectedTutor.label}`}
      >
        <span
          className="tutor-picker__orb"
          aria-hidden="true"
          style={{
            "--tutor-picker-a": selectedTutor.colors[0],
            "--tutor-picker-b": selectedTutor.colors[1],
          } as CSSProperties}
        />
        <span className="tutor-picker__copy">
          <strong>{selectedTutor.label}</strong>
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
              const tutor = tutorPersonalityProfiles[personality];
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
                      "--tutor-picker-a": tutor.colors[0],
                      "--tutor-picker-b": tutor.colors[1],
                    } as CSSProperties}
                  />
                  <span className="tutor-picker__option-copy">
                    <strong>{tutor.label}</strong>
                    <span>{tutor.shortDescription}</span>
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
