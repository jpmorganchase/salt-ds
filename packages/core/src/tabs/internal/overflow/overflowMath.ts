export const MIN_TRUSTED_TAB_WIDTH = 0.5;

export interface MeasuredOverflowTab {
  value: string;
  width: number | null;
}

interface CalculateVisibleCountProps {
  gap: number;
  maxWidth: number;
  overflowWidth: number;
  pinnedValue?: string;
  tabs: MeasuredOverflowTab[];
}

export function calculateVisibleCount({
  gap,
  maxWidth: initialMaxWidth,
  overflowWidth,
  pinnedValue,
  tabs,
}: CalculateVisibleCountProps) {
  let maxWidth = initialMaxWidth;
  let currentWidth = 0;
  let nextVisibleCount = 0;
  const visibleItems: MeasuredOverflowTab[] = [];

  while (nextVisibleCount < tabs.length) {
    const item = tabs[nextVisibleCount];
    if (!item) {
      break;
    }

    if (item.width == null) {
      return null;
    }

    const itemWidth = item.width + gap;
    if (currentWidth + itemWidth > maxWidth) {
      break;
    }

    currentWidth += itemWidth;
    visibleItems.push(item);
    nextVisibleCount += 1;
  }

  const allTabsFit = nextVisibleCount >= tabs.length;
  if (allTabsFit) {
    return nextVisibleCount;
  }

  maxWidth -= overflowWidth;

  while (currentWidth > maxWidth) {
    const removed = visibleItems.pop();
    if (!removed) {
      break;
    }
    if (removed.width == null) {
      return null;
    }
    currentWidth -= removed.width + gap;
    nextVisibleCount -= 1;
  }

  const pinnedItem =
    pinnedValue == null
      ? null
      : (tabs.find((item) => item.value === pinnedValue) ?? null);

  if (pinnedItem && !visibleItems.includes(pinnedItem)) {
    if (pinnedItem.width == null) {
      return null;
    }

    const pinnedWidth = pinnedItem.width + gap;
    while (currentWidth + pinnedWidth > maxWidth) {
      const removed = visibleItems.pop();
      if (!removed) {
        break;
      }
      if (removed.width == null) {
        return null;
      }
      currentWidth -= removed.width + gap;
      nextVisibleCount -= 1;
    }
  }

  return Math.max(0, nextVisibleCount);
}

export function partitionVisibleValues(
  orderedValues: string[],
  visibleCount: number,
  pinnedValue?: string,
) {
  let visibleValues = orderedValues.slice(0, visibleCount);
  let hiddenValues = orderedValues.slice(visibleCount);

  const hiddenPinnedIndex =
    pinnedValue != null ? hiddenValues.indexOf(pinnedValue) : -1;

  if (hiddenPinnedIndex !== -1) {
    const pinnedHiddenValue = hiddenValues[hiddenPinnedIndex];
    hiddenValues = hiddenValues.filter(
      (_, index) => index !== hiddenPinnedIndex,
    );
    if (pinnedHiddenValue !== undefined) {
      visibleValues = [...visibleValues, pinnedHiddenValue];
    }
  }

  return { visibleValues, hiddenValues };
}
