import { useEffect, useState, KeyboardEvent } from "react";
import { useInterval } from "./useInterval";

const INTERVAL_DELAY = 300;

function useSpinner(
  activationFn: (event?: KeyboardEvent) => void,
  isAtLimit: boolean
) {
  const [buttonDown, setButtonDown] = useState(false);

  const cancelInterval = () => setButtonDown(false);

  useEffect(() => {
    if (isAtLimit) setButtonDown(false);
  }, [isAtLimit]);

  useEffect(() => {
    window.addEventListener("keyup", cancelInterval);
    window.addEventListener("mouseup", cancelInterval);
    return () => {
      window.removeEventListener("keyup", cancelInterval);
      window.removeEventListener("mouseup", cancelInterval);
    };
  }, []);

  const activate = (event: KeyboardEvent) => {
    activationFn(event);
    setButtonDown(true);
  };

  useInterval(() => activationFn(), buttonDown ? INTERVAL_DELAY : null);

  return { activate, buttonDown };
}

export { useSpinner };
