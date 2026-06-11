import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { STATUSES, statusColor, statusLabel, useOrders, type OrderStatus } from "@/lib/admin-data";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { formatNGN } from "@/lib/format";
import { Check, ChevronDown, Search } from "lucide-react";

export const Route = createFileRoute("/admin/orders")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !isAdminAuthenticated()) throw redirect({ to: "/admin/login" });
  },
  head: () => ({ meta: [{ title: "Orders — Itel Admin" }] }),
  component: AdminOrders,
});

const STATUS_FILTERS: (OrderStatus | "all")[] = ["all", ...STATUSES];

function AdminOrders() {
  const [orders, updateStatus] = useOrders();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    let list = orders;
    if (statusFilter !== "all") list = list.filter((o) => o.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((o) => o.id.toLowerCase().includes(q) || o.customer.name.toLowerCase().includes(q) || o.customer.email.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [orders, search, statusFilter]);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">{orders.length} total orders</p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 md:max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by order ID, name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border bg-card py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                statusFilter === s
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-hairline text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {s === "all" ? "All" : statusLabel(s)}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm" ref={dropdownRef}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-surface text-left text-xs font-medium text-muted-foreground">
                <th className="px-4 py-3 md:px-6">Order</th>
                <th className="px-4 py-3 md:px-6">Customer</th>
                <th className="px-4 py-3 text-right md:px-6">Total</th>
                <th className="px-4 py-3 text-center md:px-6">Status</th>
                <th className="px-4 py-3 text-right md:px-6">Payment</th>
                <th className="px-4 py-3 text-right md:px-6">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((o) => (
                <tr key={o.id} className="transition-colors hover:bg-surface/50">
                  <td className="px-4 py-3 font-mono text-xs font-semibold md:px-6">{o.id}</td>
                  <td className="px-4 py-3 md:px-6">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{o.customer.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{o.customer.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs font-semibold md:px-6">{formatNGN(o.total)}</td>
                  <td className="px-4 py-3 text-center md:px-6">
                    <div className="relative inline-block">
                      <button
                        type="button"
                        onClick={() => setOpenDropdown(openDropdown === o.id ? null : o.id)}
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-medium capitalize transition-all hover:opacity-80"
                        style={{ background: `color-mix(in oklab, ${statusColor(o.status)} 15%, transparent)`, color: statusColor(o.status) }}
                      >
                        {statusLabel(o.status)}
                        <ChevronDown className="h-3 w-3" />
                      </button>
                      {openDropdown === o.id && (
                        <div className="absolute left-1/2 top-full z-50 mt-1 w-40 -translate-x-1/2 rounded-xl border bg-card p-1 shadow-lg">
                          {STATUSES.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => { updateStatus(o.id, s); setOpenDropdown(null); }}
                              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium capitalize transition-colors hover:bg-surface ${
                                s === o.status ? "text-foreground" : "text-muted-foreground"
                              }`}
                            >
                              <span className="h-2 w-2 rounded-full" style={{ background: statusColor(s) }} />
                              {statusLabel(s)}
                              {s === o.status && <Check className="ml-auto h-3 w-3" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-xs capitalize text-muted-foreground md:px-6">{o.payment}</td>
                  <td className="px-4 py-3 text-right text-xs text-muted-foreground md:px-6">{new Date(o.date).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">No orders match your filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
