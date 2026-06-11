import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Edit3, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { formatNGN } from "@/lib/format";
import { useSolarSystems, type SolarSystem, type SolarComponent } from "@/lib/solar-systems";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin/solar-systems")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !isAdminAuthenticated()) throw redirect({ to: "/admin/login" });
  },
  head: () => [{ title: "Solar Systems — Itel Admin" }],
  component: AdminSolarSystems,
});

type FormState = { name: string; tagline: string; slug: string; price: number; voltage: string; totalPanels: number; panelWattage: number; inverterKVA: number; batteryCapacityKWh: number; batteryType: string; whatItPowers: string; description: string; components: SolarComponent[]; highlights: string[]; installationAccessories: string[] };

const emptyForm: FormState = {
  name: "", tagline: "", slug: "", price: 0, voltage: "48V",
  totalPanels: 4, panelWattage: 550, inverterKVA: 5, batteryCapacityKWh: 5.12,
  batteryType: "LiFePO4", whatItPowers: "", description: "",
  components: [{ type: "panel", name: "", spec: "", qty: 1 }],
  highlights: [""], installationAccessories: [""],
};

function systemToForm(sys: SolarSystem): FormState {
  return {
    name: sys.name, tagline: sys.tagline, slug: sys.slug, price: sys.price,
    voltage: sys.voltage, totalPanels: sys.totalPanels, panelWattage: sys.panelWattage,
    inverterKVA: sys.inverterKVA, batteryCapacityKWh: sys.batteryCapacityKWh,
    batteryType: sys.batteryType, whatItPowers: sys.whatItPowers, description: sys.description || "",
    components: sys.components, highlights: sys.highlights, installationAccessories: sys.installationAccessories,
  };
}

