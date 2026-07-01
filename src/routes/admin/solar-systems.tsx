import { createFileRoute, redirect } from "@tanstack/react-router";
import React, { useState, useMemo } from "react";
import { Edit3, Plus, Trash2, X, Tag, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useProducts } from "@/lib/admin-data";
import { formatNGN } from "@/lib/format";
import {
  useSolarSystems,
  calculateSystemPrice,
  type SolarSystem,
  type SolarComponent,
} from "@/lib/solar-systems";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { uploadImage } from "@/lib/supabase";
import { ImagePlus } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/admin/solar-systems")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !isAdminAuthenticated())
      throw redirect({ to: "/admin/login" });
  },
  head: () => ({ meta: [{ title: "Solar Systems — Itel Admin" }] }),
  component: AdminSolarSystems,
});

type FormState = {
  name: string;
  tagline: string;
  slug: string;
  /** Selling price (after discount if any) */
  price: number;
  /** Discount amount in NGN — 0 means no discount */
  discountAmount: number;
  voltage: string;
  totalPanels: number;
  panelWattage: number;
  inverterKVA: number;
  batteryCapacityKWh: number;
  batteryType: string;
  whatItPowers: string;
  description: string;
  images: string;
  components: SolarComponent[];
  highlights: string[];
  installationAccessories: string[];
};

const emptyForm: FormState = {
  name: "",
  tagline: "",
  slug: "",
  price: 0,
  discountAmount: 0,
  voltage: "48V",
  totalPanels: 4,
  panelWattage: 550,
  inverterKVA: 5,
  batteryCapacityKWh: 5.12,
  batteryType: "LiFePO4",
  whatItPowers: "",
  description: "",
  images: "",
  components: [{ type: "panel", name: "", spec: "", qty: 1 }],
  highlights: [""],
  installationAccessories: [""],
};

function systemToForm(sys: SolarSystem): FormState {
  const originalPrice = sys.originalPrice ?? sys.price;
  const discountAmount = originalPrice > sys.price ? originalPrice - sys.price : 0;
  return {
    name: sys.name,
    tagline: sys.tagline,
    slug: sys.slug,
    price: sys.price,
    discountAmount,
    voltage: sys.voltage,
    totalPanels: sys.totalPanels,
    panelWattage: sys.panelWattage,
    inverterKVA: sys.inverterKVA,
    batteryCapacityKWh: sys.batteryCapacityKWh,
    batteryType: sys.batteryType,
    whatItPowers: sys.whatItPowers,
    description: sys.description || "",
    images: sys.images?.join("\n") || "",
    components: sys.components,
    highlights: sys.highlights,
    installationAccessories: sys.installationAccessories,
  };
}

