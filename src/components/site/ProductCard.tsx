import { Link } from "@tanstack/react-router";
import { memo } from "react";
import { Star, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { formatNGN } from "@/lib/format";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/products";
import { PanelArt } from "./ProductArt";

export const ProductCard = memo(function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const hasImage = product.images?.length > 0 && product.images[0].startsWith("data:");
  const discountPct =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : 0;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    add(product.slug, 1);
    toast.success(`Added ${product.name} to cart`);
  }

  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      className="card-cmp group relative flex flex-col overflow-hidden rounded-2xl border border-hairline bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:shadow-[var(--shadow-elevated)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
        {hasImage ? (
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <PanelArt category={product.category} spec={product.spec} />
        )}
        {discountPct > 0 && (
          <span className="absolute left-1.5 top-1.5 z-10 rounded-full bg-red-500 px-2 py-0.5 text-[9px] font-bold text-white shadow-sm md:left-3 md:top-3 md:px-2.5 md:py-1 md:text-[10px]">
            -{discountPct}%
          </span>
        )}
        {product.badge && !discountPct && (
          <span className="absolute left-1.5 top-1.5 z-10 rounded-full bg-primary px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-primary-foreground shadow-sm md:left-3 md:top-3 md:px-3 md:py-1 md:text-[10px]">
            {product.badge}
          </span>
        )}
        <span className="absolute right-1.5 top-1.5 z-10 rounded-md border border-hairline bg-background/70 px-1.5 py-0.5 text-[8px] font-semibold text-foreground backdrop-blur-sm md:right-3 md:top-3 md:px-2.5 md:py-1 md:text-[10px]">
          {product.spec}
        </span>
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/10 to-transparent" />
      </div>

      <div className="flex flex-1 flex-col gap-1 p-2 md:gap-1.5 md:p-5">
        <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-muted-foreground md:text-[10px]">
          {product.brand}
        </p>
        <h3 className="text-[11px] font-semibold leading-tight text-foreground md:text-base">
          {product.name}
        </h3>
        <p className="hidden text-sm text-muted-foreground md:line-clamp-1">{product.tagline}</p>

        <div className="mt-auto flex items-center gap-1 pt-1 md:pt-2">
          <Star className="h-2.5 w-2.5 fill-[var(--solar)] text-[var(--solar)] md:h-3 md:w-3" />
          <span className="text-[10px] font-medium text-foreground md:text-xs">{product.rating}</span>
          <span className="hidden text-xs text-muted-foreground md:inline">· {product.reviews}</span>
        </div>

        <div className="flex items-end justify-between gap-1 pt-1 md:gap-2 md:pt-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-tight md:text-lg md:font-semibold">
              {formatNGN(product.price)}
            </p>
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-[9px] text-muted-foreground line-through md:text-xs">
                {formatNGN(product.originalPrice)}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            className="inline-flex items-center gap-1 rounded-full border border-hairline px-2 py-1 text-[9px] font-medium transition-all md:px-4 md:py-2 md:text-xs hover:border-primary hover:bg-primary hover:text-primary-foreground active:scale-95"
          >
            <ShoppingBag className="h-2 w-2 md:h-3 md:w-3" /> Add
          </button>
        </div>
      </div>
    </Link>
  );
});
