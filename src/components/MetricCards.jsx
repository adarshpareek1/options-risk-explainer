import React from 'react';
import { TrendingUp, TrendingDown, Target, AlertTriangle, Sparkles, ShieldCheck } from 'lucide-react';

export function MetricCards({ strategy }) {
  const { maxProfit, maxLoss, breakeven } = strategy.metrics;
  const isUnlimitedProfit = maxProfit === 'Unlimited';
  const isUnlimitedLoss = maxLoss === 'Unlimited';

  return (
    <section className="metric-cards-section" aria-label="Key Risk Metrics Section">
      {/* Section Title */}
      <div className="section-header">
        <h2 className="section-title">Key Risk Metrics</h2>
      </div>

      <div className="metric-cards-container">
        {/* Max Profit Card */}
        <div className={`metric-card profit-card ${isUnlimitedProfit ? 'unlimited-profit-card' : ''}`}>
          <div className="card-header-clean">
            <div className={`metric-icon-bubble ${isUnlimitedProfit ? 'profit-bubble-glow' : 'profit-bubble'}`}>
              <TrendingUp size={22} />
            </div>
            <span className="card-title-clean">Max Profit</span>
            {isUnlimitedProfit ? (
              <span className="unlimited-pill profit-pill">
                <Sparkles size={11} className="inline-icon" /> UNLIMITED
              </span>
            ) : (
              <span className="capped-pill">CAPPED</span>
            )}
          </div>
          <div className={`metric-big-number mono ${isUnlimitedProfit ? 'text-emerald-unlimited' : 'text-emerald'}`}>
            {isUnlimitedProfit ? (
              <span className="unlimited-val-wrap">
                <span className="infinity-glyph">∞</span> Unlimited
              </span>
            ) : (
              maxProfit
            )}
          </div>
        </div>

        {/* Max Loss Card */}
        <div className={`metric-card loss-card ${isUnlimitedLoss ? 'unlimited-danger-card' : ''}`}>
          <div className="card-header-clean">
            <div className={`metric-icon-bubble ${isUnlimitedLoss ? 'danger-bubble-glow pulse' : 'loss-bubble'}`}>
              {isUnlimitedLoss ? <AlertTriangle size={22} /> : <TrendingDown size={22} />}
            </div>
            <span className="card-title-clean">Max Loss</span>
            {isUnlimitedLoss ? (
              <span className="unlimited-pill danger-pill pulse-badge">
                <AlertTriangle size={11} className="inline-icon" /> UNDEFINED RISK
              </span>
            ) : (
              <span className="capped-pill safe-pill">DEFINED RISK</span>
            )}
          </div>
          <div className={`metric-big-number mono ${isUnlimitedLoss ? 'text-danger-unlimited' : 'text-danger'}`}>
            {isUnlimitedLoss ? (
              <span className="unlimited-val-wrap">
                <span className="infinity-glyph">∞</span> Unlimited
              </span>
            ) : (
              maxLoss
            )}
          </div>
        </div>

        {/* Breakeven Card */}
        <div className="metric-card breakeven-card">
          <div className="card-header-clean">
            <div className="metric-icon-bubble target-bubble">
              <Target size={22} />
            </div>
            <span className="card-title-clean">Breakeven</span>
            <span className="target-pill">THRESHOLD</span>
          </div>
          <div className="metric-big-number mono text-cyan">{breakeven}</div>
        </div>
      </div>
    </section>
  );
}
