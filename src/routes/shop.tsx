import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/site/ProductCard";
import { Pagination } from "@/components/site/Pagination";
import { CATEGORIES, PRODUCTS, type ProductCategory } from "@/lib/products";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — Itel Energy" },
      { name: "description", content: "Solar panels, inverters, lithium batteries, MPPT controllers, mounts and complete kits. Premium components for African conditions." },
      { property: "og:url", content: "https://itelenergy.com/shop" },
      { rel: "canonical", href: "https://itelenergy.com/shop" },
    ],
  }),
  component: Shop,
});

type Filter = ProductCategory | "all";

const PER_PAGE = 8;

function Shop() {
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<"featured" | "low" | "high" | "rating">("featured");
  const [page, setPage] = useState(1);

  const products = useMemo(() => {
    let list = filter === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.category === filter);
    list = [...list];
    if (sort === "low") list.sort((a, b) => a.price - b.price);
    if (sort === "high") list.sort((a, b) => b.price - a.price);
    if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [filter, sort]);

  const totalPages = Math.ceil(products.length / PER_PAGE);
  const paged = products.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function handleFilter(f: Filter) {
    setFilter(f);
    setPage(1);
  }

  function handleSort(s: typeof sort) {
    setSort(s);
    setPage(1);
  }

  return (
    <div>
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
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6">
          <div className="-mx-1 flex flex-wrap gap-1.5">
            <FilterChip active={filter === "all"} onClick={() => handleFilter("all")}>All</FilterChip>
            {CATEGORIES.map((c) => (
              <FilterChip key={c.id} active={filter === c.id} onClick={() => handleFilter(c.id)}>{c.label}</FilterChip>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <label htmlFor="sort">Sort</label>
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

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paged.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>

        {products.length === 0 && (
          <p className="py-20 text-center text-sm text-muted-foreground">No products match this filter.</p>
        )}

        <Pagination page={page} totalPages={totalPages} onPage={setPage} />
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
      className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
        active
          ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-glow-red)]"
          : "border-hairline text-foreground/80 hover:bg-accent"
      }`}
    >
      {children}
    </button>
  );
}
