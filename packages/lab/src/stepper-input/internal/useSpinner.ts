import { useEffect, useState, SyntheticEvent, useCallback } from "react";
import { useInterval } from "./useInterval";

const INTERVAL_DELAY = 300;

function useSpinner(
  activationFn: (event?: SyntheticEvent) => void,
  isAtLimit: boolean
) {
  const [buttonDown, setButtonDown] = useState(false);
  const [event, setEvent] = useState<SyntheticEvent | null>(null);

  const cancelInterval = () => {
    setEvent(null);
  };

  useEffect(() => {
    if (isAtLimit) cancelInterval();
  }, [isAtLimit]);

  useEffect(() => {
    window.addEventListener("mouseup", cancelInterval);
    return () => {
      window.removeEventListener("mouseup", cancelInterval);
    };
  }, [cancelInterval]);

  const activate = (event: SyntheticEvent) => {
    activationFn(event);
    if (event.type === "mousedown") {
      setButtonDown(true);
      setEvent(event);
    }
  };
  useInterval(
    () => {
      if (buttonDown && event) {
        activationFn(event);
      }
    },
    buttonDown ? INTERVAL_DELAY : null
  );

  return { activate, buttonDown };
}

export { useSpinner };
