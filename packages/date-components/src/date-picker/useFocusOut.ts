import type { ElementProps, FloatingContext } from "@floating-ui/react";
import { useMemo } from "react";

export interface UseFocusOutProps {
  /**
   * Whether the hook is enabled
   * @default true
   */
  enabled?: boolean;
}

function getTabbableElements(parent: Element): HTMLElement[] {
  const focusableSelectors = [
    "button:not([disabled])",
    "input:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
  ];
  const tabbableElements = parent.querySelectorAll<HTMLElement>(
    focusableSelectors.join(","),
  );
  return Array.from(tabbableElements).filter(
    (element) => !element.hasAttribute("disabled") && element.tabIndex >= 0,
  );
}
//
// This hook is needed to close the overlay, when,
// 1. the floating element is opened
// 2. the user re-focuses into the reference element with the mouse
// 3. the user tabs out of the reference element
// Without this hook, the floating element can re-receive focus
export function useFocusOut(
  context: FloatingContext,
  props: UseFocusOutProps,
): ElementProps {
  const { onOpenChange } = context;
  const { enabled = true } = props;

  const reference: ElementProps["reference"] = useMemo(() => {
    const referenceElement = context.elements.reference as Element | undefined;

    if (!referenceElement) {
      return {};
    }

    return {
      onKeyDown(event: React.KeyboardEvent<Element>) {
        if (event.key === "Tab") {
          const tabbableElements = getTabbableElements(referenceElement);
          const tabbedBeforeFirstElement =
            event.shiftKey && document.activeElement === tabbableElements[0];
          const tabbedAfterLastElement =
            document.activeElement ===
            tabbableElements[tabbableElements.length - 1];
          if (tabbedBeforeFirstElement || tabbedAfterLastElement) {
            onOpenChange(false, event.nativeEvent, "focus-out");
          }
        }
      },
    };
  }, [onOpenChange, context.elements.reference]);

  return useMemo(() => (enabled ? { reference } : {}), [enabled, reference]);
}
