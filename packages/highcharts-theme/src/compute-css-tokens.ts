const parseCSSNumber = (value?: string | null): number | undefined => {
  const parsedNumber = Number.parseFloat(value?.trim() ?? "");
  return Number.isFinite(parsedNumber) ? parsedNumber : undefined;
};

/**
 * Read multiple CSS custom properties as numbers using a single computedStyle lookup.
 * Returns an object keyed by the provided variable names.
 */
export const getCSSTokensFromElement = (
  element: Element,
  tokenNames: readonly string[],
): Record<string, number | undefined> => {
  const view = element.ownerDocument?.defaultView;

  // Defensive - never reached as guarded by hostElement in getDensityTokenMap
  if (!view?.getComputedStyle) {
    return Object.create(null);
  }
  const styles = view.getComputedStyle(element);
  const result: Record<string, number | undefined> = {};

  for (const name of tokenNames) {
    const raw = styles.getPropertyValue(name);
    result[name] = parseCSSNumber(raw);
  }
  return result;
};
