import { useWindow } from "@salt-ds/window";
import { type PointerEvent, useCallback, useEffect, useState } from "react";
import { useInterval } from "./useInterval";

const INITIAL_DELAY = 500;
const INTERVAL_DELAY = 100;

export function useLongPressPointerAction(
  actionFn: (event?: PointerEvent) => void,
  isAtLimit: boolean,
) {
  const [active, setActive] = useState(false);
  const [delay, setDelay] = useState(INITIAL_DELAY);

  const cancel = useCallback(() => {
    setActive(false);
    setDelay(INITIAL_DELAY);
  }, []);

  useEffect(() => {
    if (isAtLimit) {
      cancel();
    }
  }, [isAtLimit, cancel]);

  const targetWindow = useWindow();
  useEffect(() => {
    if (targetWindow) {
      targetWindow.addEventListener("pointerup", cancel);
      targetWindow.addEventListener("pointercancel", cancel);
      targetWindow.addEventListener("blur", cancel);
      targetWindow.addEventListener("contextmenu", cancel); // Don't rely on this alone to cancel
    }
    return () => {
      if (targetWindow) {
        targetWindow.removeEventListener("pointerup", cancel);
        targetWindow.removeEventListener("pointercancel", cancel);
        targetWindow.removeEventListener("blur", cancel);
        targetWindow.removeEventListener("contextmenu", cancel);
      }
    };
  }, [cancel, targetWindow]);

  const activate = useCallback(
    (event: PointerEvent) => {
      // Only left mouse button, or any touch/pen
      if (
        (event.pointerType === "mouse" && event.button === 0) ||
        event.pointerType === "touch" ||
        event.pointerType === "pen"
      ) {
        actionFn(event);
        setActive(true);
      }
    },
    [actionFn],
  );

  useInterval(
    () => {
      if (!active) {
        return;
      }
      actionFn();
      if (delay === INITIAL_DELAY) {
        setDelay(INTERVAL_DELAY);
      }
    },
    active ? delay : null,
  );

  return activate;
}
