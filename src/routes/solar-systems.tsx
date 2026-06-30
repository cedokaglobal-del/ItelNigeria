import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { Star, ShoppingBag, Eye } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart";
import { fetchSolarSystems } from "@/lib/solar-systems";
import { formatNGN } from "@/lib/format";
import { ImageCarousel } from "@/components/site/ImageCarousel";
import { Pagination } from "@/components/site/Pagination";

export const Route = createFileRoute("/solar-systems")({
  loader: () => fetchSolarSystems(),
  pendingComponent: SolarSystemsSkeleton,
  head: () => ({
    meta: [
      { title: "Solar Systems — ItelNigeria" },
      {
        name: "description",
        content:
          "Pre-engineered solar systems for homes and businesses. Complete combos with panels, inverters, batteries, and installation accessories.",
      },
      { property: "og:title", content: "Solar Systems — ItelNigeria" },
      { property: "og:description", content: "Complete pre-engineered solar systems for Nigerian homes and businesses. Panels, inverters, batteries, and all accessories included." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://itelenergy.com/solar-systems" },
      { property: "og:site_name", content: "ItelNigeria" },
      { property: "og:locale", content: "en_NG" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Solar Systems — ItelNigeria" },
      { name: "twitter:description", content: "Complete pre-engineered solar combos — panels, inverter, battery, and accessories. Designed for Nigeria." },
    ],
    links: [{ rel: "canonical", href: "https://itelenergy.com/solar-systems" }],
  }),
  component: SolarSystemsPage,
});

const PER_PAGE = 8;

function SolarSystemsPage() {
  const gridRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const isListing = pathname === "/solar-systems";
  const systems = Route.useLoaderData();
  const [filterVoltage, setFilterVoltage] = useState<string>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [page]);

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
            <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
              Solar systems
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
              Pre-engineered combos — panels, inverter, battery, and all accessories. Designed and
              guaranteed by Itel.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6">
          <div className="flex gap-1.5">
            <FilterChip active={filterVoltage === "all"} onClick={() => handleFilter("all")}>
              All
            </FilterChip>
            <FilterChip active={filterVoltage === "24V"} onClick={() => handleFilter("24V")}>
              24V Systems
            </FilterChip>
            <FilterChip active={filterVoltage === "48V"} onClick={() => handleFilter("48V")}>
              48V Systems
            </FilterChip>
          </div>
          <p className="text-xs text-muted-foreground">
            {filtered.length} system{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div ref={gridRef} className="grid min-h-[400px] gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paged.map((sys) => (
            <SolarSystemCard key={sys.slug} system={sys} />
          ))}
        </div>

        {paged.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
              No results
            </p>
            <p className="mt-2 text-sm text-muted-foreground">No systems match this filter.</p>
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onPage={setPage} />
      </section>
    </div>
  );
}

function SolarSystemCard({
  system: sys,
}: {
  system: {
    slug: string;
    name: string;
    images: string[];
    badge?: string;
    voltage: string;
    totalPanels: number;
    panelWattage: number;
    inverterKVA: number;
    batteryCapacityKWh: number;
    tagline: string;
    rating: number;
    reviews: number;
    price: number;
    originalPrice?: number;
  };
}) {
  const { add } = useCart();

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    add(sys.slug, 1);
    toast.success(`Added ${sys.name} to cart`);
  }

  return (
    <Link
      to="/solar-systems/$slug"
      params={{ slug: sys.slug }}
      className="card-cmp group relative flex flex-col overflow-hidden rounded-2xl border border-hairline bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:shadow-[var(--shadow-elevated)]"
    >
      <div className="relative overflow-hidden">
        <ImageCarousel
          images={sys.images}
          alt={sys.name}
          className="aspect-[7/5] rounded-b-none"
        />
        {sys.badge && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-primary/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground shadow-sm backdrop-blur-sm">
            {sys.badge}
          </span>
        )}
        {!sys.badge && sys.originalPrice && sys.originalPrice > sys.price && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
            -{Math.round((1 - sys.price / sys.originalPrice) * 100)}% OFF
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/10 to-transparent" />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">
          {sys.voltage} · {sys.totalPanels}×{sys.panelWattage}W
        </p>
        <h2 className="text-sm font-semibold leading-snug tracking-tight">{sys.name}</h2>
        <p className="line-clamp-1 text-xs text-muted-foreground">{sys.tagline}</p>

        <div className="mt-1.5 flex items-center gap-2 rounded-lg border bg-surface/80 px-2.5 py-1.5">
          <span className="font-mono text-[10px] font-semibold">{sys.inverterKVA}kVA</span>
          <span className="text-[9px] text-muted-foreground">·</span>
          <span className="font-mono text-[10px] font-semibold">{sys.batteryCapacityKWh}kWh</span>
          <span className="text-[9px] text-muted-foreground">·</span>
          <span className="font-mono text-[10px] font-semibold">{sys.voltage}</span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div>
            {sys.originalPrice && sys.originalPrice > sys.price && (
              <p className="font-mono text-xs text-muted-foreground line-through">
                {formatNGN(sys.originalPrice)}
              </p>
            )}
            <p className="font-mono text-base font-bold tracking-tight text-primary">
              {formatNGN(sys.price)}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Star className="h-2.5 w-2.5 fill-[var(--solar)] text-[var(--solar)]" />
              <span className="font-medium text-foreground">{sys.rating}</span>
              <span>({sys.reviews})</span>
            </div>
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={handleAddToCart}
              className="inline-flex items-center gap-1 rounded-full border border-hairline px-2.5 py-1.5 text-[10px] font-medium transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground active:scale-95"
            >
              <ShoppingBag className="h-3 w-3" /> Add
            </button>
            <span className="inline-flex items-center gap-1 rounded-full border border-hairline px-2.5 py-1.5 text-[10px] font-medium transition-all group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground active:scale-95">
              <Eye className="h-3 w-3" /> View
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
        active
          ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-glow-red)]"
          : "border-hairline text-muted-foreground hover:bg-accent hover:border-foreground/20"
      }`}
    >
      {children}
    </button>
  );
}

function SolarSystemsSkeleton() {
  return (
    <div>
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/[0.04] to-transparent">
        <div className="container-page py-12 md:py-16">
          <div className="mx-auto max-w-2xl text-center space-y-3">
            <div className="mx-auto h-9 w-64 rounded-xl bg-muted/50 animate-pulse" />
            <div className="mx-auto h-4 w-96 rounded-full bg-muted/30 animate-pulse" />
          </div>
        </div>
      </section>
      <section className="container-page py-8">
        <div className="flex gap-2 pb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 w-24 rounded-full bg-muted/40 animate-pulse" />
          ))}
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border bg-card overflow-hidden">
              <div className="aspect-[7/5] bg-muted/40 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-3 w-1/2 rounded bg-muted/50 animate-pulse" />
                <div className="h-4 w-3/4 rounded bg-muted/40 animate-pulse" />
                <div className="h-3 w-full rounded bg-muted/30 animate-pulse" />
                <div className="mt-3 h-7 w-full rounded-lg bg-muted/30 animate-pulse" />
                <div className="mt-2 h-6 w-1/2 rounded bg-muted/50 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
