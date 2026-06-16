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
        <div className="surface mx-auto max-w-lg rounded-3xl p-12 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[var(--gradient-red)] shadow-[var(--shadow-glow-red)]">
            <ShoppingBag className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">Your cart is empty</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Start with a complete kit or build your own system using our calculator.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow-red)]"
            >
              Shop products
            </Link>
            <Link
              to="/calculator"
              className="inline-flex items-center gap-2 rounded-full border border-hairline px-5 py-2.5 text-sm font-medium hover:bg-accent"
            >
              Size my system
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Your cart</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {count} {count === 1 ? "item" : "items"} · review and proceed to checkout
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <ul className="space-y-3">
          {detailed.map(({ product, qty, lineTotal }) => (
            <li key={product.slug} className="surface flex items-center gap-4 rounded-2xl p-4">
              <Link
                to="/products/$slug"
                params={{ slug: product.slug }}
                className="surface-2 relative h-20 w-20 shrink-0 overflow-hidden rounded-xl"
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
                <p className="mt-1 text-sm font-medium">{formatNGN(product.price)}</p>
              </div>

              <div className="inline-flex items-center rounded-full border border-hairline">
                <button
                  type="button"
                  aria-label="Decrease"
                  onClick={() => setQty(product.slug, qty - 1)}
                  className="grid h-9 w-9 place-items-center text-muted-foreground hover:text-foreground"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center font-mono text-sm">{qty}</span>
                <button
                  type="button"
                  aria-label="Increase"
                  onClick={() => setQty(product.slug, qty + 1)}
                  className="grid h-9 w-9 place-items-center text-muted-foreground hover:text-foreground"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="hidden w-28 text-right font-mono text-sm font-semibold sm:block">
                {formatNGN(lineTotal)}
              </div>

              <button
                type="button"
                onClick={() => remove(product.slug)}
                aria-label={`Remove ${product.name}`}
                className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>

        <aside className="surface h-fit rounded-2xl p-6 lg:sticky lg:top-24">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Order summary
          </h2>

          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-mono">{formatNGN(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="font-mono">{shipping === 0 ? "Free" : formatNGN(shipping)}</dd>
            </div>
            <div className="border-t border-hairline pt-3">
              <div className="flex items-baseline justify-between">
                <dt className="text-sm font-semibold">Total</dt>
                <dd className="font-mono text-xl font-semibold">{formatNGN(total)}</dd>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                VAT included where applicable
              </p>
            </div>
          </dl>

          <Link
            to="/checkout"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow-red)] transition-transform hover:scale-[1.01]"
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

          <div className="mt-6 rounded-xl border border-hairline bg-background/40 p-4 text-[11px] text-muted-foreground">
            🔒 Secure checkout · Pay with Paystack or Flutterwave · Bank transfer supported
          </div>
        </aside>
      </div>
    </div>
  );
}
