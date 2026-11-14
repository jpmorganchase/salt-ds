/**
 * Merges whitespace-separated ARIA ID references, preserving their order and
 * removing duplicates.
 */
export function mergeAriaIds(
  ...values: (string | undefined)[]
): string | undefined {
  const ids = new Set<string>();
  for (const value of values) {
    for (const id of value?.split(/\s+/) ?? []) {
      if (id) {
        ids.add(id);
      }
    }
  }
  return ids.size ? [...ids].join(" ") : undefined;
}
