import { useEffect, useState, useId as useReactId } from "react";

function useIdLegacy(idOverride?: string): string {
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

function useIdInternal(idOverride?: string): string {
  const id = (useReactId as () => string)();
  return idOverride == null ? id : idOverride;
}

export const useId = useReactId === undefined ? useIdLegacy : useIdInternal;
