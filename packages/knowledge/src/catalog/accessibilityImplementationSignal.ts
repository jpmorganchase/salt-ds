import type { AccessibilityImplementationSignal } from "../types.js";
import { canonicalJson } from "./catalogSerialization.js";

export function formatAccessibilityImplementationSignalStatement(
  signal: Pick<AccessibilityImplementationSignal, "kind" | "values">,
): string {
  return canonicalJson({
    kind: signal.kind,
    values: signal.values,
  });
}
