import {
  RefObject,
  UIEvent,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { KeySet } from "./keyset";
import { CollectionItem } from "../common-hooks";

export type Row<Item> = [number, number, number, CollectionItem<Item>];

const byKey = ([k1]: Row<unknown>, [k2]: Row<unknown>) => k1 - k2;

const renderBuffer = 5;

interface VirtualizationHookProps<Item> {
  viewportRef: RefObject<HTMLElement>;
  data: CollectionItem<Item>[];
  itemGapSize?: number;
}

interface VirtualizationHookResult<Item> {
  rows: Row<Item>[];
  contentHeight: number;
  onVerticalScroll: (e: UIEvent<HTMLElement>) => void;
}

export const useVirtualization = <Item>({
  viewportRef,
  data,
  itemGapSize = 0,
}: VirtualizationHookProps<Item>): VirtualizationHookResult<Item> => {
  const viewportMeasures = useRef({
    contentHeight: 10000,
    firstVisibleRow: 0,
    rowCount: 1,
    rowHeight: 0,
    scrollPos: 0,
  });
  const [rows, setRows] = useState<Row<Item>[]>([[0, 0, 1, data[0]]]);
  const keys = useMemo(() => new KeySet(0, 1), []);

  const updateRows = useCallback(
    (from, to) => {
      const { rowHeight } = viewportMeasures.current;
      const totalRowHeight = rowHeight + itemGapSize;
      const lo = Math.max(0, from - renderBuffer);
      const hi = Math.min(data.length, to + renderBuffer);
      keys.reset(lo, hi);
      const newRows = data
        .slice(lo, hi)
        .map(
          (value, idx) =>
            [
              keys.keyFor(idx + lo),
              (idx + lo) * totalRowHeight,
              idx + lo + 1,
              value,
            ] as Row<Item>
        )
        .sort(byKey);
      setRows(newRows);
    },
    [data, keys]
  );

  useLayoutEffect(() => {
    const viewport = viewportMeasures.current;
    const viewportEl = viewportRef.current;
    if (viewportEl) {
      // TODO no reference to ListItem className
      const listItemEl = viewportEl.querySelector(".uitkListItem");
      if (listItemEl) {
        const { height: viewportHeight } = viewportEl.getBoundingClientRect();
        const { height: rowHeight } = listItemEl.getBoundingClientRect();
        viewport.rowHeight = rowHeight;
        viewport.rowCount = Math.ceil(viewportHeight / rowHeight);
        viewport.contentHeight = (rowHeight + itemGapSize) * data.length;
        updateRows(0, viewport.rowCount);
      }
    }
  }, [data, itemGapSize, keys, updateRows]);

  const handleVerticalScroll = useCallback(
    (e) => {
      const viewport = viewportMeasures.current;
      const scrollTop = e.target.scrollTop;
      if (scrollTop !== viewport.scrollPos) {
        viewport.scrollPos = scrollTop;
        const firstRow = Math.floor(scrollTop / viewport.rowHeight);
        if (firstRow !== viewport.firstVisibleRow) {
          viewport.firstVisibleRow = firstRow;
          const from = firstRow;
          const to = firstRow + viewport.rowCount;
          updateRows(from, to);
        }
      }
    },
    [updateRows]
  );

  return {
    rows,
    contentHeight: viewportMeasures.current.contentHeight,
    onVerticalScroll: handleVerticalScroll,
  };
};
