const WIDTH_EPSILON = 0.5;

export function getMeasuredWidth(element: HTMLElement | null | undefined) {
  if (!element) {
    return 0;
  }

  const width = element.getBoundingClientRect().width;
  return width || element.clientWidth || 0;
}

export function getIntrinsicMeasuredWidth(
  element: HTMLElement | null | undefined,
) {
  if (!element) {
    return 0;
  }

  const borderWidth = element.offsetWidth - element.clientWidth;
  return Math.max(getMeasuredWidth(element), element.scrollWidth + borderWidth);
}

export function getGapValue(styles: CSSStyleDeclaration) {
  return Number.parseFloat(styles.columnGap || styles.gap || "0") || 0;
}

export function seedWidthMap(elements: HTMLElement[]) {
  const widths = new Map<HTMLElement, number>();
  for (const element of elements) {
    widths.set(element, getMeasuredWidth(element));
  }
  return widths;
}

export function updateWidthMap(
  widths: Map<HTMLElement, number>,
  element: HTMLElement,
  nextWidth: number,
  epsilon = WIDTH_EPSILON,
) {
  const previousWidth = widths.get(element);
  widths.set(element, nextWidth);

  if (previousWidth === undefined) {
    return false;
  }

  return Math.abs(previousWidth - nextWidth) > epsilon;
}
