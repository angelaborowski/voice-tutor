import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { syncTutorPersonality } from "@/features/tutor/api/client";
import { AGENT_SETTINGS_STORAGE_KEY, readAgentSettings, type AgentSettings } from "@/features/tutor/domain/settings";
import { gsap, useGSAP } from "@/lib/gsap";
import { infoPages, problemProofStats, tutorPersonalities, tutorPricingPlans, type LandingInfoPageKey } from "./data";
import { LandingBackground } from "./LandingBackground";
import { LandingChromeMenu } from "./LandingChromeMenu";
import { useLandingTransitionNavigate } from "./LandingRouteTransition";
import { TutorFlickDeck } from "./TutorFlickDeck";

export function LandingInfoPage({ page }: { page: LandingInfoPageKey }) {
  const navigate = useNavigate();
  const transitionTo = useLandingTransitionNavigate();
  const pageRef = useRef<HTMLElement | null>(null);
  const content = infoPages[page];
  const [selectedMode, setSelectedMode] = useState<AgentSettings["personality"]>(() => {
    const storedPersonality = readAgentSettings().personality;
    return tutorPersonalities.includes(storedPersonality) ? storedPersonality : "athena";
  });
  const handleSelectMode = useCallback((personality: AgentSettings["personality"]) => {
    const current = readAgentSettings();
    const next = {
      ...current,
      personality,
    };

    setSelectedMode(personality);
    localStorage.setItem(AGENT_SETTINGS_STORAGE_KEY, JSON.stringify(next));
    void syncTutorPersonality(personality);
  }, []);

  const handleStartChat = () => {
    navigate("/app");
  };

  const handleWaitlistClick = () => {
    if (transitionTo) {
      transitionTo("/");
      return;
    }

    navigate("/");
  };

  useGSAP(() => {
    const root = pageRef.current;
    if (!root) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const copyTargets = Array.from(root.querySelectorAll<HTMLElement>("[data-page-reveal]"));
    const cardTargets = Array.from(root.querySelectorAll<HTMLElement>("[data-page-card]"));
    const allTargets = [...copyTargets, ...cardTargets];
    if (!allTargets.length) return;

    if (prefersReducedMotion) {
      gsap.set(allTargets, { autoAlpha: 1, y: 0, scale: 1 });
      return;
    }

    gsap.set(copyTargets, { autoAlpha: 0, y: 16 });
    gsap.set(cardTargets, { autoAlpha: 0, y: 18, scale: 0.985 });

    gsap.timeline({
      defaults: {
        ease: "power3.out",
      },
    })
      .to(copyTargets, {
        autoAlpha: 1,
        y: 0,
        duration: 0.42,
        stagger: 0.055,
      }, 0.08)
      .to(cardTargets, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.44,
        stagger: 0.045,
      }, 0.18);
  }, { scope: pageRef, dependencies: [page], revertOnUpdate: true });

  return (
    <main ref={pageRef} className="landing landing--page" aria-labelledby={`${page}-page-title`}>
      <LandingBackground />
      <LandingChromeMenu onStart={handleStartChat} onWaitlist={handleWaitlistClick} />

      <section className={`landing__section landing__section--${page} landing__section--page`}>
        {page !== "problem" && page !== "tutors" && (
          <p className="landing__section-kicker">{content.kicker}</p>
        )}
        <div className="landing__section-copy">
          <h1 data-page-reveal id={`${page}-page-title`}>{content.title}</h1>
          <p data-page-reveal>{content.body}</p>
          {page !== "problem" && content.proof.length > 0 && (
            <ul data-page-reveal className="landing__section-proof" aria-label={`${content.kicker} highlights`}>
              {content.proof.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </div>
        {page === "tutors" ? (
          <>
            <TutorFlickDeck selectedMode={selectedMode} onSelect={handleSelectMode} />
            <section data-page-card className="landing__tutor-pricing" aria-labelledby="tutor-pricing-title">
              <div className="landing__tutor-pricing-head">
                <h2 id="tutor-pricing-title">Pricing</h2>
                <p>Plans are built around student habits and uptime.</p>
                <p>Talk to your tutor on demand, or book regular sessions and get a reminder when it is time to study.</p>
              </div>
              <div className="landing__tutor-pricing-grid">
                {tutorPricingPlans.map((plan) => (
                  <article
                    key={plan.name}
                    className={`landing__tutor-price-card${plan.featured ? " is-featured" : ""}`}
                  >
                    <span>{plan.name}</span>
                    <strong>{plan.price}</strong>
                    <p>{plan.hours}</p>
                    <small>{plan.summary}</small>
                    <ul>
                      {plan.includes.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>
          </>
        ) : page !== "problem" ? (
          <div className="landing__mode-grid">
            {content.cards.map((card) => (
              <article key={card.title}>
                <strong>{card.title}</strong>
                <p>{card.body}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="landing__problem-fact-sheet" aria-label="Private tutoring evidence and cost">
            <div className="landing__problem-fact-head">
              <span>What the facts say</span>
              <strong>Private tutoring is effective, but expensive to use regularly.</strong>
            </div>
            <div className="landing__problem-proof">
              {problemProofStats.map((stat) => (
                <article data-page-card key={stat.label}>
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                  <p>{stat.body}</p>
                  <a href={stat.href} target="_blank" rel="noreferrer">
                    Source: {stat.source}
                  </a>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
