import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export function StrategySelector({
  strategies,
  selectedStrategyId,
  onSelectStrategy,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const currentStrategy = strategies[selectedStrategyId];
  const { inputs } = currentStrategy;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const strategyList = [
    { id: 'LONG_CALL', name: 'Long Call' },
    { id: 'BULL_CALL_SPREAD', name: 'Bull Call Spread' },
    { id: 'SHORT_STRADDLE', name: 'Short Straddle' },
  ];

  const handleSelect = (id) => {
    onSelectStrategy(id);
    setIsOpen(false);
  };

  return (
    <section className="strategy-selection-section" aria-label="Strategy Selection Section">
      {/* Section Title */}
      <div className="section-header">
        <h2 className="section-title">Choose a Strategy</h2>
      </div>

      <div className="selection-card">
        {/* Strategy Dropdown */}
        <div className="dropdown-container" ref={dropdownRef}>
          <div
            className={`custom-dropdown-trigger ${isOpen ? 'active' : ''}`}
            onClick={() => setIsOpen(!isOpen)}
            role="button"
            tabIndex={0}
          >
            <div className="current-strat-name">{currentStrategy.name}</div>
            <div className="trigger-arrow">
              <ChevronDown className={`chevron-icon ${isOpen ? 'rotated' : ''}`} size={20} />
            </div>
          </div>

          {isOpen && (
            <div className="dropdown-menu-list">
              {strategyList.map((item) => (
                <div
                  key={item.id}
                  className={`dropdown-option-item ${item.id === selectedStrategyId ? 'selected' : ''}`}
                  onClick={() => handleSelect(item.id)}
                >
                  <span className="option-name">{item.name}</span>
                  {item.id === selectedStrategyId && <Check size={18} className="option-check" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trade Setup Pre-filled Inputs */}
        <div className="trade-setup-strip">
          {selectedStrategyId === 'LONG_CALL' && (
            <>
              <div className="setup-metric-item">
                <span className="setup-label">Underlying:</span>
                <span className="setup-val">{inputs.underlying} ({inputs.spot})</span>
              </div>
              <div className="setup-metric-item">
                <span className="setup-label">Strike:</span>
                <span className="setup-val">{inputs.strike}</span>
              </div>
              <div className="setup-metric-item">
                <span className="setup-label">Premium Paid:</span>
                <span className="setup-val">{inputs.premium}</span>
              </div>
              <div className="setup-metric-item">
                <span className="setup-label">Sample Quantity:</span>
                <span className="setup-val">{inputs.quantity}</span>
              </div>
            </>
          )}

          {selectedStrategyId === 'BULL_CALL_SPREAD' && (
            <>
              <div className="setup-metric-item">
                <span className="setup-label">Lower Strike A:</span>
                <span className="setup-val">{inputs.strikeA}</span>
              </div>
              <div className="setup-metric-item">
                <span className="setup-label">Higher Strike B:</span>
                <span className="setup-val">{inputs.strikeB}</span>
              </div>
              <div className="setup-metric-item">
                <span className="setup-label">Premium Paid A:</span>
                <span className="setup-val">{inputs.premiumA}</span>
              </div>
              <div className="setup-metric-item">
                <span className="setup-label">Premium Recv B:</span>
                <span className="setup-val">{inputs.premiumB}</span>
              </div>
              <div className="setup-metric-item">
                <span className="setup-label">Net Cost:</span>
                <span className="setup-val">{inputs.netCost}</span>
              </div>
              <div className="setup-metric-item">
                <span className="setup-label">Quantity:</span>
                <span className="setup-val">{inputs.quantity}</span>
              </div>
            </>
          )}

          {selectedStrategyId === 'SHORT_STRADDLE' && (
            <>
              <div className="setup-metric-item">
                <span className="setup-label">Strike A:</span>
                <span className="setup-val">{inputs.strikeA} (ATM)</span>
              </div>
              <div className="setup-metric-item">
                <span className="setup-label">Call Premium Recv:</span>
                <span className="setup-val">{inputs.callPremium}</span>
              </div>
              <div className="setup-metric-item">
                <span className="setup-label">Put Premium Recv:</span>
                <span className="setup-val">{inputs.putPremium}</span>
              </div>
              <div className="setup-metric-item">
                <span className="setup-label">Net Premium:</span>
                <span className="setup-val">{inputs.netPremium}</span>
              </div>
              <div className="setup-metric-item">
                <span className="setup-label">Quantity:</span>
                <span className="setup-val">{inputs.quantity}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
