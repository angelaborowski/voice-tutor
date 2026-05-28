import { problemAccessTiers, problemCostComparison, problemLifestyleEquivalents, studyPackArtifacts } from "./data";

export function ProblemCostBreakdown() {
  return (
    <div className="landing__problem-breakdown" aria-label="Tutoring cost comparison">
      <div className="landing__problem-cost-grid">
        {problemCostComparison.map((item, index) => (
          <article key={item.label} className="landing__problem-cost-card">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <p>{item.detail}</p>
            {index < problemCostComparison.length - 1 && (
              <b aria-hidden="true">→</b>
            )}
          </article>
        ))}
      </div>

      <div className="landing__problem-equivalents" aria-label="Monthly tutoring cost in everyday terms">
        <span>£160 a month is roughly</span>
        <div>
          {problemLifestyleEquivalents.map((item) => (
            <p key={item.label}>
              <strong>{item.value}</strong>
              <small>{item.label}</small>
            </p>
          ))}
        </div>
      </div>

      <div className="landing__problem-solution">
        <span>What Teach Me costs</span>
        <div>
          {problemAccessTiers.map((tier) => (
            <article className="landing__problem-price-card" key={tier.label}>
              <span>{tier.label}</span>
              <strong>{tier.price}</strong>
              <p>{tier.access}</p>
              <small>{tier.note}</small>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export function StudyPackPreview() {
  return (
    <div className="landing__pack-preview" aria-label="Generated learning pack preview">
      <div className="landing__pack-sheet">
        <div className="landing__pack-sheet-head">
          <span>Generated Pack</span>
          <strong>Photosynthesis answer drill</strong>
        </div>
        <div className="landing__pack-sheet-lines" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <div className="landing__pack-sheet-grid">
          {studyPackArtifacts.map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
