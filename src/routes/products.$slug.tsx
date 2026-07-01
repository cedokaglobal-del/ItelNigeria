import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Check, Minus, Plus, ShieldCheck, ShoppingBag, Star, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PanelArt } from "@/components/site/ProductArt";
import { ProductCard } from "@/components/site/ProductCard";
import { ImageCarousel } from "@/components/site/ImageCarousel";
import { useCart } from "@/lib/cart";
import { formatNGN } from "@/lib/format";
import { fetchProduct, fetchProducts } from "@/lib/products";

function ProductSkeleton() {
  return (
    <div className="container-page py-8">
      <div className="mb-6 h-4 w-32 animate-shimmer rounded" />
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="aspect-square animate-shimmer rounded-2xl" />
        <div className="space-y-4">
          <div className="h-6 w-3/4 animate-shimmer rounded" />
          <div className="h-4 w-1/2 animate-shimmer rounded" />
          <div className="h-4 w-1/3 animate-shimmer rounded" />
          <div className="mt-4 h-24 w-full animate-shimmer rounded" />
          <div className="h-10 w-40 animate-shimmer rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/products/$slug")({
  loader: async ({ params }) => {
    const [product, all] = await Promise.all([fetchProduct(params.slug), fetchProducts().catch(() => [] as Awaited<ReturnType<typeof fetchProducts>>)]);
    if (!product) throw notFound();
    return { product, related: (all ?? []).filter((p) => p.category === product.category && p.slug !== product.slug).slice(0, 4) };
  },
  pendingComponent: ProductSkeleton,
  head: ({ loaderData }) => {
    const p = loaderData.product;
    const href = "https://itelenergy.com/products/" + p.slug;
    return {
      meta: [
        { title: `${p.name} — ItelNigeria` },
        { name: "description", content: p.tagline },
        ...(p.tags?.length ? [{ name: "keywords", content: p.tags.join(", ") }] : []),
        { property: "og:title", content: `${p.name} — ItelNigeria` },
        { property: "og:description", content: p.tagline },
        { property: "og:type", content: "product" },
        { property: "og:url", content: href },
        { property: "og:site_name", content: "ItelNigeria" },
        { property: "og:locale", content: "en_NG" },
        { property: "product:price:amount", content: String(p.price) },
        { property: "product:price:currency", content: "NGN" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: `${p.name} — ItelNigeria` },
        { name: "twitter:description", content: p.tagline },
      ],
      links: [{ rel: "canonical", href }],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { product, related } = Route.useLoaderData();
  const { add } = useCart();
  const [qty, setQty] = useState(1);

  const hasImages = product.images?.length > 0 && product.images[0].startsWith("data:");
  const discountPct =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : 0;

  function handleAdd() {
    add(product.slug, qty);
    toast.success(`Added ${qty} × ${product.name} to cart`);
  }

  return (
    <div className="pb-24 md:pb-0">
      {/* ── Mobile sticky CTA ── */}
      <div className="gpu fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold tracking-tight">{formatNGN(product.price)}</p>
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-[11px] text-muted-foreground line-through">
                {formatNGN(product.originalPrice)}
              </p>
            )}
          </div>
          <div className="flex items-center rounded-lg border border-hairline">
            <button
              type="button"
              onClick={() => setQty((v) => Math.max(1, v - 1))}
              className="grid h-9 w-9 place-items-center text-muted-foreground hover:text-foreground active:bg-accent rounded-lg"
              aria-label="Decrease"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="flex w-8 items-center justify-center text-sm font-semibold tabular-nums">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty((v) => v + 1)}
              className="grid h-9 w-9 place-items-center text-muted-foreground hover:text-foreground active:bg-accent rounded-lg"
              aria-label="Increase"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all active:scale-95"
          >
            <ShoppingBag className="h-3.5 w-3.5" /> Add
          </button>
        </div>
      </div>

      <div className="container-page py-4 md:py-10">
        {/* ── Breadcrumb ── */}
        <Link
          to="/shop"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Back
        </Link>

        {/* ── Image (full width on mobile) ── */}
        <div className="mt-3 overflow-hidden rounded-2xl bg-surface-2 md:rounded-3xl">
          {hasImages ? (
            <ImageCarousel images={product.images} alt={product.name} className="aspect-square" />
          ) : (
            <div className="aspect-square">
              <PanelArt category={product.category} spec={product.spec} />
            </div>
          )}
        </div>

        {/* ── Product info header ── */}
        <div className="mt-5 space-y-3">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
              {product.brand}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
              {product.name}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{product.tagline}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-[var(--solar)] text-[var(--solar)]" />
              <span className="font-medium">{product.rating}</span>
              <span className="text-muted-foreground"> · {product.reviews}</span>
            </span>
            <span className="rounded-full border border-hairline px-2.5 py-0.5 text-[11px] font-medium text-[var(--solar)]">
              {product.spec}
            </span>
          </div>
        </div>

        {/* ── Price block ── */}
        <div className="mt-5 flex items-baseline gap-3 border-y border-hairline py-4">
          <span className="text-3xl font-bold tracking-tight md:text-4xl">
            {formatNGN(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <>
              <span className="text-sm text-muted-foreground line-through md:text-base">
                {formatNGN(product.originalPrice)}
              </span>
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                -{discountPct}%
              </span>
            </>
          )}
          <span className="text-[11px] text-muted-foreground/60 md:text-xs">VAT incl.</span>
        </div>

        {/* ── Description ── */}
        <section className="mt-6">
          <p className="text-sm leading-relaxed text-foreground/85">{product.description}</p>
        </section>

        {/* ── Highlights ── */}
        <section className="mt-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Key features
          </h2>
          <ul className="mt-3 space-y-2">
            {product.highlights.map((h) => (
              <li key={h} className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--solar)]/10">
                  <Check className="h-3 w-3 text-[var(--solar)]" />
                </span>
                <span className="text-foreground/85">{h}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Specs ── */}
        <section className="mt-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Specifications
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-2 md:gap-3">
            <SpecItem
              label="Category"
              value={product.category.charAt(0).toUpperCase() + product.category.slice(1)}
            />
            <SpecItem label="Spec" value={product.spec} />
            <SpecItem label="Brand" value={product.brand} />
            <SpecItem label="Warranty" value={product.warranty} />
            <SpecItem label="In stock" value={product.inStock ? "Yes" : "No"} />
            {discountPct > 0 && <SpecItem label="You save" value={`${discountPct}%`} />}
          </div>
        </section>

        {/* ── Desktop CTA (hidden on mobile — sticky bar handles it) ── */}
        <div className="hidden md:block mt-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center rounded-xl border border-hairline">
              <button
                type="button"
                onClick={() => setQty((v) => Math.max(1, v - 1))}
                className="grid h-11 w-11 place-items-center text-muted-foreground hover:text-foreground active:bg-accent rounded-xl"
                aria-label="Decrease"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="flex w-10 items-center justify-center text-sm font-semibold tabular-nums">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((v) => v + 1)}
                className="grid h-11 w-11 place-items-center text-muted-foreground hover:text-foreground active:bg-accent rounded-xl"
                aria-label="Increase"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={handleAdd}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:brightness-110 active:scale-[0.98]"
            >
              <ShoppingBag className="h-4 w-4" /> Add to cart
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Badge icon={ShieldCheck} title="Warranty" value={product.warranty} />
            <Badge icon={Truck} title="Delivery" value="3–7 days nationwide" />
          </div>

          <div className="rounded-xl border bg-surface px-4 py-3 text-xs text-center text-muted-foreground">
            <Check className="-mt-0.5 mr-1 inline h-3 w-3 text-primary" />
            Free delivery in Lagos · 14-day guarantee · Secure checkout
          </div>
        </div>

        {/* ── Warranty + Delivery (mobile) ── */}
        <div className="mt-6 grid grid-cols-2 gap-3 md:hidden">
          <CompactBadge icon={ShieldCheck} label="Warranty" value={product.warranty} />
          <CompactBadge icon={Truck} label="Delivery" value="3–7 days nationwide" />
        </div>

        {/* ── Related products ── */}
        {related.length > 0 && (
          <section className="mt-10 md:mt-16">
            <h2 className="text-base font-semibold tracking-tight md:text-lg">Pairs well with</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Badge({
  icon: Icon,
  title,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
}) {
  return (
    <div className="surface flex items-center gap-3 rounded-xl px-4 py-3">
      <Icon className="h-4 w-4 shrink-0 text-[var(--solar)]" />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{title}</p>
        <p className="text-xs font-semibold truncate">{value}</p>
      </div>
    </div>
  );
}

function CompactBadge({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border bg-surface px-3.5 py-3">
      <Icon className="h-4 w-4 shrink-0 text-[var(--solar)]" />
      <div>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="text-[11px] font-semibold">{value}</p>
      </div>
    </div>
  );
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-surface px-3.5 py-2.5 md:px-4 md:py-3">
      <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold">{value}</p>
    </div>
  );
}
