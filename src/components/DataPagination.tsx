import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export function DataPagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).slice(
    Math.max(0, page - 3),
    Math.max(0, page - 3) + 5,
  );
  return (
    <Pagination className="mt-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={(e) => {
              e.preventDefault();
              if (page > 1) onChange(page - 1);
            }}
            className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
        {pages.map((p) => (
          <PaginationItem key={p}>
            <PaginationLink
              isActive={p === page}
              onClick={(e) => {
                e.preventDefault();
                onChange(p);
              }}
              className="cursor-pointer"
            >
              {p}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            onClick={(e) => {
              e.preventDefault();
              if (page < totalPages) onChange(page + 1);
            }}
            className={
              page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export function paginate<T>(items: T[], page: number, perPage = 6) {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const safe = Math.min(page, totalPages);
  const start = (safe - 1) * perPage;
  return {
    pageItems: items.slice(start, start + perPage),
    totalPages,
    page: safe,
  };
}
