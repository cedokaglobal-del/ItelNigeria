import { Link, useLocation } from "@tanstack/react-router";
import { BarChart3, Box, Database, Layers, LayoutDashboard, LogOut, ShoppingCart, Sun } from "lucide-react";
import { logoutAdmin } from "@/lib/admin-auth";
import { useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Box },
  { to: "/admin/categories", label: "Categories", icon: Layers },
  { to: "/admin/solar-systems", label: "Systems", icon: Sun },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/setup", label: "DB Setup", icon: Database },
];

function SupabaseStatus() {
  const [status, setStatus] = useState<"checking" | "connected" | "disconnected">("checking");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const { error } = await supabase.from("products").select("slug", { count: "exact", head: true });
        if (cancelled) return;
        if (error) {
          setStatus("disconnected");
          setErrorMsg(error.message);
        } else {
          setStatus("connected");
          setErrorMsg(null);
        }
      } catch {
        if (!cancelled) setStatus("disconnected");
      }
    };
    check();
    return () => { cancelled = true; };
  }, []);

  const dot = status === "connected" ? "bg-green-500" : status === "disconnected" ? "bg-red-400" : "bg-amber-400 animate-pulse";
  const label = status === "connected" ? "Connected" : status === "disconnected" ? `Disconnected: ${errorMsg ?? "check console"}` : "Checking…";
  const link = status === "disconnected"
    ? { to: "/admin/setup" as const, label: "Fix" }
    : null;

  return (
    <div className="flex items-center gap-1.5" title={label}>
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      <span className="text-[10px] text-muted-foreground hidden sm:inline max-w-32 truncate">{label}</span>
      {link && (
        <Link
          to={link.to}
          className="text-[10px] font-medium text-primary underline underline-offset-2"
        >
          {link.label}
        </Link>
      )}
    </div>
  );
}

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
      <aside className="hidden w-64 shrink-0 border-r bg-card p-6 shadow-[4px_0_24px_rgba(0,0,0,0.02)] lg:flex lg:flex-col z-10">
        <Link to="/admin" aria-label="Itel Admin Dashboard">
          <img
            src="/Image/logo/itellogonigera.png"
            alt="ItelNigeria Logo"
            className="h-11 w-auto object-contain"
          />
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
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
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
          <SupabaseStatus />
          <div className="h-2" />
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
            <Link to="/admin" aria-label="Itel Admin Dashboard">
              <img
                src="/Image/logo/itellogonigera.png"
                alt="ItelNigeria Logo"
                className="h-9 w-auto object-contain"
              />
            </Link>
            <div className="flex items-center gap-3">
              <SupabaseStatus />
              <button
              type="button"
              onClick={handleLogout}
              className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-red-500"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
            </div>
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
