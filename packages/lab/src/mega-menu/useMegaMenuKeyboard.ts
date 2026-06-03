import type { ElementProps, FloatingRootContext } from "@floating-ui/react";
import { useMemo } from "react";

const COLUMN_SELECTOR = "[data-mega-menu-column]";
const ITEM_SELECTOR = "[data-mega-menu-item]";
export const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Elements within an aria-hidden or inert subtree are outside the focus order,
// including floating-ui's focus guards. `:not()` cannot match on an ancestor,
// so candidates are filtered by ancestor lookup rather than by selector.
const HIDDEN_ANCESTOR_SELECTOR = '[aria-hidden="true"], [inert]';

function isNavigable(el: HTMLElement): boolean {
  return (
    el.matches(FOCUSABLE_SELECTOR) && !el.closest(HIDDEN_ANCESTOR_SELECTOR)
  );
}

function queryFocusables(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((el) => !el.closest(HIDDEN_ANCESTOR_SELECTOR));
}

function firstFocusable(root: HTMLElement | null): HTMLElement | null {
  return root ? (queryFocusables(root)[0] ?? null) : null;
}

/**
 * Get navigable items within a column.
 * Prefers explicitly marked items (`data-mega-menu-item`) that are navigable,
 * falling back to all focusable elements when no usable marked items are found.
 */
function getColumnItems(column: HTMLElement): HTMLElement[] {
  const marked = Array.from(
    column.querySelectorAll<HTMLElement>(ITEM_SELECTOR),
  ).filter(isNavigable);
  if (marked.length > 0) return marked;
  return queryFocusables(column);
}

/**
 * Build a 2D grid of navigable items from the panel DOM.
 * Each column is a `[data-mega-menu-column]` wrapper; items within each
 * column are discovered via `getColumnItems`.
 * Items not inside any column (orphans) are inserted at their DOM position
 * as single-item columns so keyboard navigation follows visual order.
 */
function buildGrid(panel: HTMLElement): HTMLElement[][] {
  const columns = new Set(panel.querySelectorAll<HTMLElement>(COLUMN_SELECTOR));
  const grid: HTMLElement[][] = [];
  const processedColumns = new Set<HTMLElement>();

  // Walk columns and items in DOM order so orphans are interleaved correctly.
  const all = panel.querySelectorAll<HTMLElement>(
    `${COLUMN_SELECTOR}, ${ITEM_SELECTOR}`,
  );

  for (const el of all) {
    if (columns.has(el) && !processedColumns.has(el)) {
      processedColumns.add(el);
      const items = getColumnItems(el);
      if (items.length > 0) grid.push(items);
    } else if (el.matches(ITEM_SELECTOR)) {
      const parentCol = el.closest(COLUMN_SELECTOR);
      if (
        (!parentCol || !columns.has(parentCol as HTMLElement)) &&
        isNavigable(el)
      ) {
        grid.push([el]);
      }
    }
  }

  return grid;
}

function findPosition(
  grid: HTMLElement[][],
  el: HTMLElement,
): { col: number; row: number } | null {
  for (let col = 0; col < grid.length; col++) {
    const row = grid[col].indexOf(el);
    if (row !== -1) return { col, row };
  }
  return null;
}

function focusTrigger(context: FloatingRootContext) {
  const reference = context.elements.reference as HTMLElement | null;
  (firstFocusable(reference) ?? reference)?.focus();
}

function focusNextAfterPanel(context: FloatingRootContext, panel: HTMLElement) {
  const reference = context.elements.reference as HTMLElement | null;
  const refFocusable = firstFocusable(reference) ?? reference;

  const nextLi = refFocusable?.closest("li")?.nextElementSibling;
  const nextSibling =
    nextLi instanceof HTMLElement ? firstFocusable(nextLi) : null;

  const nextOutside =
    nextSibling ||
    (() => {
      const allFocusable = queryFocusables(
        panel.ownerDocument.documentElement,
      ).filter((el) => !panel.contains(el));
      const idx = refFocusable ? allFocusable.indexOf(refFocusable) : -1;
      return idx >= 0 ? allFocusable[idx + 1] : undefined;
    })();

  if (nextOutside) {
    const view = panel.ownerDocument.defaultView;
    view?.requestAnimationFrame(() => {
      view?.requestAnimationFrame(() => {
        nextOutside.focus();
      });
    });
  }
}

export interface UseMegaMenuKeyboardProps {
  /**
   * Whether the interaction is enabled.
   * @default true
   */
  enabled?: boolean;
}

