# Pagination

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/pagination
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/pagination/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/pagination/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/pagination/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-pagination--default

## When to use

- **For large datasets split across sequential pages**: Pagination allows users to navigate through large amounts of content split logically into pages without overwhelming the interface.
- **For search results and data grids**: Organize and present query results or tabular data across multiple pages, allowing users to review and navigate between result sets.
- **To provide page references**: Enable users to reference specific pages when discussing results or sharing links (e.g., "see page 5").
- **To communicate pagination scope**: Establish a natural breaking point where users can assess content, determine if they've found what they need, or refine their search query.

## When not to use

- **For sequential processes or workflows**: Use [Stepper](https://www.saltdesignsystem.com/salt/components/stepper) instead to communicate progress through multi-step forms or onboarding flows. Use [button bar pattern](https://www.saltdesignsystem.com/salt/patterns/button-bar) for navigation.
- **For infinite scrolling**: When users don't need to filter or reference specific pages, infinite scrolling is more natural (e.g., news feeds, social media).
- **For lazy/load-more patterns**: When you cannot define total page count upfront, use Load More button instead. Gives users greater control over loading content.
- **For content without clear pagination needs**: If there's no reason for users to navigate between batches or filter results, consider inline or scrolling alternatives.

## Decision tree: Pagination vs alternatives

```
Do you have large content split into sequential pages?
├─ No → Use inline content, Card grid, or scrolling layout
└─ Yes → Do users need to reference pages or filter results?
   ├─ No → Use infinite scroll (auto-load more) or lazy loading
   └─ Yes → Can you define total page count upfront?
      ├─ No → Use Load More button (lazy loading pattern)
      └─ Yes → Is this a sequential step-by-step process?
         ├─ Yes → Use Stepper with button bar for navigation
         └─ No → Use Pagination (Paginator or CompactPaginator variant)
```

## Component variants

### Paginator (Default)
- **Use case**: Standard pagination with full page number range.
- **Display**: Shows Previous button, page numbers (with ellipsis if truncated), Next button.
- **Props**: `count`, `defaultPage`/`page`, `onPageChange`, `boundaryCount`, `siblingCount`.
- **Best for**: Documents, search results, text-heavy content where users may jump to specific pages.

### CompactPaginator
- **Use case**: Space-constrained layouts or high-density interfaces.
- **Display**: Shows Previous button, current page label, Next button (no intermediate page numbers).
- **Width**: More predictable; doesn't grow with page count.
- **Best for**: Sidebars, mobile views, image galleries, data grids with other controls.

### With GoToInput
- **Use case**: Pagination with hundreds or thousands of pages.
- **Display**: Paginator (or CompactPaginator) + GoToInput (labeled input field).
- **Pattern**: Position GoToInput to the left if users will use it regularly; otherwise, right.
- **Best for**: Large result sets, archives, datasets with explicit page targeting.

### With CompactInput
- **Use case**: Minimal, compressed pagination with direct page navigation.
- **Display**: CompactPaginator + CompactInput (no label).
- **Best for**: Space-limited layouts, mobile interfaces.

## Truncation and page range configuration

- **boundaryCount**: Pages displayed next to Previous/Next buttons (minimum 1).
  - Default: 1 → `[Prev] 1 ... current ± 1 pages ... N [Next]`
  - Higher values show more edge pages; reduces ellipsis.
  
- **siblingCount**: Pages displayed on either side of active page.
  - Default: 1 → `[Prev] 1 ... [current-1] [current] [current+1] ... N [Next]`
  - Must configure in pairs (1, 3, 5, etc.) for visual centering of active page.
  - Higher values widen range; higher truncation at edges.

- **Ellipsis**: Rendered as "..." when page range cannot display all numbers.

## Positioning and layout

- **Above and below content**: Recommended for long pages (prevents excessive scrolling to find pagination).
- **Alignment**:
  - **Left**: Text/search result pages (natural reading flow).
  - **Center**: Image galleries, tile grids (visual symmetry).
  - **Right**: Data grids full-width (aligns with grid edge).
- **Responsive**: Switch from Paginator to CompactPaginator at breakpoints (e.g., lg and below).

## Focus and keyboard behavior

### Initial focus
1. If input field (GoToInput/CompactInput) positioned left → focus on input.
2. If on page 1 → focus on first page button (Previous button skipped as disabled).
3. If Active page > 1 → focus on Previous button (allows immediate back navigation).

### Tab/Shift+Tab
- Tab: Moves focus through pagination elements sequentially (buttons, input). From last element, focus exits to next page element.
- Shift+Tab: Moves focus backward. From first element, focus exits to previous page element.

### Enter/Space
- **On page button**: Activates page change (click behavior).
- **On input field**: Submits entered value and navigates to that page.

## Accessibility requirements

- **Set aria-label on Pagination root**: Helps screen readers identify pagination navigation (e.g., "Pagination Navigation").
- **Active page button**: Receives `aria-current="page"` for screen reader announcement.
- **Disabled buttons**: Previous (page 1) and Next (last page) receive `aria-disabled` when inactive.
- **Button semantics**: Page number items rendered with button role.
- **Input integration**: GoToInput/CompactInput use standard input labels and ARIA attributes.
- **Dynamic announcements**: Page changes announced via `useAriaAnnouncer` for screen reader users.

## Validation checklist

- [ ] Pagination used for navigable sequential pages, not sequential processes (use Stepper instead)
- [ ] `count` prop provided (required; total page count)
- [ ] `onPageChange` callback implemented to update active page
- [ ] Paginator or CompactPaginator variant chosen based on space constraints
- [ ] boundaryCount and siblingCount configured appropriately (pairs for sibling)
- [ ] GoToInput/CompactInput included for large page counts (100+)
- [ ] Pagination positioned above and below content (if long pages)
- [ ] Focus management verified: initial focus and Tab order correct
- [ ] ARIA labels set on Pagination root and input components
- [ ] Page change announcements working via useAriaAnnouncer
- [ ] No nested Pagination components (single root only)
- [ ] Responsive behavior implemented (Paginator ↔ CompactPaginator at breakpoints)

## AI generation rules (required)

### Select this component when
- Intent is to navigate large datasets split across sequential pages
- Users need to reference or return to specific pages
- Large problem set (100s or 1000s of pages) and GoToInput should be included
- Space-constrained layout and CompactPaginator variant is appropriate
- NOT for sequential wizard/onboarding (use Stepper instead)
- NOT for infinite scroll or lazy-load patterns

### Auto-configure

| Rule | Logic |
|---|---|
| **Structure** | Pagination > { Paginator (or CompactPaginator) + optional GoToInput/CompactInput } |
| **Count prop** | Set count to total pages (required; determines page range) |
| **Page state** | Use page + onPageChange for controlled mode, or defaultPage for uncontrolled |
| **Variant** | Paginator for typical layout; CompactPaginator for constrained space or mobile |
| **Input** | Include GoToInput when pages > 100, CompactInput with CompactPaginator |
| **Range config** | boundaryCount default 1, siblingCount default 1 (adjust for space/usability) |
| **Positioning** | Display above and below content for long pages; align based on content type |
| **Focus** | Focus management automated by Pagination context; verify Tab order in page |
| **Accessibility** | Set aria-label on Pagination, ensure page changes announced, verify keyboard nav |

### Storybook references
- Default: https://storybook.saltdesignsystem.com/?path=/story/core-pagination--default
- With Truncation: https://storybook.saltdesignsystem.com/?path=/story/core-pagination--with-truncation
- With Input: https://storybook.saltdesignsystem.com/?path=/story/core-pagination--with-input
- Compact: https://storybook.saltdesignsystem.com/?path=/story/core-pagination--compact
- Compact With Input: https://storybook.saltdesignsystem.com/?path=/story/core-pagination--compact-with-input
- Compact With Go To: https://storybook.saltdesignsystem.com/?path=/story/core-pagination--compact-with-go-to
