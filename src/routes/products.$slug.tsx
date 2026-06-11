import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Check, ShieldCheck, ShoppingBag, Star, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PanelArt } from "@/components/site/ProductArt";
import { ProductCard } from "@/components/site/ProductCard";
import { ImageCarousel } from "@/components/site/ImageCarousel";
import { useCart } from "@/lib/cart";
import { formatNGN } from "@/lib/format";
import { getProduct, PRODUCTS } from "@/lib/products";

export const Route = createFileRoute("/products/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — Itel Energy` },
          { name: "description", content: loaderData.product.tagline },
          { property: "og:title", content: `${loaderData.product.name} — Itel Energy` },
          { property: "og:description", content: loaderData.product.tagline },
        ]
      : [],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { add } = useCart();
  const [qty, setQty] = useState(1);

  const related = PRODUCTS.filter(
    (p) => p.category === product.category && p.slug !== product.slug,
  ).slice(0, 4);

  const hasImages = product.images?.length > 0 && product.images[0].startsWith("data:");
  const discountPct = product.originalPrice && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  return (
    <div className="container-page py-10">
      <Link
        to="/shop"
        className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to shop
      </Link>

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <div className="surface overflow-hidden rounded-3xl">
          {hasImages ? (
            <ImageCarousel images={product.images} alt={product.name} />
          ) : (
            <div className="aspect-square">
              <PanelArt category={product.category} spec={product.spec} />
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
            {product.brand}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{product.name}</h1>
          <p className="mt-2 text-muted-foreground">{product.tagline}</p>

          <div className="mt-4 flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-[var(--solar)] text-[var(--solar)]" />
              <span className="font-medium">{product.rating}</span>
              <span className="text-muted-foreground">· {product.reviews} reviews</span>
            </span>
            <span className="rounded-full border border-hairline px-2 py-0.5 text-xs text-[var(--solar)]">
              {product.spec}
            </span>
          </div>

          <div className="mt-6 flex items-baseline gap-3 border-y border-hairline py-6">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-semibold tracking-tight">{formatNGN(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-lg text-muted-foreground line-through">{formatNGN(product.originalPrice)}</span>
              )}
            </div>
            {discountPct > 0 && (
              <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-[11px] font-bold text-white">-{discountPct}%</span>
            )}
            <span className="text-xs text-muted-foreground">VAT included</span>
          </div>

          <p className="mt-6 text-sm leading-relaxed text-foreground/90">{product.description}</p>

          <ul className="mt-5 space-y-2">
            {product.highlights.map((h: string) => (
              <li key={h} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--solar)]" />
                <span className="text-foreground/90">{h}</span>
              </li>
            ))}
          </ul>

          <div className="mt-7 flex items-center gap-3">
            <div className="inline-flex items-center rounded-full border border-hairline">
              <button
                type="button"
                onClick={() => setQty((v) => Math.max(1, v - 1))}
                className="h-11 w-11 text-lg text-muted-foreground hover:text-foreground"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-10 text-center text-sm font-semibold">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((v) => v + 1)}
                className="h-11 w-11 text-lg text-muted-foreground hover:text-foreground"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                add(product.slug, qty);
                toast.success(`Added ${qty} × ${product.name} to cart`);
              }}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow-red)] transition-transform hover:scale-[1.01]"
            >
              <ShoppingBag className="h-4 w-4" /> Add to cart
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
            <Badge icon={ShieldCheck} title="Warranty" value={product.warranty} />
            <Badge icon={Truck} title="Delivery" value="3–7 days nationwide" />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl font-semibold tracking-tight">Pairs well with</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
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
      <Icon className="h-4 w-4 text-[var(--solar)]" />
      <div>
        <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{title}</p>
        <p className="text-xs font-semibold">{value}</p>
      </div>
    </div>
  );
}
