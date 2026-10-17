const parseCSSNumber = (value?: string): number | undefined => {
  const parsedNumber = Number.parseFloat(value ?? "");
  return Number.isFinite(parsedNumber) ? parsedNumber : undefined;
};

const normalizeCSSValue = (value?: string | null): string | undefined => {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : undefined;
};

const REM_VALUE = /^(-?(?:\d+\.?\d*|\.\d+))rem$/;

// Highcharts expects px, but theme tokens may be defined in rem.
const resolveRemValue = (
  value: string | undefined,
  rootFontSize: number,
): string | undefined => {
  const match = value?.match(REM_VALUE);
  return match ? `${Number.parseFloat(match[1]) * rootFontSize}px` : value;
};

/**
 * Read multiple CSS custom properties using a single computedStyle lookup.
 * Returns an object keyed by the provided variable names, with rem values
 * resolved to px.
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
  const rootFontSize =
    parseCSSNumber(
      view.getComputedStyle(element.ownerDocument.documentElement).fontSize,
    ) ?? 16;
  const result: Record<string, string | undefined> = {};

  for (const name of tokenNames) {
    result[name] = resolveRemValue(
      normalizeCSSValue(styles.getPropertyValue(name)),
      rootFontSize,
    );
  }
  return result;
};

export const getNumericCSSToken = (
  tokenValues: Record<string, string | undefined>,
  tokenName: string,
): number | undefined => {
  return parseCSSNumber(tokenValues[tokenName]);
};
