import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, CreditCard, Landmark, Lock } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart";
import { formatNGN } from "@/lib/format";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Itel Energy" }] }),
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
      <div className="container-page py-24 text-center">
        <h1 className="text-2xl font-semibold">Your cart is empty</h1>
        <Link
          to="/shop"
          className="mt-4 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Browse shop
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="container-page py-24">
        <div className="surface mx-auto max-w-lg rounded-3xl p-12 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[var(--solar)] text-[var(--solar-foreground)]">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">Order placed</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Order <span className="font-mono text-foreground">{done}</span> confirmed. We'll email
            you next steps within 15 minutes.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    const id = "ITL-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    toast.success("Payment successful");
    clear();
    setDone(id);
    setSubmitting(false);
  };

  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Checkout</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        <Lock className="-mt-0.5 mr-1 inline h-3 w-3" /> Secure · 256-bit encrypted
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Section title="Contact">
            <Field label="Full name" name="name" placeholder="Jane Doe" required />
            <Field
              label="Email"
              name="email"
              type="email"
              placeholder="jane@example.com"
              required
            />
            <Field label="Phone" name="phone" type="tel" placeholder="+234 800 000 0000" required />
          </Section>

          <Section title="Delivery">
            <Field label="Address" name="address" placeholder="12 Awolowo Rd" required />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="City" name="city" placeholder="Lagos" required />
              <Field label="State" name="state" placeholder="Lagos" required />
            </div>
          </Section>

          <Section title="Payment method">
            <div className="grid gap-3 md:grid-cols-3">
              <PayOption
                icon={CreditCard}
                label="Paystack"
                sub="Card · USSD"
                active={method === "paystack"}
                onClick={() => setMethod("paystack")}
              />
              <PayOption
                icon={CreditCard}
                label="Flutterwave"
                sub="Card · Mobile"
                active={method === "flutterwave"}
                onClick={() => setMethod("flutterwave")}
              />
              <PayOption
                icon={Landmark}
                label="Bank transfer"
                sub="Manual"
                active={method === "transfer"}
                onClick={() => setMethod("transfer")}
              />
            </div>
          </Section>
        </div>

        <aside className="surface h-fit rounded-2xl p-6 lg:sticky lg:top-24">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Your order
          </h2>
          <ul className="mt-5 divide-y divide-hairline">
            {detailed.map((d) => (
              <li
                key={d.product.slug}
                className="flex items-center justify-between gap-3 py-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{d.product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Qty {d.qty} · {d.product.spec}
                  </p>
                </div>
                <p className="font-mono text-xs">{formatNGN(d.lineTotal)}</p>
              </li>
            ))}
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
              <dd className="font-mono text-xl font-semibold">{formatNGN(total)}</dd>
            </div>
          </dl>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow-red)] transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Processing…" : `Pay ${formatNGN(total)}`}
          </button>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            By placing this order you agree to our terms & warranty policy.
          </p>
        </aside>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="surface rounded-2xl p-6">
      <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </h2>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-xl border border-hairline bg-background/40 px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </label>
  );
}

function PayOption({
  icon: Icon,
  label,
  sub,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sub: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all ${
        active
          ? "border-primary bg-primary/5 shadow-[var(--shadow-glow-red)]"
          : "border-hairline hover:bg-accent"
      }`}
    >
      <Icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-[11px] text-muted-foreground">{sub}</p>
      </div>
    </button>
  );
}
