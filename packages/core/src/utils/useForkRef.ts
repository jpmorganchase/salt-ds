import { type MutableRefObject, type Ref, useMemo, useRef } from "react";

type RefCleanup = () => void;

function attachRef<Instance>(
  ref: Ref<Instance> | null | undefined,
  instance: Instance,
): RefCleanup | undefined {
  if (typeof ref === "function") {
    // From React 19, a callback ref can return a cleanup function, which React
    // calls instead of calling the ref with `null`.
    const cleanup: unknown = ref(instance);
    return typeof cleanup === "function"
      ? (cleanup as RefCleanup)
      : () => ref(null);
  }

  if (ref) {
    (ref as MutableRefObject<Instance | null>).current = instance;
    return () => {
      (ref as MutableRefObject<Instance | null>).current = null;
    };
  }

  return undefined;
}

export function useForkRef<Instance>(
  refA: Ref<Instance> | null | undefined,
  refB: Ref<Instance> | null | undefined,
): Ref<Instance> | null {
  const cleanupRef = useRef<RefCleanup | undefined>(undefined);

  /**
   * This creates a new function when either ref changes, so React detaches the
   * old forkRef and attaches the new one. The forkRef never returns a cleanup
   * itself, so every React version detaches it by calling it with `null`; that
   * is when the cleanups collected from refA and refB are run.
   */
  return useMemo(() => {
    if (refA == null && refB == null) {
      return null;
    }

    return (instance: Instance | null) => {
      cleanupRef.current?.();
      cleanupRef.current = undefined;

      if (instance != null) {
        const cleanupA = attachRef(refA, instance);
        const cleanupB = attachRef(refB, instance);
        cleanupRef.current = () => {
          cleanupA?.();
          cleanupB?.();
        };
      }
    };
  }, [refA, refB]);
}
