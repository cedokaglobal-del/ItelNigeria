import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { useMemo, useState } from "react";
import { useSolarSystems } from "@/lib/solar-systems";
import { formatNGN } from "@/lib/format";
import { ImageCarousel } from "@/components/site/ImageCarousel";
import { Pagination } from "@/components/site/Pagination";

export const Route = createFileRoute("/solar-systems")({
  head: () => ({
    meta: [
      { title: "Solar Systems — Itel Energy" },
      { name: "description", content: "Pre-engineered solar systems for homes and businesses. Complete combos with panels, inverters, batteries, and installation accessories." },
      { property: "og:url", content: "https://itelenergy.com/solar-systems" },
      { rel: "canonical", href: "https://itelenergy.com/solar-systems" },
    ],
  }),
  component: SolarSystemsPage,
});

const PER_PAGE = 8;

function SolarSystemsPage() {
  const { pathname } = useLocation();
  const isListing = pathname === "/solar-systems";
  const [systems] = useSolarSystems();
  const [filterVoltage, setFilterVoltage] = useState<string>("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!isListing) return [];
    let list = systems;
    if (filterVoltage !== "all") list = list.filter((s) => s.voltage === filterVoltage);
    return list;
  }, [isListing, systems, filterVoltage]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function handleFilter(v: string) {
    setFilterVoltage(v);
    setPage(1);
  }

  if (!isListing) return <Outlet />;

  return (
    <div>
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/[0.04] to-transparent">
        <div className="container-page py-12 md:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">Solar systems</h1>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
              Pre-engineered combos — panels, inverter, battery, and all accessories. Designed and guaranteed by Itel.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6">
          <div className="flex gap-1.5">
            <FilterChip active={filterVoltage === "all"} onClick={() => handleFilter("all")}>All</FilterChip>
            <FilterChip active={filterVoltage === "24V"} onClick={() => handleFilter("24V")}>24V</FilterChip>
            <FilterChip active={filterVoltage === "48V"} onClick={() => handleFilter("48V")}>48V</FilterChip>
          </div>
          <p className="text-xs text-muted-foreground">{filtered.length} system{filtered.length !== 1 ? "s" : ""}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paged.map((sys) => (
            <Link
              key={sys.slug}
              to="/solar-systems/$slug"
              params={{ slug: sys.slug }}
              className="group overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md"
            >
              <div className="relative">
                <ImageCarousel images={sys.images} alt={sys.name} className="aspect-[7/5]" />
                {sys.badge && (
                  <span className="absolute left-2 top-2 z-10 rounded-full bg-primary/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary-foreground backdrop-blur-sm">
                    {sys.badge}
                  </span>
                )}
              </div>
              <div className="p-3.5">
                <p className="text-[9px] font-semibold uppercase tracking-widest text-primary">{sys.voltage} · {sys.totalPanels}×{sys.panelWattage}W</p>
                <h2 className="mt-0.5 truncate text-sm font-semibold tracking-tight">{sys.name}</h2>
                <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">{sys.tagline}</p>

                <div className="mt-2.5 flex items-center gap-3 rounded-lg border bg-surface px-2.5 py-2">
                  <span className="font-mono text-[11px] font-semibold">{sys.inverterKVA}kVA</span>
                  <span className="text-[10px] text-muted-foreground">·</span>
                  <span className="font-mono text-[11px] font-semibold">{sys.batteryCapacityKWh}kWh</span>
                  <span className="text-[10px] text-muted-foreground">·</span>
                  <span className="font-mono text-[11px] font-semibold">{sys.voltage}</span>
                </div>

                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Star className="h-2.5 w-2.5 fill-[var(--solar)] text-[var(--solar)]" />
                    <span className="font-medium text-foreground">{sys.rating}</span>
                    <span>({sys.reviews})</span>
                  </div>
                  <p className="font-mono text-sm font-bold tracking-tight text-primary">{formatNGN(sys.price)}</p>
                </div>

                <div className="mt-2.5">
                  <span className="inline-flex w-full items-center justify-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-[10px] font-semibold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    View system
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {paged.length === 0 && (
          <p className="py-20 text-center text-sm text-muted-foreground">No systems match this filter.</p>
        )}

        <Pagination page={page} totalPages={totalPages} onPage={setPage} />
      </section>
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-[11px] font-medium transition-all ${
        active ? "border-primary bg-primary text-primary-foreground" : "border-hairline text-muted-foreground hover:bg-accent"
      }`}
    >
      {children}
    </button>
  );
}


