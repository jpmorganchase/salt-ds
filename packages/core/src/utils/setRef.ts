import type { MutableRefObject } from "react";

/**
 * @deprecated since 1.72.1. Use `useForkRef` to merge refs instead, which also
 * runs the cleanup functions that callback refs can return from React 19.
 */
export function setRef<T>(
  ref:
    | MutableRefObject<T | null>
    | ((instance: T | null) => void)
    | null
    | undefined,
  value: T | null,
): void {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}
