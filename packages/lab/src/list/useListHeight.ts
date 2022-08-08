import { useMemo, useState, useCallback, RefObject } from "react";
import { useResizeObserver, HeightOnly } from "../responsive/useResizeObserver";

export interface ListHeightHookProps {
  borderless?: boolean;
  displayedItemCount: number;
  getItemHeight?: (index: number) => number;
  height?: number | string;
  itemCount: number;
  itemGapSize: number;
  itemHeight?: number | string;
  rowHeightRef: RefObject<HTMLElement | null>;
}

export interface HeightHookResult {
  preferredHeight: number | undefined;
}

export const useListHeight = ({
  borderless,
  displayedItemCount,
  getItemHeight,
  // TODO no need to incur the cost of a resizeObserver if height is explicit
  height,
  itemCount,
  itemGapSize,
  itemHeight: itemHeightProp,
  rowHeightRef,
}: ListHeightHookProps): HeightHookResult => {
  // TODO default by density
  const [measuredItemHeight, setMeasuredItemHeight] = useState(36);

  const preferredHeight = useMemo(() => {
    let result = borderless ? 0 : 2;
    const itemHeight = itemHeightProp ?? measuredItemHeight;

    // if there are 0 items we render with the preferred count
    const preferredItemCount =
      Math.min(displayedItemCount, itemCount) || displayedItemCount;

    if (typeof getItemHeight === "function") {
      result +=
        Array(preferredItemCount)
          .fill(0)
          .reduce<number>(
            (total, _, index) => total + getItemHeight(index) + itemGapSize,
            0
          ) -
        // We don't want gap after the last item
        itemGapSize;
    } else {
      result +=
        preferredItemCount * Number(itemHeight) +
        (preferredItemCount - 1) * itemGapSize;
    }

    // list height will be undefined if the item height can not be
    // converted to a number, for example rem or a percentage string
    return isNaN(result) ? undefined : result;
  }, [
    borderless,
    displayedItemCount,
    getItemHeight,
    itemCount,
    itemGapSize,
    itemHeightProp,
    measuredItemHeight,
  ]);

  const handleRowHeight = useCallback(({ height }) => {
    setMeasuredItemHeight(height);
  }, []);

  useResizeObserver(rowHeightRef, HeightOnly, handleRowHeight, true);

  return {
    preferredHeight,
  };
};
