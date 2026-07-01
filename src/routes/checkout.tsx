import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, CreditCard, Landmark, Lock, ShoppingBag, Truck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart";
import { formatNGN } from "@/lib/format";
import { PanelArt } from "@/components/site/ProductArt";
import { ProductImage } from "@/components/site/ProductImage";
import { insertOrder, type Order, type OrderItem } from "@/lib/admin-data";
import { fetchProducts } from "@/lib/products";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — ItelNigeria" },
      { name: "description", content: "Complete your solar equipment order. Secure checkout with Paystack or Flutterwave." },
      { name: "robots", content: "noindex, nofollow" },
      { name: "googlebot", content: "noindex, nofollow" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { detailed, subtotal, count, clear } = useCart();
  const navigate = useNavigate();
  const [method, setMethod] = useState<"paystack" | "flutterwave" | "transfer">("paystack");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const shipping = subtotal > 0 && subtotal < 1000000 ? 15000 : 0;
  const total = subtotal + shipping;

  if (count === 0 && !done) {
    return (
      <div className="container-page py-16 md:py-24">
        <div className="mx-auto max-w-md rounded-3xl border bg-card p-6 text-center md:p-10">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary">
            <ShoppingBag className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="mt-5 text-xl font-semibold tracking-tight md:text-2xl">Nothing to checkout</h1>
          <p className="mt-2 text-sm text-muted-foreground">Add items to your cart first.</p>
          <Link to="/shop" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:brightness-110">
            Browse shop
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="container-page py-16 md:py-24">
        <div className="mx-auto max-w-md rounded-3xl border bg-card p-6 text-center md:p-10">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-green-500">
            <CheckCircle2 className="h-7 w-7 text-white" />
          </div>
          <h1 className="mt-5 text-xl font-semibold tracking-tight md:text-2xl">Order confirmed!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Reference <span className="font-mono font-medium text-foreground">{done}</span>
            <br />We will send you next steps within 15 minutes.
          </p>
          <Link to="/" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:brightness-110">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const form = e.currentTarget;
    const data = new FormData(form);
    const name = (data.get("name") as string) || "";
    const email = (data.get("email") as string) || "";
    const phone = (data.get("phone") as string) || "";
    const address = (data.get("address") as string) || "";
    const city = (data.get("city") as string) || "";
    const state = (data.get("state") as string) || "";

    // Fetch full product details for the order items
    const products = await fetchProducts();
    const items: OrderItem[] = detailed.map((d) => {
      const product = products.find((p) => p.slug === d.product.slug) ?? d.product;
      return {
        slug: product.slug,
        name: product.name,
        price: product.price,
        qty: d.qty,
        spec: product.spec,
      };
    });

    const orderId = "ITL-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    const order: Order = {
      id: orderId,
      date: new Date().toISOString(),
      customer: { name, email, phone },
      items,
      subtotal,
      shipping,
      total,
      status: "pending",
      payment: method,
      address: { line: address, city, state },
    };

    const { error } = await insertOrder(order);

    if (error) {
      // Still complete for the user even if DB write fails — log for retry
      console.error("Order DB save failed:", error);
      toast.warning("Order placed but couldn't sync to dashboard. Please contact support.");
    } else {
      toast.success("Order placed successfully!");
    }

    clear();
    setDone(orderId);
    setSubmitting(false);
  };

  return (
    <div className="container-page py-6 md:py-12">
      <div className="flex items-center gap-2">
        <Lock className="h-3.5 w-3.5 text-primary" />
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Checkout</h1>
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground md:text-sm">Secure checkout · 256-bit encrypted</p>

      <form onSubmit={onSubmit} className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-10">
        <div className="space-y-5">
          <Section title="Contact">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" name="name" placeholder="Jane Doe" required />
              <Field label="Email" name="email" type="email" placeholder="jane@example.com" required />
            </div>
            <Field label="Phone" name="phone" type="tel" placeholder="+234 800 000 0000" required />
          </Section>

          <Section title="Delivery address">
            <Field label="Street address" name="address" placeholder="12 Awolowo Rd" required />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="City" name="city" placeholder="Lagos" required />
              <Field label="State" name="state" placeholder="Lagos" required />
            </div>
          </Section>

          <Section title="Payment method">
            <div className="grid gap-3 sm:grid-cols-3">
              <PayOption icon={CreditCard} label="Paystack" sub="Card · USSD · QR" active={method === "paystack"} onClick={() => setMethod("paystack")} />
              <PayOption icon={CreditCard} label="Flutterwave" sub="Card · Mobile Money" active={method === "flutterwave"} onClick={() => setMethod("flutterwave")} />
              <PayOption icon={Landmark} label="Bank transfer" sub="Manual payment" active={method === "transfer"} onClick={() => setMethod("transfer")} />
            </div>
            {method === "transfer" && (
              <div className="mt-3 rounded-xl border bg-background/40 p-3 text-xs text-muted-foreground">
                You will receive account details after placing the order. Please use your order reference as the transfer narration.
              </div>
            )}
          </Section>

          <div className="flex flex-wrap gap-4 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Lock className="h-3 w-3" /> 256-bit SSL</span>
            <span className="inline-flex items-center gap-1"><Truck className="h-3 w-3" /> Free delivery in Lagos</span>
            <span className="inline-flex items-center gap-1"><CreditCard className="h-3 w-3" /> Paystack &amp; Flutterwave</span>
          </div>
        </div>

        <aside className="h-fit rounded-2xl border bg-card p-5 md:p-6 lg:sticky lg:top-24">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order summary</h2>
          <ul className="mt-4 divide-y divide-hairline">
            {detailed.map((d) => {
              const hasImage = d.product.images?.length > 0 && d.product.images[0].startsWith("data:");
              return (
                <li key={d.product.slug} className="flex items-center gap-3 py-3 text-sm">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface">
                    {hasImage ? (
                      <ProductImage src={d.product.images[0]} alt={d.product.name} className="h-full w-full object-cover" />
                    ) : (
                      <PanelArt category={d.product.category} spec={d.product.spec} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{d.product.name}</p>
                    <p className="text-xs text-muted-foreground">Qty {d.qty} · {d.product.spec}</p>
                  </div>
                  <p className="font-mono text-xs font-medium">{formatNGN(d.lineTotal)}</p>
                </li>
              );
            })}
          </ul>

          <dl className="mt-4 space-y-2 border-t border-hairline pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-mono">{formatNGN(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="font-mono">{shipping === 0 ? "Free" : formatNGN(shipping)}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-hairline pt-3">
              <dt className="font-semibold">Total</dt>
              <dd className="font-mono text-lg font-semibold md:text-xl">{formatNGN(total)}</dd>
            </div>
          </dl>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]"
          >
            {submitting ? (
              <><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Processing…</>
            ) : (
              <>Pay {formatNGN(total)}</>
            )}
          </button>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            By placing this order you agree to our terms &amp; warranty policy.
          </p>
        </aside>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-4 md:p-6">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, name, type = "text", placeholder, required }: {
  label: string; name: string; type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-xl border bg-background/40 px-4 py-3 text-sm placeholder:text-muted-foreground/50 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </label>
  );
}

function PayOption({ icon: Icon, label, sub, active, onClick }: {
  icon: React.ComponentType<{ className?: string }>; label: string; sub: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all ${active ? "border-primary bg-primary/5 shadow-sm" : "border-hairline hover:bg-accent"}`}
    >
      <Icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-[11px] text-muted-foreground">{sub}</p>
      </div>
    </button>
  );
}
