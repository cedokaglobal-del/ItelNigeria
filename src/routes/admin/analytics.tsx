import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMemo } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useCalculatorSessions } from "@/lib/admin-data";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { formatNGN, formatNumber } from "@/lib/format";
import { BarChart3, BatteryCharging, Cpu, Sun, Zap } from "lucide-react";

export const Route = createFileRoute("/admin/analytics")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !isAdminAuthenticated())
      throw redirect({ to: "/admin/login" });
  },
  head: () => ({ meta: [{ title: "Analytics — Itel Admin" }] }),
  component: AdminAnalytics,
});

function AdminAnalytics() {
  const sessions = useCalculatorSessions();
  const batterySplit = useMemo(
    () => ({
      lithium: sessions.filter((s) => s.batteryType === "lithium").length,
      tubular: sessions.filter((s) => s.batteryType === "tubular").length,
    }),
    [sessions],
  );
  const voltageSplit = useMemo(
    () => ({
      "48V": sessions.filter((s) => s.systemVoltage === 48).length,
      "24V": sessions.filter((s) => s.systemVoltage === 24).length,
    }),
    [sessions],
  );
  const totalSessions = sessions.length;
  const avgKWh =
    totalSessions > 0 ? sessions.reduce((s, c) => s + c.dailyKWh, 0) / totalSessions : 0;
  const avgCost =
    totalSessions > 0
      ? Math.round(sessions.reduce((s, c) => s + c.estimatedCost, 0) / totalSessions)
      : 0;
  const avgPanels =
    totalSessions > 0 ? sessions.reduce((s, c) => s + c.panelCount, 0) / totalSessions : 0;
  const totalPotentialRevenue = sessions.reduce((s, c) => s + c.estimatedCost, 0);
  const avgCostByBattery = useMemo(
    () => ({
      lithium:
        batterySplit.lithium > 0
          ? Math.round(
              sessions
                .filter((s) => s.batteryType === "lithium")
                .reduce((s, c) => s + c.estimatedCost, 0) / batterySplit.lithium,
            )
          : 0,
      tubular:
        batterySplit.tubular > 0
          ? Math.round(
              sessions
                .filter((s) => s.batteryType === "tubular")
                .reduce((s, c) => s + c.estimatedCost, 0) / batterySplit.tubular,
            )
          : 0,
    }),
    [sessions, batterySplit],
  );
  const maxDailyKWh = sessions.length > 0 ? Math.max(...sessions.map((s) => s.dailyKWh)) : 0;
  const maxPanels = sessions.length > 0 ? Math.max(...sessions.map((s) => s.panelCount)) : 0;
  const maxInverter = sessions.length > 0 ? Math.max(...sessions.map((s) => s.inverterKVA)) : 0;

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Calculator usage and system sizing insights
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={Zap}
          label="Total calculations"
          value={formatNumber(totalSessions)}
          sub="All time"
        />
        <MetricCard
          icon={Sun}
          label="Avg. daily load"
          value={`${avgKWh.toFixed(1)} kWh`}
          sub="Across all sessions"
        />
        <MetricCard
          icon={BarChart3}
          label="Avg. system cost"
          value={formatNGN(avgCost)}
          sub="Per calculation"
        />
        <MetricCard
          icon={Cpu}
          label="Avg. panels per sys"
          value={avgPanels.toFixed(1)}
          sub="550W panels"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="mb-1 text-sm font-semibold">Battery type preference</h2>
          <p className="mb-5 text-xs text-muted-foreground">
            LiFePO4 vs Tubular across all sessions
          </p>
          <div className="space-y-4">
            <BarRow
              label="LiFePO4"
              value={batterySplit.lithium}
              total={totalSessions}
              color="var(--primary)"
            />
            <BarRow
              label="Tubular"
              value={batterySplit.tubular}
              total={totalSessions}
              color="var(--solar)"
            />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl border bg-surface px-4 py-4">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Avg. LiFePO4 cost
              </p>
              <p className="mt-1 font-mono text-base font-semibold">
                {formatNGN(avgCostByBattery.lithium)}
              </p>
            </div>
            <div className="rounded-xl border bg-surface px-4 py-4">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Avg. Tubular cost
              </p>
              <p className="mt-1 font-mono text-base font-semibold">
                {formatNGN(avgCostByBattery.tubular)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="mb-1 text-sm font-semibold">System voltage preference</h2>
          <p className="mb-5 text-xs text-muted-foreground">24V vs 48V system designs</p>
          <div className="space-y-4">
            <BarRow
              label="48V"
              value={voltageSplit["48V"]}
              total={totalSessions}
              color="var(--primary)"
            />
            <BarRow
              label="24V"
              value={voltageSplit["24V"]}
              total={totalSessions}
              color="var(--tech)"
            />
          </div>
          <div className="mt-6 rounded-xl border bg-surface px-4 py-4">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              <BatteryCharging className="-mt-0.5 mr-1 inline h-3 w-3" />
              Potential revenue from calculator
            </p>
            <p className="mt-1 font-mono text-lg font-bold">{formatNGN(totalPotentialRevenue)}</p>
            <p className="text-xs text-muted-foreground">
              If every calculated system was purchased
            </p>
          </div>
        </div>
      </div>

      {sessions.length > 0 && (
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <SessionCard
            icon={Zap}
            label="Largest system"
            value={`${maxDailyKWh.toFixed(1)} kWh/day`}
            sub={`${maxPanels} panels · ${maxInverter} kVA`}
          />
          <SessionCard
            icon={BarChart3}
            label="Average payback"
            value={`${avgCost > 0 ? (avgCost / 850 / 30).toFixed(1) : "—"} months`}
            sub="Based on ₦850/kWh generator cost"
          />
          <SessionCard
            icon={Sun}
            label="CO₂ saved potential"
            value={`${formatNumber(Math.round(sessions.reduce((s, c) => s + c.dailyKWh, 0) * 365 * 0.7))} kg/yr`}
            sub={`~${formatNumber(Math.round((sessions.reduce((s, c) => s + c.dailyKWh, 0) * 365 * 0.7) / 21))} trees equivalent`}
          />
        </div>
      )}
    </AdminLayout>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
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

function BarRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {value} ({pct.toFixed(0)}%)
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

function SessionCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface">
          <Icon className="h-5 w-5 text-primary" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="truncate text-lg font-bold tracking-tight">{value}</p>
          <p className="truncate text-[11px] text-muted-foreground">{sub}</p>
        </div>
      </div>
    </div>
  );
}
