import React, { useMemo } from 'react';

export function ChartSection({ strategy }) {
  const { chartConfig } = strategy;
  const { minSpot, maxSpot, breakevens, calcPayoff } = chartConfig;

  // ViewBox dimensions - high resolution coordinate space
  const svgW = 1000;
  const svgH = 390;
  const padding = { top: 55, right: 60, bottom: 65, left: 95 };
  const plotW = svgW - padding.left - padding.right;
  const plotH = svgH - padding.top - padding.bottom;

  // Calculate coordinates, paths, and annotations
  const {
    points,
    zeroY,
    breakevenCoords,
    profitPath,
    lossPath,
    curvePath,
  } = useMemo(() => {
    const stepCount = 120;
    const step = (maxSpot - minSpot) / stepCount;

    const data = [];
    let highest = -Infinity;
    let lowest = Infinity;

    for (let s = minSpot; s <= maxSpot; s += step) {
      const pnl = calcPayoff(s);
      data.push({ spot: s, pnl });
      if (pnl > highest) highest = pnl;
      if (pnl < lowest) lowest = pnl;
    }

    // Vertical scale with comfortable headroom
    const absMax = Math.max(Math.abs(highest), Math.abs(lowest), 8000);
    const upperY = absMax * 1.25;
    const lowerY = -absMax * 1.25;

    const getX = (spotVal) => padding.left + ((spotVal - minSpot) / (maxSpot - minSpot)) * plotW;
    const getY = (pnlVal) => padding.top + plotH - ((pnlVal - lowerY) / (upperY - lowerY)) * plotH;

    const zeroCoordY = getY(0);

    const mappedPoints = data.map((d) => ({
      ...d,
      x: getX(d.spot),
      y: getY(d.pnl),
    }));

    // Generate main payoff line path
    const mainLine = mappedPoints.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}` : `${acc} L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
    }, '');

    // Breakeven coordinates
    const beMarkers = breakevens.map((be) => ({
      price: be,
      x: getX(be),
      y: zeroCoordY,
    }));

    // Polygon paths for Profit and Loss
    let pPath = '';
    let lPath = '';

    if (strategy.id === 'LONG_CALL') {
      const beX = getX(24060);
      const profitPts = mappedPoints.filter((p) => p.spot >= 24060);
      const lossPts = mappedPoints.filter((p) => p.spot <= 24060);

      pPath = `M ${beX.toFixed(1)} ${zeroCoordY.toFixed(1)} ` +
        profitPts.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') +
        ` L ${getX(maxSpot).toFixed(1)} ${zeroCoordY.toFixed(1)} Z`;

      lPath = `M ${getX(minSpot).toFixed(1)} ${zeroCoordY.toFixed(1)} ` +
        lossPts.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') +
        ` L ${beX.toFixed(1)} ${zeroCoordY.toFixed(1)} Z`;
    } else if (strategy.id === 'BULL_CALL_SPREAD') {
      const beX = getX(24060);
      const profitPts = mappedPoints.filter((p) => p.spot >= 24060);
      const lossPts = mappedPoints.filter((p) => p.spot <= 24060);

      pPath = `M ${beX.toFixed(1)} ${zeroCoordY.toFixed(1)} ` +
        profitPts.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') +
        ` L ${getX(maxSpot).toFixed(1)} ${zeroCoordY.toFixed(1)} Z`;

      lPath = `M ${getX(minSpot).toFixed(1)} ${zeroCoordY.toFixed(1)} ` +
        lossPts.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') +
        ` L ${beX.toFixed(1)} ${zeroCoordY.toFixed(1)} Z`;
    } else if (strategy.id === 'SHORT_STRADDLE') {
      const lowerBeX = getX(23860);
      const upperBeX = getX(24140);
      const profitPts = mappedPoints.filter((p) => p.spot >= 23860 && p.spot <= 24140);
      const leftLossPts = mappedPoints.filter((p) => p.spot <= 23860);
      const rightLossPts = mappedPoints.filter((p) => p.spot >= 24140);

      pPath = `M ${lowerBeX.toFixed(1)} ${zeroCoordY.toFixed(1)} ` +
        profitPts.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') +
        ` L ${upperBeX.toFixed(1)} ${zeroCoordY.toFixed(1)} Z`;

      const leftLoss = `M ${getX(minSpot).toFixed(1)} ${zeroCoordY.toFixed(1)} ` +
        leftLossPts.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') +
        ` L ${lowerBeX.toFixed(1)} ${zeroCoordY.toFixed(1)} Z`;

      const rightLoss = `M ${upperBeX.toFixed(1)} ${zeroCoordY.toFixed(1)} ` +
        rightLossPts.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') +
        ` L ${getX(maxSpot).toFixed(1)} ${zeroCoordY.toFixed(1)} Z`;

      lPath = `${leftLoss} ${rightLoss}`;
    }

    return {
      points: mappedPoints,
      zeroY: zeroCoordY,
      breakevenCoords: beMarkers,
      profitPath: pPath,
      lossPath: lPath,
      curvePath: mainLine,
      getX,
      getY,
    };
  }, [chartConfig, minSpot, maxSpot, breakevens, calcPayoff, strategy.id]);

  return (
    <section className="chart-wrapper-section" aria-label="Payoff Curve Section">
      {/* Section Title */}
      <div className="section-header">
        <h2 className="section-title">Payoff Curve</h2>
      </div>

      <div className="chart-card">
        {/* SVG Payoff Visualization */}
        <div className="chart-canvas-container">
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="payoff-svg-crisp"
            shapeRendering="geometricPrecision"
            textRendering="geometricPrecision"
          >
            <defs>
              {/* Rich Emerald Profit Area Gradient */}
              <linearGradient id="profitEmeraldGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
              </linearGradient>

              {/* Rich Crimson Loss Area Gradient */}
              <linearGradient id="lossCrimsonGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.35" />
              </linearGradient>

              {/* Curve Shadow Filter */}
              <filter id="curveShadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000000" floodOpacity="0.5" />
              </filter>
            </defs>

            {/* Background Grid Lines */}
            <line
              x1={padding.left}
              y1={zeroY - 70}
              x2={svgW - padding.right}
              y2={zeroY - 70}
              stroke="rgba(255, 255, 255, 0.05)"
              strokeDasharray="4,4"
              vectorEffect="non-scaling-stroke"
            />
            <line
              x1={padding.left}
              y1={zeroY + 70}
              x2={svgW - padding.right}
              y2={zeroY + 70}
              stroke="rgba(255, 255, 255, 0.05)"
              strokeDasharray="4,4"
              vectorEffect="non-scaling-stroke"
            />

            {/* Zero P&L Axis Baseline */}
            <line
              x1={padding.left}
              y1={zeroY}
              x2={svgW - padding.right}
              y2={zeroY}
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth="1.5"
              strokeDasharray="6,4"
              vectorEffect="non-scaling-stroke"
            />

            {/* Y-Axis Directional Labels */}
            <text
              x={padding.left - 12}
              y={padding.top + 15}
              fill="#10b981"
              fontSize="13"
              fontWeight="800"
              textAnchor="end"
              className="mono"
            >
              ▲ PROFIT (₹)
            </text>
            <text
              x={padding.left - 12}
              y={zeroY + 4}
              fill="#ffffff"
              fontSize="12"
              fontWeight="700"
              textAnchor="end"
              className="mono"
            >
              ₹0
            </text>
            <text
              x={padding.left - 12}
              y={svgH - padding.bottom - 10}
              fill="#f43f5e"
              fontSize="13"
              fontWeight="800"
              textAnchor="end"
              className="mono"
            >
              ▼ LOSS (₹)
            </text>

            {/* Shaded Profit Area (Green) */}
            {profitPath && (
              <path
                d={profitPath}
                fill="url(#profitEmeraldGlow)"
                stroke="#10b981"
                strokeWidth="1"
                strokeOpacity="0.4"
              />
            )}

            {/* Shaded Loss Area (Red) */}
            {lossPath && (
              <path
                d={lossPath}
                fill="url(#lossCrimsonGlow)"
                stroke="#f43f5e"
                strokeWidth="1"
                strokeOpacity="0.4"
              />
            )}

            {/* Main Payoff Line (Sky Cyan) */}
            <path
              d={curvePath}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#curveShadow)"
              vectorEffect="non-scaling-stroke"
            />

            {/* ========================================================
                CLEAR IN-CHART ZONE EXPLAINER CALLOUTS
               ======================================================== */}
            {strategy.id === 'LONG_CALL' && (
              <>
                {/* Profit Zone Box (Right side above zero line) */}
                <g>
                  <rect
                    x="690"
                    y={zeroY - 90}
                    width="230"
                    height="50"
                    rx="8"
                    fill="rgba(6, 26, 20, 0.9)"
                    stroke="#10b981"
                    strokeWidth="1.5"
                  />
                  <text x="705" y={zeroY - 68} fill="#34d399" fontSize="13" fontWeight="800">
                    ▲ PROFIT ZONE (Make Money)
                  </text>
                  <text x="705" y={zeroY - 50} fill="#a7f3d0" fontSize="11" fontWeight="500">
                    Unlimited gains above 24,060
                  </text>
                </g>

                {/* Loss Zone Box (Left side below zero line) */}
                <g>
                  <rect
                    x="120"
                    y={zeroY + 30}
                    width="230"
                    height="50"
                    rx="8"
                    fill="rgba(30, 10, 16, 0.9)"
                    stroke="#f43f5e"
                    strokeWidth="1.5"
                  />
                  <text x="135" y={zeroY + 52} fill="#fb7185" fontSize="13" fontWeight="800">
                    ▼ LOSS ZONE (Lose Money)
                  </text>
                  <text x="135" y={zeroY + 70} fill="#fecdd3" fontSize="11" fontWeight="500">
                    Loss capped to ₹6,000 premium paid
                  </text>
                </g>
              </>
            )}

            {strategy.id === 'BULL_CALL_SPREAD' && (
              <>
                {/* Profit Zone Box */}
                <g>
                  <rect
                    x="680"
                    y={zeroY - 85}
                    width="240"
                    height="50"
                    rx="8"
                    fill="rgba(6, 26, 20, 0.9)"
                    stroke="#10b981"
                    strokeWidth="1.5"
                  />
                  <text x="695" y={zeroY - 63} fill="#34d399" fontSize="13" fontWeight="800">
                    ▲ PROFIT ZONE (Max ₹24,000)
                  </text>
                  <text x="695" y={zeroY - 45} fill="#a7f3d0" fontSize="11" fontWeight="500">
                    Capped profit reached at/above 24,300
                  </text>
                </g>

                {/* Loss Zone Box */}
                <g>
                  <rect
                    x="120"
                    y={zeroY + 25}
                    width="230"
                    height="50"
                    rx="8"
                    fill="rgba(30, 10, 16, 0.9)"
                    stroke="#f43f5e"
                    strokeWidth="1.5"
                  />
                  <text x="135" y={zeroY + 47} fill="#fb7185" fontSize="13" fontWeight="800">
                    ▼ LOSS ZONE (Max ₹6,000)
                  </text>
                  <text x="135" y={zeroY + 65} fill="#fecdd3" fontSize="11" fontWeight="500">
                    Loss strictly limited to net cost paid
                  </text>
                </g>
              </>
            )}

            {strategy.id === 'SHORT_STRADDLE' && (
              <>
                {/* Center Profit Zone Box */}
                <g>
                  <rect
                    x="375"
                    y={zeroY - 110}
                    width="250"
                    height="50"
                    rx="8"
                    fill="rgba(6, 26, 20, 0.9)"
                    stroke="#10b981"
                    strokeWidth="1.5"
                  />
                  <text x="500" y={zeroY - 88} fill="#34d399" fontSize="13" fontWeight="800" textAnchor="middle">
                    ▲ PROFIT ZONE (Range-bound)
                  </text>
                  <text x="500" y={zeroY - 70} fill="#a7f3d0" fontSize="11" fontWeight="500" textAnchor="middle">
                    Profitable between 23,860 & 24,140 (Max ₹14k)
                  </text>
                </g>

                {/* Left Loss Wing */}
                <g>
                  <rect
                    x="110"
                    y={zeroY + 30}
                    width="190"
                    height="45"
                    rx="6"
                    fill="rgba(30, 10, 16, 0.9)"
                    stroke="#f43f5e"
                    strokeWidth="1.2"
                  />
                  <text x="125" y={zeroY + 50} fill="#fb7185" fontSize="12" fontWeight="800">
                    ▼ DOWNSIDE LOSS ZONE
                  </text>
                  <text x="125" y={zeroY + 66} fill="#fecdd3" fontSize="10.5">
                    Unlimited loss below 23,860
                  </text>
                </g>

                {/* Right Loss Wing */}
                <g>
                  <rect
                    x="710"
                    y={zeroY + 30}
                    width="190"
                    height="45"
                    rx="6"
                    fill="rgba(30, 10, 16, 0.9)"
                    stroke="#f43f5e"
                    strokeWidth="1.2"
                  />
                  <text x="725" y={zeroY + 50} fill="#fb7185" fontSize="12" fontWeight="800">
                    ▼ UPSIDE LOSS ZONE
                  </text>
                  <text x="725" y={zeroY + 66} fill="#fecdd3" fontSize="10.5">
                    Unlimited loss above 24,140
                  </text>
                </g>
              </>
            )}

            {/* Breakeven Point(s) - High Visibility Callout */}
            {breakevenCoords.map((be, idx) => (
              <g key={idx}>
                {/* Vertical Guideline */}
                <line
                  x1={be.x}
                  y1={padding.top - 10}
                  x2={be.x}
                  y2={svgH - padding.bottom}
                  stroke="#06b6d4"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                  vectorEffect="non-scaling-stroke"
                />

                {/* Target Beacon Circle on Zero Line */}
                <circle
                  cx={be.x}
                  cy={zeroY}
                  r="6.5"
                  fill="#06b6d4"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  vectorEffect="non-scaling-stroke"
                />

                {/* Breakeven Banner Callout */}
                <rect
                  x={be.x - 70}
                  y={padding.top - 40}
                  width="140"
                  height="30"
                  rx="6"
                  fill="#061c2b"
                  stroke="#00e5ff"
                  strokeWidth="1.8"
                  vectorEffect="non-scaling-stroke"
                />
                <text
                  x={be.x}
                  y={padding.top - 20}
                  fill="#00e5ff"
                  fontSize="12"
                  fontWeight="800"
                  textAnchor="middle"
                  className="mono"
                >
                  Breakeven: {be.price.toLocaleString()}
                </text>
              </g>
            ))}

            {/* X-Axis Horizontal Bottom Line */}
            <line
              x1={padding.left}
              y1={svgH - padding.bottom}
              x2={svgW - padding.right}
              y2={svgH - padding.bottom}
              stroke="rgba(255, 255, 255, 0.25)"
              strokeWidth="1"
            />
          </svg>

          {/* Underlying Price (X-Axis) Ticks & Labels */}
          <div className="x-axis-labels">
            <span className="mono">{minSpot.toLocaleString()}</span>
            <span className="mono">{Math.round(minSpot + (maxSpot - minSpot) * 0.25).toLocaleString()}</span>
            <span className="mono highlight-spot-label font-bold text-white">
              {Math.round(minSpot + (maxSpot - minSpot) * 0.5).toLocaleString()} (Spot)
            </span>
            <span className="mono">{Math.round(minSpot + (maxSpot - minSpot) * 0.75).toLocaleString()}</span>
            <span className="mono">{maxSpot.toLocaleString()}</span>
          </div>

          {/* Centered X-Axis Title */}
          <div className="x-axis-title-centered">
            <span>NIFTY EXPIRY PRICE (₹)  ►</span>
          </div>
        </div>

        {/* Intuitive Legend */}
        <div className="chart-legend-clean">
          <div className="legend-item">
            <span className="legend-color-box green-box"></span>
            <span><strong>Profit Area (Green)</strong>: Where you gain money</span>
          </div>
          <div className="legend-item">
            <span className="legend-color-box red-box"></span>
            <span><strong>Loss Area (Red)</strong>: Where you incur loss</span>
          </div>
          <div className="legend-item">
            <span className="legend-color-box cyan-dot"></span>
            <span><strong>Breakeven Point</strong>: Zero Profit / Zero Loss threshold</span>
          </div>
        </div>
      </div>
    </section>
  );
}
