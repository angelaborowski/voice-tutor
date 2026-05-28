import { LoaderCircle, Volume2, VolumeX } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Orb } from "@/components/ui/orb";
import { fetchTutorPreviewAudio } from "@/features/tutor/api/client";
import { personalityColors, type AgentSettings } from "@/features/tutor/domain/settings";
import { Draggable, gsap, useGSAP } from "@/lib/gsap";
import { tutorOptions } from "./data";

function getTutorIndex(personality: AgentSettings["personality"]) {
  const index = tutorOptions.findIndex((mode) => mode.personality === personality);
  return index >= 0 ? index : 1;
}

export function TutorFlickDeck({
  selectedMode,
  onSelect,
}: {
  selectedMode: AgentSettings["personality"];
  onSelect: (personality: AgentSettings["personality"]) => void;
}) {
  const deckRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [loadingPreview, setLoadingPreview] = useState<AgentSettings["personality"] | null>(null);
  const [playingPreview, setPlayingPreview] = useState<AgentSettings["personality"] | null>(null);
  const [previewError, setPreviewError] = useState<AgentSettings["personality"] | null>(null);
  const flickCards = useMemo(
    () =>
      Array.from({ length: tutorOptions.length }, (_, index) => ({
        ...tutorOptions[index % tutorOptions.length],
        flickId: `${tutorOptions[index % tutorOptions.length].personality}-${index}`,
      })),
    [],
  );

  useEffect(() => () => {
    abortRef.current?.abort();
    audioRef.current?.pause();
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
    }
  }, []);

  function stopPreview() {
    abortRef.current?.abort();
    abortRef.current = null;
    audioRef.current?.pause();
    audioRef.current = null;
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    setLoadingPreview(null);
    setPlayingPreview(null);
  }

  async function handlePreviewClick(personality: AgentSettings["personality"]) {
    onSelect(personality);
    setPreviewError(null);

    if (playingPreview === personality || loadingPreview === personality) {
      stopPreview();
      return;
    }

    stopPreview();
    const abortController = new AbortController();
    abortRef.current = abortController;
    setLoadingPreview(personality);

    try {
      const audioBlob = await fetchTutorPreviewAudio(personality);
      if (abortController.signal.aborted) return;

      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audioUrlRef.current = audioUrl;
      audio.addEventListener("ended", stopPreview, { once: true });
      audio.addEventListener("error", () => {
        setPreviewError(personality);
        stopPreview();
      }, { once: true });
      setLoadingPreview(null);
      setPlayingPreview(personality);
      await audio.play();
    } catch {
      if (!abortController.signal.aborted) {
        setPreviewError(personality);
      }
      stopPreview();
    }
  }

  useGSAP((_, contextSafe) => {
    const slider = deckRef.current;
    if (!slider) return undefined;

    const list = slider.querySelector<HTMLElement>("[data-flick-cards-list]");
    if (!list) return undefined;

    const cards = Array.from(list.querySelectorAll<HTMLElement>("[data-flick-cards-item]"));
    const total = cards.length;
    if (!total) return undefined;
    let activeIndex = getTutorIndex(selectedMode);
    const sliderWidth = slider.offsetWidth;
    const threshold = 0.1;

    const draggers: HTMLDivElement[] = [];
    cards.forEach((card) => {
      const dragger = document.createElement("div");
      dragger.setAttribute("data-flick-cards-dragger", "");
      card.appendChild(dragger);
      draggers.push(dragger);
    });

    slider.setAttribute("data-flick-drag-status", "grab");

    const safeSelect = contextSafe
      ? contextSafe((personality: AgentSettings["personality"]) => onSelect(personality))
      : (personality: AgentSettings["personality"]) => onSelect(personality);

    function getConfig(index: number, currentIndex: number) {
      let diff = index - currentIndex;
      if (diff > total / 2) diff -= total;
      else if (diff < -total / 2) diff += total;

      switch (diff) {
        case 0:
          return { x: 0, y: 0, rot: 0, s: 1, o: 1, z: 5 };
        case 1:
          return { x: 25, y: 1, rot: 10, s: 0.9, o: 1, z: 4 };
        case -1:
          return { x: -25, y: 1, rot: -10, s: 0.9, o: 1, z: 4 };
        case 2:
          return { x: 45, y: 5, rot: 15, s: 0.8, o: 1, z: 3 };
        case -2:
          return { x: -45, y: 5, rot: -15, s: 0.8, o: 1, z: 3 };
        default: {
          const dir = diff > 0 ? 1 : -1;
          return { x: 55 * dir, y: 5, rot: 20 * dir, s: 0.6, o: 0, z: 2 };
        }
      }
    }

    function renderCards(currentIndex: number) {
      cards.forEach((card, index) => {
        const cfg = getConfig(index, currentIndex);
        let status: string;

        if (cfg.x === 0) status = "active";
        else if (cfg.x === 25) status = "2-after";
        else if (cfg.x === -25) status = "2-before";
        else if (cfg.x === 45) status = "3-after";
        else if (cfg.x === -45) status = "3-before";
        else status = "hidden";

        card.setAttribute("data-flick-cards-item-status", status);
        card.style.zIndex = String(cfg.z);

        gsap.to(card, {
          duration: 0.6,
          ease: "elastic.out(1.2, 1)",
          xPercent: cfg.x,
          yPercent: cfg.y,
          rotation: cfg.rot,
          scale: cfg.s,
          opacity: cfg.o,
        });
      });
    }

    renderCards(activeIndex);

    let pressClientX = 0;
    let pressClientY = 0;

    const draggables = Draggable.create(draggers, {
      type: "x",
      edgeResistance: 0.8,
      bounds: { minX: -sliderWidth / 2, maxX: sliderWidth / 2 },
      inertia: false,

      onPress() {
        pressClientX = this.pointerEvent.clientX;
        pressClientY = this.pointerEvent.clientY;
        slider.setAttribute("data-flick-drag-status", "grabbing");
      },

      onDrag() {
        const rawProgress = this.x / sliderWidth;
        const progress = Math.min(1, Math.abs(rawProgress));
        const direction = rawProgress > 0 ? -1 : 1;
        const nextIndex = (activeIndex + direction + total) % total;

        cards.forEach((card, index) => {
          const from = getConfig(index, activeIndex);
          const to = getConfig(index, nextIndex);
          const mix = (key: "x" | "y" | "rot" | "s" | "o") => from[key] + (to[key] - from[key]) * progress;

          gsap.set(card, {
            xPercent: mix("x"),
            yPercent: mix("y"),
            rotation: mix("rot"),
            scale: mix("s"),
            opacity: mix("o"),
          });
        });
      },

      onRelease() {
        slider.setAttribute("data-flick-drag-status", "grab");

        const releaseClientX = this.pointerEvent.clientX;
        const releaseClientY = this.pointerEvent.clientY;
        const dragDistance = Math.hypot(releaseClientX - pressClientX, releaseClientY - pressClientY);

        const raw = this.x / sliderWidth;
        let shift = 0;
        if (raw > threshold) shift = -1;
        else if (raw < -threshold) shift = 1;

        if (shift !== 0) {
          activeIndex = (activeIndex + shift + total) % total;
          renderCards(activeIndex);
          safeSelect(flickCards[activeIndex].personality);
        }

        gsap.to(this.target, {
          x: 0,
          duration: 0.3,
          ease: "power1.out",
        });

        if (dragDistance < 4) {
          this.target.style.pointerEvents = "none";

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              const element = document.elementFromPoint(releaseClientX, releaseClientY);
              if (element) {
                const event = new MouseEvent("click", {
                  view: window,
                  bubbles: true,
                  cancelable: true,
                });
                element.dispatchEvent(event);
              }

              this.target.style.pointerEvents = "auto";
            });
          });
        }
      },
    });

    return () => {
      draggables.forEach((draggable) => draggable.kill());
      draggers.forEach((dragger) => dragger.remove());
    };
  }, { dependencies: [selectedMode, flickCards, onSelect], scope: deckRef, revertOnUpdate: true });

  return (
    <div ref={deckRef} data-flick-cards-init className="landing__mode-flick flick-group">
      <div className="flick-group__relative-object" aria-hidden="true">
        <div className="flick-group__relative-object-before" />
      </div>
      <div data-flick-cards-collection className="flick-group__collection">
        <div data-flick-cards-list className="flick-group__list">
          {flickCards.map((mode) => (
            <div
              key={mode.flickId}
              data-flick-cards-item
              data-flick-cards-item-status=""
              className="flick-group__item"
            >
              <div className="flick-card">
                <div className="flick-card__before" />
                <div className="flick-card__media">
                  <button
                    type="button"
                    className="landing__mode-card"
                    aria-pressed={selectedMode === mode.personality}
                    onClick={() => onSelect(mode.personality)}
                  >
                    <span className="landing__mode-card-signal">{mode.signal}</span>
                    <div className="landing__mode-card-orb" aria-hidden="true">
                      <Orb
                        agentState={
                          selectedMode === mode.personality || playingPreview === mode.personality
                            ? "talking"
                            : "listening"
                        }
                        colors={personalityColors[mode.personality]}
                        manualInput={
                          selectedMode === mode.personality || playingPreview === mode.personality
                            ? 0.74
                            : 0.46
                        }
                        manualOutput={
                          selectedMode === mode.personality || playingPreview === mode.personality
                            ? 0.84
                            : 0.58
                        }
                        seed={(mode.title.length + 3) * 193}
                        volumeMode="manual"
                        className="landing__orb-canvas"
                      />
                    </div>
                    <strong>{mode.title}</strong>
                    <p>{mode.body}</p>
                  </button>
                  <button
                    type="button"
                    className="landing__mode-card-preview"
                    aria-label={
                      playingPreview === mode.personality || loadingPreview === mode.personality
                        ? `Stop ${mode.title} voice preview`
                        : `Play ${mode.title} voice preview`
                    }
                    title={
                      previewError === mode.personality
                        ? "Voice preview unavailable"
                        : `${mode.title} voice`
                    }
                    onClick={(event) => {
                      event.stopPropagation();
                      void handlePreviewClick(mode.personality);
                    }}
                  >
                    {loadingPreview === mode.personality ? (
                      <LoaderCircle size={15} aria-hidden="true" />
                    ) : playingPreview === mode.personality ? (
                      <VolumeX size={15} aria-hidden="true" />
                    ) : (
                      <Volume2 size={15} aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
