import { usePrevious } from "@salt-ds/core";
import { useEffect, useRef } from "react";

export function useFocusMenuRemount<T extends HTMLElement>(key: string) {
  const ref = useRef<T>(null);
  const shouldFocusOnMount = useRef(false);
  const previousKey = usePrevious(key);

  useEffect(() => {
    if (ref.current && shouldFocusOnMount.current && previousKey !== key) {
      ref.current.focus();
      shouldFocusOnMount.current = false;
    } else {
      shouldFocusOnMount.current = false;
    }
  }, [previousKey, key]);

  return { ref, shouldFocusOnMount };
}