export function AdminSolarSystemsContent({
  onPublish,
}: {
  onPublish?: (system: SolarSystem) => void;
}) {
  const [systems, updatePrice, addSystem, deleteSystem, updateSystem] = useSolarSystems();
  const [priceEdit, setPriceEdit] = useState<{ slug: string; price: number } | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const [products] = useProducts();

  /** Computed cost from component catalog prices — live preview in the admin form */
  const computedPrice = useMemo(() => {
    if (!form || !products) return 0;
    return calculateSystemPrice(form.components.filter((c) => c.name), products);
  }, [form?.components, products]);

  /** Final selling price (computed minus discount) */
  const sellingPrice = useMemo(() => {
    if (!form) return 0;
    const base = form.price > 0 ? form.price : computedPrice;
    return Math.max(0, base - (form.discountAmount ?? 0));
  }, [form?.price, form?.discountAmount, computedPrice]);

  const discountPct = useMemo(() => {
    if (!form || form.discountAmount <= 0) return 0;
    const base = form.price > 0 ? form.price : computedPrice;
    if (base <= 0) return 0;
    return Math.round((form.discountAmount / base) * 100);
  }, [form?.price, form?.discountAmount, computedPrice]);

  async function handleImagesFromFiles(files: FileList | null) {
    if (!files) return;
    toast.info(`Uploading ${files.length} images to Supabase...`);
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const url = await uploadImage(files[i]);
      if (url) urls.push(url);
    }
    const existing = form?.images ? form.images.split("\n").filter(Boolean) : [];
    setForm((prev) => (prev ? { ...prev, images: [...existing, ...urls].join("\n") } : prev));
    toast.success(`Uploaded ${urls.length} images`);
  }

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

    // Use manually entered price if set, else fall back to computed
    const basePrice = form.price > 0 ? form.price : computedPrice;
    const finalPrice = Math.max(0, basePrice - (form.discountAmount ?? 0));
    const hasDiscount = form.discountAmount > 0;

    const system: SolarSystem = {
      slug,
      name: form.name,
      tagline: form.tagline,
      description: form.description,
      images: form.images.split("\n").map((s) => s.trim()).filter(Boolean),
      rating: existing?.rating ?? 0,
      reviews: existing?.reviews ?? 0,
      voltage: form.voltage as "24V" | "48V",
      totalPanels: form.totalPanels,
      panelWattage: form.panelWattage,
      inverterKVA: form.inverterKVA,
      batteryCapacityKWh: form.batteryCapacityKWh,
      batteryType: form.batteryType as "LiFePO4" | "Tubular",
      price: finalPrice,
      originalPrice: hasDiscount ? basePrice : undefined,
      totalArrayKW: Number(((form.totalPanels * form.panelWattage) / 1000).toFixed(2)),
      whatItPowers: form.whatItPowers,
      highlights: form.highlights.filter(Boolean),
      installationAccessories: form.installationAccessories.filter(Boolean),
      components: form.components.filter((c) => c.name),
    };
    if (editingSlug) {
      updateSystem(editingSlug, system);
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
    const arrayKw = ((sys.totalPanels * sys.panelWattage) / 1000).toFixed(2);
    const dailyKwh = ((sys.totalPanels * sys.panelWattage * 5.5) / 1000).toFixed(1);
    return { arrayKw, dailyKwh };
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Solar Systems</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage pre-configured solar system combos
          </p>
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

      {/* Systems list */}
      <div className="mt-6 space-y-3">
        {systems.length === 0 && (
          <div className="rounded-xl border border-dashed bg-surface/40 py-16 text-center">
            <p className="text-sm text-muted-foreground">No solar systems yet.</p>
            <button
              type="button"
              onClick={() => setForm({ ...emptyForm })}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
            >
              <Plus className="h-3.5 w-3.5" /> Create first system
            </button>
          </div>
        )}
        {systems.map((sys) => {
          const { arrayKw, dailyKwh } = energyInfo(sys);
          const hasDiscount = sys.originalPrice && sys.originalPrice > sys.price;
          const discPct = hasDiscount
            ? Math.round((1 - sys.price / sys.originalPrice!) * 100)
            : 0;
          return (
            <div
              key={sys.slug}
              className="rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold truncate">{sys.name}</p>
                    {sys.badge && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        {sys.badge}
                      </span>
                    )}
                    {hasDiscount && (
                      <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-500">
                        -{discPct}% OFF
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground truncate">{sys.tagline}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
                    <span className="rounded-full border bg-surface px-2.5 py-1 font-mono font-semibold">
                      {sys.voltage}
                    </span>
                    <span className="rounded-full border bg-surface px-2.5 py-1 font-mono">
                      {arrayKw} kW array
                    </span>
                    <span className="rounded-full border bg-surface px-2.5 py-1 font-mono">
                      {sys.inverterKVA} kVA inverter
                    </span>
                    <span className="rounded-full border bg-surface px-2.5 py-1 font-mono">
                      {sys.batteryCapacityKWh} kWh battery
                    </span>
                    <span className="rounded-full border bg-surface px-2.5 py-1 font-mono">
                      ~{dailyKwh} kWh/day
                    </span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  {hasDiscount && (
                    <p className="text-xs text-muted-foreground line-through">
                      {formatNGN(sys.originalPrice!)}
                    </p>
                  )}
                  <p className="font-mono text-lg font-bold text-primary">{formatNGN(sys.price)}</p>
                  <div className="mt-2 flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSlug(sys.slug);
                        setForm(systemToForm(sys));
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border bg-surface px-2.5 py-1.5 text-[11px] font-medium hover:bg-accent"
                    >
                      <Edit3 className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => confirmDelete(sys.slug, sys.name)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-medium text-red-600 hover:bg-red-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick price edit overlay */}
      {priceEdit && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4">
          <div className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-xl">
            <p className="font-semibold">Quick price update</p>
            <input
              type="number"
              value={priceEdit.price}
              onChange={(e) => setPriceEdit({ ...priceEdit, price: Number(e.target.value) })}
              className="mt-3 w-full rounded-xl border bg-surface px-4 py-2.5 text-sm"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setPriceEdit(null)}
                className="rounded-xl border px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSavePrice(priceEdit.slug, priceEdit.price)}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/edit system modal */}
      {form && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 px-4 py-8 backdrop-blur-sm">
          <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">
                {editingSlug ? "Edit solar system" : "New solar system"}
              </h2>
              <button
                onClick={() => { setForm(null); setEditingSlug(null); }}
                className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* ── LIVE PRICE PREVIEW BANNER ── */}
            <div className="mt-4 rounded-xl border border-primary/20 bg-primary/[0.04] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Computed cost from components
                  </p>
                  <p className="mt-0.5 font-mono text-2xl font-bold text-primary">
                    {computedPrice > 0 ? formatNGN(computedPrice) : "—"}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    Pulled live from your product catalog prices
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, price: computedPrice })}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Use this price
                </button>
              </div>

              {/* Discount controls */}
              <div className="mt-4 grid gap-3 sm:grid-cols-2 border-t border-primary/10 pt-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Selling price (NGN)
                  </label>
                  <input
                    type="number"
                    value={form.price || ""}
                    placeholder={computedPrice > 0 ? String(computedPrice) : "0"}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full rounded-xl border bg-card px-4 py-2.5 text-sm font-mono focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Leave as 0 to auto-use computed price
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <Tag className="inline h-3 w-3 mr-1" />
                      Discount amount (NGN)
                    </label>
                    {discountPct > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                        -{discountPct}% OFF
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    value={form.discountAmount || ""}
                    placeholder="0"
                    onChange={(e) => setForm({ ...form, discountAmount: Number(e.target.value) })}
                    className="w-full rounded-xl border bg-card px-4 py-2.5 text-sm font-mono focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {form.discountAmount > 0 && (
                    <p className="mt-1 text-[10px] font-semibold text-green-600">
                      Customer pays: {formatNGN(sellingPrice)}
                    </p>
                  )}
                </div>
              </div>

              {/* Summary row */}
              {(form.price > 0 || computedPrice > 0) && (
                <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
                  <span className="rounded-full bg-surface border px-2.5 py-1 font-medium">
                    Full price: {formatNGN(form.price > 0 ? form.price : computedPrice)}
                  </span>
                  {form.discountAmount > 0 && (
                    <>
                      <span className="rounded-full bg-red-50 border border-red-200 px-2.5 py-1 font-medium text-red-600">
                        Discount: -{formatNGN(form.discountAmount)} ({discountPct}%)
                      </span>
                      <span className="rounded-full bg-green-50 border border-green-200 px-2.5 py-1 font-bold text-green-700">
                        Sale price: {formatNGN(sellingPrice)}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* ── FORM FIELDS ── */}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              <Field label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} />
              <div className="sm:col-span-2">
                <Field label="Tagline" value={form.tagline} onChange={(v) => setForm({ ...form, tagline: v })} />
              </div>
              <div className="sm:col-span-2">
                <Field label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} type="textarea" />
              </div>

              {/* Image picker */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1">Images</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.images.split("\n").filter(Boolean).map((url, i) => (
                    <div key={url} className="relative h-16 w-16 shrink-0 rounded-lg border bg-surface overflow-hidden group/image">
                      <img src={url} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          const list = form.images.split("\n").filter(Boolean);
                          list.splice(i, 1);
                          setForm({ ...form, images: list.join("\n") });
                        }}
                        className="absolute right-0.5 top-0.5 hidden h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs group-hover/image:flex"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <textarea
                  value={form.images}
                  onChange={(e) => setForm({ ...form, images: e.target.value })}
                  className="w-full rounded-xl border bg-surface px-4 py-2.5 text-sm"
                  rows={2}
                  placeholder="Image URLs (one per line)"
                />
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleImagesFromFiles(e.target.files)}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent"
                >
                  <ImagePlus className="h-3.5 w-3.5" /> Upload from device
                </button>
              </div>

              <Select label="Voltage" value={form.voltage} options={["24V", "48V"]} onChange={(v) => setForm({ ...form, voltage: v })} />
              <Select label="Battery type" value={form.batteryType} options={["LiFePO4", "Tubular"]} onChange={(v) => setForm({ ...form, batteryType: v })} />
              <Field label="Panels (qty)" type="number" value={String(form.totalPanels)} onChange={(v) => setForm({ ...form, totalPanels: Number(v) })} />
              <Field label="Panel wattage (W)" type="number" value={String(form.panelWattage)} onChange={(v) => setForm({ ...form, panelWattage: Number(v) })} />
              <Field label="Inverter (kVA)" type="number" value={String(form.inverterKVA)} onChange={(v) => setForm({ ...form, inverterKVA: Number(v) })} />
              <Field label="Battery (kWh)" type="number" value={String(form.batteryCapacityKWh)} onChange={(v) => setForm({ ...form, batteryCapacityKWh: Number(v) })} />
              <div className="sm:col-span-2">
                <Field label="What it powers" value={form.whatItPowers} onChange={(v) => setForm({ ...form, whatItPowers: v })} />
              </div>
            </div>

            {/* Components */}
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Components <span className="ml-1 font-normal normal-case text-primary">(prices auto-computed from catalog)</span>
              </p>
              {form.components.map((c, i) => (
                <div key={i} className="mt-2 flex flex-wrap items-end gap-2 rounded-xl border bg-surface p-3">
                  <Select
                    label="Type"
                    value={c.type}
                    options={["panel", "inverter", "battery", "accessory"]}
                    onChange={(v) => {
                      const comps = [...form.components];
                      comps[i] = { ...comps[i], type: v as SolarComponent["type"] };
                      setForm({ ...form, components: comps });
                    }}
                  />
                  <div className="flex-1">
                    <label className="block text-[10px] font-medium text-muted-foreground mb-1">Name</label>
                    <input
                      placeholder="Component name"
                      value={c.name}
                      onChange={(e) => {
                        const comps = [...form.components];
                        comps[i] = { ...comps[i], name: e.target.value };
                        setForm({ ...form, components: comps });
                      }}
                      className="w-full rounded-lg border bg-card px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-muted-foreground mb-1">Spec</label>
                    <input
                      placeholder="Spec"
                      value={c.spec}
                      onChange={(e) => {
                        const comps = [...form.components];
                        comps[i] = { ...comps[i], spec: e.target.value };
                        setForm({ ...form, components: comps });
                      }}
                      className="w-28 rounded-lg border bg-card px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-muted-foreground mb-1">Qty</label>
                    <input
                      placeholder="Qty"
                      type="number"
                      value={c.qty}
                      onChange={(e) => {
                        const comps = [...form.components];
                        comps[i] = { ...comps[i], qty: Number(e.target.value) };
                        setForm({ ...form, components: comps });
                      }}
                      className="w-16 rounded-lg border bg-card px-3 py-2 text-xs"
                    />
                  </div>
                  <button
                    onClick={() => setForm({ ...form, components: form.components.filter((_, j) => j !== i) })}
                    className="rounded-lg border p-2 text-muted-foreground hover:text-red-500 hover:border-red-200"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setForm({ ...form, components: [...form.components, { type: "panel", name: "", spec: "", qty: 1 }] })}
                className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-3 w-3" /> Add component
              </button>
            </div>

            {/* Highlights */}
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Highlights (one per line)</p>
              <textarea
                value={form.highlights.join("\n")}
                onChange={(e) => setForm({ ...form, highlights: e.target.value.split("\n") })}
                className="mt-1 w-full rounded-xl border bg-surface px-4 py-2.5 text-sm"
                rows={4}
              />
            </div>

            {/* Installation accessories */}
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Installation accessories (one per line)</p>
              <textarea
                value={form.installationAccessories.join("\n")}
                onChange={(e) => setForm({ ...form, installationAccessories: e.target.value.split("\n") })}
                className="mt-1 w-full rounded-xl border bg-surface px-4 py-2.5 text-sm"
                rows={4}
              />
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end gap-2 border-t pt-4">
              <button
                onClick={() => { setForm(null); setEditingSlug(null); }}
                className="rounded-xl border px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSystem}
                className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:brightness-110 active:scale-[0.98]"
              >
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

function Field({
  label, value, onChange, type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground">{label}</label>
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full rounded-xl border bg-surface px-4 py-2.5 text-sm"
          rows={3}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full rounded-xl border bg-surface px-4 py-2.5 text-sm"
        />
      )}
    </div>
  );
}

function Select({
  label, value, options, onChange,
}: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border bg-surface px-4 py-2.5 text-sm"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
