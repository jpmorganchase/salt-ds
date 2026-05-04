import { type KeyboardEvent, useCallback } from "react";

const COLUMN_SELECTOR = "[data-mega-menu-column]";
const ITEM_SELECTOR = "[data-mega-menu-item]";
export const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Get navigable items within a column.
 * Prefers explicitly marked items (`data-mega-menu-item`), falling back
 * to all focusable elements when no marked items are found.
 */
function getColumnItems(column: HTMLElement): HTMLElement[] {
  const marked = Array.from(
    column.querySelectorAll<HTMLElement>(ITEM_SELECTOR),
  );
  if (marked.length > 0) return marked;
  return Array.from(column.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
}

/**
 * Build a 2D grid of navigable items from the panel DOM.
 * Each column is a `[data-mega-menu-column]` wrapper; items within each
 * column are discovered via `getColumnItems`.
 * Items not inside any column are appended as their own single-item columns
 * so they remain reachable by keyboard navigation.
 */
function buildGrid(panel: HTMLElement): HTMLElement[][] {
  const columns = Array.from(
    panel.querySelectorAll<HTMLElement>(COLUMN_SELECTOR),
  );
  const grid = columns
    .map((col) => getColumnItems(col))
    .filter((items) => items.length > 0);

  // Collect items that sit outside any column
  const allItems = Array.from(
    panel.querySelectorAll<HTMLElement>(ITEM_SELECTOR),
  );
  const columnSet = new Set(columns);
  for (const item of allItems) {
    const inColumn = item.closest(COLUMN_SELECTOR);
    if (!inColumn || !columnSet.has(inColumn as HTMLElement)) {
      grid.push([item]);
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

interface UseMegaMenuKeyboardProps {
  isOpen: boolean;
  onFocusTrigger: () => void;
  onClose: () => void;
  onCloseAndFocusNext: (panel: HTMLElement) => void;
}

/**
 * Keyboard navigation for a mega menu laid out as a grid of columns.
 *
 * - **↑ / ↓** move within the current column.
 * - **← / →** jump to the **top** of the previous / next column.
 * - **Tab / Shift+Tab** move linearly through every item.
 * - **Home / End** jump to the first / last item in the column.
 * - **↑ from the first item** or **← from the first column** returns
 *   focus to the trigger.
 */
export function useMegaMenuKeyboard({
  isOpen,
  onFocusTrigger,
  onClose,
  onCloseAndFocusNext,
}: UseMegaMenuKeyboardProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (!isOpen) return;

      const panel = event.currentTarget;
      const target = event.target as HTMLElement;

      // Find the navigable item that contains the focused element
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
            // Wrap to first item of next column
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
            // Wrap to last item of previous column
            const prevCol = pos.col - 1;
            if (prevCol >= 0) {
              grid[prevCol][grid[prevCol].length - 1].focus();
            } else {
              onFocusTrigger();
            }
          }
          break;
        }

        case "ArrowRight": {
          event.preventDefault();
          const nextCol = pos.col + 1;
          if (nextCol < grid.length) {
            grid[nextCol][0].focus();
          }
          break;
        }

        case "ArrowLeft": {
          event.preventDefault();
          const prevCol = pos.col - 1;
          if (prevCol >= 0) {
            grid[prevCol][0].focus();
          } else {
            onFocusTrigger();
          }
          break;
        }

        case "Tab": {
          event.preventDefault();
          if (event.shiftKey) {
            if (linearIndex === 0) {
              onFocusTrigger();
            } else {
              allItems[linearIndex - 1]?.focus();
            }
          } else {
            if (linearIndex === allItems.length - 1) {
              onCloseAndFocusNext(panel);
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
    [isOpen, onFocusTrigger, onClose, onCloseAndFocusNext],
  );

  return { handleKeyDown };
}

/**
 * Focus the first navigable item inside a mega menu panel.
 * Retries with `requestAnimationFrame` if content has not yet rendered.
 */
export function focusFirstItem(panel: HTMLElement, attempt = 0): void {
  const firstItem =
    panel.querySelector<HTMLElement>(ITEM_SELECTOR) ??
    panel
      .querySelector<HTMLElement>(COLUMN_SELECTOR)
      ?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);

  if (firstItem) {
    firstItem.focus();
    return;
  }

  const view = panel.ownerDocument.defaultView;
  if (attempt < 3 && view) {
    view.requestAnimationFrame(() => focusFirstItem(panel, attempt + 1));
  }
}
