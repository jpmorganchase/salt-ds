import { useWindow } from "@salt-ds/window";
import { useLayoutEffect } from "react";

export function useDismissWithEscape(onDismiss: () => void, enabled = true) {
  const targetWindow = useWindow();

  useLayoutEffect(() => {
    if (!targetWindow || !enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onDismiss();
      }
    };

    targetWindow.addEventListener("keydown", onKeyDown);

    return () => {
      targetWindow.removeEventListener("keydown", onKeyDown);
    };
  }, [onDismiss, enabled]);
}
