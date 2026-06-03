import type { ElementProps, FloatingRootContext } from "@floating-ui/react";
import { useMemo } from "react";
import { FOCUSABLE_SELECTOR } from "./MegaMenuGridContext";

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
  const focusable =
    reference?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ?? reference;
  focusable?.focus();
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
 * keyboard events on the floating (panel) element. Trigger-level keys (e.g.
 * ArrowDown to enter the panel) are owned by `MegaMenuTrigger`.
 *
 * The 2D model is supplied by the registration store (`getModel`) and rebuilt
 * lazily on each keystroke, so a DOM reorder never leaves a stale grid behind.
 *
 * - **↑ / ↓** move within the current group (column). ↓ on the last item is a
 *   no-op; ↑ on the first item returns focus to the trigger.
 * - **← / →** jump to the top of the previous / next column. ← on the first
 *   column returns focus to the trigger.
 * - **Home / End** jump to the first / last item in the column.
 * - **→ from the last column** closes the panel and moves focus to the next
 *   sibling trigger (no-op if there is none).
 */
export function useMegaMenuKeyboard(
  context: FloatingRootContext,
  getModel: () => HTMLElement[][],
  props: UseMegaMenuKeyboardProps = {},
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

          const target = event.target as HTMLElement;
          const focusedItem = target.closest<HTMLElement>(FOCUSABLE_SELECTOR);
          if (!focusedItem) return;

          // Built lazily here (never memoised) so dynamic mount/unmount reorder
          // is always reflected.
          const grid = getModel();
          const pos = findPosition(grid, focusedItem);
          if (!pos) return;

          switch (event.key) {
            case "ArrowDown": {
              event.preventDefault();
              const next = pos.row + 1;
              // Strictly within the group — last item is a no-op.
              if (next < grid[pos.col].length) {
                grid[pos.col][next].focus();
              }
              break;
            }

            case "ArrowUp": {
              event.preventDefault();
              // Strictly within the group — first item returns to the trigger.
              if (pos.row > 0) {
                grid[pos.col][pos.row - 1].focus();
              } else {
                focusTrigger(context);
              }
              break;
            }

            case "ArrowRight": {
              event.preventDefault();
              const nextCol = pos.col + 1;
              if (nextCol < grid.length) {
                grid[nextCol][0].focus();
              } else {
                // On the last column — close panel and move to next trigger.
                const reference = context.elements
                  .reference as HTMLElement | null;
                const trigger =
                  reference?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ??
                  reference;
                const li = trigger?.closest("li");
                const nextSibling =
                  li?.nextElementSibling instanceof HTMLElement
                    ? li.nextElementSibling.querySelector<HTMLElement>(
                        FOCUSABLE_SELECTOR,
                      )
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
  }, [enabled, open, context, onOpenChange, getModel]);
}
