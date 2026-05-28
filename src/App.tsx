import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

const LandingPage = lazy(() =>
  import("@/pages/landing").then((module) => ({ default: module.LandingPage })),
);
const LandingInfoPage = lazy(() =>
  import("@/pages/landing").then((module) => ({ default: module.LandingInfoPage })),
);
const VoiceTutorApp = lazy(() =>
  import("@/features/tutor/VoiceTutorApp").then((module) => ({ default: module.VoiceTutorApp })),
);
const StudyPackDemoPage = lazy(() =>
  import("@/features/tutor/StudyPackDemoPage").then((module) => ({ default: module.StudyPackDemoPage })),
);

export default function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/problem" element={<LandingInfoPage page="problem" />} />
        <Route path="/tutors" element={<LandingInfoPage page="tutors" />} />
        <Route path="/demo-pack" element={<StudyPackDemoPage />} />
        <Route path="/app" element={<VoiceTutorApp />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </Suspense>
  );
}
