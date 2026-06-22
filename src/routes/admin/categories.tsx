import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Edit3, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { useCategories, type Category } from "@/lib/categories";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/admin/categories")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !isAdminAuthenticated())
      throw redirect({ to: "/admin/login" });
  },
  head: () => ({ meta: [{ title: "Categories — Itel Admin" }] }),
  component: AdminCategories,
});

function AdminCategories() {
  const [categories, add, remove, update] = useCategories();
  const [editing, setEditing] = useState<{ id: string; label: string; blurb: string } | null>(null);
  const [newCat, setNewCat] = useState(false);

  function handleSave() {
    if (!editing || !editing.label.trim()) return;
    const id = editing.id.replace(/\s+/g, "-").toLowerCase();
    if (!editing.id.trim()) {
      add({ id, label: editing.label.trim(), blurb: editing.blurb.trim() });
      toast.success(`Category "${editing.label}" created`);
    } else {
      update(editing.id, { label: editing.label.trim(), blurb: editing.blurb.trim() });
      toast.success("Category updated");
    }
    setEditing(null);
    setNewCat(false);
  }

  function handleDelete(id: string, label: string) {
    if (window.confirm(`Delete "${label}"? Products using it will keep the id string.`)) {
      remove(id);
      toast.success(`Category "${label}" deleted`);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage product categories — changes apply to all products
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setNewCat(true); setEditing({ id: "", label: "", blurb: "" }); }}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Add category
        </button>
      </div>

      <div className="mt-6 space-y-2">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between rounded-xl border bg-card p-4">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{cat.label}</p>
              <p className="text-xs text-muted-foreground">
                <span className="font-mono text-[10px]">{cat.id}</span>
                {cat.blurb && <> · {cat.blurb}</>}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => { setEditing({ id: cat.id, label: cat.label, blurb: cat.blurb }); setNewCat(false); }}
                className="inline-flex items-center gap-1 rounded-lg border bg-surface px-2.5 py-1.5 text-[11px] font-medium hover:bg-accent"
              >
                <Edit3 className="h-3.5 w-3.5" /> Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(cat.id, cat.label)}
                className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-medium text-red-600 hover:bg-red-100"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create modal */}
      {(editing || newCat) && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold">{newCat ? "New category" : "Edit category"}</p>
              <button onClick={() => { setEditing(null); setNewCat(false); }} className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-accent">
                <X className="h-4 w-4" />
              </button>
            </div>
            {editing && (
              <div className="mt-5 space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Category ID</label>
                  <input
                    type="text"
                    value={editing.id}
                    onChange={(e) => setEditing({ ...editing, id: e.target.value })}
                    placeholder="e.g. panels"
                    className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={!newCat}
                  />
                  {!newCat && <p className="mt-0.5 text-[10px] text-muted-foreground">ID cannot be changed after creation</p>}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Display label</label>
                  <input
                    type="text"
                    value={editing.label}
                    onChange={(e) => setEditing({ ...editing, label: e.target.value })}
                    placeholder="e.g. Solar Panels"
                    className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Blurb / subtitle</label>
                  <input
                    type="text"
                    value={editing.blurb}
                    onChange={(e) => setEditing({ ...editing, blurb: e.target.value })}
                    placeholder="e.g. Mono PERC & N-Type panels"
                    className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => { setEditing(null); setNewCat(false); }} className="rounded-xl border px-4 py-2 text-sm">Cancel</button>
              <button onClick={handleSave} className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
                {newCat ? "Create" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function AdminCategoriesPage() {
  return (
    <AdminLayout>
      <AdminCategories />
    </AdminLayout>
  );
}
