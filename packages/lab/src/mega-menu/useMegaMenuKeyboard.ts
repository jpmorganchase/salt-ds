import type { ElementProps, FloatingRootContext } from "@floating-ui/react";
import { useMemo } from "react";
import {
  COLUMN_SELECTOR,
  columnsOf,
  FOCUSABLE_SELECTOR,
  focusablesIn,
  getAdjacentTrigger,
  getTriggerFocusable,
} from "./megaMenuNavigation";

export interface UseMegaMenuKeyboardProps {
  /**
   * Whether the interaction is enabled.
   * @default true
   */
  enabled?: boolean;
}

/**
 * Floating-ui interaction for the open panel's arrow-key navigation. Tab /
 * Shift+Tab / Escape / focus-out are handled natively by `FloatingFocusManager`
 * + `useDismiss`; trigger-level keys live in `MegaMenuTrigger`.
 *
 * Position is read straight from the live DOM each keystroke — `closest` for the
 * current column, `columnsOf` for the column order — so dynamic mounts are always
 * reflected and there is no model to build or keep in sync. Columns are
 * `[data-mega-menu-column]` (groups and supporting regions alike); items are the
 * focusables within a column.
 *
 * - **↑ / ↓** move within the column, then fall through to the previous / next
 *   column. ↑ off the very first item → trigger; ↓ off the very last item → no-op.
 * - **← / →** jump to the first item of the previous / next column. ← off the
 *   first column → trigger; → off the last column → next trigger + close.
 * - **Home / End** jump to the first / last item in the column.
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

    const reference = () => context.elements.reference as HTMLElement | null;
    const focusTrigger = () => getTriggerFocusable(reference())?.focus();
    const firstOf = (column: HTMLElement | undefined) =>
      column ? focusablesIn(column)[0] : undefined;
    const lastOf = (column: HTMLElement | undefined) => {
      const items = column ? focusablesIn(column) : [];
      return items[items.length - 1];
    };

    return {
      floating: {
        onKeyDown(event: React.KeyboardEvent) {
          if (!open) return;

          const item = (event.target as HTMLElement).closest<HTMLElement>(
            FOCUSABLE_SELECTOR,
          );
          const column = item?.closest<HTMLElement>(COLUMN_SELECTOR);
          if (!item || !column) return;

          const panel = event.currentTarget as HTMLElement;
          const columns = columnsOf(panel);
          const items = focusablesIn(column);
          const col = columns.indexOf(column);
          const row = items.indexOf(item);

          switch (event.key) {
            case "ArrowDown":
              event.preventDefault();
              (row < items.length - 1
                ? items[row + 1]
                : firstOf(columns[col + 1])
              )?.focus();
              break;

            case "ArrowUp":
              event.preventDefault();
              if (row > 0) items[row - 1].focus();
              else if (col > 0) lastOf(columns[col - 1])?.focus();
              else focusTrigger();
              break;

            case "ArrowRight":
              event.preventDefault();
              if (col < columns.length - 1) {
                firstOf(columns[col + 1])?.focus();
              } else {
                // Past the last column — close and move to the next trigger.
                const next = getAdjacentTrigger(
                  getTriggerFocusable(reference()),
                  "next",
                );
                if (next) {
                  onOpenChange(false);
                  next.focus();
                }
              }
              break;

            case "ArrowLeft":
              event.preventDefault();
              if (col > 0) firstOf(columns[col - 1])?.focus();
              else focusTrigger();
              break;

            case "Home":
              event.preventDefault();
              items[0]?.focus();
              break;

            case "End":
              event.preventDefault();
              items[items.length - 1]?.focus();
              break;

            default:
              break;
          }
        },
      },
    };
  }, [enabled, open, context, onOpenChange]);
}
