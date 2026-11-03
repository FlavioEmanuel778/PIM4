import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({ basePath, q, page, pages, params = {} }: { basePath: string; q: string; page: number; pages: number; params?: Record<string, string> }) {
  const href = (p: number) => `${basePath}?${new URLSearchParams({ ...params, ...(q ? { q } : {}), page: String(p) })}`;
  return (
    <nav className="pagination" aria-label="Paginação">
      <Link className="page-btn" href={href(page - 1)} aria-disabled={page <= 1} aria-label="Página anterior"><ChevronLeft aria-hidden /></Link>
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => <Link key={p} className="page-btn" href={href(p)} aria-current={p === page ? "page" : undefined}>{p}</Link>)}
      <Link className="page-btn" href={href(page + 1)} aria-disabled={page >= pages} aria-label="Próxima página"><ChevronRight aria-hidden /></Link>
    </nav>
  );
}
