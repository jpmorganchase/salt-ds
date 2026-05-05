const parseCSSNumber = (value?: string): number | undefined => {
  const parsedNumber = Number.parseFloat(value ?? "");
  return Number.isFinite(parsedNumber) ? parsedNumber : undefined;
};

const normalizeCSSValue = (value?: string | null): string | undefined => {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : undefined;
};

/**
 * Read multiple CSS custom properties using a single computedStyle lookup.
 * Returns an object keyed by the provided variable names.
 */
export const getCSSTokensFromElement = (
  element: Element,
  tokenNames: readonly string[],
): Record<string, string | undefined> => {
  const view = element.ownerDocument?.defaultView;

  // Defensive - never reached as guarded by hostElement in getDensityTokenMap
  if (!view?.getComputedStyle) {
    return Object.create(null);
  }
  const styles = view.getComputedStyle(element);
  const result: Record<string, string | undefined> = {};

  for (const name of tokenNames) {
    result[name] = normalizeCSSValue(styles.getPropertyValue(name));
  }
  return result;
};

export const getNumericCSSToken = (
  tokenValues: Record<string, string | undefined>,
  tokenName: string,
): number | undefined => {
  return parseCSSNumber(tokenValues[tokenName]);
};
