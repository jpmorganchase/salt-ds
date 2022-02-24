import { Ref, useMemo } from "react";
import { setRef } from "./setRef";

export function useForkRef<Instance>(
  refA: Ref<Instance> | null | undefined,
  refB: Ref<Instance> | null | undefined
): Ref<Instance> | null {
  /**
   * This will create a new function if the ref props change and are defined.
   * This means React will call the old forkRef with `null` and the new forkRef
   * with the ref. Cleanup naturally emerges from this behavior
   */
  return useMemo(() => {
    if (refA == null && refB == null) {
      return () => null;
    }
    return (refValue) => {
      setRef(refA, refValue);
      setRef(refB, refValue);
    };
  }, [refA, refB]);
}
