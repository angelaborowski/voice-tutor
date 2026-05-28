import { ChevronRight, Home, MessageCircle } from "lucide-react";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

import { syncTutorPersonality } from "@/features/tutor/api/client";
import { AGENT_SETTINGS_STORAGE_KEY, readAgentSettings, type AgentSettings } from "@/features/tutor/domain/settings";
import { infoPages, tutorPersonalities, type LandingInfoPageKey } from "./data";
import { LandingBackground } from "./LandingBackground";
import { LandingChromeMenu } from "./LandingChromeMenu";
import { ProblemCostBreakdown, StudyPackPreview } from "./LandingPreviews";
import { TutorFlickDeck } from "./TutorFlickDeck";

export function LandingInfoPage({ page }: { page: LandingInfoPageKey }) {
  const navigate = useNavigate();
  const content = infoPages[page];
  const [selectedMode, setSelectedMode] = useState<AgentSettings["personality"]>(() => {
    const storedPersonality = readAgentSettings().personality;
    return tutorPersonalities.includes(storedPersonality) ? storedPersonality : "athena";
  });
  const cardClassName = page === "problem"
    ? "landing__insight-grid"
    : page === "tutors"
      ? "landing__mode-grid"
      : "landing__pack-grid";

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
      <LandingChromeMenu onStart={handleStartChat} />

      <section className={`landing__section landing__section--${page} landing__section--page`}>
        {page !== "problem" && (
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
          {page === "pack" && (
            <div className="landing__section-actions">
              <button type="button" className="landing__section-action is-primary" onClick={handleStartChat}>
                <MessageCircle size={18} strokeWidth={2.2} aria-hidden="true" />
                <span>Start chat</span>
                <ChevronRight size={17} strokeWidth={2.4} aria-hidden="true" />
              </button>
              <button type="button" className="landing__section-action" onClick={() => navigate("/")}>
                <Home size={17} strokeWidth={2.2} aria-hidden="true" />
                <span>Home</span>
              </button>
            </div>
          )}
        </div>
        {page === "tutors" ? (
          <TutorFlickDeck selectedMode={selectedMode} onSelect={handleSelectMode} />
        ) : page === "problem" ? (
          <ProblemCostBreakdown />
        ) : (
          <>
            {page === "pack" && <StudyPackPreview />}
            <div className={cardClassName}>
              {content.cards.map((card) => (
                <article key={card.title}>
                  <strong>{card.title}</strong>
                  <p>{card.body}</p>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
