import { useRef } from "react";

import { GlassEffect } from "@/components/ui/glass-effect";
import { CustomEase, gsap, useGSAP } from "@/lib/gsap";

export function MobileAppHeader({
  isMenuOpen,
  onMenuToggle,
}: {
  isMenuOpen: boolean;
  onMenuToggle: () => void;
}) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useGSAP(
    () => {
      const button = buttonRef.current;
      if (!button) return;

      const lines = button.querySelectorAll(".mobile-menu-button__line");
      const [line1, line2, line3] = Array.from(lines);
      if (!line1 || !line2 || !line3) return;

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReducedMotion) {
        gsap.set(line1, { opacity: 1, rotate: isMenuOpen ? -45 : 0, scaleX: 1, x: 0, y: isMenuOpen ? "0.38em" : 0 });
        gsap.set(line2, { opacity: isMenuOpen ? 0 : 1, scaleX: isMenuOpen ? 0 : 1, x: 0, y: 0 });
        gsap.set(line3, { opacity: 1, rotate: isMenuOpen ? 45 : 0, scaleX: 1, x: 0, y: isMenuOpen ? "-0.38em" : 0 });
        return;
      }

      CustomEase.create("mobileMenuButton", "0.5, 0.05, 0.05, 0.99");
      const timeline = gsap.timeline({
        defaults: {
          duration: 0.3,
          ease: "mobileMenuButton",
          overwrite: "auto",
        },
      });

      if (isMenuOpen) {
        timeline
          .to(line2, { opacity: 0, scaleX: 0 })
          .to(line1, { x: "-1.3em", opacity: 0 }, "<")
          .to(line3, { x: "1.3em", opacity: 0 }, "<")
          .to([line1, line3], { opacity: 0, duration: 0.1 }, "<+=0.2")
          .set(line1, { rotate: -135, y: "-1.3em", scaleX: 0.9 })
          .set(line3, { rotate: 135, y: "-1.4em", scaleX: 0.9 }, "<")
          .to(line1, { opacity: 1, x: "0em", y: "0.5em" })
          .to(line3, { opacity: 1, x: "0em", y: "-0.25em" }, "<+=0.1");
      } else {
        timeline.to([line1, line2, line3], {
          opacity: 1,
          rotate: 0,
          scaleX: 1,
          x: "0em",
          y: "0em",
          duration: 0.45,
        });
      }
    },
    { dependencies: [isMenuOpen], scope: buttonRef, revertOnUpdate: true },
  );

  return (
    <header className="mobile-app-header" aria-label="Mobile app header">
      <button
        ref={buttonRef}
        type="button"
        className="mobile-menu-button"
        data-menu-button={isMenuOpen ? "close" : "burger"}
        onClick={onMenuToggle}
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        aria-expanded={isMenuOpen}
      >
        <GlassEffect />
        <span className="mobile-menu-button__line" />
        <span className="mobile-menu-button__line" />
        <span className="mobile-menu-button__line" />
      </button>
      <strong>Teach Me</strong>
      <span aria-hidden="true" />
    </header>
  );
}
