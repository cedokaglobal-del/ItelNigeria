import { Link } from "@tanstack/react-router";
import { memo } from "react";
import { Star } from "lucide-react";
import { formatNGN } from "@/lib/format";
import type { Product } from "@/lib/products";
import { PanelArt } from "./ProductArt";

export const ProductCard = memo(function ProductCard({ product }: { product: Product }) {
  const hasImage = product.images?.length > 0 && product.images[0].startsWith("data:");
  const discountPct = product.originalPrice && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-hairline bg-[var(--gradient-card)] transition-all hover:border-white/15 hover:shadow-[var(--shadow-elevated)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
        {hasImage ? (
          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <PanelArt category={product.category} spec={product.spec} />
        )}
        {discountPct > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2 py-1 text-[10px] font-bold text-white shadow-sm">
            -{discountPct}%
          </span>
        )}
        {product.badge && !discountPct && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground shadow-[var(--shadow-glow-red)]">
            {product.badge}
          </span>
        )}
        <span className="absolute right-3 top-3 rounded-md border border-hairline bg-background/60 px-2 py-1 text-[10px] font-semibold text-[var(--solar)] backdrop-blur">
          {product.spec}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          {product.brand}
        </p>
        <h3 className="text-base font-semibold leading-snug text-foreground">{product.name}</h3>
        <p className="line-clamp-1 text-sm text-muted-foreground">{product.tagline}</p>

        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <div className="flex items-baseline gap-2">
              <p className="text-lg font-semibold tracking-tight">{formatNGN(product.price)}</p>
              {product.originalPrice && product.originalPrice > product.price && (
                <p className="text-xs text-muted-foreground line-through">{formatNGN(product.originalPrice)}</p>
              )}
            </div>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-[var(--solar)] text-[var(--solar)]" />
              {product.rating} · {product.reviews} reviews
            </p>
          </div>
          <span className="rounded-full border border-hairline px-3 py-1.5 text-xs font-medium transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
            View
          </span>
        </div>
      </div>
    </Link>
  );
});
