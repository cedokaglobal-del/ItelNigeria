import { Link } from "@tanstack/react-router";
import { memo } from "react";
import { Star, ShoppingBag } from "lucide-react";
import { formatNGN } from "@/lib/format";
import type { Product } from "@/lib/products";
import { PanelArt } from "./ProductArt";

export const ProductCard = memo(function ProductCard({ product }: { product: Product }) {
  const hasImage = product.images?.length > 0 && product.images[0].startsWith("data:");
  const discountPct =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : 0;

  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-hairline bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:shadow-[var(--shadow-elevated)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
        {hasImage ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <PanelArt category={product.category} spec={product.spec} />
        )}
        {discountPct > 0 && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
            -{discountPct}%
          </span>
        )}
        {product.badge && !discountPct && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground shadow-sm">
            {product.badge}
          </span>
        )}
        <span className="absolute right-3 top-3 z-10 rounded-md border border-hairline bg-background/70 px-2.5 py-1 text-[10px] font-semibold text-foreground backdrop-blur-sm">
          {product.spec}
        </span>
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/10 to-transparent" />
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          {product.brand}
        </p>
        <h3 className="text-base font-semibold leading-snug text-foreground">{product.name}</h3>
        <p className="line-clamp-1 text-sm text-muted-foreground">{product.tagline}</p>

        <div className="mt-auto flex items-center gap-1 pt-2">
          <Star className="h-3 w-3 fill-[var(--solar)] text-[var(--solar)]" />
          <span className="text-xs font-medium text-foreground">{product.rating}</span>
          <span className="text-xs text-muted-foreground">· {product.reviews}</span>
        </div>

        <div className="flex items-end justify-between gap-2 pt-3">
          <div>
            <div className="flex items-baseline gap-2">
              <p className="text-lg font-semibold tracking-tight">{formatNGN(product.price)}</p>
              {product.originalPrice && product.originalPrice > product.price && (
                <p className="text-xs text-muted-foreground line-through">
                  {formatNGN(product.originalPrice)}
                </p>
              )}
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-4 py-2 text-xs font-medium transition-all group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground active:scale-95">
            <ShoppingBag className="h-3 w-3" /> Buy
          </span>
        </div>
      </div>
    </Link>
  );
});
