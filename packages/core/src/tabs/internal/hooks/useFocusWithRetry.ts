import { useCallback, useEffect, useRef } from "react";

interface UseFocusWithRetryArgs {
  maxAttempts?: number;
  targetWindow: Window | null | undefined;
}

export function useFocusWithRetry({
  maxAttempts = 120,
  targetWindow,
}: UseFocusWithRetryArgs) {
  const focusRafRef = useRef<number | null>(null);

  const cancelScheduledFocus = useCallback(() => {
    if (focusRafRef.current != null && targetWindow) {
      targetWindow.cancelAnimationFrame(focusRafRef.current);
      focusRafRef.current = null;
    }
  }, [targetWindow]);

  const focusElementWithRetry = useCallback(
    (getElement: () => HTMLElement | null | undefined) => {
      const doc = targetWindow?.document;
      if (!doc) {
        getElement()?.focus({ preventScroll: true });
        return;
      }

      cancelScheduledFocus();

      let attempts = 0;

      const focusElement = () => {
        const element = getElement();
        if (!element?.isConnected) {
          if (attempts >= maxAttempts || !targetWindow?.requestAnimationFrame) {
            return;
          }

          attempts += 1;
          focusRafRef.current =
            targetWindow.requestAnimationFrame(focusElement);
          return;
        }

        element.focus({ preventScroll: true });

        if (doc.activeElement === element || attempts >= maxAttempts) {
          focusRafRef.current = null;
          return;
        }

        attempts += 1;
        if (targetWindow?.requestAnimationFrame) {
          focusRafRef.current =
            targetWindow.requestAnimationFrame(focusElement);
        } else {
          queueMicrotask(focusElement);
        }
      };

      focusElement();
    },
    [cancelScheduledFocus, maxAttempts, targetWindow],
  );

  useEffect(() => {
    return () => {
      cancelScheduledFocus();
    };
  }, [cancelScheduledFocus]);

  return {
    cancelScheduledFocus,
    focusElementWithRetry,
  };
}
