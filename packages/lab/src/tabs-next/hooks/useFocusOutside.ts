import { useWindow } from "@salt-ds/window";
import { type RefObject, useEffect } from "react";

export function useFocusOutside(
  elementRef: RefObject<HTMLElement>,
  onFocusOutside: () => void,
  enabled: boolean,
) {
  const targetWindow = useWindow();

  useEffect(() => {
    if (!enabled) return;

    const handleFocus = (event: FocusEvent) => {
      // If focus is outside the tabstrip (including the list) then close the list.
      if (
        event.target instanceof HTMLElement &&
        !elementRef.current?.contains(event.target)
      ) {
        onFocusOutside();
      }
    };

    targetWindow?.addEventListener("focusin", handleFocus);

    return () => {
      targetWindow?.removeEventListener("focusin", handleFocus);
    };
  }, [targetWindow, onFocusOutside, elementRef, enabled]);
}
