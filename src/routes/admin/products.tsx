import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { CATEGORIES, type Product, type ProductCategory } from "@/lib/products";
import { useProducts } from "@/lib/admin-data";
import { formatNGN } from "@/lib/format";
import { Edit3, Eye, ImagePlus, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminSolarSystemsContent } from "./solar-systems";

export const Route = createFileRoute("/admin/products")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !isAdminAuthenticated()) throw redirect({ to: "/admin/login" });
  },
  head: () => ({ meta: [{ title: "Products — Itel Admin" }] }),
  component: AdminProducts,
});

type Tab = "products" | "solar-systems";

type SolarComp = { type: "panel" | "inverter" | "battery" | "accessory"; name: string; spec: string; qty: number };

type ProductForm = {
  slug: string; name: string; brand: string; category: ProductCategory;
  price: number; originalPrice: string; rating: number; reviews: number; tagline: string;
  images: string; spec: string; description: string; warranty: string; inStock: boolean;
  highlights: string[]; badge: string;
  // Solar system config
  solarEnabled: boolean;
  solarVoltage: string; solarPanels: number; solarPanelWattage: number;
  solarInverterKVA: number; solarBatteryKWh: number; solarBatteryType: string;
  solarComponents: SolarComp[];
};

const emptyForm: ProductForm = {
  slug: "", name: "", brand: "Itel Energy", category: "panels",
  price: 0, originalPrice: "", rating: 0, reviews: 0, tagline: "", spec: "",
  images: "", description: "", warranty: "", inStock: true, highlights: [""], badge: "",
  solarEnabled: false,
  solarVoltage: "48V", solarPanels: 4, solarPanelWattage: 550, solarInverterKVA: 5,
  solarBatteryKWh: 5.12, solarBatteryType: "LiFePO4",
  solarComponents: [{ type: "panel", name: "", spec: "", qty: 1 }],
};

function productToForm(p: Product): ProductForm {
  return {
    slug: p.slug, name: p.name, brand: p.brand, category: p.category,
    price: p.price, originalPrice: p.originalPrice ? String(p.originalPrice) : "",
    rating: p.rating, reviews: p.reviews, tagline: p.tagline,
    images: p.images?.join("\n") ?? "", spec: p.spec, description: p.description,
    warranty: p.warranty, inStock: p.inStock, highlights: p.highlights, badge: p.badge || "",
    solarEnabled: false,
    solarVoltage: "48V", solarPanels: 4, solarPanelWattage: 550, solarInverterKVA: 5,
    solarBatteryKWh: 5.12, solarBatteryType: "LiFePO4",
    solarComponents: [{ type: "panel", name: "", spec: "", qty: 1 }],
  };
}

