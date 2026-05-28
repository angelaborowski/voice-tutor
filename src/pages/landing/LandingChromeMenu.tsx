import { MailPlus, Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { CustomEase, gsap, useGSAP } from "@/lib/gsap";
import { landingNavItems } from "./data";
import { useLandingTransitionNavigate } from "./LandingRouteTransition";

export function LandingChromeMenu({ onStart, onWaitlist }: { onStart: () => void; onWaitlist?: () => void }) {
  const navigate = useNavigate();
  const transitionTo = useLandingTransitionNavigate();
  const navRef = useRef<HTMLDivElement | null>(null);
  const sidenavTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useGSAP(() => {
    const root = navRef.current;
    const navWrap = root?.querySelector<HTMLElement>("[data-sidenav-wrap]");
    const overlay = root?.querySelector<HTMLElement>("[data-sidenav-overlay]");
    const menu = root?.querySelector<HTMLElement>("[data-sidenav-menu]");
    const bgPanels = root?.querySelectorAll<HTMLElement>("[data-sidenav-panel]");
    const menuLinks = root?.querySelectorAll<HTMLElement>("[data-sidenav-link]");
    const fadeTargets = root?.querySelectorAll<HTMLElement>("[data-sidenav-fade]");
    const menuButtonTexts = root?.querySelectorAll<HTMLElement>("[data-sidenav-label]");
    const menuButtonIcon = root?.querySelector<HTMLElement>("[data-sidenav-icon]");

    if (!navWrap || !overlay || !menu || !bgPanels || !menuLinks || !fadeTargets || !menuButtonTexts || !menuButtonIcon) {
      return;
    }

    CustomEase.create("sideNav", "0.65, 0.01, 0.05, 0.99");

    gsap.set(navWrap, { display: "none" });
    gsap.set(menu, { xPercent: 120 });
    gsap.set(overlay, { autoAlpha: 0 });
    gsap.set(bgPanels, { xPercent: 101 });
    gsap.set(menuLinks, { yPercent: 140, rotation: 10 });
    gsap.set(fadeTargets, { autoAlpha: 0, yPercent: 50 });
    gsap.set(menuButtonTexts, { yPercent: 0 });
    gsap.set(menuButtonIcon, { rotation: 0 });

    const timeline = gsap.timeline({
      paused: true,
      defaults: {
        ease: "sideNav",
        duration: 0.7,
      },
      onStart: () => {
        navWrap.setAttribute("data-nav-state", "open");
        gsap.set(navWrap, { display: "block" });
      },
      onReverseComplete: () => {
        navWrap.setAttribute("data-nav-state", "closed");
        gsap.set(navWrap, { display: "none" });
      },
    });

    timeline
      .to(menu, { xPercent: 0 })
      .to(menuButtonTexts, { yPercent: -100, stagger: 0.08 }, "<")
      .to(menuButtonIcon, { rotation: 315 }, "<")
      .to(overlay, { autoAlpha: 1 }, "<")
      .to(bgPanels, { xPercent: 0, stagger: 0.12, duration: 0.58 }, "<")
      .to(menuLinks, { yPercent: 0, rotation: 0, stagger: 0.055 }, "<+=0.28")
      .to(fadeTargets, { autoAlpha: 1, yPercent: 0, stagger: 0.045 }, "<+=0.18");

    sidenavTimelineRef.current = timeline;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      sidenavTimelineRef.current = null;
    };
  }, { scope: navRef });

  useEffect(() => {
    const timeline = sidenavTimelineRef.current;
    if (!timeline) return;

    if (isMenuOpen) {
      timeline.play();
    } else {
      timeline.reverse();
    }
  }, [isMenuOpen]);

  const handleLandingNav = (target: string) => {
    if (target === "start") {
      setIsMenuOpen(false);
      onStart();
      return;
    }

    setIsMenuOpen(false);
    window.setTimeout(() => {
      if (transitionTo) {
        transitionTo(target);
        return;
      }

      navigate(target);
    }, 80);
  };

  const handleLogoClick = () => {
    if (transitionTo) {
      transitionTo("/");
      return;
    }

    navigate("/");
  };

  return (
    <div ref={navRef} className="landing__nav-shell">
      <header className="landing__chrome">
        <button type="button" className="landing__logo landing__logo-button" onClick={handleLogoClick}>
          <strong>Teach Me</strong>
        </button>
        <div className="landing__chrome-actions">
          <button
            type="button"
            className="landing__waitlist-link"
            onClick={onWaitlist ?? (() => navigate("/"))}
            aria-label="Get first access to Teach Me"
          >
            <MailPlus size={16} strokeWidth={2.2} />
            <span>Want in?</span>
          </button>
          <button
            type="button"
            data-sidenav-toggle
            data-sidenav-button
            className="sidenav__button"
            onClick={() => setIsMenuOpen((value) => !value)}
            aria-expanded={isMenuOpen}
          >
            <div className="sidenav__button-text">
              <p data-sidenav-label className="sidenav__button-label">Menu</p>
              <p data-sidenav-label className="sidenav__button-label">Close</p>
            </div>
            <div data-sidenav-icon className="sidenav__button-icon">
              <Menu size={21} />
            </div>
          </button>
        </div>
      </header>

      <div data-sidenav-wrap data-nav-state="closed" className="sidenav__nav">
        <button
          type="button"
          data-sidenav-overlay
          data-sidenav-toggle
          className="sidenav__overlay"
          onClick={() => setIsMenuOpen(false)}
          aria-label="Close menu"
        />
        <nav data-lenis-prevent data-sidenav-menu className="sidenav__menu" aria-label="Landing menu">
          <div className="sidenav__menu-bg" aria-hidden="true">
            <div data-sidenav-panel className="sidenav__menu-bg-panel is--athena" />
            <div data-sidenav-panel className="sidenav__menu-bg-panel is--apollo" />
            <div data-sidenav-panel className="sidenav__menu-bg-panel is--hermes" />
            <div data-sidenav-panel className="sidenav__menu-bg-panel is--socrates" />
            <div data-sidenav-panel className="sidenav__menu-bg-panel is--hestia" />
            <div data-sidenav-panel className="sidenav__menu-bg-panel is--ares" />
            <div data-sidenav-panel className="sidenav__menu-bg-panel is--spectrum" />
          </div>
          <div className="sidenav__menu-inner">
            <ul className="sidenav__menu-list">
              {landingNavItems.map(([label, eyebrow, target]) => (
                <li className="sidenav__menu-list-item" key={label}>
                  <button
                    type="button"
                    data-sidenav-link
                    className="sidenav__menu-link"
                    onClick={() => handleLandingNav(target)}
                  >
                    <span className="sidenav__menu-link-heading">{label}</span>
                    <span className="sidenav__menu-link-eyebrow">{eyebrow}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </div>
  );
}