export function AdminSolarSystemsContent({ onPublish }: { onPublish?: (system: SolarSystem) => void }) {
  const [systems, updatePrice, addSystem, deleteSystem] = useSolarSystems();
  const [priceEdit, setPriceEdit] = useState<{ slug: string; price: number } | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);

  function handleSavePrice(slug: string, price: number) {
    updatePrice(slug, price);
    toast.success("Price updated");
    setPriceEdit(null);
  }

  function handleSaveSystem() {
    if (!form) return;
    const slug = form.slug.replace(/\s+/g, "-").toLowerCase();
    const existing = systems.find((s) => s.slug === slug);
    if (existing && editingSlug !== slug) {
      toast.error("A system with this slug already exists");
      return;
    }
    const system: SolarSystem = {
      slug,
      name: form.name,
      tagline: form.tagline,
      description: form.description,
      rating: existing?.rating ?? 0,
      reviews: existing?.reviews ?? 0,
      voltage: form.voltage as "24V" | "48V",
      totalPanels: form.totalPanels,
      panelWattage: form.panelWattage,
      inverterKVA: form.inverterKVA,
      batteryCapacityKWh: form.batteryCapacityKWh,
      batteryType: form.batteryType as "LiFePO4" | "Tubular",
      price: form.price,
      whatItPowers: form.whatItPowers,
      highlights: form.highlights.filter(Boolean),
      installationAccessories: form.installationAccessories.filter(Boolean),
      components: form.components.filter((c) => c.name),
    };
    if (editingSlug) {
      deleteSystem(editingSlug);
      addSystem(system);
      toast.success("Solar system updated");
    } else {
      addSystem(system);
      toast.success("Solar system created");
    }
    setForm(null);
    setEditingSlug(null);
  }

  function confirmDelete(slug: string, name: string) {
    if (window.confirm(`Delete "${name}"? This cannot be undone.`)) {
      deleteSystem(slug);
      toast.success("System deleted");
    }
  }

  function energyInfo(sys: SolarSystem) {
    const arrayKw = (sys.totalPanels * sys.panelWattage / 1000).toFixed(2);
    const dailyKwh = (sys.totalPanels * sys.panelWattage * 5.5 / 1000).toFixed(1);
    return { arrayKw, dailyKwh };
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Solar Systems</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage pre-configured solar system combos</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingSlug(null);
            setForm({ ...emptyForm });
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> New system
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {systems.map((sys) => {
          const { arrayKw, dailyKwh } = energyInfo(sys);
          const compCount = sys.components.length;
          return (
            <div key={sys.slug} className="rounded-xl border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{sys.name}</p>
                    {sys.badge && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">{sys.badge}</span>}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{sys.voltage} · {sys.totalPanels}×{sys.panelWattage}W · {sys.inverterKVA}kVA · {sys.batteryCapacityKWh}kWh</p>
                </div>
                <p className="font-mono text-sm font-semibold">{formatNGN(sys.price)}</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPriceEdit({ slug: sys.slug, price: sys.price })}
                    className="rounded-lg border p-2 text-muted-foreground hover:bg-accent"
                    title="Edit price"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditingSlug(sys.slug); setForm(systemToForm(sys)); }}
                    className="rounded-lg border p-2 text-muted-foreground hover:bg-accent"
                    title="Edit full system"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => confirmDelete(sys.slug, sys.name)}
                    className="rounded-lg border p-2 text-red-500 hover:bg-red-50"
                    title="Delete system"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {/* Energy calculation display */}
              <div className="mt-3 flex flex-wrap items-center gap-3 border-t pt-3">
                <EnergyMetric label="Array" value={`${arrayKw} kW`} />
                <EnergyMetric label="Daily yield" value={`${dailyKwh} kWh`} />
                <EnergyMetric label="Components" value={`${compCount} items`} />
                <EnergyMetric label="Price/kWh" value={formatNGN(Math.round(sys.price / Number(dailyKwh)))} sub="/day" />
                {onPublish && (
                  <button
                    type="button"
                    onClick={() => onPublish(sys)}
                    className="ml-auto rounded-lg bg-primary/10 px-3 py-1.5 text-[11px] font-semibold text-primary hover:bg-primary/20"
                  >
                    Publish to catalog
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Price edit modal */}
      {priceEdit && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4">
          <div className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Edit price</h2>
              <button onClick={() => setPriceEdit(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <label className="mt-4 block text-xs font-medium text-muted-foreground">Price (NGN)</label>
            <input
              type="number"
              value={priceEdit.price}
              onChange={(e) => setPriceEdit({ ...priceEdit, price: Number(e.target.value) })}
              className="mt-1 w-full rounded-xl border bg-surface px-4 py-2.5 text-sm"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setPriceEdit(null)} className="rounded-xl border px-4 py-2 text-sm">Cancel</button>
              <button onClick={() => handleSavePrice(priceEdit.slug, priceEdit.price)} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Create/edit system modal */}
      {form && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/30 px-4 py-10">
          <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{editingSlug ? "Edit system" : "New solar system"}</h2>
              <button onClick={() => { setForm(null); setEditingSlug(null); }} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              <Field label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} />
              <div className="sm:col-span-2">
                <Field label="Tagline" value={form.tagline} onChange={(v) => setForm({ ...form, tagline: v })} />
              </div>
              <div className="sm:col-span-2">
                <Field label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
              </div>
              <Field label="Price (NGN)" type="number" value={String(form.price)} onChange={(v) => setForm({ ...form, price: Number(v) })} />
              <Select label="Voltage" value={form.voltage} options={["24V", "48V"]} onChange={(v) => setForm({ ...form, voltage: v })} />
              <Field label="Panels (qty)" type="number" value={String(form.totalPanels)} onChange={(v) => setForm({ ...form, totalPanels: Number(v) })} />
              <Field label="Panel wattage" type="number" value={String(form.panelWattage)} onChange={(v) => setForm({ ...form, panelWattage: Number(v) })} />
              <Field label="Inverter (kVA)" type="number" value={String(form.inverterKVA)} onChange={(v) => setForm({ ...form, inverterKVA: Number(v) })} />
              <Field label="Battery (kWh)" type="number" value={String(form.batteryCapacityKWh)} onChange={(v) => setForm({ ...form, batteryCapacityKWh: Number(v) })} />
              <Select label="Battery type" value={form.batteryType} options={["LiFePO4", "Tubular"]} onChange={(v) => setForm({ ...form, batteryType: v })} />
              <div className="sm:col-span-2">
                <Field label="What it powers" value={form.whatItPowers} onChange={(v) => setForm({ ...form, whatItPowers: v })} />
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Components</p>
              {form.components.map((c, i) => (
                <div key={i} className="mt-2 flex flex-wrap items-end gap-2 rounded-xl border bg-surface p-3">
                  <Select label="Type" value={c.type} options={["panel", "inverter", "battery", "accessory"]} onChange={(v) => {
                    const comps = [...form.components];
                    comps[i] = { ...comps[i], type: v as SolarComponent["type"] };
                    setForm({ ...form, components: comps });
                  }} />
                  <input placeholder="Name" value={c.name} onChange={(e) => {
                    const comps = [...form.components];
                    comps[i] = { ...comps[i], name: e.target.value };
                    setForm({ ...form, components: comps });
                  }} className="flex-1 rounded-lg border bg-card px-3 py-2 text-xs" />
                  <input placeholder="Spec" value={c.spec} onChange={(e) => {
                    const comps = [...form.components];
                    comps[i] = { ...comps[i], spec: e.target.value };
                    setForm({ ...form, components: comps });
                  }} className="w-32 rounded-lg border bg-card px-3 py-2 text-xs" />
                  <input placeholder="Qty" type="number" value={c.qty} onChange={(e) => {
                    const comps = [...form.components];
                    comps[i] = { ...comps[i], qty: Number(e.target.value) };
                    setForm({ ...form, components: comps });
                  }} className="w-16 rounded-lg border bg-card px-3 py-2 text-xs" />
                  <button onClick={() => {
                    setForm({ ...form, components: form.components.filter((_, j) => j !== i) });
                  }} className="rounded-lg border p-2 text-muted-foreground"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              ))}
              <button
                onClick={() => setForm({ ...form, components: [...form.components, { type: "panel", name: "", spec: "", qty: 1 }] })}
                className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-3 w-3" /> Add component
              </button>
            </div>

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Highlights (one per line)</p>
              <textarea
                value={form.highlights.join("\n")}
                onChange={(e) => setForm({ ...form, highlights: e.target.value.split("\n") })}
                className="mt-1 w-full rounded-xl border bg-surface px-4 py-2.5 text-sm"
                rows={4}
              />
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Installation accessories (one per line)</p>
              <textarea
                value={form.installationAccessories.join("\n")}
                onChange={(e) => setForm({ ...form, installationAccessories: e.target.value.split("\n") })}
                className="mt-1 w-full rounded-xl border bg-surface px-4 py-2.5 text-sm"
                rows={4}
              />
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t pt-4">
              <button onClick={() => { setForm(null); setEditingSlug(null); }} className="rounded-xl border px-4 py-2 text-sm">Cancel</button>
              <button onClick={handleSaveSystem} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                {editingSlug ? "Save changes" : "Create system"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function AdminSolarSystems() {
  return (
    <AdminLayout>
      <AdminSolarSystemsContent />
    </AdminLayout>
  );
}

function EnergyMetric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg border bg-surface px-3 py-1.5">
      <span className="text-[10px] font-medium text-muted-foreground">{label}:</span>
      <span className="text-xs font-semibold">{value}</span>
      {sub && <span className="text-[10px] text-muted-foreground">{sub}</span>}
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground">{label}</label>
      {type === "textarea" ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-xl border bg-surface px-4 py-2.5 text-sm" rows={3} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-xl border bg-surface px-4 py-2.5 text-sm" />
      )}
    </div>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-xl border bg-surface px-4 py-2.5 text-sm">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
