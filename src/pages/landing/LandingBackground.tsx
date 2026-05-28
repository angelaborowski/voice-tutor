import { useEffect, useState } from "react";

import DarkVeil from "@/components/DarkVeil";

export function LandingBackground({ hueShift = 0 }: { hueShift?: number }) {
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setIsReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  if (isReducedMotion) {
    return <div className="landing__veil-fallback" aria-hidden="true" />;
  }

  return (
    <div className="landing__veil" aria-hidden="true">
      <DarkVeil
        hueShift={hueShift}
        noiseIntensity={0.02}
        scanlineIntensity={0.02}
        scanlineFrequency={0.7}
        speed={0.46}
        warpAmount={0.08}
        resolutionScale={1}
      />
    </div>
  );
}
