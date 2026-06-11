import { Link } from "@tanstack/react-router";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5">
      <span className="relative grid h-8 w-8 place-items-center">
        <span className="absolute inset-0 rounded-lg bg-[var(--gradient-red)] shadow-[var(--shadow-glow-red)] transition-transform duration-300 group-hover:scale-105" />
        <svg
          viewBox="0 0 24 24"
          className="relative h-4 w-4 text-primary-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3.4" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" />
        </svg>
      </span>
      {!compact && (
        <span className="text-[15px] font-semibold tracking-tight">
          Itel<span className="text-muted-foreground"> Energy</span>
        </span>
      )}
    </Link>
  );
}
