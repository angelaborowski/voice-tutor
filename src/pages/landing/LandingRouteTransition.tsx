import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { CustomEase, gsap } from "@/lib/gsap";

const landingRouteLabels: Record<string, string> = {
  "/": "Teach Me",
  "/problem": "The Problem",
  "/tutors": "Meet Tutors",
};

type TransitionNavigate = (target: string) => void;

const LandingTransitionContext = createContext<TransitionNavigate | null>(null);

export function useLandingTransitionNavigate() {
  return useContext(LandingTransitionContext);
}

export function LandingRouteTransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const transitionRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const isTransitioningRef = useRef(false);
  const [label, setLabel] = useState(landingRouteLabels[location.pathname] ?? "Teach Me");

  const transitionTo = useCallback<TransitionNavigate>((target) => {
    const root = transitionRef.current;
    const isLandingTarget = target in landingRouteLabels;
    const isCurrentTarget = target === location.pathname;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isCurrentTarget) {
      window.scrollTo(0, 0);
      return;
    }

    if (!root || !isLandingTarget || prefersReducedMotion) {
      navigate(target);
      window.setTimeout(() => window.scrollTo(0, 0), 0);
      return;
    }

    if (isTransitioningRef.current) return;

    const panels = root.querySelectorAll<HTMLElement>("[data-route-panel]");
    const labelEl = root.querySelector<HTMLElement>("[data-route-label]");
    const nextLabel = landingRouteLabels[target];
    setLabel(nextLabel);
    if (labelEl) {
      labelEl.textContent = nextLabel;
    }

    isTransitioningRef.current = true;
    timelineRef.current?.kill();
    CustomEase.create("landingRoute", "0.76, 0, 0.24, 1");

    gsap.set(root, { autoAlpha: 1, display: "block" });
    gsap.set(panels, { scaleX: 0, transformOrigin: "left center" });
    gsap.set(labelEl, { autoAlpha: 0, yPercent: 28 });

    timelineRef.current = gsap.timeline({
      defaults: {
        ease: "landingRoute",
      },
      onComplete: () => {
        isTransitioningRef.current = false;
        gsap.set(root, { autoAlpha: 0, display: "none" });
      },
      onInterrupt: () => {
        isTransitioningRef.current = false;
      },
    });

    timelineRef.current
      .to(panels, {
        scaleX: 1,
        duration: 0.28,
        stagger: 0.035,
      })
      .to(labelEl, {
        autoAlpha: 1,
        yPercent: 0,
        duration: 0.16,
      }, "<+=0.08")
      .add(() => {
        navigate(target);
        window.scrollTo(0, 0);
      })
      .set(panels, { transformOrigin: "right center" })
      .to(labelEl, {
        autoAlpha: 0,
        yPercent: -26,
        duration: 0.16,
      }, "+=0.02")
      .to(panels, {
        scaleX: 0,
        duration: 0.34,
        stagger: {
          each: 0.035,
          from: "start",
        },
      }, "<");
  }, [location.pathname, navigate]);

  const contextValue = useMemo(() => transitionTo, [transitionTo]);

  useEffect(() => () => {
    timelineRef.current?.kill();
  }, []);

  return (
    <LandingTransitionContext.Provider value={contextValue}>
      {children}
      <div ref={transitionRef} className="landing__route-transition" aria-hidden="true">
        <div className="landing__route-panels">
          <span data-route-panel className="landing__route-panel" />
          <span data-route-panel className="landing__route-panel" />
          <span data-route-panel className="landing__route-panel" />
        </div>
        <span data-route-label className="landing__route-label">{label}</span>
      </div>
    </LandingTransitionContext.Provider>
  );
}
