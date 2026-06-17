import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { PanelArt } from "@/components/site/ProductArt";
import { useCart } from "@/lib/cart";
import { formatNGN } from "@/lib/format";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [{ title: "Cart — ItelNigeria" }],
  }),
  component: CartPage,
});

function CartPage() {
  const { detailed, subtotal, count, setQty, remove } = useCart();
  const shipping = subtotal > 0 && subtotal < 1000000 ? 15000 : 0;
  const total = subtotal + shipping;

  if (count === 0) {
    return (
      <div className="container-page py-24">
        <div className="mx-auto max-w-lg rounded-3xl border bg-card p-8 text-center md:p-12">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary shadow-sm">
            <ShoppingBag className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">Your cart is empty</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Start with a complete kit or build your own system using our calculator.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm"
            >
              Shop products
            </Link>
            <Link
              to="/calculator"
              className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium hover:bg-accent"
            >
              Size my system
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-8 md:py-12">
      <h1 className="text-2xl font-semibold tracking-tight md:text-4xl">Your cart</h1>
      <p className="mt-1 text-xs text-muted-foreground md:text-sm">
        {count} {count === 1 ? "item" : "items"}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:gap-8">
        <ul className="space-y-3">
          {detailed.map(({ product, qty, lineTotal }) => (
            <li
              key={product.slug}
              className="flex items-center gap-3 rounded-2xl border bg-card p-3 md:gap-4 md:p-4"
            >
              <Link
                to="/products/$slug"
                params={{ slug: product.slug }}
                className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface md:h-20 md:w-20"
              >
                <PanelArt category={product.category} spec={product.spec} />
              </Link>

              <div className="min-w-0 flex-1">
                <Link
                  to="/products/$slug"
                  params={{ slug: product.slug }}
                  className="block truncate text-sm font-semibold hover:text-[var(--solar)]"
                >
                  {product.name}
                </Link>
                <p className="text-xs text-muted-foreground">{product.spec}</p>
                <p className="mt-0.5 text-sm font-medium md:mt-1">{formatNGN(product.price)}</p>

                <div className="mt-2 flex items-center gap-3 md:hidden">
                  <div className="inline-flex items-center rounded-full border">
                    <button
                      type="button"
                      aria-label="Decrease"
                      onClick={() => setQty(product.slug, qty - 1)}
                      className="grid h-8 w-8 place-items-center text-muted-foreground hover:text-foreground"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="flex w-7 items-center justify-center font-mono text-sm">{qty}</span>
                    <button
                      type="button"
                      aria-label="Increase"
                      onClick={() => setQty(product.slug, qty + 1)}
                      className="grid h-8 w-8 place-items-center text-muted-foreground hover:text-foreground"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="ml-auto font-mono text-xs font-semibold">{formatNGN(lineTotal)}</span>
                  <button
                    type="button"
                    onClick={() => remove(product.slug)}
                    aria-label={`Remove ${product.name}`}
                    className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="hidden items-center gap-3 md:flex">
                <div className="inline-flex items-center rounded-full border">
                  <button
                    type="button"
                    aria-label="Decrease"
                    onClick={() => setQty(product.slug, qty - 1)}
                    className="grid h-9 w-9 place-items-center text-muted-foreground hover:text-foreground"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="flex w-8 items-center justify-center font-mono text-sm">{qty}</span>
                  <button
                    type="button"
                    aria-label="Increase"
                    onClick={() => setQty(product.slug, qty + 1)}
                    className="grid h-9 w-9 place-items-center text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <span className="w-24 text-right font-mono text-sm font-semibold">{formatNGN(lineTotal)}</span>
                <button
                  type="button"
                  onClick={() => remove(product.slug)}
                  aria-label={`Remove ${product.name}`}
                  className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-2xl border bg-card p-5 md:p-6 lg:sticky lg:top-24">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Order summary
          </h2>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-mono">{formatNGN(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="font-mono">{shipping === 0 ? "Free" : formatNGN(shipping)}</dd>
            </div>
            <div className="border-t pt-3">
              <div className="flex items-baseline justify-between">
                <dt className="text-sm font-semibold">Total</dt>
                <dd className="font-mono text-lg font-semibold md:text-xl">{formatNGN(total)}</dd>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                VAT included where applicable
              </p>
            </div>
          </dl>

          <Link
            to="/checkout"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-transform active:scale-[0.98]"
          >
            Checkout
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/shop"
            className="mt-2 inline-flex w-full items-center justify-center text-xs text-muted-foreground hover:text-foreground"
          >
            Continue shopping
          </Link>

          <div className="mt-5 rounded-xl border bg-background/40 p-3 text-[11px] text-muted-foreground">
            Secure checkout · Pay with Paystack or Flutterwave · Bank transfer supported
          </div>
        </aside>
      </div>
    </div>
  );
}
