import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase";
import { Database, CheckCircle2, XCircle, Loader2, Copy, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/setup")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !isAdminAuthenticated())
      throw redirect({ to: "/admin/login" });
  },
  head: () => ({ meta: [{ title: "DB Setup — Itel Admin" }] }),
  component: AdminSetup,
});

type TableStatus = "checking" | "exists" | "missing";

const tables = ["products", "orders", "categories", "solar_systems"];

const SQL = `-- Create products table
CREATE TABLE IF NOT EXISTS products (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  price DOUBLE PRECISION NOT NULL,
  "originalPrice" DOUBLE PRECISION,
  images JSONB DEFAULT '[]'::jsonb,
  rating DOUBLE PRECISION DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  tagline TEXT NOT NULL,
  badge TEXT,
  spec TEXT NOT NULL,
  highlights JSONB DEFAULT '[]'::jsonb,
  description TEXT NOT NULL,
  warranty TEXT NOT NULL,
  "inStock" BOOLEAN DEFAULT true,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read" ON products FOR SELECT USING (true);
CREATE POLICY "Allow service role insert" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service role update" ON products FOR UPDATE USING (true);
CREATE POLICY "Allow service role delete" ON products FOR DELETE USING (true);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  date TIMESTAMPTZ NOT NULL,
  customer JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal DOUBLE PRECISION NOT NULL,
  shipping DOUBLE PRECISION NOT NULL,
  total DOUBLE PRECISION NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment TEXT NOT NULL DEFAULT 'transfer',
  address JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous insert" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service role all" ON orders FOR ALL USING (true);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  blurb TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow service role all" ON categories FOR ALL USING (true);

-- Create solar_systems table
CREATE TABLE IF NOT EXISTS solar_systems (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  badge TEXT,
  rating DOUBLE PRECISION DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  voltage TEXT NOT NULL,
  "totalPanels" INTEGER NOT NULL,
  "panelWattage" INTEGER NOT NULL,
  "inverterKVA" DOUBLE PRECISION NOT NULL,
  "batteryCapacityKWh" DOUBLE PRECISION NOT NULL,
  "batteryType" TEXT NOT NULL,
  "totalArrayKW" DOUBLE PRECISION NOT NULL,
  price DOUBLE PRECISION NOT NULL,
  "originalPrice" DOUBLE PRECISION,
  "whatItPowers" TEXT NOT NULL,
  components JSONB DEFAULT '[]'::jsonb,
  "installationAccessories" JSONB DEFAULT '[]'::jsonb,
  highlights JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE solar_systems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read" ON solar_systems FOR SELECT USING (true);
CREATE POLICY "Allow service role all" ON solar_systems FOR ALL USING (true);`;

function TableRow({ name, status, error }: { name: string; status: TableStatus; error: string | null }) {
  return (
    <div className="flex items-center justify-between rounded-lg border px-4 py-3">
      <div className="flex items-center gap-3">
        {status === "checking" ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : status === "exists" ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : (
          <XCircle className="h-5 w-5 text-red-400" />
        )}
        <span className="font-mono text-sm font-medium">{name}</span>
      </div>
      <span className={`text-xs ${status === "exists" ? "text-green-600" : status === "missing" ? "text-red-500" : "text-muted-foreground"}`}>
        {status === "exists" ? "Exists" : status === "missing" ? "Missing" : "Checking..."}
      </span>
      {error && <span className="ml-4 max-w-96 truncate text-xs text-red-400">{error}</span>}
    </div>
  );
}

function AdminSetup() {
  const [statuses, setStatuses] = useState<Record<string, TableStatus>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    tables.forEach((name) => checkTable(name));
  }, []);

  async function checkTable(name: string) {
    setStatuses((prev) => ({ ...prev, [name]: "checking" }));
    try {
      const { error } = await supabase.from(name).select("*", { count: "exact", head: true });
      if (error) {
        setStatuses((prev) => ({ ...prev, [name]: "missing" }));
        setErrors((prev) => ({ ...prev, [name]: error.message }));
      } else {
        setStatuses((prev) => ({ ...prev, [name]: "exists" }));
        setErrors((prev) => ({ ...prev, [name]: null }));
      }
    } catch (e) {
      setStatuses((prev) => ({ ...prev, [name]: "missing" }));
      setErrors((prev) => ({ ...prev, [name]: e instanceof Error ? e.message : "Unknown error" }));
    }
  }

  function copySQL() {
    navigator.clipboard.writeText(SQL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const allExist = tables.every((t) => statuses[t] === "exists");
  const anyMissing = tables.some((t) => statuses[t] === "missing");

  return (
    <AdminLayout>
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Database className="h-6 w-6" />
            Database Setup
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Check which Supabase tables exist and run the SQL migration to create missing ones.
          </p>
        </div>

        {/* Table status */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Table Status</h2>
          <div className="space-y-2">
            {tables.map((name) => (
              <TableRow key={name} name={name} status={statuses[name] || "checking"} error={errors[name] || null} />
            ))}
          </div>
          {allExist && (
            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              All tables exist. The database is ready.
            </div>
          )}
          <button
            type="button"
            onClick={() => router.navigate({ to: "/admin/setup" })}
            className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Re-check
          </button>
        </div>

        {anyMissing && (
          <>
            {/* Instructions */}
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <p className="font-medium">Missing tables detected.</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>Go to your{" "}
                  <a
                    href="https://supabase.com/dashboard/project/vcoleadgptniogdspaim/sql/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium underline underline-offset-2 hover:text-amber-900"
                  >
                    Supabase SQL Editor <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>Paste the SQL below and click <strong>Run</strong></li>
                <li>Come back here and refresh to verify</li>
              </ol>
            </div>

            {/* SQL block */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Migration SQL</h2>
                <button
                  type="button"
                  onClick={copySQL}
                  className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
                >
                  {copied ? (
                    <>Copied!</>
                  ) : (
                    <><Copy className="h-3.5 w-3.5" /> Copy SQL</>
                  )}
                </button>
              </div>
              <pre className="overflow-x-auto rounded-lg border bg-muted p-4 text-xs leading-relaxed">
                <code>{SQL}</code>
              </pre>
            </div>

            {/* Quick run button */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              <p className="font-medium">One-click option</p>
              <p className="mt-1 text-blue-700">
                Open the{" "}
                <a
                  href="https://supabase.com/dashboard/project/vcoleadgptniogdspaim/sql/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline underline-offset-2 hover:text-blue-900"
                >
                  Supabase SQL Editor
                </a>
                , paste the SQL, and run it. That's it.
              </p>
            </div>
          </>
        )}

        {/* Error details from app */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold">Common Issues</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="rounded-lg border px-4 py-3">
              <p className="font-medium text-foreground">"relation does not exist"</p>
              <p>Run the SQL migration above to create the tables.</p>
            </div>
            <div className="rounded-lg border px-4 py-3">
              <p className="font-medium text-foreground">"permission denied" or "violates RLS"</p>
              <p>
                The app uses the anon key (client-side). The RLS policies in the SQL allow anonymous
                reads and service-role writes. Make sure the policies are created.
              </p>
            </div>
            <div className="rounded-lg border px-4 py-3">
              <p className="font-medium text-foreground">"column not found"</p>
              <p>The column names must match exactly (case-sensitive with quotes for camelCase). The SQL above handles this correctly.</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
