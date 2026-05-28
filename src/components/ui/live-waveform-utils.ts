type ProcessingWaveformMode = "scrolling" | "static";

type ProcessingWaveformOptions = {
  barCount: number;
  lastActiveData: number[];
  mode: ProcessingWaveformMode;
  time: number;
  transitionProgress: number;
};

export function buildProcessingWaveformData({
  barCount,
  lastActiveData,
  mode,
  time,
  transitionProgress,
}: ProcessingWaveformOptions) {
  const data: number[] = [];
  const halfCount = Math.floor(barCount / 2);

  for (let i = 0; i < barCount; i++) {
    const normalizedPosition = mode === "static"
      ? (i - halfCount) / halfCount
      : (i - barCount / 2) / (barCount / 2);
    const centerWeight = 1 - Math.abs(normalizedPosition) * 0.4;
    const wave1 = Math.sin(time * 1.5 + normalizedPosition * 3) * 0.25;
    const wave2 = Math.sin(time * 0.8 - normalizedPosition * 2) * 0.2;
    const wave3 = Math.cos(time * 2 + normalizedPosition) * 0.15;
    const processingValue = (0.2 + wave1 + wave2 + wave3) * centerWeight;

    let finalValue = processingValue;
    if (lastActiveData.length > 0 && transitionProgress < 1) {
      const lastDataIndex = mode === "static"
        ? Math.min(i, lastActiveData.length - 1)
        : Math.floor((i / barCount) * lastActiveData.length);
      finalValue =
        (lastActiveData[lastDataIndex] || 0) * (1 - transitionProgress) +
        processingValue * transitionProgress;
    }

    data.push(Math.max(0.05, Math.min(1, finalValue)));
  }

  return data;
}
