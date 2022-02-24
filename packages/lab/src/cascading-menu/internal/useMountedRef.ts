import { useEffect, useRef } from "react";
/**
 * Used to know if the component is mounted or not
 */
export function useMountedRef() {
  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return mountedRef;
}
