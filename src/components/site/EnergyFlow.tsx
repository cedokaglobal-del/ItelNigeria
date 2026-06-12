import { memo } from "react";

/**
 * Animated solar → battery → home power-flow diagram for the hero.
 */
export const EnergyFlow = memo(function EnergyFlow() {
  return (
    <svg
      viewBox="0 0 420 320"
      className="h-full w-full"
      role="img"
      aria-label="Solar energy flow diagram"
    >
      <defs>
        <radialGradient id="sun" cx="0.5" cy="0.5">
          <stop offset="0" stopColor="oklch(0.92 0.17 88)" />
          <stop offset="1" stopColor="oklch(0.7 0.18 70 / 0)" />
        </radialGradient>
        <linearGradient id="pnl" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="oklch(0.32 0.04 250)" />
          <stop offset="1" stopColor="oklch(0.18 0.03 260)" />
        </linearGradient>
      </defs>

      {/* Sun */}
      <circle cx="340" cy="60" r="60" fill="url(#sun)" className="animate-pulse-glow" />
      <circle cx="340" cy="60" r="18" fill="oklch(0.92 0.17 88)" />

      {/* Solar panel */}
      <g transform="translate(40 50) rotate(-12)">
        <rect width="170" height="100" rx="4" fill="url(#pnl)" stroke="oklch(1 0 0 / 0.15)" />
        {Array.from({ length: 5 }).map((_, c) =>
          Array.from({ length: 3 }).map((_, r) => (
            <rect
              key={`${c}-${r}`}
              x={4 + c * 33}
              y={4 + r * 31}
              width="30"
              height="28"
              fill="oklch(0.25 0.05 250)"
              stroke="oklch(1 0 0 / 0.12)"
            />
          )),
        )}
      </g>

      {/* Inverter */}
      <g transform="translate(160 190)">
        <rect
          width="100"
          height="80"
          rx="10"
          fill="oklch(0.22 0.02 260)"
          stroke="oklch(1 0 0 / 0.14)"
        />
        <rect x="10" y="12" width="80" height="24" rx="3" fill="oklch(0.12 0.02 260)" />
        <text
          x="50"
          y="29"
          textAnchor="middle"
          fontFamily="monospace"
          fontSize="11"
          fill="oklch(0.83 0.17 86)"
        >
          5.2 kW
        </text>
        <circle cx="22" cy="58" r="4" fill="oklch(0.68 0.18 244)" />
        <circle cx="38" cy="58" r="4" fill="oklch(0.83 0.17 86)" />
        <circle cx="54" cy="58" r="4" fill="oklch(0.6 0.245 27)" />
      </g>

      {/* Battery */}
      <g transform="translate(300 200)">
        <rect
          width="80"
          height="80"
          rx="8"
          fill="oklch(0.22 0.02 260)"
          stroke="oklch(1 0 0 / 0.14)"
        />
        <rect x="10" y="10" width="60" height="8" rx="2" fill="oklch(0.12 0.02 260)" />
        {[0, 1, 2, 3].map((i) => (
          <rect
            key={i}
            x="10"
            y={26 + i * 10}
            width={56 - i * 4}
            height="5"
            rx="2"
            fill="oklch(0.83 0.17 86 / 0.9)"
          />
        ))}
      </g>

      {/* Home */}
      <g transform="translate(30 200)">
        <path
          d="M50 0 L100 36 L100 80 L0 80 L0 36 Z"
          fill="oklch(0.22 0.02 260)"
          stroke="oklch(1 0 0 / 0.14)"
        />
        <rect x="38" y="48" width="24" height="32" fill="oklch(0.6 0.245 27 / 0.85)" />
        <rect x="12" y="50" width="16" height="12" fill="oklch(0.83 0.17 86 / 0.85)" />
        <rect x="72" y="50" width="16" height="12" fill="oklch(0.83 0.17 86 / 0.85)" />
      </g>

      {/* Flow lines */}
      <path
        d="M120 150 Q 180 170 200 190"
        stroke="oklch(0.83 0.17 86)"
        strokeWidth="2"
        fill="none"
        className="animate-flow"
      />
      <path
        d="M260 230 Q 290 235 300 240"
        stroke="oklch(0.68 0.18 244)"
        strokeWidth="2"
        fill="none"
        className="animate-flow"
      />
      <path
        d="M160 240 Q 145 250 130 250"
        stroke="oklch(0.6 0.245 27)"
        strokeWidth="2"
        fill="none"
        className="animate-flow"
      />
    </svg>
  );
});
