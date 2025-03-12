import type { FloatingContext } from "@floating-ui/react";
import { useCallback, useEffect } from "react";

export interface UseFocusOutProps {
  /**
   * Whether the focus outside middleware is enabled.
   * @default true
   */
  enabled?: boolean;
  /**
   * Callback function to be called when focus moves outside the reference and floating elements.
   */
  onFocusOut?: (event: FocusEvent) => void;
  /**
   * Function to determine if a focus event should trigger the onFocusOut callback.
   */
  outsidePress?: (event: FocusEvent) => boolean;
}

// Hook to close the floating element when focus is outside the reference and `floating` elements
// This is needed to close the overlay, when the input has focus and the overlay is opened and the user tabs out of the
// date input
export function useFocusOut(
  context: {
    elements: FloatingContext["elements"];
  },
  props: UseFocusOutProps = {},
): undefined {
  const { elements } = context;
  const { enabled = true, onFocusOut, outsidePress } = props;

  if (!enabled) return;

  const handleFocus = useCallback(
    (event: FocusEvent) => {
      const target = event.target as Node;
      const referenceElement = elements.reference as Element;
      const floatingElement = elements.floating as Element;

      // Check if the focus target is outside both the reference and floating elements
      // and if the outsidePress function allows it
      if (
        referenceElement &&
        floatingElement &&
        !referenceElement.contains(target) &&
        !floatingElement.contains(target) &&
        (!outsidePress || outsidePress(event))
      ) {
        onFocusOut?.(event);
      }
    },
    [elements.reference, elements.floating, onFocusOut, outsidePress],
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("focusin", handleFocus);

    return () => {
      document.removeEventListener("focusin", handleFocus);
    };
  }, [handleFocus, enabled]);
}
