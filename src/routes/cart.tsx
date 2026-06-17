import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CreditCard, Minus, Plus, ShoppingBag, Trash2, Truck } from "lucide-react";
import { PanelArt } from "@/components/site/ProductArt";
import { useCart } from "@/lib/cart";
import { formatNGN } from "@/lib/format";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Cart — ItelNigeria" },
      { name: "description", content: "Review your solar equipment selections before checkout." },
      { name: "robots", content: "noindex, nofollow" },
      { name: "googlebot", content: "noindex, nofollow" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { detailed, subtotal, count, setQty, remove } = useCart();
  const shipping = subtotal > 0 && subtotal < 1000000 ? 15000 : 0;
  const total = subtotal + shipping;

  if (count === 0) {
    return (
      <div className="container-page py-16 md:py-24">
        <div className="mx-auto max-w-lg rounded-3xl border bg-card p-6 text-center md:p-10">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary">
            <ShoppingBag className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="mt-5 text-xl font-semibold tracking-tight md:text-2xl">Your cart is empty</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Browse our shop or use the calculator to build a system.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link to="/shop" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:brightness-110">
              Shop products
            </Link>
            <Link to="/calculator" className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-accent">
              Size my system
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-6 md:py-12">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Cart</h1>
          <p className="mt-0.5 text-xs text-muted-foreground md:text-sm">
            {count} {count === 1 ? "item" : "items"}
          </p>
        </div>
        <Link to="/shop" className="text-xs font-medium text-primary underline-offset-2 hover:underline md:text-sm">
          Continue shopping
        </Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:gap-10">
        <ul className="space-y-3">
          {detailed.map(({ product, qty, lineTotal }) => {
            const hasImage = product.images?.length > 0 && product.images[0].startsWith("data:");
            return (
              <li key={product.slug} className="rounded-2xl border bg-card p-3 md:flex md:items-center md:gap-4 md:p-4">
                <Link to="/products/$slug" params={{ slug: product.slug }} className="flex gap-3 md:flex-1 md:items-center md:gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface md:h-24 md:w-24">
                    {hasImage ? (
                      <img src={product.images[0]} alt={product.name} loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <PanelArt category={product.category} spec={product.spec} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 self-center">
                    <p className="truncate text-sm font-semibold md:text-base">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.spec}</p>
                    <p className="mt-1 text-sm font-semibold text-primary md:hidden">{formatNGN(product.price)}</p>
                  </div>
                </Link>

                <div className="mt-3 flex items-center justify-between gap-2 border-t pt-3 md:mt-0 md:border-0 md:pt-0 md:gap-3">
                  <div className="inline-flex items-center rounded-xl border">
                    <button type="button" aria-label="Decrease quantity" onClick={() => setQty(product.slug, qty - 1)}
                      className="grid h-10 w-10 place-items-center text-muted-foreground transition-colors hover:text-foreground active:bg-accent rounded-xl">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="flex w-9 items-center justify-center font-mono text-sm font-semibold tabular-nums">{qty}</span>
                    <button type="button" aria-label="Increase quantity" onClick={() => setQty(product.slug, qty + 1)}
                      className="grid h-10 w-10 place-items-center text-muted-foreground transition-colors hover:text-foreground active:bg-accent rounded-xl">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="hidden font-mono text-sm font-semibold md:block md:w-24 md:text-right">{formatNGN(lineTotal)}</span>
                  <button type="button" onClick={() => remove(product.slug)} aria-label={`Remove ${product.name}`}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="h-fit rounded-2xl border bg-card p-5 md:p-6 lg:sticky lg:top-24">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order summary</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-mono font-medium">{formatNGN(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="font-mono font-medium">{shipping === 0 ? "Free" : formatNGN(shipping)}</dd>
            </div>
            {subtotal >= 1000000 && (
              <p className="text-[11px] text-green-600">Free shipping on orders above ₦1,000,000</p>
            )}
            <div className="border-t pt-3">
              <div className="flex items-baseline justify-between">
                <dt className="font-semibold">Total</dt>
                <dd className="font-mono text-lg font-semibold md:text-xl">{formatNGN(total)}</dd>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">VAT included where applicable</p>
            </div>
          </dl>

          <Link to="/checkout" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:brightness-110 active:scale-[0.98]">
            Proceed to checkout <ArrowRight className="h-4 w-4" />
          </Link>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1"><CreditCard className="h-3 w-3" /> Paystack</span>
            <span className="inline-flex items-center gap-1"><CreditCard className="h-3 w-3" /> Flutterwave</span>
            <span className="inline-flex items-center gap-1"><Truck className="h-3 w-3" /> Free delivery Lagos</span>
          </div>

          <div className="mt-4 rounded-xl border bg-background/40 p-3 text-center text-[11px] text-muted-foreground">
            Secure checkout · 256-bit encrypted · Bank transfer supported
          </div>
        </aside>
      </div>
    </div>
  );
}
