import { type SyntheticEvent, useCallback, useEffect, useState } from "react";
import { useInterval } from "./useInterval";

const INITIAL_DELAY = 500;
const INTERVAL_DELAY = 100;

function useSpinner(
  activationFn: (event?: SyntheticEvent) => void,
  isAtLimit: boolean,
) {
  const [buttonDown, setButtonDown] = useState(false);
  const [delay, setDelay] = useState(INITIAL_DELAY);

  const cancelInterval = useCallback(() => {
    setButtonDown(false);
    setDelay(INITIAL_DELAY);
  }, []);

  useEffect(() => {
    if (isAtLimit) cancelInterval();
  }, [isAtLimit, cancelInterval]);

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
    }
  };

  useInterval(
    () => {
      if (!buttonDown) return;
      activationFn();
      if (delay === INITIAL_DELAY) {
        setDelay(INTERVAL_DELAY);
      }
    },
    buttonDown ? delay : null,
  );

  return { activate, buttonDown };
}

export { useSpinner };
