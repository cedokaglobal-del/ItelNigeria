import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PanelArt } from "@/components/site/ProductArt";
import { ProductCard } from "@/components/site/ProductCard";
import { ImageCarousel } from "@/components/site/ImageCarousel";
import { useCart } from "@/lib/cart";
import { formatNGN } from "@/lib/format";
import { getProduct, getProducts } from "@/lib/products";

export const Route = createFileRoute("/products/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData.product.name} — Itel Energy` },
      { name: "description", content: loaderData.product.tagline },
      { property: "og:title", content: `${loaderData.product.name} — Itel Energy` },
      { property: "og:description", content: loaderData.product.tagline },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [showFullDesc, setShowFullDesc] = useState(false);

  const related = useMemo(
    () =>
      getProducts()
        .filter((p) => p.category === product.category && p.slug !== product.slug)
        .slice(0, 4),
    [product.category, product.slug],
  );

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
    <div className="pb-20 md:pb-0">
      {/* ── Mobile sticky CTA bar ── */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold tracking-tight">{formatNGN(product.price)}</p>
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-xs text-muted-foreground line-through">
                {formatNGN(product.originalPrice)}
              </p>
            )}
          </div>
          <div className="flex items-center rounded-xl border border-hairline">
            <button
              type="button"
              onClick={() => setQty((v) => Math.max(1, v - 1))}
              className="grid h-10 w-10 place-items-center text-muted-foreground hover:text-foreground active:bg-accent rounded-xl"
              aria-label="Decrease"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="flex w-9 items-center justify-center text-sm font-semibold tabular-nums">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty((v) => v + 1)}
              className="grid h-10 w-10 place-items-center text-muted-foreground hover:text-foreground active:bg-accent rounded-xl"
              aria-label="Increase"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all active:scale-95"
          >
            <ShoppingBag className="h-4 w-4" /> Add
          </button>
        </div>
      </div>

      <div className="container-page py-6 md:py-10">
        {/* ── Breadcrumb ── */}
        <Link
          to="/shop"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground group"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />{" "}
          Back to shop
        </Link>

        <div className="mt-4 grid gap-8 md:grid-cols-[1.2fr_1fr] md:gap-12">
          {/* ════════ LEFT COLUMN ════════ */}
          <div className="space-y-8 md:space-y-10">
            {/* ── Image gallery ── */}
            <div className="surface overflow-hidden rounded-2xl md:rounded-3xl">
              {hasImages ? (
                <ImageCarousel
                  images={product.images}
                  alt={product.name}
                  className="aspect-square md:aspect-[5/4]"
                />
              ) : (
                <div className="aspect-square">
                  <PanelArt category={product.category} spec={product.spec} />
                </div>
              )}
            </div>

            {/* ── Product info (mobile only) ── */}
            <div className="md:hidden space-y-4">
              <div>
                <p className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
                  {product.brand}
                </p>
                <h1 className="mt-1.5 text-2xl font-semibold tracking-tight">{product.name}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{product.tagline}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-[var(--solar)] text-[var(--solar)]" />
                  <span className="font-medium">{product.rating}</span>
                  <span className="text-muted-foreground"> · {product.reviews} reviews</span>
                </span>
                <span className="rounded-full border border-hairline px-2.5 py-0.5 text-xs font-medium text-[var(--solar)]">
                  {product.spec}
                </span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold tracking-tight">
                  {formatNGN(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-base text-muted-foreground line-through">
                      {formatNGN(product.originalPrice)}
                    </span>
                    <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      -{discountPct}%
                    </span>
                  </>
                )}
                <span className="text-xs text-muted-foreground/60">VAT incl.</span>
              </div>
            </div>

            {/* ── Description ── */}
            <section>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  Description
                </h2>
              </div>
              <div className="mt-3">
                <p
                  className={`text-sm leading-relaxed text-foreground/85 ${!showFullDesc && "line-clamp-3"}`}
                >
                  {product.description}
                </p>
                {product.description.length > 120 && (
                  <button
                    type="button"
                    onClick={() => setShowFullDesc(!showFullDesc)}
                    className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    {showFullDesc ? "Show less" : "Read more"}{" "}
                    <ChevronDown
                      className={`h-3 w-3 transition-transform ${showFullDesc && "rotate-180"}`}
                    />
                  </button>
                )}
              </div>
            </section>

            {/* ── Highlights ── */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Key features
              </h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {product.highlights.map((h) => (
                  <li
                    key={h}
                    className="flex items-start gap-2.5 rounded-xl border bg-surface px-4 py-3 text-sm"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--solar)]" />
                    <span className="text-foreground/85">{h}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* ── Specs ── */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Specifications
              </h2>
              <div className="mt-3 grid grid-cols-2 gap-3">
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

            {/* ── Related products ── */}
            {related.length > 0 && (
              <section className="pt-4">
                <h2 className="text-lg font-semibold tracking-tight">Pairs well with</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {related.map((p) => (
                    <ProductCard key={p.slug} product={p} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ════════ RIGHT COLUMN (desktop sticky) ════════ */}
          <div className="hidden md:block">
            <div className="sticky top-24 space-y-6">
              {/* ── Product header ── */}
              <div>
                <p className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
                  {product.brand}
                </p>
                <h1 className="mt-1.5 text-3xl font-semibold tracking-tight">{product.name}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{product.tagline}</p>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-[var(--solar)] text-[var(--solar)]" />
                  <span className="font-medium">{product.rating}</span>
                  <span className="text-muted-foreground"> · {product.reviews} reviews</span>
                </span>
                <span className="rounded-full border border-hairline px-2.5 py-0.5 text-xs font-medium text-[var(--solar)]">
                  {product.spec}
                </span>
              </div>

              {/* ── Pricing ── */}
              <div className="border-y border-hairline py-5">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold tracking-tight">
                    {formatNGN(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <>
                      <span className="text-lg text-muted-foreground line-through">
                        {formatNGN(product.originalPrice)}
                      </span>
                      <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-[11px] font-bold text-white">
                        -{discountPct}%
                      </span>
                    </>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground/60">VAT included</p>
              </div>

              {/* ── Description preview ── */}
              <p className="text-sm leading-relaxed text-foreground/80 line-clamp-3">
                {product.description}
              </p>

              {/* ── Highlights strip ── */}
              <ul className="space-y-2">
                {product.highlights.slice(0, 3).map((h) => (
                  <li key={h} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--solar)]" />
                    <span className="text-foreground/80">{h}</span>
                  </li>
                ))}
              </ul>

              {/* ── CTA ── */}
              <div className="space-y-4">
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
            </div>
          </div>
        </div>
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

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-surface px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold">{value}</p>
    </div>
  );
}
