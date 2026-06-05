import type { ElementProps, FloatingRootContext } from "@floating-ui/react";
import { useMemo } from "react";

const COLUMN_SELECTOR = "[data-mega-menu-column]";
const ACTION_BAR_SELECTOR = "[data-mega-menu-action-bar]";

export const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Controls that own the arrow keys for their own behaviour (text editing,
// option lists, value steppers …). When focus is inside one of these the
// engine must NOT hijack the keys — it returns early and lets the control
// keep them.
const SELF_CONSUMING_SELECTOR =
  'input, textarea, select, [contenteditable], [role="combobox"], [role="listbox"], [role="slider"], [role="spinbutton"], [role="textbox"]';

// Elements within an aria-hidden or inert subtree are outside the focus order,
// including floating-ui's focus guards. `:not()` cannot match on an ancestor,
// so candidates are filtered by ancestor lookup rather than by selector.
const HIDDEN_ANCESTOR_SELECTOR = '[aria-hidden="true"], [inert]';

function queryFocusables(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((el) => !el.closest(HIDDEN_ANCESTOR_SELECTOR));
}

function firstFocusable(root: HTMLElement | null): HTMLElement | null {
  return root ? (queryFocusables(root)[0] ?? null) : null;
}

interface NavModel {
  /** Column elements (`data-mega-menu-column`) in DOM order, each with ≥1 cell. */
  columns: HTMLElement[];
  /** Full-width action-bar elements (`MegaMenuActionBar`); always the bottom of the center area. */
  actionBars: HTMLElement[];
}

/**
 * Build the navigation model from the panel DOM at keypress time.
 * Columns and action bars are discovered via the structural attributes; their
 * cells are any focusable descendants. There is a single query path — focusability
 * is the only signal, with no per-item marker or fallback. An action bar
 * (`MegaMenuActionBar`) is always the bottom of the center area, so there is no
 * top/bottom split.
 */
function buildModel(panel: HTMLElement): NavModel {
  const columns = Array.from(
    panel.querySelectorAll<HTMLElement>(COLUMN_SELECTOR),
  ).filter((el) => queryFocusables(el).length > 0);

  const actionBars = Array.from(
    panel.querySelectorAll<HTMLElement>(ACTION_BAR_SELECTOR),
  ).filter((el) => queryFocusables(el).length > 0);

  return { columns, actionBars };
}

function focusTrigger(context: FloatingRootContext) {
  const reference = context.elements.reference as HTMLElement | null;
  (firstFocusable(reference) ?? reference)?.focus();
}

function focusNextTriggerAndClose(context: FloatingRootContext) {
  const reference = context.elements.reference as HTMLElement | null;
  const trigger = firstFocusable(reference) ?? reference;
  const li = trigger?.closest("li");
  const next =
    li?.nextElementSibling instanceof HTMLElement
      ? firstFocusable(li.nextElementSibling)
      : null;
  if (next) {
    context.onOpenChange(false);
    next.focus();
  }
}

/**
 * Whether the columns are laid out as a single stacked column rather than a row.
 * At small viewports the panel grid collapses to one column (see
 * `MegaMenuPanel.css`), so columns flow top-to-bottom. Detected geometrically:
 * the second column begins at or below the bottom of the first.
 */
function columnsStacked(columns: HTMLElement[]): boolean {
  if (columns.length < 2) return false;
  const first = columns[0].getBoundingClientRect();
  const second = columns[1].getBoundingClientRect();
  return second.top >= first.bottom - 1;
}

/**
 * Stacked (small-viewport) movement: every cell forms one linear list in layout
 * order, so all four arrows degrade to previous/next. Up/Left on the very first
 * item returns focus to the trigger (menu stays open).
 */
function handleLinear(
  key: string,
  cell: HTMLElement,
  panel: HTMLElement,
  context: FloatingRootContext,
): boolean {
  const cells = queryFocusables(panel);
  const index = cells.indexOf(cell);
  if (index === -1) return false;

  switch (key) {
    case "ArrowDown":
    case "ArrowRight": {
      if (index < cells.length - 1) {
        cells[index + 1].focus();
      }
      return true;
    }
    case "ArrowUp":
    case "ArrowLeft": {
      if (index > 0) {
        cells[index - 1].focus();
      } else {
        focusTrigger(context);
      }
      return true;
    }
    case "Home": {
      cells[0]?.focus();
      return true;
    }
    case "End": {
      cells[cells.length - 1]?.focus();
      return true;
    }
    default:
      return false;
  }
}

/**
 * Apply an arrow/Home/End movement from `cell`. Returns `true` when the key was
 * consumed (so the caller can `preventDefault`).
 *
 * - **Columns** (groups + side content): Up/Down move within the column,
 *   Left/Right cross to the adjacent column. Down on the last cell crosses into
 *   the bottom action bar if one exists, otherwise no-op; Up on the first
 *   cell returns to the trigger.
 * - **Action bars** (the full-width row): Left/Right move within, Up crosses
 *   into the first column's first item, Down is a no-op.
 * - **Edges**: Left/Up on the very first item → trigger (menu stays open);
 *   Right on the last column → next sibling trigger + close (no-op if none).
 */
function handleArrow(
  key: string,
  cell: HTMLElement,
  panel: HTMLElement,
  context: FloatingRootContext,
): boolean {
  const { columns, actionBars } = buildModel(panel);

  // Small viewport: the grid is stacked into one column, so arrows degrade to a
  // single linear Up/Down (and Left/Right) walk through every cell in order.
  if (columnsStacked(columns)) {
    return handleLinear(key, cell, panel, context);
  }

  const column = cell.closest<HTMLElement>(COLUMN_SELECTOR);
  const actionBar = cell.closest<HTMLElement>(ACTION_BAR_SELECTOR);

  if (column) {
    const colIndex = columns.indexOf(column);
    const cells = queryFocusables(column);
    const rowIndex = cells.indexOf(cell);

    switch (key) {
      case "ArrowDown": {
        if (rowIndex < cells.length - 1) {
          cells[rowIndex + 1].focus();
        } else if (actionBars.length > 0) {
          firstFocusable(actionBars[0])?.focus();
        }
        return true;
      }
      case "ArrowUp": {
        if (rowIndex > 0) {
          cells[rowIndex - 1].focus();
        } else {
          // The action bar is always below the columns, so there is nothing above
          // the first cell — return to the trigger (menu stays open).
          focusTrigger(context);
        }
        return true;
      }
      case "ArrowRight": {
        if (colIndex < columns.length - 1) {
          firstFocusable(columns[colIndex + 1])?.focus();
        } else {
          focusNextTriggerAndClose(context);
        }
        return true;
      }
      case "ArrowLeft": {
        if (colIndex > 0) {
          firstFocusable(columns[colIndex - 1])?.focus();
        } else {
          focusTrigger(context);
        }
        return true;
      }
      case "Home": {
        cells[0]?.focus();
        return true;
      }
      case "End": {
        cells[cells.length - 1]?.focus();
        return true;
      }
      default:
        return false;
    }
  }

  if (actionBar) {
    const cells = queryFocusables(actionBar);
    const index = cells.indexOf(cell);

    switch (key) {
      case "ArrowRight": {
        if (index < cells.length - 1) {
          cells[index + 1].focus();
        }
        return true;
      }
      case "ArrowLeft": {
        if (index > 0) {
          cells[index - 1].focus();
        } else if (cell === firstFocusable(panel)) {
          // The very first item in layout order returns to the trigger.
          focusTrigger(context);
        }
        return true;
      }
      case "ArrowUp": {
        // The action bar is the bottom of the center area, so Up crosses into the
        // first cell of the first column.
        if (columns.length > 0) {
          firstFocusable(columns[0])?.focus();
        } else {
          focusTrigger(context);
        }
        return true;
      }
      case "ArrowDown": {
        // An action bar is always the bottom — nothing below it.
        return true;
      }
      case "Home": {
        cells[0]?.focus();
        return true;
      }
      case "End": {
        cells[cells.length - 1]?.focus();
        return true;
      }
      default:
        return false;
    }
  }

  return false;
}

/**
 * Move focus to the first document-focusable after the panel, retrying across
 * two animation frames so the panel has unmounted. Mirrors the next-sibling
 * trigger first, then falls back to the next focusable outside the panel.
 */
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

export interface UseMegaMenuNavigationProps {
  /**
   * Whether the interaction is enabled.
   * @default true
   */
  enabled?: boolean;
}

/**
 * Floating-ui custom interaction hook for mega menu keyboard navigation.
 *
 * Returns `ElementProps` merged via `useInteractions`, handling key events on
 * the floating (panel) element only. The reference (trigger) keys are owned by
 * `MegaMenuTrigger`. The navigation model is rebuilt from the panel DOM on every
 * keypress from the structural attributes (`data-mega-menu-column`,
 * `data-mega-menu-action-bar`); cells are the focusable descendants of each container.
 *
 * - **↑ / ↓** move within a column; **← / →** cross between columns.
 * - Within an action bar **← / →** move along it and **↑ / ↓** cross to the columns.
 * - **Tab / Shift+Tab** move linearly through every cell in layout order.
 * - **Home / End** jump to the first / last cell in the column.
 * - **↑ / ←** on the very first item returns focus to the trigger (menu open).
 * - **→** on the last column closes the menu and focuses the next trigger.
 * - At a small viewport the grid stacks into one column and all arrows degrade
 *   to a single linear walk over every cell.
 * - Focus inside a self-consuming control (input, combobox, slider …) keeps its
 *   own keys — the engine returns early without preventing default.
 */
export function useMegaMenuNavigation(
  context: FloatingRootContext,
  props: UseMegaMenuNavigationProps = {},
): ElementProps {
  const { enabled = true } = props;
  const { open, onOpenChange } = context;

  return useMemo(() => {
    if (!enabled) {
      return {};
    }

    return {
      // The reference (trigger) keys — Left/Right between siblings and Down to
      // open and enter the panel — are owned solely by `MegaMenuTrigger`. The
      // engine only handles keys once focus is inside the floating panel.
      floating: {
        onKeyDown(event: React.KeyboardEvent) {
          if (!open) return;

          const panel = event.currentTarget as HTMLElement;
          const target = event.target as HTMLElement;
          const { key } = event;

          const isArrowOrEdge =
            key === "ArrowUp" ||
            key === "ArrowDown" ||
            key === "ArrowLeft" ||
            key === "ArrowRight" ||
            key === "Home" ||
            key === "End";

          // ROLE-AWARE: a self-consuming control keeps its own navigation keys.
          if (isArrowOrEdge && target.closest(SELF_CONSUMING_SELECTOR)) {
            return;
          }

          const cell = target.closest<HTMLElement>(FOCUSABLE_SELECTOR);

          // Tab traversal walks every cell in layout (DOM) order. The panel is
          // portaled, so the boundary transitions are handled manually.
          if (key === "Tab") {
            const allCells = queryFocusables(panel);
            const linearIndex = cell ? allCells.indexOf(cell) : -1;
            if (linearIndex === -1) return;
            event.preventDefault();
            if (event.shiftKey) {
              if (linearIndex === 0) {
                focusTrigger(context);
              } else {
                allCells[linearIndex - 1]?.focus();
              }
            } else if (linearIndex === allCells.length - 1) {
              onOpenChange(false);
              focusNextAfterPanel(context, panel);
            } else {
              allCells[linearIndex + 1]?.focus();
            }
            return;
          }

          if (!cell || !isArrowOrEdge) return;

          if (handleArrow(key, cell, panel, context)) {
            event.preventDefault();
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
  const firstItem = firstFocusable(panel);

  if (firstItem) {
    firstItem.focus();
    return;
  }

  const view = panel.ownerDocument.defaultView;
  if (attempt < 3 && view) {
    view.requestAnimationFrame(() => focusFirstItem(panel, attempt + 1));
  }
}
