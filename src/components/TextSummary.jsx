import React from 'react';

export function TextSummary({ strategy }) {
  return (
    <section className="text-summary-section" aria-label="Summary Section">
      {/* Section Title */}
      <div className="section-header">
        <h2 className="section-title">Summary</h2>
      </div>

      <div className="summary-card-clean">
        <p className="summary-single-sentence">
          {strategy.summary}
        </p>
      </div>
    </section>
  );
}
