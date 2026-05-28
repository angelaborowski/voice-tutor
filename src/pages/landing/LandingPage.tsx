import { ChevronRight } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { Orb } from "@/components/ui/orb";
import { CustomEase, SplitText, gsap, useGSAP } from "@/lib/gsap";
import { landingTutorBackgroundHues, landingTutorPalettes } from "./data";
import { LandingBackground } from "./LandingBackground";
import { LandingChromeMenu } from "./LandingChromeMenu";

export function LandingPage() {
  const navigate = useNavigate();
  const landingRef = useRef<HTMLElement | null>(null);
  const waitlistNameInputRef = useRef<HTMLInputElement | null>(null);
  const startTransitionRef = useRef(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const [waitlistName, setWaitlistName] = useState("");
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistStatus, setWaitlistStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [waitlistMessage, setWaitlistMessage] = useState("");
  const [landingTutorIndex, setLandingTutorIndex] = useState(0);
  const landingTutorColors = landingTutorPalettes[landingTutorIndex % landingTutorPalettes.length];
  const landingTutorBackgroundHue = landingTutorBackgroundHues[landingTutorIndex % landingTutorBackgroundHues.length];

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return undefined;

    const intervalId = window.setInterval(() => {
      setLandingTutorIndex((current) => (current + 1) % landingTutorPalettes.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!isWaitlistModalOpen) return undefined;

    const focusId = window.setTimeout(() => waitlistNameInputRef.current?.focus(), 80);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsWaitlistModalOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.clearTimeout(focusId);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.removeProperty("overflow");
    };
  }, [isWaitlistModalOpen]);

  useGSAP((_, contextSafe) => {
    const wrap = landingRef.current?.querySelector<HTMLElement>("[data-load-wrap]");
    if (!wrap) return;

    const completeLoad = contextSafe
      ? contextSafe(() => setIsLoaded(true))
      : () => setIsLoaded(true);
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      gsap.set(wrap, { display: "none" });
      completeLoad();
      return;
    }

    CustomEase.create("voiceLoader", "0.65, 0.01, 0.05, 0.99");

    const container = wrap.querySelector("[data-load-container]");
    const bg = wrap.querySelector("[data-load-bg]");
    const progressBar = wrap.querySelector("[data-load-progress]");
    const orb = wrap.querySelector("[data-load-orb]");
    const textElements = Array.from(wrap.querySelectorAll<HTMLElement>("[data-load-text]"));

    const splitText = textElements.map(
      (element) => new SplitText(element, { type: "lines,chars", mask: "lines" }),
    );
    const splitChars = splitText.map((split) => split.chars);

    gsap.set(wrap, { display: "grid", autoAlpha: 1 });
    gsap.set(progressBar, { scaleX: 0, transformOrigin: "left center" });
    gsap.set(textElements, { autoAlpha: 1 });
    gsap.set(splitChars, { autoAlpha: 0, yPercent: 125 });
    gsap.set(orb, { scale: 0.88, autoAlpha: 0.72 });

    const loadTimeline = gsap.timeline({
      defaults: {
        ease: "voiceLoader",
        duration: 2.45,
      },
      onComplete: completeLoad,
    });

    loadTimeline
      .to(progressBar, { scaleX: 1 })
      .to(orb, { scale: 1, autoAlpha: 1, duration: 1.2 }, "<")
      .to(splitChars[0] ?? [], {
        autoAlpha: 1,
        yPercent: 0,
        duration: 0.55,
        stagger: { each: 0.018 },
      }, 0.1)
      .to(splitChars[0] ?? [], {
        autoAlpha: 0,
        yPercent: -125,
        duration: 0.38,
        stagger: { each: 0.014 },
      }, ">+=0.28")
      .to(splitChars[1] ?? [], {
        autoAlpha: 1,
        yPercent: 0,
        duration: 0.55,
        stagger: { each: 0.018 },
      }, "<")
      .add("hideContent", ">+=0.38")
      .to(splitChars[1] ?? [], {
        autoAlpha: 0,
        yPercent: -125,
        duration: 0.36,
        stagger: { each: 0.014 },
      }, "hideContent")
      .to(container, { autoAlpha: 0, scale: 0.96, duration: 0.5 }, "hideContent")
      .to(progressBar, {
        scaleX: 0,
        transformOrigin: "right center",
        duration: 0.5,
      }, "hideContent")
      .to(bg, { yPercent: -101, duration: 0.9 }, "hideContent")
      .set(wrap, { display: "none" });

    return () => {
      splitText.forEach((split) => split.revert());
    };
  }, { scope: landingRef });

  useGSAP(() => {
    if (!isLoaded) return;

    const root = landingRef.current;
    if (!root) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealElements = Array.from(root.querySelectorAll<HTMLElement>("[data-hero-reveal]"));
    const cta = root.querySelector<HTMLElement>("[data-hero-cta]");

    if (prefersReducedMotion) {
      gsap.set([...revealElements, cta].filter(Boolean), { autoAlpha: 1 });
      return;
    }

    gsap.timeline({ defaults: { ease: "power3.out" } })
      .fromTo(revealElements, {
        autoAlpha: 0,
        y: 18,
      }, {
        autoAlpha: 1,
        y: 0,
        duration: 0.42,
        stagger: 0.08,
      })
      .fromTo(cta, {
        autoAlpha: 0,
        y: 10,
      }, {
        autoAlpha: 1,
        y: 0,
        duration: 0.32,
      }, "-=0.16");
  }, { scope: landingRef, dependencies: [isLoaded], revertOnUpdate: true });

  useGSAP(() => {
    const root = landingRef.current;
    const buttons = root?.querySelectorAll<HTMLElement>("[data-button-057]");
    if (!buttons?.length) return;

    const cleanups: Array<() => void> = [];
    const mm = gsap.matchMedia();

    const setupButtons = () => {
      buttons.forEach((element) => {
        const text = element.querySelector<HTMLElement>("[data-button-057-text]");
        if (!text) return;

        const hoverRoot = element.closest<HTMLElement>("[data-hover]") ?? element;
        const scrambleChars = element.getAttribute("data-button-057-scramble-chars")
          ?? "▛▜▟▙▞▚▗▖▘▝▐▕▋▌▍▎▏";
        let timeline: gsap.core.Timeline | undefined;

        const measureNaturalWidth = () => {
          const previous = text.style.width;
          text.style.width = "auto";
          const width = Math.ceil(text.scrollWidth);
          text.style.width = previous;
          return width;
        };

        const setFixedWidth = () => {
          text.style.width = `${measureNaturalWidth()}px`;
        };

        const clearFixedWidth = () => {
          text.style.removeProperty("width");
        };

        const playSequence = () => {
          const originalText = text.textContent ?? "";
          if (!originalText || timeline?.isActive()) return;

          const duration = gsap.utils.clamp(0.45, 0.8, originalText.length * (0.45 / 6));
          timeline?.kill();
          setFixedWidth();

          timeline = gsap.timeline({
            overwrite: true,
            onComplete: clearFixedWidth,
            onInterrupt: clearFixedWidth,
          });

          timeline.to(text, {
            duration,
            delay: 0.1,
            scrambleText: {
              text: originalText,
              chars: `${originalText}${scrambleChars}`,
              speed: 0.1,
              revealDelay: 0.1,
            },
          });
        };

        const onFocusIn = () => {
          if (hoverRoot.matches(":focus-visible")) playSequence();
        };

        hoverRoot.addEventListener("pointerenter", playSequence);
        hoverRoot.addEventListener("mouseenter", playSequence);
        hoverRoot.addEventListener("focusin", onFocusIn);

        cleanups.push(() => {
          hoverRoot.removeEventListener("pointerenter", playSequence);
          hoverRoot.removeEventListener("mouseenter", playSequence);
          hoverRoot.removeEventListener("focusin", onFocusIn);
          timeline?.kill();
          clearFixedWidth();
        });
      });
    };

    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    fontsReady.then(() => {
      mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", setupButtons);
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      mm.revert();
    };
  }, { scope: landingRef });

  const handleStart = () => {
    if (startTransitionRef.current) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wrap = landingRef.current?.querySelector<HTMLElement>("[data-load-wrap]");
    if (prefersReducedMotion || !wrap) {
      navigate("/app");
      return;
    }

    startTransitionRef.current = true;
    setIsStarting(true);
    setIsWaitlistModalOpen(false);

    const bg = wrap.querySelector("[data-load-bg]");
    const container = wrap.querySelector("[data-load-container]");
    const progressBar = wrap.querySelector("[data-load-progress]");
    const orb = wrap.querySelector("[data-load-orb]");
    const exitText = wrap.querySelector("[data-load-exit]");

    CustomEase.create("voiceLoader", "0.65, 0.01, 0.05, 0.99");

    gsap.timeline({
      defaults: {
        ease: "voiceLoader",
      },
      onComplete: () => navigate("/app"),
    })
      .set(wrap, { display: "grid", autoAlpha: 1 })
      .set(bg, { yPercent: 0, autoAlpha: 0 })
      .set(progressBar, { scaleX: 0, transformOrigin: "left center" })
      .set(container, { autoAlpha: 0, scale: 0.94 })
      .set(orb, { scale: 0.82, autoAlpha: 0 })
      .set(exitText, { autoAlpha: 0, yPercent: 38 })
      .to(bg, { autoAlpha: 1, duration: 0.75 }, 0)
      .to(container, { autoAlpha: 1, scale: 1, duration: 0.82 }, 0.14)
      .to(orb, { scale: 1, autoAlpha: 1, duration: 0.82 }, 0.14)
      .to(exitText, { autoAlpha: 1, yPercent: 0, duration: 0.55 }, 0.34)
      .to(progressBar, { scaleX: 1, duration: 1.25 }, 0.26)
      .to(container, { autoAlpha: 0.84, scale: 0.985, duration: 0.24 }, 1.28);
  };

  const handleWaitlistSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = waitlistName.trim();
    const email = waitlistEmail.trim();
    if (!name || !email) {
      setWaitlistStatus("error");
      setWaitlistMessage("Enter your name and email to get first access.");
      return;
    }

    setWaitlistStatus("submitting");
    setWaitlistMessage("Adding you now...");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, source: "landing-want-in" }),
      });
      const data = (await response.json().catch(() => ({}))) as { message?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not save that email right now.");
      }

      setWaitlistStatus("success");
      setWaitlistMessage(data.message ?? "You're on the list.");
      setWaitlistName("");
      setWaitlistEmail("");
    } catch (error) {
      setWaitlistStatus("error");
      setWaitlistMessage(error instanceof Error ? error.message : "Could not save that email right now.");
    }
  };

  return (
    <main
      ref={landingRef}
      className={`landing ${isLoaded ? "is-loaded" : "is-loading"} ${isStarting ? "is-starting" : ""}`}
      style={{
        "--landing-orb-a": landingTutorColors[0],
        "--landing-orb-b": landingTutorColors[1],
      } as CSSProperties}
      aria-labelledby="landing-title"
    >
      <LandingBackground hueShift={landingTutorBackgroundHue} />
      <div data-load-wrap className="loader" aria-hidden={isLoaded && !isStarting}>
        <div data-load-bg className="loader__bg">
          <div data-load-progress className="loader__bg-bar" />
        </div>
        <div data-load-container className="loader__container">
          <div data-load-orb className="loader__orb">
            <Orb
              agentState="thinking"
              colors={["#ffffff", "#8b8b8b"]}
              inverted
              manualInput={0.25}
              manualOutput={0.58}
              seed={404}
              volumeMode="manual"
              className="landing__orb-canvas"
            />
          </div>
          <div className="loader__text-wrap">
            <span data-load-text className="loader__text-el">Hold tight</span>
            <span data-load-text className="loader__text-el">Preparing your tutor</span>
            <span data-load-exit className="loader__exit-text">Starting your session</span>
          </div>
        </div>
      </div>

      <LandingChromeMenu onStart={handleStart} onWaitlist={() => setIsWaitlistModalOpen(true)} />

      <section className="landing__hero">
        <div className="landing__presence">
          <div
            className="landing__orb-shell"
            style={{ "--orb-glow": landingTutorColors[0] } as CSSProperties}
          >
            <Orb
              agentState="listening"
              colors={landingTutorColors}
              manualInput={0.6}
              manualOutput={0.78}
              seed={1107}
              volumeMode="manual"
              className="landing__orb-canvas"
            />
          </div>
        </div>

        <div className="landing__story">
          <h1 id="landing-title" data-hero-reveal>Your tutor, on demand.</h1>
          <p data-hero-reveal>
            Say what you know. Teach Me finds the gaps, guides the lesson, and leaves you with
            notes, flashcards, quizzes, and next steps.
          </p>
          <button
            type="button"
            className="landing__cta button-005"
            data-button-005
            data-hero-cta
            onClick={handleStart}
            aria-label="Let's talk"
            disabled={isStarting}
          >
            <span className="button-005__text-wrap">
              <span className="button-005__text is--default">
                Let&apos;s talk
              </span>
              <span aria-hidden="true" className="button-005__text is--hover">
                Let&apos;s talk
              </span>
            </span>
            <span className="button-005__icon-wrap" aria-hidden="true">
              <span className="button-005__icon-inner is--default">
                <ChevronRight className="button-005__icon" strokeWidth={2.4} />
              </span>
              <span className="button-005__icon-inner is--hover">
                <ChevronRight className="button-005__icon" strokeWidth={2.4} />
              </span>
            </span>
          </button>

        </div>
      </section>

      <div
        data-modal-group-status={isWaitlistModalOpen ? "active" : "not-active"}
        className="modal landing__waitlist-modal"
      >
        <button
          type="button"
          data-modal-close=""
          className="modal__dark"
          aria-label="Close early list signup"
          onClick={() => setIsWaitlistModalOpen(false)}
        />
        <div
          data-modal-name="waitlist"
          data-modal-status={isWaitlistModalOpen ? "active" : "not-active"}
          className="modal__card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="waitlist-modal-title"
        >
          <div className="modal__scroll">
            <form className="modal__content" onSubmit={handleWaitlistSubmit}>
              <div className="modal__intro">
                <h2 id="waitlist-modal-title" className="modal__h2">Get first access.</h2>
                <p className="modal__note">
                  Be the first to try Teach Me when the demo opens up. We'll only use this to send
                  access and launch updates.
                </p>
              </div>
              <label className="modal__field">
                <span>Your name</span>
                <input
                  ref={waitlistNameInputRef}
                  aria-label="Your name"
                  type="text"
                  value={waitlistName}
                  placeholder="Your name"
                  autoComplete="name"
                  disabled={waitlistStatus === "submitting"}
                  required
                  onChange={(event) => {
                    setWaitlistName(event.target.value);
                    if (waitlistStatus !== "idle") {
                      setWaitlistStatus("idle");
                      setWaitlistMessage("");
                    }
                  }}
                />
              </label>
              <label className="modal__field">
                <span>Your email</span>
                <input
                  aria-label="Email address for Teach Me updates"
                  type="email"
                  value={waitlistEmail}
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={waitlistStatus === "submitting"}
                  required
                  onChange={(event) => {
                    setWaitlistEmail(event.target.value);
                    if (waitlistStatus !== "idle") {
                      setWaitlistStatus("idle");
                      setWaitlistMessage("");
                    }
                  }}
                />
              </label>
              <button className="modal__submit" type="submit" disabled={waitlistStatus === "submitting"}>
                {waitlistStatus === "submitting" ? "Joining" : "Join list"}
              </button>
              {waitlistStatus !== "idle" && (
                <p className={`modal__message is-${waitlistStatus}`} aria-live="polite">
                  {waitlistMessage}
                </p>
              )}
            </form>
          </div>
          <button
            type="button"
            data-modal-close=""
            className="modal__btn-close"
            aria-label="Close early list signup"
            onClick={() => setIsWaitlistModalOpen(false)}
          >
            <span className="modal__btn-close-bar" />
            <span className="modal__btn-close-bar is--second" />
          </button>
        </div>
      </div>
    </main>
  );
}
