import { createFileRoute } from "@tanstack/react-router";
import { PRODUCTS } from "@/lib/products";

const PAGES = [
  { loc: "/", priority: "1.0", changefreq: "weekly" },
  { loc: "/shop", priority: "0.9", changefreq: "daily" },
  { loc: "/calculator", priority: "0.9", changefreq: "weekly" },
  { loc: "/solar-systems", priority: "0.9", changefreq: "daily" },
  { loc: "/cart", priority: "0.5", changefreq: "monthly" },
  { loc: "/checkout", priority: "0.5", changefreq: "monthly" },
  ...PRODUCTS.map((p) => ({
    loc: `/products/${p.slug}` as const,
    priority: "0.7",
    changefreq: "weekly" as const,
  })),
];

export const Route = createFileRoute("/sitemap/xml")({
  component: () => null,
  loader: () => {
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
