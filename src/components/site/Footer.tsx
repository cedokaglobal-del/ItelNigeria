import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-hairline">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            Premium solar equipment and intelligent sizing for homes and businesses across Nigeria.
          </p>
        </div>

        <FooterCol title="Shop">
          <FLink to="/shop">All products</FLink>
          <FLink to="/shop">Solar panels</FLink>
          <FLink to="/shop">Inverters</FLink>
          <FLink to="/shop">Batteries</FLink>
          <FLink to="/solar-systems">Solar systems</FLink>
        </FooterCol>

        <FooterCol title="Tools">
          <FLink to="/calculator">Solar calculator</FLink>
          <FLink to="/shop">Compare products</FLink>
          <FLink to="/cart">My cart</FLink>
        </FooterCol>

        <FooterCol title="Company">
          <FLink to="/">About</FLink>
          <FLink to="/">Installers</FLink>
          <FLink to="/">Warranty</FLink>
          <FLink to="/">Contact</FLink>
        </FooterCol>
      </div>

      <div className="border-t border-hairline">
        <div className="container-page flex flex-col items-start justify-between gap-3 py-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} ItelNigeria. Powering independence.</p>
          <p>NGN pricing · Free delivery in Lagos · Pay with Paystack & Flutterwave</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </h4>
      <ul className="space-y-2 text-sm">{children}</ul>
    </div>
  );
}

function FLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <Link to={to} className="text-foreground/80 transition-colors hover:text-foreground">
        {children}
      </Link>
    </li>
  );
}
