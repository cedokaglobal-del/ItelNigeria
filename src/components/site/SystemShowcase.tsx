import { useMemo } from "react";
import type { SolarSystem } from "@/lib/solar-systems";

type LayoutItem = {
  src: string;
  label: string;
  x: string;
  y: string;
  rotate: string;
  scale: string;
  z: number;
  width: string;
};

function productImage(type: string, name: string): string {
  const colors: Record<string, string> = {
    panel: "#0d9488", inverter: "#2563eb", battery: "#7c3aed", accessory: "#6b7280",
  };
  const c = colors[type] ?? "#6b7280";
  const label = name.length > 20 ? name.slice(0, 17) + "…" : name;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 400 250">
    <rect width="400" height="250" fill="${c}" rx="12"/>
    <rect width="400" height="250" fill="url(#g)" rx="12" opacity="0.4"/>
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.15"/><stop offset="1" stop-color="#000" stop-opacity="0.3"/></linearGradient></defs>
    <text x="200" y="125" text-anchor="middle" fill="rgba(255,255,255,0.92)" font-family="system-ui,sans-serif" font-size="22" font-weight="700">${label}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function SystemShowcase({ system }: { system: SolarSystem }) {
  const items = useMemo<LayoutItem[]>(() => {
    const list: LayoutItem[] = [];
    for (const comp of system.components) {
      const src = productImage(comp.type, comp.name);
      if (!src) continue;
      const type = comp.type;
      if (type === "panel") {
        list.push({
          src, label: `${comp.qty}× Panels`,
          x: "50%", y: "32%", rotate: "-2deg", scale: "1", z: 1,
          width: "65%",
        });
      } else if (type === "inverter") {
        list.push({
          src, label: `${comp.qty}× Inverter`,
          x: "68%", y: "58%", rotate: "3deg", scale: "1.05", z: 3,
          width: "32%",
        });
      } else if (type === "battery") {
        list.push({
          src, label: `${comp.qty}× Battery`,
          x: "32%", y: "60%", rotate: "-1deg", scale: "1.08", z: 2,
          width: "28%",
        });
      } else {
        list.push({
          src, label: comp.name,
          x: `${20 + (list.length % 3) * 25}%`, y: "78%", rotate: "0deg", scale: "0.85", z: 0,
          width: "18%",
        });
      }
    }
    return list;
  }, [system]);

  const arrayKw = ((system.totalPanels * system.panelWattage) / 1000).toFixed(2);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl">
      {/* Subtle grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Radial glow */}
      <div className="pointer-events-none absolute -left-1/4 -top-1/4 h-1/2 w-1/2 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-1/4 -right-1/4 h-1/2 w-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

      {/* Content */}
      <div className="relative aspect-[16/9] md:aspect-[21/9]">
        {/* Floating product items */}
        {items.map((item, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: item.x,
              top: item.y,
              width: item.width,
              transform: `translate(-50%, -50%) rotate(${item.rotate}) scale(${item.scale})`,
              zIndex: item.z,
            }}
          >
            <div className="relative">
              <img
                src={item.src}
                alt={item.label}
                loading="lazy"
                className="w-full rounded-xl border border-white/10 bg-black/20 object-contain shadow-2xl shadow-black/50 backdrop-blur-sm"
                style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.5))" }}
              />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/60 px-2.5 py-0.5 text-[9px] font-medium text-white/80 backdrop-blur-sm md:text-[10px]">
                {item.label}
              </div>
            </div>
          </div>
        ))}

        {/* Top-left branding */}
        <div className="absolute left-4 top-4 z-10 md:left-6 md:top-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/70 backdrop-blur-sm md:text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" /> Complete system
          </span>
        </div>

        {/* Bottom-left specs */}
        <div className="absolute bottom-4 left-4 z-10 space-y-1 md:bottom-6 md:left-6">
          <p className="text-balance text-lg font-bold leading-tight text-white drop-shadow-lg md:text-3xl">
            {system.name}
          </p>
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold text-white/90 backdrop-blur-sm md:text-xs">
              {system.voltage}
            </span>
            <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold text-white/90 backdrop-blur-sm md:text-xs">
              {arrayKw}kW Array
            </span>
            <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold text-white/90 backdrop-blur-sm md:text-xs">
              {system.inverterKVA}kVA
            </span>
            <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold text-white/90 backdrop-blur-sm md:text-xs">
              {system.batteryCapacityKWh}kWh
            </span>
          </div>
        </div>

        {/* Corner accent */}
        <div className="absolute right-4 top-4 z-10 md:right-6 md:top-6">
          <svg width="40" height="40" viewBox="0 0 40 40" className="h-8 w-8 md:h-10 md:w-10">
            <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <circle cx="20" cy="20" r="8" fill="rgba(255,255,255,0.1)" />
            <path d="M20 5 L20 8 M20 32 L20 35 M5 20 L8 20 M32 20 L35 20" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
