import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Box,
  DollarSign,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Package,
  Plus,
  Settings,
} from "lucide-react";
import { useMemo } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  getDashboardStats,
  useCalculatorSessions,
  useOrders,
  useProducts,
  statusColor,
  statusLabel,
} from "@/lib/admin-data";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { formatNGN } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin/")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !isAdminAuthenticated())
      throw redirect({ to: "/admin/login" });
  },
  head: () => ({ meta: [{ title: "Admin Dashboard — ItelNigeria" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const [orders, , ordersLoading] = useOrders();
  const [sessions, sessionsLoading] = useCalculatorSessions();
  const [products, , , , , productsLoading] = useProducts();
  const stats = useMemo(
    () => getDashboardStats(orders, sessions, products.length),
    [orders, sessions, products.length],
  );
  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5),
    [orders],
  );
  const lithiumPct =
    sessions.length > 0
      ? Math.round(
          (sessions.filter((s) => s.batteryType === "lithium").length / sessions.length) * 100,
        )
      : 0;
  const avgKWh =
    sessions.length > 0 ? sessions.reduce((s, c) => s + c.dailyKWh, 0) / sessions.length : 0;
  const conversionRate =
    stats.totalCalculatorSessions > 0
      ? Math.round((stats.totalOrders / stats.totalCalculatorSessions) * 100)
      : 0;

  const isLoading = ordersLoading || sessionsLoading || productsLoading;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div style={{ animationDelay: "0.1s" }} className="animate-fade-in-up">
            <Skeleton className="h-8 w-48 rounded-lg mb-6" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ animationDelay: `${0.1 + i * 0.08}s` }} className="animate-fade-in-up">
                <Skeleton className="h-28 rounded-2xl" />
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div style={{ animationDelay: "0.4s" }} className="animate-fade-in-up lg:col-span-2">
              <Skeleton className="h-8 w-32 rounded-lg mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-16 rounded-xl" />
                ))}
              </div>
            </div>
            <div style={{ animationDelay: "0.5s" }} className="animate-fade-in-up space-y-4">
              <Skeleton className="h-8 w-24 rounded-lg" />
              <div className="space-y-3 mt-4">
                {[1, 2, 3, 4].map((j) => (
                  <Skeleton key={j} className="h-10 rounded-xl" />
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div style={{ animationDelay: "0.55s" }} className="animate-fade-in-up">
              <Skeleton className="h-8 w-32 rounded-lg mb-4" />
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((j) => (
                  <Skeleton key={j} className="h-24 rounded-xl" />
                ))}
              </div>
            </div>
            <div style={{ animationDelay: "0.7s" }} className="animate-fade-in-up">
              <Skeleton className="h-8 w-32 rounded-lg mb-4" />
              <div className="space-y-4">
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-16 rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8 animate-fade-in-up">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">Your ItelNigeria store at a glance</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/admin/products"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.97]"
            >
              <Plus className="h-3.5 w-3.5" /> Add product
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={DollarSign}
          label="Total revenue"
          value={formatNGN(stats.totalRevenue)}
          sub={`${stats.totalOrders} orders`}
          delay={1}
        />
        <StatCard
          icon={ShoppingCart}
          label="Pending orders"
          value={String(stats.pendingOrders)}
          sub={`${stats.totalOrders} total`}
          tone="accent"
          delay={2}
        />
        <StatCard
          icon={Package}
          label="Products"
          value={String(stats.totalProducts)}
          sub="In catalog"
          delay={3}
        />
        <StatCard
          icon={TrendingUp}
          label="Conversion rate"
          value={`${conversionRate}%`}
          sub={`${stats.totalCalculatorSessions} calculators`}
          tone="accent"
          delay={4}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="animate-fade-in-up animate-delay-2 rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent orders</h2>
            <Link
              to="/admin/orders"
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {recentOrders.length === 0 && (
              <div className="flex flex-col items-center gap-2 rounded-xl border bg-surface px-4 py-8 text-center">
                <ShoppingCart className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No orders yet</p>
                <p className="text-xs text-muted-foreground/60">
                  Orders will appear here when customers check out
                </p>
              </div>
            )}
            {recentOrders.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between rounded-xl border bg-surface px-4 py-3 transition-all hover:border-primary/20 hover:bg-accent/50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Users className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{o.customer.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {o.id.slice(0, 8)} &middot; {formatNGN(o.total)}
                    </p>
                  </div>
                </div>
                <span
                  className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium capitalize"
                  style={{
                    background: `color-mix(in oklab, ${statusColor(o.status)} 15%, transparent)`,
                    color: statusColor(o.status),
                  }}
                >
                  {statusLabel(o.status)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="animate-fade-in-up animate-delay-3 space-y-4">
          <div className="rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
            <h2 className="text-sm font-semibold">Order status</h2>
            <div className="mt-4 space-y-3">
              {[
                { status: "pending" as const, icon: Clock, color: statusColor("pending") },
                { status: "processing" as const, icon: AlertCircle, color: statusColor("processing") },
                { status: "shipped" as const, icon: Package, color: statusColor("shipped") },
                { status: "delivered" as const, icon: CheckCircle2, color: statusColor("delivered") },
              ].map(({ status, icon: Icon, color }) => {
                const count = orders.filter((o) => o.status === status).length;
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5" style={{ color }} />
                      <span className="text-xs capitalize text-muted-foreground">{status}</span>
                    </div>
                    <span className="text-xs font-semibold">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Quick actions</h2>
            </div>
            <div className="mt-4 space-y-2">
              <QuickAction to="/admin/products" icon={Package} label="Manage products" />
              <QuickAction to="/admin/categories" icon={Settings} label="Manage categories" />
              <QuickAction to="/admin/orders" icon={ShoppingCart} label="View orders" />
              <QuickAction to="/" icon={BarChart3} label="View live site" external />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="animate-fade-in-up animate-delay-4 rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <h2 className="text-sm font-semibold">Calculator insights</h2>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <InsightCard label="LiFePO4 preference" value={`${lithiumPct}%`} sub="choose lithium" />
            <InsightCard label="Avg. daily load" value={`${avgKWh.toFixed(1)} kWh`} sub="per session" />
            <InsightCard label="Avg. system cost" value={formatNGN(stats.avgSystemCost)} sub="per calculation" />
            <InsightCard
              label="48V adoption"
              value={
                sessions.length > 0
                  ? `${Math.round((sessions.filter((s) => s.systemVoltage === 48).length / sessions.length) * 100)}%`
                  : "0%"
              }
              sub="prefer 48V"
            />
          </div>
          <Link
            to="/admin/analytics"
            className="mt-4 flex items-center justify-center gap-1 rounded-xl border bg-surface py-2.5 text-xs font-medium text-primary transition-all hover:bg-accent"
          >
            <BarChart3 className="h-3.5 w-3.5" /> View full analytics
          </Link>
        </div>

        <div className="animate-fade-in-up animate-delay-5 rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Store performance</h2>
            <Sparkles className="h-4 w-4 text-solar" />
          </div>
          <div className="mt-4 space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Delivered</span>
                <span className="font-medium">{stats.deliveredOrders} / {stats.totalOrders}</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-accent">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{
                    width: stats.totalOrders > 0 ? `${(stats.deliveredOrders / stats.totalOrders) * 100}%` : "0%",
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Calculator → Order</span>
                <span className="font-medium">{conversionRate}%</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-accent">
                <div
                  className="h-full rounded-full bg-solar transition-all duration-700"
                  style={{ width: `${conversionRate}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Products in stock</span>
                <span className="font-medium">{products.filter((p) => p.inStock !== false).length} / {products.length}</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-accent">
                <div
                  className="h-full rounded-full bg-green-500 transition-all duration-700"
                  style={{
                    width:
                      products.length > 0
                        ? `${((products.filter((p) => p.inStock !== false).length / products.length) * 100)}%`
                        : "0%",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone,
  delay = 1,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  tone?: "accent";
  delay?: number;
}) {
  return (
    <div
      className={`animate-fade-in-up animate-delay-${delay} rounded-2xl border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tone === "accent" ? "bg-primary/10 text-primary" : "bg-surface text-muted-foreground"}`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="truncate text-lg font-bold tracking-tight">{value}</p>
          <p className="text-[11px] text-muted-foreground">{sub}</p>
        </div>
      </div>
    </div>
  );
}

function InsightCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border bg-surface px-4 py-5 transition-all hover:border-primary/20">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function QuickAction({
  to,
  icon: Icon,
  label,
  external,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  external?: boolean;
}) {
  const Comp = external ? "a" : Link;
  const props = external ? { href: to, target: "_blank", rel: "noopener" } : { to };
  return (
    <Comp
      {...props}
      className="flex items-center gap-2 rounded-xl border bg-surface px-4 py-2.5 text-xs font-medium text-foreground/80 transition-all hover:border-primary/20 hover:bg-accent hover:text-foreground"
    >
      <Icon className="h-3.5 w-3.5 text-primary" />
      {label}
      <ArrowRight className="ml-auto h-3 w-3 text-muted-foreground" />
    </Comp>
  );
}
