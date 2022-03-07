import { useEffect, useMemo, useState } from "react";

// Why would we ever want to wait unti post render to know our id ?
export function useId(idOverride?: string): string {
  const [defaultId, setDefaultId] = useState(idOverride);
  const id = idOverride || defaultId;
  useEffect(() => {
    if (defaultId == null) {
      // Fallback to this default id when possible.
      // Use the random value for client-side rendering only.
      // We can't use it server-side.
      setDefaultId(`uitk-${Math.round(Math.random() * 1e5)}`);
    }
  }, [defaultId]);
  return id as string;
}

export function useIdMemo(idOverride?: string): string {
  const id = useMemo(() => {
    return idOverride ?? `uitk-${Math.round(Math.random() * 1e5)}`;
  }, [idOverride]);
  return id;
}
