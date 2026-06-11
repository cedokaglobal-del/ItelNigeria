import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/robots/txt")({
  component: () => null,
  loader: () => {
    const content = `User-agent: *
Allow: /
Sitemap: https://itelenergy.com/sitemap.xml

# Disallow admin pages from search
Disallow: /admin/
`;
    return new Response(content, {
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  },
});
