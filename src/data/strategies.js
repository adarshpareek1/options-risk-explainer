// Pre-trade Options Risk Explainer Strategy Definitions with Realistic INR Data & Exact Formulas

export const STRATEGIES = {
  LONG_CALL: {
    id: 'LONG_CALL',
    name: 'Long Call',
    inputs: {
      underlying: 'Nifty 50',
      spot: '24,000',
      strike: '24,000 Call',
      premium: '₹60 per unit (₹6,000 / lot)',
      quantity: '1 Lot (100 units)',
    },
    // Formulas: Max Loss = Premium, Max Profit = 'Unlimited', Breakeven = Strike + Premium
    metrics: {
      maxProfit: 'Unlimited',
      maxLoss: '₹6,000',
      breakeven: '24,060',
    },
    summary:
      'You could lose up to ₹6,000 if Nifty ends at or below 24,000 at expiry. You start making money above 24,060.',
    chartConfig: {
      currency: '₹',
      minSpot: 23600,
      maxSpot: 24500,
      strike: 24000,
      breakevens: [24060],
      calcPayoff: (spot) => {
        // Payoff = (max(0, spot - 24000) - 60) * 100
        const intrinsic = Math.max(0, spot - 24000);
        return (intrinsic - 60) * 100;
      },
    },
  },

  BULL_CALL_SPREAD: {
    id: 'BULL_CALL_SPREAD',
    name: 'Bull Call Spread',
    // Required inputs: Lower Strike A, Higher Strike B, Premium Paid A, Premium Received B
    inputs: {
      underlying: 'Nifty 50',
      strikeA: '24,000',
      strikeB: '24,300',
      premiumA: '₹90',
      premiumB: '₹30',
      netCost: '₹60 (₹6,000 / lot)',
      quantity: '1 Lot (100 units)',
    },
    // Formulas:
    // Net Cost = Premium A - Premium B (90 - 30 = 60)
    // Max Loss = Net Cost (60 * 100 = ₹6,000)
    // Max Profit = (Strike B - Strike A) - Net Cost ((24300 - 24000) - 60 = 240 * 100 = ₹24,000)
    // Breakeven = Strike A + Net Cost (24000 + 60 = 24,060)
    metrics: {
      maxProfit: '₹24,000',
      maxLoss: '₹6,000',
      breakeven: '24,060',
    },
    summary:
      'You could lose up to ₹6,000 if Nifty ends at or below 24,000 at expiry, and you make profit above 24,060 with your maximum profit capped at ₹24,000 at or above 24,300.',
    chartConfig: {
      currency: '₹',
      minSpot: 23600,
      maxSpot: 24500,
      strikeLow: 24000,
      strikeHigh: 24300,
      breakevens: [24060],
      calcPayoff: (spot) => {
        const longPayoff = Math.max(0, spot - 24000);
        const shortPayoff = Math.max(0, spot - 24300);
        return (longPayoff - shortPayoff - 60) * 100;
      },
    },
  },

  SHORT_STRADDLE: {
    id: 'SHORT_STRADDLE',
    name: 'Short Straddle',
    // Required inputs: Strike A, Call Premium Received, Put Premium Received
    inputs: {
      underlying: 'Nifty 50',
      strikeA: '24,000',
      callPremium: '₹80',
      putPremium: '₹60',
      netPremium: '₹140 (₹14,000 / lot)',
      quantity: '1 Lot (100 units)',
    },
    // Formulas:
    // Net Premium = Call + Put (80 + 60 = 140)
    // Max Profit = Net Premium (140 * 100 = ₹14,000)
    // Max Loss = 'Unlimited'
    // Breakevens = Strike A + Net Premium (24000 + 140 = 24,140) AND Strike A - Net Premium (24000 - 140 = 23,860)
    metrics: {
      maxProfit: '₹14,000',
      maxLoss: 'Unlimited',
      breakeven: '23,860 & 24,140',
    },
    summary:
      'You make a maximum profit of ₹14,000 if Nifty ends at 24,000 at expiry and remain in profit between 23,860 and 24,140, but you incur unlimited losses if Nifty moves outside this range.',
    chartConfig: {
      currency: '₹',
      minSpot: 23500,
      maxSpot: 24500,
      strike: 24000,
      breakevens: [23860, 24140],
      calcPayoff: (spot) => {
        const callLoss = Math.max(0, spot - 24000);
        const putLoss = Math.max(0, 24000 - spot);
        return (140 - callLoss - putLoss) * 100;
      },
    },
  },
};
