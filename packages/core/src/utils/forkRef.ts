import type { Ref, RefCallback } from "react";

type RefCleanup = () => void;

function attachRef<Instance>(
  ref: Ref<Instance> | null | undefined,
  instance: Instance,
): RefCleanup | undefined {
  if (typeof ref === "function") {
    // From React 19, a callback ref can return a cleanup function, which React
    // calls instead of calling the ref with `null`.
    const cleanup = ref(instance);
    return typeof cleanup === "function" ? cleanup : () => ref(null);
  }

  if (ref) {
    // `current` is read-only in the React 18 types.
    const objectRef: { current: Instance | null } = ref;
    objectRef.current = instance;
    return () => {
      objectRef.current = null;
    };
  }

  return undefined;
}

/**
 * Merges two refs into a callback ref. Components and hooks should use
 * `useForkRef`, so the merged ref only changes when one of the refs changes.
 * This is for places that can't call a hook, such as a props getter.
 *
 * The returned ref never returns a cleanup itself, so every React version
 * detaches it by calling it with `null`; that is when the cleanups collected
 * from refA and refB are run.
 */
export function forkRef<Instance>(
  refA: Ref<Instance> | null | undefined,
  refB: Ref<Instance> | null | undefined,
): RefCallback<Instance> {
  let cleanup: RefCleanup | undefined;

  return (instance: Instance | null) => {
    cleanup?.();
    cleanup = undefined;

    if (instance != null) {
      const cleanupA = attachRef(refA, instance);
      const cleanupB = attachRef(refB, instance);
      cleanup = () => {
        cleanupA?.();
        cleanupB?.();
      };
    }
  };
}