function AdminProducts() {
  const [tab, setTab] = useState<Tab>("products");
  const [products, updateStock, addProduct, updateProduct, deleteProduct] = useProducts();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ProductCategory | "all">("all");
  const [form, setForm] = useState<ProductForm | null>(null);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    let list = products;
    if (filter !== "all") list = list.filter((p) => p.category === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.tagline.toLowerCase().includes(q));
    }
    return list;
  }, [products, search, filter]);

  function handleImagesFromFiles(files: FileList | null) {
    if (!files) return;
    const readers: Promise<string>[] = [];
    for (let i = 0; i < files.length; i++) {
      readers.push(new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(files[i]);
      }));
    }
    Promise.all(readers).then((urls) => {
      const existing = form?.images ? form.images.split("\n").filter(Boolean) : [];
      setForm((prev) => prev ? { ...prev, images: [...existing, ...urls].join("\n") } : prev);
    });
  }

  function handleSaveProduct() {
    if (!form) return;
    const slug = form.slug.replace(/\s+/g, "-").toLowerCase();
    const existing = products.find((p) => p.slug === slug);
    if (existing && editingSlug !== slug) {
      toast.error("A product with this slug already exists");
      return;
    }
    const images = form.images.split("\n").map((s) => s.trim()).filter(Boolean);
    const originalPrice = form.originalPrice ? Number(form.originalPrice) : undefined;

    // Build product — if solar enabled, auto-fill kit fields
    let category = form.category;
    let spec = form.spec;
    let description = form.description;
    let highlights = form.highlights.filter(Boolean);

    if (form.solarEnabled) {
      category = "kits";
      const arrayKw = (form.solarPanels * form.solarPanelWattage / 1000).toFixed(2);
      const dailyKwh = (form.solarPanels * form.solarPanelWattage * 5.5 / 1000).toFixed(1);
      spec = `${arrayKw}kW · ${form.solarBatteryKWh}kWh`;
      description = description || `Complete ${form.solarVoltage} solar system. ${form.solarPanels}×${form.solarPanelWattage}W panels (${arrayKw}kW array), ${form.solarInverterKVA}kVA inverter, ${form.solarBatteryKWh}kWh ${form.solarBatteryType} battery. Generates ~${dailyKwh}kWh/day.`;
      if (highlights.length === 1 && highlights[0] === "") {
        highlights = [
          `${form.solarPanels} × ${form.solarPanelWattage}W solar panels`,
          `${form.solarInverterKVA}kVA hybrid inverter`,
          `${form.solarBatteryKWh}kWh ${form.solarBatteryType} battery`,
          `${form.solarVoltage} system · ${arrayKw}kW total array · ${dailyKwh}kWh/day`,
        ];
      }
    }

    const product: Product = {
      slug, name: form.name, brand: form.brand, category,
      price: form.price, originalPrice, images: images.length ? images : [],
      rating: form.rating, reviews: form.reviews,
      tagline: form.tagline, spec, description,
      warranty: form.warranty, inStock: form.inStock,
      highlights, badge: form.badge || undefined,
    };

    if (editingSlug) {
      updateProduct(editingSlug, product);
      toast.success("Product updated");
    } else {
      addProduct(product);
      // If solar system, also create component products in their categories
      if (form.solarEnabled) {
        let created = 0;
        for (const comp of form.solarComponents) {
          if (!comp.name) continue;
          const compSlug = `${slug}-${comp.type}-${created}`;
          const cat = comp.type === "panel" ? "panels" as const
            : comp.type === "inverter" ? "inverters" as const
            : comp.type === "battery" ? "batteries" as const
            : "accessories" as const;
          addProduct({
            slug: compSlug, name: comp.name, brand: "Itel Energy", category: cat,
            price: Math.round((form.price / form.solarComponents.filter((c) => c.name).length) / Math.max(comp.qty, 1)),
            images: [], rating: 0, reviews: 0, tagline: comp.spec, spec: comp.spec,
            highlights: [], description: `Part of ${form.name}: ${comp.name} (${comp.spec})`,
            warranty: "See system", inStock: true,
          });
          created++;
        }
        toast.success(`Created "${form.name}" + ${created} components in catalog`);
      } else {
        toast.success("Product created");
      }
    }
    setForm(null);
    setEditingSlug(null);
  }

  function confirmDelete(slug: string, name: string) {
    if (window.confirm(`Delete "${name}"? This cannot be undone.`)) {
      deleteProduct(slug);
      toast.success("Product deleted");
    }
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">{products.length} products in catalog</p>
        </div>
        <div className="flex gap-2">
          {tab === "products" && (
            <button
              type="button"
              onClick={() => { setEditingSlug(null); setForm({ ...emptyForm }); }}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:brightness-110"
            >
              <Plus className="h-4 w-4" /> Add product
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl border bg-surface p-1">
        {(["products", "solar-systems"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
              tab === t ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "products" ? "Products" : "Solar Systems"}
          </button>
        ))}
      </div>

      {tab === "products" ? (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 md:max-w-xs">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border bg-card py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>All</FilterChip>
              {CATEGORIES.map((c) => (
                <FilterChip key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)}>{c.label}</FilterChip>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-surface text-left text-xs font-medium text-muted-foreground">
                    <th className="px-4 py-3 md:px-6">Product</th>
                    <th className="px-4 py-3 md:px-6">Category</th>
                    <th className="px-4 py-3 text-right md:px-6">Price</th>
                    <th className="px-4 py-3 text-center md:px-6">Stock</th>
                    <th className="px-4 py-3 text-right md:px-6">Rating</th>
                    <th className="px-4 py-3 text-right md:px-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((p) => (
                    <tr key={p.slug} className="transition-colors hover:bg-surface/50">
                      <td className="px-4 py-3 md:px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 rounded-lg border bg-surface" />
                          <div className="min-w-0">
                            <p className="truncate font-medium">{p.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{p.spec} &middot; {p.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs md:px-6">
                        <span className="rounded-full border bg-surface px-2.5 py-0.5 text-[10px] font-medium">
                          {CATEGORIES.find((c) => c.id === p.category)?.label ?? p.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs font-semibold md:px-6">{formatNGN(p.price)}</td>
                      <td className="px-4 py-3 text-center md:px-6">
                        <button
                          type="button"
                          onClick={() => updateStock(p.slug, !p.inStock)}
                          className={`inline-block h-2.5 w-2.5 rounded-full transition-all hover:scale-125 ${p.inStock ? "bg-green-500" : "bg-red-400"}`}
                          title={p.inStock ? "In stock" : "Out of stock"}
                        />
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs md:px-6">{p.rating} &middot; {p.reviews}</td>
                      <td className="px-4 py-3 text-right md:px-6">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => { setEditingSlug(p.slug); setForm(productToForm(p)); }}
                            className="rounded-lg border p-1.5 text-muted-foreground hover:bg-accent"
                            title="Edit product"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => confirmDelete(p.slug, p.name)}
                            className="rounded-lg border p-1.5 text-red-500 hover:bg-red-50"
                            title="Delete product"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                          <Link
                            to="/products/$slug"
                            params={{ slug: p.slug }}
                            className="rounded-lg border bg-surface p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                            title="View on site"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">No products match your filter.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Product form modal */}
          {form && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black/30 px-4 py-10">
              <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">{editingSlug ? "Edit product" : "New product"}</h2>
                  <button onClick={() => { setForm(null); setEditingSlug(null); }} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <PField label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                  <PField label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} />
                  <PField label="Brand" value={form.brand} onChange={(v) => setForm({ ...form, brand: v })} />
                  <PSelect label="Category" value={form.category} options={CATEGORIES.map((c) => ({ value: c.id, label: c.label }))} onChange={(v) => setForm({ ...form, category: v as ProductCategory })} />
                  <PField label="Price (NGN)" type="number" value={String(form.price)} onChange={(v) => setForm({ ...form, price: Number(v) })} />
                  <PField label="Original Price (NGN, optional)" type="number" value={form.originalPrice} onChange={(v) => setForm({ ...form, originalPrice: v })} placeholder="Higher price for discount display" />
                  <PField label="Spec" value={form.spec} onChange={(v) => setForm({ ...form, spec: v })} placeholder="e.g. 550W, 5kVA · 48V" />
                  <PField label="Tagline" value={form.tagline} onChange={(v) => setForm({ ...form, tagline: v })} />
                  <PField label="Warranty" value={form.warranty} onChange={(v) => setForm({ ...form, warranty: v })} placeholder="e.g. 5 years" />
                  <PField label="Badge (optional)" value={form.badge} onChange={(v) => setForm({ ...form, badge: v })} placeholder="e.g. Best seller, New" />

                  {/* Images */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Images</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {form.images.split("\n").filter(Boolean).map((url, i) => (
                        <div key={i} className="relative h-16 w-16 shrink-0 rounded-lg border bg-surface overflow-hidden group/image">
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
                    <div className="flex gap-2">
                      <textarea
                        value={form.images}
                        onChange={(e) => setForm({ ...form, images: e.target.value })}
                        className="flex-1 rounded-xl border bg-surface px-4 py-2.5 text-sm"
                        rows={3}
                        placeholder="Image URLs (one per line)"
                      />
                    </div>
                    <div className="mt-2">
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
                        className="inline-flex items-center gap-1.5 rounded-lg border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent"
                      >
                        <ImagePlus className="h-3.5 w-3.5" /> Upload from device
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.inStock} onChange={(e) => setForm({ ...form, inStock: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                      <span className="text-xs font-medium text-muted-foreground">In stock</span>
                    </label>
                  </div>
                  <div className="sm:col-span-2">
                    <PField label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} textarea />
                  </div>
                  <div className="sm:col-span-2">
                    <PListEditor
                      label="Highlights (one per line)"
                      values={form.highlights}
                      onChange={(v) => setForm({ ...form, highlights: v })}
                    />
                  </div>

                  {/* Solar system toggle */}
                  <div className="sm:col-span-2 border-t pt-4 mt-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.solarEnabled}
                        onChange={(e) => setForm({ ...form, solarEnabled: e.target.checked })}
                        className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <div>
                        <span className="text-sm font-semibold">Solar system bundle</span>
                        <p className="text-xs text-muted-foreground">Auto-fills kit category, spec, description, and creates component products on save</p>
                      </div>
                    </label>
                  </div>

                  {form.solarEnabled && (
                    <>
                      <PField label="System voltage" value={form.solarVoltage} onChange={(v) => setForm({ ...form, solarVoltage: v })} placeholder="48V" />
                      <PField label="Number of panels" type="number" value={String(form.solarPanels)} onChange={(v) => setForm({ ...form, solarPanels: Number(v) })} />
                      <PField label="Panel wattage (W)" type="number" value={String(form.solarPanelWattage)} onChange={(v) => setForm({ ...form, solarPanelWattage: Number(v) })} />
                      <PField label="Inverter (kVA)" type="number" value={String(form.solarInverterKVA)} onChange={(v) => setForm({ ...form, solarInverterKVA: Number(v) })} />
                      <PField label="Battery capacity (kWh)" type="number" value={String(form.solarBatteryKWh)} onChange={(v) => setForm({ ...form, solarBatteryKWh: Number(v) })} />
                      <PField label="Battery type" value={form.solarBatteryType} onChange={(v) => setForm({ ...form, solarBatteryType: v })} placeholder="LiFePO4" />

                      {/* Auto-calculated metrics */}
                      <div className="sm:col-span-2 rounded-xl border bg-surface p-3 text-sm">
                        <p className="font-medium text-muted-foreground text-xs mb-1.5">Auto-calculated energy metrics</p>
                        <div className="flex gap-4 text-xs font-mono">
                          <span>Array: <strong>{(form.solarPanels * form.solarPanelWattage / 1000).toFixed(2)} kW</strong></span>
                          <span>Daily: <strong>{(form.solarPanels * form.solarPanelWattage * 5.5 / 1000).toFixed(1)} kWh</strong></span>
                          <span>Battery: <strong>{form.solarBatteryKWh} kWh</strong></span>
                        </div>
                      </div>

                      {/* Components */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Components (published as individual products)</label>
                        {form.solarComponents.map((comp, i) => (
                          <div key={i} className="flex flex-wrap items-end gap-2 mb-2">
                            <select
                              value={comp.type}
                              onChange={(e) => {
                                const list = [...form.solarComponents];
                                list[i] = { ...list[i], type: e.target.value as SolarComp["type"] };
                                setForm({ ...form, solarComponents: list });
                              }}
                              className="rounded-xl border bg-surface px-3 py-2 text-xs"
                            >
                              <option value="panel">Panel</option>
                              <option value="inverter">Inverter</option>
                              <option value="battery">Battery</option>
                              <option value="accessory">Accessory</option>
                            </select>
                            <input
                              value={comp.name}
                              onChange={(e) => {
                                const list = [...form.solarComponents];
                                list[i] = { ...list[i], name: e.target.value };
                                setForm({ ...form, solarComponents: list });
                              }}
                              placeholder="Name"
                              className="min-w-[140px] rounded-xl border bg-surface px-3 py-2 text-xs"
                            />
                            <input
                              value={comp.spec}
                              onChange={(e) => {
                                const list = [...form.solarComponents];
                                list[i] = { ...list[i], spec: e.target.value };
                                setForm({ ...form, solarComponents: list });
                              }}
                              placeholder="Spec"
                              className="min-w-[100px] rounded-xl border bg-surface px-3 py-2 text-xs"
                            />
                            <input
                              type="number"
                              value={String(comp.qty)}
                              onChange={(e) => {
                                const list = [...form.solarComponents];
                                list[i] = { ...list[i], qty: Number(e.target.value) };
                                setForm({ ...form, solarComponents: list });
                              }}
                              placeholder="Qty"
                              className="w-16 rounded-xl border bg-surface px-3 py-2 text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const list = form.solarComponents.filter((_, idx) => idx !== i);
                                setForm({ ...form, solarComponents: list });
                              }}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, solarComponents: [...form.solarComponents, { type: "panel", name: "", spec: "", qty: 1 }] })}
                          className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          <Plus className="h-3 w-3" /> Add component
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-6 flex justify-end gap-2 border-t pt-4">
                  <button onClick={() => { setForm(null); setEditingSlug(null); }} className="rounded-xl border px-4 py-2 text-sm">Cancel</button>
                  <button onClick={handleSaveProduct} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                    {editingSlug ? "Save changes" : "Create product"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <AdminSolarSystemsContent onPublish={(sys) => {
          const arrayKw = (sys.totalPanels * sys.panelWattage / 1000).toFixed(2);
          const dailyKwh = (sys.totalPanels * sys.panelWattage * 5.5 / 1000).toFixed(1);
          // Create kit product for the system
          addProduct({
            slug: sys.slug, name: sys.name, brand: "Itel Energy", category: "kits",
            price: sys.price, images: sys.images, rating: sys.rating, reviews: sys.reviews,
            tagline: sys.tagline, spec: `${arrayKw}kW · ${sys.batteryCapacityKWh}kWh`,
            highlights: sys.highlights,
            description: sys.description || `Complete ${sys.voltage} solar system. ${arrayKw}kW array, ${sys.inverterKVA}kVA inverter, ${sys.batteryCapacityKWh}kWh ${sys.batteryType} battery. Generates ~${dailyKwh}kWh/day.`,
            warranty: "Component-wise", inStock: true,
          });
          // Create individual component products in correct categories
          let compIndex = 0;
          for (const comp of sys.components) {
            const compSlug = `${sys.slug}-comp-${compIndex}`;
            const cat = comp.type === "panel" ? "panels" as const
              : comp.type === "inverter" ? "inverters" as const
              : comp.type === "battery" ? "batteries" as const
              : "accessories" as const;
            addProduct({
              slug: compSlug, name: comp.name, brand: "Itel Energy", category: cat,
              price: Math.round((sys.price / sys.components.length) / comp.qty),
              images: [],
              rating: 0, reviews: 0, tagline: comp.spec, spec: comp.spec,
              highlights: [], description: `Part of ${sys.name}: ${comp.name} (${comp.spec})`,
              warranty: "See system", inStock: true,
            });
            compIndex++;
          }
          toast.success(`Published "${sys.name}" + ${sys.components.length} components to catalog`);
        }} />
      )}
    </AdminLayout>
  );
}

function PField({ label, value, onChange, type = "text", textarea, placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; textarea?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-xl border bg-surface px-4 py-2.5 text-sm" rows={3} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-1 w-full rounded-xl border bg-surface px-4 py-2.5 text-sm" />
      )}
    </div>
  );
}

function PSelect({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-xl border bg-surface px-4 py-2.5 text-sm">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function PListEditor({ label, values, onChange }: { label: string; values: string[]; onChange: (v: string[]) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground">{label}</label>
      <textarea
        value={values.join("\n")}
        onChange={(e) => onChange(e.target.value.split("\n"))}
        className="mt-1 w-full rounded-xl border bg-surface px-4 py-2.5 text-sm"
        rows={4}
      />
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${active ? "border-primary bg-primary text-primary-foreground" : "border-hairline text-muted-foreground hover:bg-accent hover:text-foreground"}`}>
      {children}
    </button>
  );
}
