import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowRight, BarChart3, Box, DollarSign, ShoppingCart, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  getDashboardStats,
  useCalculatorSessions,
  useOrders,
  statusColor,
  statusLabel,
} from "@/lib/admin-data";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { formatNGN } from "@/lib/format";

export const Route = createFileRoute("/admin/")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !isAdminAuthenticated())
      throw redirect({ to: "/admin/login" });
  },
  head: () => ({ meta: [{ title: "Admin Dashboard — Itel Energy" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const [orders] = useOrders();
  const sessions = useCalculatorSessions();
  const stats = useMemo(() => getDashboardStats(orders, sessions), [orders, sessions]);
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

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Overview of your Itel Energy store</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={DollarSign}
          label="Total revenue"
          value={formatNGN(stats.totalRevenue)}
          sub={`${stats.totalOrders} orders`}
        />
        <StatCard
          icon={ShoppingCart}
          label="Pending orders"
          value={String(stats.pendingOrders)}
          sub={`${stats.totalOrders} total orders`}
          tone="accent"
        />
        <StatCard
          icon={Box}
          label="Products"
          value={String(stats.totalProducts)}
          sub="In catalog"
        />
        <StatCard
          icon={Sparkles}
          label="Avg. system cost"
          value={formatNGN(stats.avgSystemCost)}
          sub={`${stats.totalCalculatorSessions} calculations`}
          tone="accent"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
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
            {recentOrders.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between rounded-xl border bg-surface px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{o.customer.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {o.id} &middot; {formatNGN(o.total)}
                  </p>
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

        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-semibold">Calculator insights</h2>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-xl border bg-surface px-4 py-5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                LiFePO4 preference
              </p>
              <p className="mt-1 text-2xl font-bold">{lithiumPct}%</p>
              <p className="text-xs text-muted-foreground">of users choose lithium</p>
            </div>
            <div className="rounded-xl border bg-surface px-4 py-5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Avg. daily load
              </p>
              <p className="mt-1 text-2xl font-bold">{avgKWh.toFixed(1)} kWh</p>
              <p className="text-xs text-muted-foreground">across all sessions</p>
            </div>
            <div className="rounded-xl border bg-surface px-4 py-5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Avg. system cost
              </p>
              <p className="mt-1 text-2xl font-bold">{formatNGN(stats.avgSystemCost)}</p>
              <p className="text-xs text-muted-foreground">per calculation</p>
            </div>
            <div className="rounded-xl border bg-surface px-4 py-5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                48V adoption
              </p>
              <p className="mt-1 text-2xl font-bold">
                {sessions.length > 0
                  ? Math.round(
                      (sessions.filter((s) => s.systemVoltage === 48).length / sessions.length) *
                        100,
                    )
                  : 0}
                %
              </p>
              <p className="text-xs text-muted-foreground">prefer 48V systems</p>
            </div>
          </div>
          <Link
            to="/admin/analytics"
            className="mt-4 flex items-center justify-center gap-1 rounded-xl border bg-surface py-2.5 text-xs font-medium text-primary hover:bg-accent"
          >
            <BarChart3 className="h-3.5 w-3.5" /> View full analytics
          </Link>
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
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  tone?: "accent";
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span
          className={`grid h-10 w-10 place-items-center rounded-xl ${tone === "accent" ? "bg-primary/10 text-primary" : "bg-surface text-muted-foreground"}`}
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
