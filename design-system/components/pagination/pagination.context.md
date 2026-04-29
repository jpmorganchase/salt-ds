# Pagination (Copilot Context)

## Source of truth

- API: ./pagination.json
- Guidance: ./pagination.md

## Key rules

- **Component hierarchy**: Pagination root provides count/page/onPageChange context to child components (Paginator, CompactPaginator, GoToInput, CompactInput).
- **Default variant**: Use Paginator unless space is constrained (then CompactPaginator). CompactPaginator shows only active page + last page + Previous/Next buttons.
- **boundaryCount/siblingCount config**: Default both to 1. Pair sibling counts (1, 3, 5) for visual balance around active page. Higher values reduce ellipsis truncation.
- **Input patterns**: 
   - GoToInput: Labeled FormField + Input for large page counts (100+).
   - CompactInput: Unlabeled variant for minimal/mobile layouts.
   - Position inputs left if primary usage pattern; otherwise right.
- **Focus management**: Initial focus goes to: (1) left input if present, (2) Previous button if page > 1, (3) first page button if page = 1. Tab/Shift+Tab navigate sequentially; exits at boundaries.
- **Accessibility essentials**: Set aria-label on Pagination root, aria-current="page" on active page button, aria-disabled on Previous (page 1) and Next (last page). Announce page changes via useAriaAnnouncer.
- **No nesting**: Single Pagination root only; all variants (Paginator/CompactPaginator, inputs) are direct children.
- **Keyboard**: Tab/Shift+Tab navigate, Enter/Space activate page buttons, input submission navigates to entered page.
- **Positioning**: Display above and below content for long pages. Align left (text), center (gallery), or right (grids) per layout.
- **Responsive**: Switch Paginator → CompactPaginator at breakpoints (e.g., lg and below) for constrained viewports.

## Key imports

```typescript
import { Pagination, Paginator, CompactPaginator, GoToInput, CompactInput } from "@salt-ds/core";
```

## Working example: PaginationExample

```tsx
import { Pagination, Paginator, GoToInput } from "@salt-ds/core";
import { useState } from "react";

export function PaginationExample() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 50;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll content or fetch new data here if needed
  };

  return (
    <div>
      {/* Content section */}
      <div style={{ minHeight: "400px", padding: "16px", border: "1px solid #ccc" }}>
        {`Showing results for page ${currentPage} of ${totalPages}`}
      </div>

      {/* Pagination with GoToInput for large page count */}
      <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "24px" }}>
        <Pagination
          count={totalPages}
          page={currentPage}
          onPageChange={(_event, newPage) => handlePageChange(newPage)}
          aria-label="Pagination Navigation"
        >
          <Paginator />
          <GoToInput />
        </Pagination>
      </div>
    </div>
  );
}

// Compact variant example (space-constrained)
export function CompactPaginationExample() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 250;

  return (
    <Pagination
      count={totalPages}
      page={currentPage}
      onPageChange={(_event, newPage) => setCurrentPage(newPage)}
      aria-label="Results Pagination"
    >
      <CompactPaginator />
      <CompactInput />
    </Pagination>
  );
}
```

## Validation checklist for generated usage

- [ ] Pagination root wraps all child components
- [ ] count prop set to total pages (required)
- [ ] page and onPageChange implemented for controlled state (or defaultPage for uncontrolled)
- [ ] Paginator or CompactPaginator chosen per space constraints
- [ ] boundaryCount and siblingCount configured as pairs if customized
- [ ] GoToInput included for 100+ pages; CompactInput with CompactPaginator
- [ ] aria-label set on Pagination root
- [ ] Page changes announced (useAriaAnnouncer or native screen reader)
- [ ] No nested Pagination components
- [ ] Responsive behavior: Paginator ↔ CompactPaginator at breakpoints
