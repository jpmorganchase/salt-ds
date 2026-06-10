import type { ElementProps, FloatingRootContext } from "@floating-ui/react";
import { useMemo } from "react";

const COLUMN_SELECTOR = "[data-mega-menu-column]";
const SUPPORTING_ACTIONS_SELECTOR = "[data-mega-menu-supporting-actions]";

export const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Controls that own the arrow keys (caret, option lists, steppers); the engine
// leaves their keys alone when focus is inside one.
const SELF_CONSUMING_SELECTOR =
  'input, textarea, select, [contenteditable], [role="combobox"], [role="listbox"], [role="slider"], [role="spinbutton"], [role="textbox"]';

// aria-hidden / inert subtrees are out of the focus order; filtered by ancestor
// lookup since `:not()` cannot match on an ancestor.
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
  /** Columns (`data-mega-menu-column`) in DOM order, each with ≥1 cell. */
  columns: HTMLElement[];
  /** Full-width supporting actions; the bottom of the center area. */
  supportingActions: HTMLElement[];
}

/** Build the navigation model from the panel DOM at keypress time. */
function buildModel(panel: HTMLElement): NavModel {
  const columns = Array.from(
    panel.querySelectorAll<HTMLElement>(COLUMN_SELECTOR),
  ).filter((el) => queryFocusables(el).length > 0);

  const supportingActions = Array.from(
    panel.querySelectorAll<HTMLElement>(SUPPORTING_ACTIONS_SELECTOR),
  ).filter((el) => queryFocusables(el).length > 0);

  return { columns, supportingActions };
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

/** True when the grid has collapsed to one stacked column (small viewport). */
function columnsStacked(columns: HTMLElement[]): boolean {
  if (columns.length < 2) return false;
  const first = columns[0].getBoundingClientRect();
  const second = columns[1].getBoundingClientRect();
  return second.top >= first.bottom - 1;
}

/** Stacked layout: all arrows degrade to prev/next over every cell. */
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

/** Arrow/Home/End movement from `cell`. Returns `true` when the key was consumed. */
function handleArrow(
  key: string,
  cell: HTMLElement,
  panel: HTMLElement,
  context: FloatingRootContext,
): boolean {
  const { columns, supportingActions } = buildModel(panel);

  if (columnsStacked(columns)) {
    return handleLinear(key, cell, panel, context);
  }

  const column = cell.closest<HTMLElement>(COLUMN_SELECTOR);
  const supportingActionsEl = cell.closest<HTMLElement>(
    SUPPORTING_ACTIONS_SELECTOR,
  );

  if (column) {
    const colIndex = columns.indexOf(column);
    const cells = queryFocusables(column);
    const rowIndex = cells.indexOf(cell);

    switch (key) {
      case "ArrowDown": {
        if (rowIndex < cells.length - 1) {
          cells[rowIndex + 1].focus();
        } else if (supportingActions.length > 0) {
          firstFocusable(supportingActions[0])?.focus();
        } else if (colIndex < columns.length - 1) {
          firstFocusable(columns[colIndex + 1])?.focus();
        } else {
          focusNextTriggerAndClose(context);
        }
        return true;
      }
      case "ArrowUp": {
        if (rowIndex > 0) {
          cells[rowIndex - 1].focus();
        } else {
          focusTrigger(context);
        }
        return true;
      }
      case "ArrowRight": {
        if (colIndex < columns.length - 1) {
          firstFocusable(columns[colIndex + 1])?.focus();
        } else if (rowIndex === cells.length - 1) {
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

  if (supportingActionsEl) {
    const cells = queryFocusables(supportingActionsEl);
    const index = cells.indexOf(cell);

    switch (key) {
      case "ArrowRight": {
        if (index < cells.length - 1) {
          cells[index + 1].focus();
        } else {
          focusNextTriggerAndClose(context);
        }
        return true;
      }
      case "ArrowLeft": {
        if (index > 0) {
          cells[index - 1].focus();
        } else if (cell === firstFocusable(panel)) {
          focusTrigger(context);
        }
        return true;
      }
      case "ArrowUp": {
        if (columns.length > 0) {
          firstFocusable(columns[0])?.focus();
        } else {
          focusTrigger(context);
        }
        return true;
      }
      case "ArrowDown": {
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

/** Focus the first document-focusable after the panel, once it has unmounted. */
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
 * Floating-ui interaction hook for mega menu keyboard navigation. Handles keys
 * on the panel only; the trigger keys are owned by `MegaMenuTrigger`.
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

          // A self-consuming control keeps its own navigation keys.
          if (isArrowOrEdge && target.closest(SELF_CONSUMING_SELECTOR)) {
            return;
          }

          const cell = target.closest<HTMLElement>(FOCUSABLE_SELECTOR);

          // Tab walks every cell in layout order; the panel is portaled, so the
          // boundary transitions are handled manually.
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

/** Focus the first navigable item inside a mega menu panel, retrying until rendered. */
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
