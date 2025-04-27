import type { ElementProps, FloatingContext } from "@floating-ui/react";
import { type KeyboardEvent, useMemo } from "react";

export interface UseKeyboardProps {
  /**
   * Whether the hook is enabled
   * @default true
   */
  enabled?: boolean;
  /**
   * Handler for when the arrow key down is pressed
   * @param event
   */
  onArrowDown?: (event: KeyboardEvent) => void;
}

/**
 * Floating UI Interactions hook, that will open DatePicker on keydown
 * @param context
 * @param props
 */
export function useKeyboard(
  context: FloatingContext,
  props: UseKeyboardProps,
): ElementProps {
  const { onOpenChange } = context;
  const { enabled = true, onArrowDown } = props;
  const reference = useMemo(
    () => ({
      onKeyDown(event: KeyboardEvent) {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          onArrowDown?.(event)
        }
      },
    }),
    [onOpenChange],
  );

  return useMemo(() => (enabled ? { reference } : {}), [enabled, reference]);
}
