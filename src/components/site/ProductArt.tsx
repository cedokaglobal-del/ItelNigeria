import { memo } from "react";
import type { ProductCategory } from "@/lib/products";

export const PanelArt = memo(function PanelArt({
  category,
  spec,
}: {
  category: ProductCategory;
  spec: string;
}) {
  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(0.65_0.16_82/0.18),transparent_55%),radial-gradient(circle_at_80%_80%,oklch(0.55_0.22_27/0.15),transparent_60%)]" />
      <div className="absolute inset-0 energy-grid opacity-30" />
      <div className="relative flex h-full w-full items-center justify-center p-8">
        {category === "panels" && <PanelSVG />}
        {category === "inverters" && <InverterSVG />}
        {category === "batteries" && <BatterySVG />}
        {category === "controllers" && <ControllerSVG />}
        {category === "kits" && <KitSVG />}
        {category === "accessories" && <AccessorySVG />}
      </div>
      <div className="absolute bottom-3 left-3 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        {spec}
      </div>
    </div>
  );
});

const PanelSVG = memo(function PanelSVG() {
  return (
    <svg viewBox="0 0 200 140" className="h-full w-full max-h-[180px] drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]">
      <defs>
        <linearGradient id="pf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="oklch(0.32 0.04 250)" />
          <stop offset="1" stopColor="oklch(0.2 0.03 260)" />
        </linearGradient>
      </defs>
      <g transform="translate(20 18) skewX(-12)">
        <rect width="160" height="100" rx="4" fill="url(#pf)" stroke="oklch(1 0 0 / 0.18)" />
        {Array.from({ length: 5 }).map((_, c) =>
          Array.from({ length: 3 }).map((_, r) => (
            <rect
              key={`${c}-${r}`}
              x={4 + c * 31}
              y={4 + r * 31}
              width="28"
              height="28"
              fill="oklch(0.25 0.05 250)"
              stroke="oklch(1 0 0 / 0.12)"
            />
          )),
        )}
      </g>
      <circle cx="170" cy="22" r="14" fill="oklch(0.86 0.17 86 / 0.95)" className="animate-pulse-glow" />
    </svg>
  );
});

const InverterSVG = memo(function InverterSVG() {
  return (
    <svg viewBox="0 0 200 140" className="h-full w-full max-h-[170px]">
      <rect x="40" y="20" width="120" height="100" rx="10" fill="oklch(0.22 0.02 260)" stroke="oklch(1 0 0 / 0.14)" />
      <rect x="52" y="34" width="96" height="36" rx="4" fill="oklch(0.12 0.02 260)" stroke="oklch(0.68 0.18 244 / 0.5)" />
      <circle cx="60" cy="92" r="4" fill="oklch(0.68 0.18 244)" className="animate-pulse-glow" />
      <circle cx="76" cy="92" r="4" fill="oklch(0.83 0.17 86)" />
      <circle cx="92" cy="92" r="4" fill="oklch(0.6 0.245 27)" />
      <rect x="108" y="86" width="40" height="14" rx="3" fill="oklch(1 0 0 / 0.06)" />
      <text x="100" y="58" textAnchor="middle" fontFamily="monospace" fontSize="11" fill="oklch(0.68 0.18 244)">
        5.00 kW
      </text>
    </svg>
  );
});

const BatterySVG = memo(function BatterySVG() {
  return (
    <svg viewBox="0 0 200 140" className="h-full w-full max-h-[170px]">
      <rect x="50" y="20" width="100" height="100" rx="10" fill="oklch(0.22 0.02 260)" stroke="oklch(1 0 0 / 0.14)" />
      <rect x="62" y="32" width="76" height="10" rx="2" fill="oklch(0.12 0.02 260)" />
      {Array.from({ length: 5 }).map((_, i) => (
        <rect key={i} x={62} y={50 + i * 10} width={62 - i * 2} height="6" rx="2" fill="oklch(0.83 0.17 86 / 0.9)" />
      ))}
      <rect x="62" y="110" width="76" height="4" rx="2" fill="oklch(1 0 0 / 0.1)" />
    </svg>
  );
});

const ControllerSVG = memo(function ControllerSVG() {
  return (
    <svg viewBox="0 0 200 140" className="h-full w-full max-h-[170px]">
      <rect x="40" y="30" width="120" height="80" rx="8" fill="oklch(0.22 0.02 260)" stroke="oklch(1 0 0 / 0.14)" />
      <rect x="52" y="42" width="96" height="28" rx="3" fill="oklch(0.12 0.02 260)" />
      <text x="100" y="62" textAnchor="middle" fontFamily="monospace" fontSize="14" fill="oklch(0.83 0.17 86)">
        60 A
      </text>
      <circle cx="64" cy="92" r="5" fill="oklch(0.6 0.245 27)" />
      <circle cx="100" cy="92" r="5" fill="oklch(0.83 0.17 86)" />
      <circle cx="136" cy="92" r="5" fill="oklch(0.68 0.18 244)" />
    </svg>
  );
});

const KitSVG = memo(function KitSVG() {
  return (
    <svg viewBox="0 0 220 140" className="h-full w-full max-h-[170px]">
      <g transform="translate(8 14) skewX(-12)">
        <rect width="90" height="56" rx="3" fill="oklch(0.28 0.04 250)" stroke="oklch(1 0 0 / 0.18)" />
        {Array.from({ length: 3 }).map((_, c) =>
          Array.from({ length: 2 }).map((_, r) => (
            <rect key={`${c}-${r}`} x={3 + c * 29} y={3 + r * 26} width="26" height="23" fill="oklch(0.2 0.04 250)" stroke="oklch(1 0 0 / 0.1)" />
          )),
        )}
      </g>
      <rect x="120" y="22" width="80" height="48" rx="6" fill="oklch(0.22 0.02 260)" stroke="oklch(1 0 0 / 0.14)" />
      <rect x="128" y="30" width="64" height="20" rx="2" fill="oklch(0.12 0.02 260)" />
      <rect x="40" y="84" width="60" height="40" rx="5" fill="oklch(0.22 0.02 260)" stroke="oklch(1 0 0 / 0.14)" />
      <rect x="46" y="92" width="48" height="6" rx="2" fill="oklch(0.83 0.17 86)" />
      <rect x="46" y="102" width="40" height="6" rx="2" fill="oklch(0.83 0.17 86 / 0.7)" />
      <path d="M105 60 Q 130 70 130 90" stroke="oklch(0.83 0.17 86)" strokeWidth="1.5" fill="none" className="animate-flow" />
      <path d="M150 70 Q 130 78 110 90" stroke="oklch(0.68 0.18 244)" strokeWidth="1.5" fill="none" className="animate-flow" />
    </svg>
  );
});

const AccessorySVG = memo(function AccessorySVG() {
  return (
    <svg viewBox="0 0 200 140" className="h-full w-full max-h-[170px]">
      <path
        d="M30 110 Q 60 30 100 70 T 170 30"
        stroke="oklch(0.6 0.245 27)"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M30 120 Q 60 40 100 80 T 170 40"
        stroke="oklch(0.83 0.17 86)"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />
      <circle cx="30" cy="110" r="6" fill="oklch(0.6 0.245 27)" />
      <circle cx="170" cy="30" r="6" fill="oklch(0.6 0.245 27)" />
    </svg>
  );
});
