import { Link } from "@tanstack/react-router";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center" aria-label="ItelNigeria Home">
      <img
        src="/Image/logo/itellogonigera.png"
        alt="ItelNigeria"
        fetchpriority="high"
        className="h-11 w-auto object-contain transition-transform duration-300 hover:scale-105 md:h-14 lg:h-16"
      />
    </Link>
  );
}
