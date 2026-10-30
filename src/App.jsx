import React, { useState } from 'react';
import { STRATEGIES } from './data/strategies';
import { Header } from './components/Header';
import { StrategySelector } from './components/StrategySelector';
import { MetricCards } from './components/MetricCards';
import { ChartSection } from './components/ChartSection';
import { TextSummary } from './components/TextSummary';
import './App.css';

export function App() {
  const [selectedStrategyId, setSelectedStrategyId] = useState('LONG_CALL');

  const currentStrategy = STRATEGIES[selectedStrategyId];

  return (
    <div className="fintech-app-shell">
      <div className="app-container">
        {/* 1. Top Component: App Name Only */}
        <Header />

        {/* 2. Second Component: Strategy Dropdown + Pre-filled Trade Setup Metrics */}
        <StrategySelector
          strategies={STRATEGIES}
          selectedStrategyId={selectedStrategyId}
          onSelectStrategy={setSelectedStrategyId}
        />

        {/* 3. Three Large Metric Cards: Max Profit, Max Loss, Breakeven (Icon, Name, Value) */}
        <MetricCards strategy={currentStrategy} />

        {/* 4. Payoff Curve with Green Profit Area, Red Loss Area, and Breakeven Point */}
        <ChartSection strategy={currentStrategy} />

        {/* 5. Summary Component: Single Sentence Explaining Profit/Loss Conditions */}
        <TextSummary strategy={currentStrategy} />
      </div>
    </div>
  );
}

export default App;
