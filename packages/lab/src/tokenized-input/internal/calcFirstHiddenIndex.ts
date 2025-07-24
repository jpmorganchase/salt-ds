export function calcFirstHiddenIndex({
  containerWidth = 0,
  pillWidths = [],
}: {
  containerWidth?: number;
  pillWidths?: number[];
} = {}) {
  let totalWidth = 0;
  let firstHiddenIndex: null | number = null;

  for (let i = 0; i < pillWidths.length; i++) {
    totalWidth += pillWidths[i];

    if (totalWidth > containerWidth) {
      firstHiddenIndex = i;
      break;
    }
  }

  return firstHiddenIndex;
}
