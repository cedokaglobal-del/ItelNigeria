import { Link, useLocation } from "@tanstack/react-router";
import { BarChart3, Box, LayoutDashboard, LogOut, ShoppingCart, Sparkles, Sun } from "lucide-react";

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Box },
  { to: "/admin/solar-systems", label: "Solar Systems", icon: Sun },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-dvh bg-surface">
      <aside className="hidden w-64 shrink-0 border-r bg-card p-6 lg:flex lg:flex-col">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            I
          </span>
          <span className="text-sm font-semibold">Itel Admin</span>
        </Link>

        <nav className="mt-8 flex flex-col gap-1">
          {nav.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t pt-4">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Back to site
          </Link>
        </div>
      </aside>

      { /* Mobile header */ }
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur lg:hidden">
          <div className="flex h-14 items-center justify-between px-4">
            <div className="flex items-center gap-2.5">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
                I
              </span>
              <span className="text-sm font-semibold">Itel Admin</span>
            </div>
            <MobileNav pathname={pathname} />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function MobileNav({ pathname }: { pathname: string }) {
  return (
    <nav className="flex gap-1">
      {nav.map((item) => {
        const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium ${
              active ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
