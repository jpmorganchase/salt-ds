import type { ElementProps, FloatingContext } from "@floating-ui/react";
import { type KeyboardEvent, useMemo } from "react";

export interface UseKeyboardProps {
  /**
   * If `true`, the hook is enabled.
   * @default true
   */
  enabled?: boolean;
  /**
   * Callback fired when the Down Arrow key is pressed on the reference element.
   */
  onArrowDown?: (event: KeyboardEvent) => void;
}

/**
 * Floating UI Interactions hook, that will open DatePicker on keydown
 * @param context
 * @param props
 */
export function useKeyboard(
  _context: FloatingContext,
  props: UseKeyboardProps,
): ElementProps {
  const { enabled = true, onArrowDown } = props;
  const reference = useMemo(
    () => ({
      onKeyDown(event: KeyboardEvent) {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          onArrowDown?.(event);
        }
      },
    }),
    [onArrowDown],
  );

  return useMemo(() => (enabled ? { reference } : {}), [enabled, reference]);
}