/**
 * Floating-ui custom interaction hook for mega menu grid keyboard navigation.
 *
 * Returns `ElementProps` that get merged via `useInteractions`, handling
 * keyboard events on both the reference (trigger) and floating (panel) elements.
 *
 * - **↑ / ↓** move within the current column.
 * - **← / →** jump to the top of the previous / next column.
 * - **Tab / Shift+Tab** move linearly through every item.
 * - **Home / End** jump to the first / last item in the column.
 * - **↑ from the first item** or **← from the first column** returns
 *   focus to the trigger.
 * - **→ from the last column** closes the panel and moves focus to the
 *   next sibling trigger.
 */
export function useMegaMenuKeyboard(
  context: FloatingRootContext,
  props: UseMegaMenuKeyboardProps = {},
): ElementProps {
  const { enabled = true } = props;
  const { open, onOpenChange } = context;

  return useMemo(() => {
    if (!enabled) {
      return {};
    }

    return {
      reference: {
        onKeyDown(event: React.KeyboardEvent) {
          if (event.key === "ArrowDown" && open) {
            event.preventDefault();
            const floating = context.elements.floating;
            if (floating instanceof HTMLElement) {
              focusFirstItem(floating);
            }
          }
        },
      },
      floating: {
        onKeyDown(event: React.KeyboardEvent) {
          if (!open) return;

          const panel = event.currentTarget as HTMLElement;
          const target = event.target as HTMLElement;

          const focusedItem =
            target.closest<HTMLElement>(ITEM_SELECTOR) ??
            target.closest<HTMLElement>(FOCUSABLE_SELECTOR);
          if (!focusedItem) return;

          const grid = buildGrid(panel);
          const pos = findPosition(grid, focusedItem);
          if (!pos) return;

          const allItems = grid.flat();
          const linearIndex = allItems.indexOf(focusedItem);

          switch (event.key) {
            case "ArrowDown": {
              event.preventDefault();
              const next = pos.row + 1;
              if (next < grid[pos.col].length) {
                grid[pos.col][next].focus();
              } else {
                const nextCol = pos.col + 1;
                if (nextCol < grid.length) {
                  grid[nextCol][0].focus();
                }
              }
              break;
            }

            case "ArrowUp": {
              event.preventDefault();
              if (pos.row > 0) {
                grid[pos.col][pos.row - 1].focus();
              } else {
                const prevCol = pos.col - 1;
                if (prevCol >= 0) {
                  grid[prevCol][grid[prevCol].length - 1].focus();
                } else {
                  focusTrigger(context);
                }
              }
              break;
            }

            case "ArrowRight": {
              event.preventDefault();
              const nextCol = pos.col + 1;
              if (nextCol < grid.length) {
                grid[nextCol][0].focus();
              } else {
                // On the last column — close panel and move to next trigger
                const reference = context.elements
                  .reference as HTMLElement | null;
                const trigger = firstFocusable(reference) ?? reference;
                const li = trigger?.closest("li");
                const nextSibling =
                  li?.nextElementSibling instanceof HTMLElement
                    ? firstFocusable(li.nextElementSibling)
                    : null;
                if (nextSibling) {
                  onOpenChange(false);
                  nextSibling.focus();
                }
              }
              break;
            }

            case "ArrowLeft": {
              event.preventDefault();
              const prevCol = pos.col - 1;
              if (prevCol >= 0) {
                grid[prevCol][0].focus();
              } else {
                focusTrigger(context);
              }
              break;
            }

            case "Tab": {
              event.preventDefault();
              if (event.shiftKey) {
                if (linearIndex === 0) {
                  focusTrigger(context);
                } else {
                  allItems[linearIndex - 1]?.focus();
                }
              } else {
                if (linearIndex === allItems.length - 1) {
                  onOpenChange(false);
                  focusNextAfterPanel(context, panel);
                } else {
                  allItems[linearIndex + 1]?.focus();
                }
              }
              break;
            }

            case "Home": {
              event.preventDefault();
              grid[pos.col][0]?.focus();
              break;
            }

            case "End": {
              event.preventDefault();
              grid[pos.col][grid[pos.col].length - 1]?.focus();
              break;
            }

            default:
              break;
          }
        },
      },
    };
  }, [enabled, open, context, onOpenChange]);
}

/**
 * Focus the first navigable item inside a mega menu panel.
 * Retries with `requestAnimationFrame` if content has not yet rendered.
 */
export function focusFirstItem(panel: HTMLElement, attempt = 0): void {
  const grid = buildGrid(panel);
  const firstItem = grid[0]?.[0];

  if (firstItem) {
    firstItem.focus();
    return;
  }

  const view = panel.ownerDocument.defaultView;
  if (attempt < 3 && view) {
    view.requestAnimationFrame(() => focusFirstItem(panel, attempt + 1));
  }
}
