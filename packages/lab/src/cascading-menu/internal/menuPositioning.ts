export type screenBounds = {
  clientHeight: number;
  clientWidth: number;
};

export function getMaxHeight(
  heightProp: number | undefined,
  menuMargin: number | undefined = 0,
  getScreenBounds: () => screenBounds = defaultGetScreenBounds
) {
  const { clientHeight } = getScreenBounds();

  let suggestedHeight = clientHeight - menuMargin;
  if (heightProp) {
    suggestedHeight = Math.min(heightProp, clientHeight) - menuMargin;
  }

  return Math.max(suggestedHeight, 0);
}

export function getHeight(
  heightProp: number | undefined,
  calculatedMenuHeight: number,
  maxHeight: number
): number {
  if (heightProp) {
    return Math.min(heightProp, calculatedMenuHeight, maxHeight);
  }

  return Math.min(calculatedMenuHeight, maxHeight);
}

export const defaultGetScreenBounds = (): screenBounds => {
  const { clientHeight, clientWidth } = document.documentElement;
  return { clientHeight, clientWidth };
};
