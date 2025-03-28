import type { ElementProps, FloatingContext } from "@floating-ui/react";
import { useMemo } from "react";

export interface UseFocusOutProps {
  /**
   * Whether the hook is enabled
   * @default true
   */
  enabled?: boolean;
}

// Hook to close the floating element when focus is outside the reference and `floating` elements
// This is needed to close the overlay, when the input has focus and the overlay is opened and the user tabs out of the
// date input
export function useFocusOut(
  context: FloatingContext,
  props: UseFocusOutProps,
): ElementProps {
  const { onOpenChange, open } = context;
  const { enabled = true } = props;
  const reference: ElementProps["reference"] = useMemo(
    () => ({
      onBlur(event) {
        const referenceElement = context.elements.reference as Element;
        const floatingElement = context.elements.floating as Element;
        setTimeout(() => {
          if (
            open &&
            !referenceElement?.contains(document.activeElement) &&
            !floatingElement?.contains(document.activeElement)
          ) {
            onOpenChange(false, event.nativeEvent, "focus-out");
          }
        }, 0);
      },
    }),
    [onOpenChange, context.elements.reference, context.elements.floating],
  );

  return useMemo(() => (enabled ? { reference } : {}), [enabled, reference]);
}
