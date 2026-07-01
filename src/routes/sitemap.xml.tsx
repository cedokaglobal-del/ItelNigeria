import { createFileRoute } from "@tanstack/react-router";
import { fetchProducts } from "@/lib/products";
import { fetchSolarSystems } from "@/lib/solar-systems";

export const Route = createFileRoute("/sitemap/xml")({
  component: () => null,
  loader: async () => {
    let products: Awaited<ReturnType<typeof fetchProducts>> = [];
    let systems: Awaited<ReturnType<typeof fetchSolarSystems>> = [];
    try { products = await fetchProducts(); } catch { /* degrade gracefully */ }
    try { systems = await fetchSolarSystems(); } catch { /* degrade gracefully */ }

    const PAGES = [
      { loc: "/", priority: "1.0", changefreq: "weekly" },
      { loc: "/shop", priority: "0.9", changefreq: "daily" },
      { loc: "/calculator", priority: "0.9", changefreq: "weekly" },
      { loc: "/solar-systems", priority: "0.9", changefreq: "daily" },
      ...products.map((p) => ({
        loc: `/products/${p.slug}`,
        priority: "0.7",
        changefreq: "weekly",
      })),
      ...systems.map((s) => ({
        loc: `/solar-systems/${s.slug}`,
        priority: "0.8",
        changefreq: "weekly",
      })),
    ];

    const urlset = PAGES.map(
      (p) => `  <url>
    <loc>https://itelenergy.com${p.loc}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`,
    ).join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlset}
</urlset>`;

    return new Response(xml, {
      headers: { "content-type": "application/xml; charset=utf-8" },
    });
  },
});
