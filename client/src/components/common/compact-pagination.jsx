import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationEllipsis,
  PaginationNext,
} from '@/components/ui/pagination';

const MAX_PAGE_BUTTONS = 5;

// only show 5 page buttons, ellipsis if there are more than 5 pages
function getVisiblePaginationItems(currentPage, totalPages) {
  if (totalPages <= MAX_PAGE_BUTTONS) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 'ellipsis-right', totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [
      1,
      'ellipsis-left',
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    'ellipsis-left',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    'ellipsis-right',
    totalPages,
  ];
}

export function CompactPagination({ page, totalPages, onPageChange }) {
  const safeTotalPages = Math.max(1, totalPages); // ensure total pages is at least 1
  const safeCurrentPage = Math.min(Math.max(1, page), safeTotalPages); // ensure page is at least 1 and at most the total pages
  const items = getVisiblePaginationItems(safeCurrentPage, safeTotalPages);

  // go to the next selected page
  const goToPage = (nextPage) => {
    const safePage = Math.min(Math.max(1, nextPage), safeTotalPages); // ensure page is at least 1 and at most the total pages
    if (safePage !== safeCurrentPage) {
      onPageChange(safePage);
    }
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          {/* disable the previous button if the current page is 1 */}
          <PaginationPrevious
            onClick={() => goToPage(safeCurrentPage - 1)}
            className={
              safeCurrentPage <= 1 ? 'pointer-events-none opacity-50' : ''
            }
          />
        </PaginationItem>

        {items.map((item, index) => {
          if (typeof item === 'string') {
            return (
              <PaginationItem key={`${item}-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }

          return (
            <PaginationItem key={item}>
              <PaginationLink
                onClick={() => goToPage(item)}
                isActive={item === safeCurrentPage}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        <PaginationItem>
          {/* disable the next button if the current page is the last page */}
          <PaginationNext
            onClick={() => goToPage(safeCurrentPage + 1)}
            className={
              safeCurrentPage >= safeTotalPages
                ? 'pointer-events-none opacity-50'
                : ''
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
