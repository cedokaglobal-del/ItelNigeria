import { Link, useLocation } from "@tanstack/react-router";
import { BarChart3, Box, LayoutDashboard, LogOut, ShoppingCart, Sun } from "lucide-react";
import { logoutAdmin } from "@/lib/admin-auth";
import { useRouter } from "@tanstack/react-router";

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Box },
  { to: "/admin/solar-systems", label: "Systems", icon: Sun },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const router = useRouter();

  function handleLogout() {
    logoutAdmin();
    router.navigate({ to: "/admin/login" });
  }

  return (
    <div className="flex min-h-dvh bg-surface">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r bg-card p-6 lg:flex lg:flex-col">
        <Link to="/admin" className="flex items-center gap-2.5">
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

        <div className="mt-auto space-y-1 border-t pt-4">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Back to site
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile layout */}
      <div className="flex flex-1 flex-col pb-16 lg:pb-0">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur lg:hidden">
          <div className="flex h-14 items-center justify-between px-4">
            <Link to="/admin" className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
                I
              </span>
              <span className="text-sm font-semibold">Itel Admin</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-red-500"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 backdrop-blur lg:hidden">
          <div className="flex items-center justify-around px-2">
            {nav.map((item) => {
              const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex flex-col items-center gap-0.5 py-2 px-3 text-[10px] font-medium transition-colors ${
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
