import { Link } from "@tanstack/react-router";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-3">
      <img
        src="/Image/logo/itellogonigera.png"
        alt="ItelNigeria Logo"
        className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105 md:h-11"
      />
      {!compact && (
        <span className="text-[15px] font-semibold tracking-tight sr-only">
          ItelNigeria
        </span>
      )}
    </Link>
  );
}
