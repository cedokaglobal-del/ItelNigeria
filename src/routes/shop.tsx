import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Package, Sun, Cpu, BatteryCharging, Zap, Wrench, type LucideIcon } from "lucide-react";
import { ProductCard } from "@/components/site/ProductCard";
import { Pagination } from "@/components/site/Pagination";
import { fetchProducts, type ProductCategory } from "@/lib/products";
import { useCategories } from "@/lib/categories";
export const Route = createFileRoute("/shop")({
  loader: () => fetchProducts(),
  pendingComponent: ShopSkeleton,
  head: () => ({
    meta: [
      { title: "Shop — ItelNigeria" },
      {
        name: "description",
        content:
          "Solar panels, inverters, lithium batteries, MPPT controllers, mounts and complete kits. Premium components for African conditions.",
      },
      { property: "og:title", content: "Shop — ItelNigeria" },
      { property: "og:description", content: "Premium solar equipment for African homes and businesses. Panels, inverters, batteries, controllers, and turnkey kits." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://itelenergy.com/shop" },
      { property: "og:site_name", content: "ItelNigeria" },
      { property: "og:locale", content: "en_NG" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Shop — ItelNigeria" },
      { name: "twitter:description", content: "Solar panels, inverters, lithium batteries, and complete solar kits for Nigerian homes and businesses." },
    ],
    links: [{ rel: "canonical", href: "https://itelenergy.com/shop" }],
  }),
  component: Shop,
});

type Filter = ProductCategory | "all";

const CAT_ICONS: Record<string, LucideIcon> = {
  panels: Sun,
  inverters: Cpu,
  batteries: BatteryCharging,
  controllers: Zap,
  kits: Package,
  accessories: Wrench,
};

const PER_PAGE = 8;

function Shop() {
  const loaderData = Route.useLoaderData();
  const gridRef = useRef<HTMLDivElement>(null);
  const [categories] = useCategories();
  const [filter, setFilter] = useState<Filter>("all");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sort, setSort] = useState<"featured" | "low" | "high" | "rating">("featured");
  const [page, setPage] = useState(1);

  useEffect(() => {
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [page]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    for (const p of loaderData) {
      if (p.tags) p.tags.forEach((t) => tags.add(t));
    }
    return Array.from(tags).sort();
  }, [loaderData]);

  const products = useMemo(() => {
    const source = loaderData;
    let list = filter === "all" ? source : source.filter((p) => p.category === filter);
    if (activeTag) {
      list = list.filter((p) => p.tags && p.tags.includes(activeTag));
    }
    list = [...list];
    if (sort === "low") list.sort((a, b) => a.price - b.price);
    if (sort === "high") list.sort((a, b) => b.price - a.price);
    if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [filter, activeTag, sort, loaderData]);

  const totalPages = Math.ceil(products.length / PER_PAGE);
  const paged = products.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function handleFilter(f: Filter) {
    setFilter(f);
    setActiveTag(null);
    setPage(1);
  }

  function handleSort(s: typeof sort) {
    setSort(s);
    setPage(1);
  }

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-hairline">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div className="container-page py-14 md:py-20">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--solar)]">Shop</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Engineered for African sun.
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Tier-1 panels, hybrid inverters, lithium batteries, and turnkey kits — selected and
            tested by Itel engineers.
          </p>
        </div>
      </section>

      <section className="container-page py-10">
        {/* ── Filters + Sort ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6">
          <div className="flex flex-wrap gap-1.5">
            <FilterChip active={filter === "all"} onClick={() => handleFilter("all")}>
              <Package className="h-3 w-3" /> All
            </FilterChip>
            {categories.map((c) => {
              const Icon = CAT_ICONS[c.id] || Package;
              return (
                <FilterChip key={c.id} active={filter === c.id} onClick={() => handleFilter(c.id)}>
                  <Icon className="h-3 w-3" /> {c.label}
                </FilterChip>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <label htmlFor="sort" className="hidden sm:inline">
              Sort by
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => handleSort(e.target.value as typeof sort)}
              className="rounded-full border border-hairline bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="featured">Featured</option>
              <option value="low">Price · Low to high</option>
              <option value="high">Price · High to low</option>
              <option value="rating">Top rated</option>
            </select>
          </div>
        </div>

        {/* ── Tags & Results count ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setActiveTag(activeTag === tag ? null : tag);
                  setPage(1);
                }}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                  activeTag === tag
                    ? "bg-[var(--solar)] text-white shadow-sm"
                    : "bg-surface text-muted-foreground hover:bg-accent hover:text-foreground border border-hairline"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground whitespace-nowrap">
            {products.length} product{products.length !== 1 ? "s" : ""}
            {filter !== "all" &&
              ` in ${categories.find((c) => c.id === filter)?.label.toLowerCase() || filter}`}
            {activeTag && ` tagged "${activeTag}"`}
          </p>
        </div>

        {/* ── Grid ── */}
        <div ref={gridRef} className="grid min-h-[400px] grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4 lg:gap-5">
          {paged.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>

        {products.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
              No results
            </p>
            <p className="mt-2 text-sm text-muted-foreground">No products match this filter.</p>
            <button
              type="button"
              onClick={() => handleFilter("all")}
              className="mt-4 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
            >
              Clear filters
            </button>
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onPage={setPage} />
      </section>
    </div>
  );
}

function ShopSkeleton() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-hairline">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div className="container-page py-14 md:py-20">
          <div className="h-3 w-16 rounded-full bg-muted/60 animate-pulse" />
          <div className="mt-3 h-10 w-72 rounded-xl bg-muted/60 animate-pulse" />
          <div className="mt-3 h-4 w-96 rounded-full bg-muted/40 animate-pulse" />
        </div>
      </section>
      <section className="container-page py-10">
        <div className="flex flex-wrap gap-2 pb-6">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-8 w-20 rounded-full bg-muted/40 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4 lg:gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl border bg-card overflow-hidden">
              <div className="aspect-square bg-muted/40 animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-3 w-3/4 rounded bg-muted/40 animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-muted/30 animate-pulse" />
                <div className="h-4 w-2/3 rounded bg-muted/50 animate-pulse mt-2" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
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
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
        active
          ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-glow-red)]"
          : "border-hairline text-foreground/80 hover:bg-accent hover:border-foreground/20"
      }`}
    >
      {children}
    </button>
  );
}
