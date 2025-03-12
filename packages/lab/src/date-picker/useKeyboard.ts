import type { ElementProps, FloatingContext } from "@floating-ui/react";
import { useMemo } from "react";

export interface UseKeyboardProps {
  /**
   * Whether the hook is enabled
   * @default true
   */
  enabled?: boolean;
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
  const { enabled = true } = props;
  const reference: ElementProps["reference"] = useMemo(
    () => ({
      onKeyDown(event) {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          onOpenChange(true, event.nativeEvent, "reference-press");
        }
      },
    }),
    [onOpenChange],
  );

  return useMemo(() => (enabled ? { reference } : {}), [enabled, reference]);
}
