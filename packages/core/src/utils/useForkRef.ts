import { type Ref, useMemo } from "react";
import { forkRef } from "./forkRef";

export function useForkRef<Instance>(
  refA: Ref<Instance> | null | undefined,
  refB: Ref<Instance> | null | undefined,
): Ref<Instance> | null {
  /**
   * This creates a new function when either ref changes, so React detaches the
   * old forkRef, which runs the cleanups of the old refs, and attaches the new
   * one.
   */
  return useMemo(() => {
    if (refA == null && refB == null) {
      return null;
    }

    return forkRef(refA, refB);
  }, [refA, refB]);
}
