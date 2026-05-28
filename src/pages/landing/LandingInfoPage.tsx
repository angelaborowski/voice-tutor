import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

import { syncTutorPersonality } from "@/features/tutor/api/client";
import { AGENT_SETTINGS_STORAGE_KEY, readAgentSettings, type AgentSettings } from "@/features/tutor/domain/settings";
import { infoPages, tutorPersonalities, tutorPricingPlans, type LandingInfoPageKey } from "./data";
import { LandingBackground } from "./LandingBackground";
import { LandingChromeMenu } from "./LandingChromeMenu";
import { TutorFlickDeck } from "./TutorFlickDeck";

export function LandingInfoPage({ page }: { page: LandingInfoPageKey }) {
  const navigate = useNavigate();
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

  return (
    <main className="landing landing--page" aria-labelledby={`${page}-page-title`}>
      <LandingBackground />
      <LandingChromeMenu onStart={handleStartChat} onWaitlist={() => navigate("/")} />

      <section className={`landing__section landing__section--${page} landing__section--page`}>
        {page !== "problem" && page !== "tutors" && (
          <p className="landing__section-kicker">{content.kicker}</p>
        )}
        <div className="landing__section-copy">
          <h1 id={`${page}-page-title`}>{content.title}</h1>
          <p>{content.body}</p>
          {page !== "problem" && content.proof.length > 0 && (
            <ul className="landing__section-proof" aria-label={`${content.kicker} highlights`}>
              {content.proof.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </div>
        {page === "tutors" ? (
          <>
            <TutorFlickDeck selectedMode={selectedMode} onSelect={handleSelectMode} />
            <section className="landing__tutor-pricing" aria-labelledby="tutor-pricing-title">
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
        ) : null}
      </section>
    </main>
  );
}
