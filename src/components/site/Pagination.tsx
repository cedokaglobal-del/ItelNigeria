import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }
  return (
    <nav className="flex items-center justify-center gap-1.5 pt-10">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className="grid h-9 w-9 place-items-center rounded-lg border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`e${i}`}
            className="grid h-9 w-9 place-items-center text-xs text-muted-foreground"
          >
            ...
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPage(p)}
            className={`grid h-9 w-9 place-items-center rounded-lg text-xs font-semibold transition-colors ${
              p === page
                ? "bg-primary text-primary-foreground"
                : "border text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
        className="grid h-9 w-9 place-items-center rounded-lg border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
