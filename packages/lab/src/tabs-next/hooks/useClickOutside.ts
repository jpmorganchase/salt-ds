import { useWindow } from "@salt-ds/window";
import { type RefObject, useEffect } from "react";

export function useClickOutside(
  elementRef: RefObject<HTMLElement>,
  onClickOutside: () => void,
  enabled: boolean,
) {
  const targetWindow = useWindow();

  useEffect(() => {
    if (!enabled) return;

    const handleClick = (event: FocusEvent) => {
      // If focus is outside the tabstrip (including the list) then close the list.
      if (
        event.target instanceof HTMLElement &&
        !elementRef.current?.contains(event.target)
      ) {
        onClickOutside();
      }
    };

    targetWindow?.addEventListener("click", handleClick, true);

    return () => {
      targetWindow?.removeEventListener("click", handleClick, true);
    };
  }, [targetWindow, onClickOutside, elementRef, enabled]);
}
