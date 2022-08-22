import { useEffect, useRef } from "react";
import { useIsomorphicLayoutEffect } from "../../utils";

function getActiveElement(doc: DocumentOrShadowRoot): HTMLElement | null {
  if (!doc) {
    return null;
  }

  const activeElement = doc.activeElement;

  if (activeElement?.shadowRoot) {
    return getActiveElement(activeElement.shadowRoot);
  }

  return activeElement as HTMLElement;
}

export interface UseReturnFocusProps {
  active?: boolean;
  disabled?: boolean;
  document: DocumentOrShadowRoot;
  focusOptions?: FocusOptions | boolean;
}

export function useReturnFocus({
  focusOptions: focusOptionsProp,
  disabled,
  active,
  document,
}: UseReturnFocusProps): void {
  const previousFocusedElement = useRef<HTMLElement | null>();

  useIsomorphicLayoutEffect(() => {
    if (active) {
      previousFocusedElement.current = getActiveElement(document);
    }
  }, [document, active]);

  const focusOptionsRef = useRef(focusOptionsProp);

  useEffect(() => {
    focusOptionsRef.current = focusOptionsProp;
  }, [focusOptionsProp]);

  useIsomorphicLayoutEffect(() => {
    const returnFocus = () => {
      const focusOptions =
        typeof focusOptionsRef.current === "object"
          ? focusOptionsRef.current
          : undefined;

      setTimeout(() => {
        if (previousFocusedElement.current) {
          previousFocusedElement.current?.focus(focusOptions);
        }
      }, 0);
    };

    if (!disabled) {
      if (!active) {
        returnFocus();
      }

      return () => {
        if (active) {
          returnFocus();
        }
      };
    }

    return undefined;
  }, [disabled, active]);
}
