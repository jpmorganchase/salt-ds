import { useControlled } from "@salt-ds/core";
import {
  Children,
  type FocusEventHandler,
  isValidElement,
  type MouseEventHandler,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CellEditorInfo } from "../CellEditor";
import type { ColumnGroupProps } from "../ColumnGroup";
import type { FocusedPart } from "../CursorContext";
import type {
  GridCellSelectionMode,
  GridColumnGroupModel,
  GridColumnModel,
  GridColumnMoveHandler,
  GridRowModel,
  GridRowSelectionMode,
  RowKeyGetter,
} from "../Grid";
import type { GridColumnInfo, GridColumnPin } from "../GridColumn";
import type { GridContext } from "../GridContext";
import { NumberRange } from "../NumberRange";
import {
  getAttribute,
  getCellPosition,
  makeMapAdder,
  makeMapDeleter,
} from "./utils";

// Attaches active onWheel event to a table element
// Grid needs to prevent default onWheel event handling for situations when a
// scrollable grid is on a scrollable page. Page should not scroll when the grid
// is being scrolled, unless reached top or bottom of scrollable grid.
export function useActiveOnWheel(onWheel: EventListener) {
  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    const table = tableRef.current;
    if (table && onWheel) {
      table.addEventListener("wheel", onWheel, { passive: false });
      return () => {
        table.removeEventListener("wheel", onWheel);
      };
    }
  }, [tableRef.current]);

  return tableRef;
}

// Total width of the given columns.
function sumWidth<T>(columns: GridColumnModel<T>[]) {
  return columns.reduce((p, x) => p + x.info.width, 0);
}

// Returns total width of the given columns wrapped in useMemo.
export function useSumWidth<T>(columns: GridColumnModel<T>[]) {
  return useMemo(() => sumWidth(columns), [columns]);
}

// Memoized sum of the given numbers.
export function useSum(source: number[]) {
  return useMemo(() => source.reduce((p, x) => p + x, 0), source);
}

// Sum width of the given range of columns.
function sumRangeWidth<T>(columns: GridColumnModel<T>[], range: NumberRange) {
  let w = 0;
  range.forEach((i) => {
    w += columns[i].info.width;
  });
  return w;
}

// Sum width of the given range of columns wrapped in useMemo.
export function useSumRangeWidth<T>(
  columns: GridColumnModel<T>[],
  range: NumberRange,
) {
  return useMemo(() => sumRangeWidth(columns, range), [columns, range]);
}

// Range memoization using Rng.equals comparator.
function useMemoRng(fn: () => NumberRange, deps: unknown[]) {
  const prevRef = useRef<NumberRange>(NumberRange.empty);
  const range = useMemo(fn, deps);
  if (!NumberRange.equals(prevRef.current, range)) {
    prevRef.current = range;
  }
  return prevRef.current;
}

// Visible range of columns within the body.
export function useBodyVisibleColumnRange<T>(
  midColumns: GridColumnModel<T>[],
  scrollLeft: number,
  clientMidWidth: number,
): NumberRange {
  return useMemoRng(() => {
    if (clientMidWidth === 0 || midColumns.length === 0) {
      return NumberRange.empty;
    }
    let width = scrollLeft;
    let start = 0;
    for (let i = 0; i < midColumns.length; ++i) {
      const colWidth = midColumns[i].info.width;
      if (width > colWidth) {
        width -= colWidth;
      } else {
        start = i;
        width += clientMidWidth;
        break;
      }
    }
    let end = start + 1;
    for (let i = start; i < midColumns.length; ++i) {
      const colWidth = midColumns[i].info.width;
      width -= colWidth;
      end = i + 1;
      if (width <= 0) {
        break;
      }
    }
    if (end > midColumns.length) {
      end = midColumns.length;
    }
    return new NumberRange(start, end);
  }, [midColumns, scrollLeft, clientMidWidth]);
}

// Client width of the middle (scrollable) part of the grid.
export function useClientMidWidth(
  clientWidth: number,
  leftWidth: number,
  rightWidth: number,
) {
  return useMemo(
    () => clientWidth - leftWidth - rightWidth,
    [clientWidth, leftWidth, rightWidth],
  );
}

// Client height of the middle part of the grid.
export function useClientMidHeight(
  clientHeight: number,
  topHeight: number,
  botHeight: number,
) {
  return useMemo(
    () => clientHeight - topHeight - botHeight,
    [clientHeight, topHeight, botHeight],
  );
}

// Y coordinate of the visible area within the virtual space.
export function useBodyVisibleAreaTop<T>(
  rowHeight: number,
  visibleRowRange: NumberRange,
  topHeight: number,
) {
  return useMemo(() => {
    let top = topHeight + visibleRowRange.start * rowHeight;
    if (visibleRowRange.start > 0) {
      top += 1; // First row (row #0) has an extra border
    }
    return top;
  }, [rowHeight, visibleRowRange, topHeight]);
}

// Visible range of rows.
export function useVisibleRowRange(
  scrollTop: number,
  clientMidHeight: number,
  rowHeight: number,
  rowCount: number,
) {
  return useMemoRng(() => {
    if (rowHeight < 1) {
      return NumberRange.empty;
    }
    const firstRowHeight = rowHeight + 1; // First row has an extra 1px

    const start =
      scrollTop > firstRowHeight
        ? 1 + Math.floor((scrollTop - firstRowHeight) / rowHeight)
        : 0;
    let endPos = scrollTop + clientMidHeight;

    if (start === 0) {
      endPos -= 1;
    }
    const end = Math.min(
      rowCount,
      Math.max(start, Math.ceil(endPos / rowHeight)),
    );

    // Scroll Top not returning to 0 after pagination. Guard to ensure issues with ScrollTop throw error
    if (start > end) {
      return NumberRange.empty;
    }

    return new NumberRange(start, end);
  }, [scrollTop, clientMidHeight, rowHeight, rowCount]);
}

export function useColumnRange<T>(
  columns: GridColumnModel<T>[],
  range: NumberRange,
): GridColumnModel<T>[] {
  return useMemo(() => columns.slice(range.start, range.end), [columns, range]);
}

// Total width of the columns scrolled out to the left of the visible area.
export function useLeftScrolledOutWidth<T>(
  midColumns: GridColumnModel<T>[],
  bodyVisibleColumnRange: NumberRange,
) {
  return useMemo(() => {
    let w = 0;
    for (let i = 0; i < bodyVisibleColumnRange.start; ++i) {
      w += midColumns[i].info.width;
    }
    return w;
  }, [midColumns, bodyVisibleColumnRange]);
}

// Row positions by row keys.
export function useRowIdxByKey<T>(rowKeyGetter: RowKeyGetter<T>, rowData: T[]) {
  return useMemo(() => {
    return new Map<string, number>(
      rowData.map((r, i) => [rowKeyGetter(r, i), i]),
    );
  }, [rowData, rowKeyGetter]);
}

export type SetState<T> = (v: T | ((p: T) => T)) => void;

// Row models for the visible rows.
export function useRowModels<T>(
  getKey: RowKeyGetter<T>,
  rowData: T[],
  visibleRowRange: NumberRange,
) {
  return useMemo(() => {
    const rows: GridRowModel<T>[] = [];
    visibleRowRange.forEach((i) => {
      const key = getKey(rowData[i], i);
      rows.push({ data: rowData[i], key, index: i });
    });
    return rows;
  }, [getKey, rowData, visibleRowRange]);
}

// Creates column group models.
export const useColumnGroups = (
  grpPs: ColumnGroupProps[],
  startIdx: number,
): GridColumnGroupModel[] =>
  useMemo(
    () =>
      grpPs.map((data, i) => {
        const childrenIds = Children.toArray(data.children)
          .map((child) => {
            if (!isValidElement(child)) {
              return undefined;
            }
            return child.props.id;
          })
          .filter((x) => x !== undefined) as string[];
        const colSpan = childrenIds.length;

        return {
          data,
          index: i + startIdx,
          childrenIds,
          colSpan,
          columnSeparator: "regular",
          rowSeparator: "regular",
        };
      }),
    [grpPs, startIdx],
  );

// Visible range of column groups.
export function useVisibleColumnGroupRange<T>(
  bodyVisColRng: NumberRange,
  midCols: GridColumnModel<T>[],
  midGrpByColId: Map<string, GridColumnGroupModel>,
  leftGrpCount: number,
): NumberRange {
  return useMemoRng(() => {
    if (bodyVisColRng.length === 0) {
      return NumberRange.empty;
    }
    const firstVisibleCol = midCols[bodyVisColRng.start];
    const lastVisibleCol = midCols[bodyVisColRng.end - 1];
    const firstVisibleGroup = midGrpByColId.get(firstVisibleCol.info.props.id);
    const lastVisibleGroup = midGrpByColId.get(lastVisibleCol.info.props.id);
    if (!firstVisibleGroup || !lastVisibleGroup) {
      return NumberRange.empty;
    }
    return new NumberRange(
      firstVisibleGroup.index - leftGrpCount,
      lastVisibleGroup.index + 1 - leftGrpCount,
    );
  }, [bodyVisColRng, midCols, midGrpByColId, leftGrpCount]);
}

export function last<T>(source: T[]): T {
  return source[source.length - 1];
}

// Range of columns visible in the header.
export function useHeadVisibleColumnRange<T>(
  bodyVisColRng: NumberRange,
  visColGrps: GridColumnGroupModel[],
  midColsById: Map<string, GridColumnModel<T>>,
  leftColCount: number,
) {
  return useMemoRng(() => {
    if (visColGrps.length === 0) {
      return bodyVisColRng;
    }
    const firstVisibleGroup = visColGrps[0];
    const lastVisibleGroup = last(visColGrps);
    const firstColId = firstVisibleGroup.childrenIds[0];
    const lastColId = last(lastVisibleGroup.childrenIds);
    const firstColIdx = midColsById.get(firstColId)?.index;
    const lastColIdx = midColsById.get(lastColId)?.index;
    if (firstColIdx === undefined || lastColIdx === undefined) {
      return NumberRange.empty;
    }
    return new NumberRange(
      firstColIdx - leftColCount,
      lastColIdx + 1 - leftColCount,
    );
  }, [bodyVisColRng, visColGrps, midColsById, leftColCount]);
}

// Creates column models.
export function useCols<T>(
  colInfos: GridColumnInfo<T>[],
  startIdx: number,
  groups: GridColumnGroupModel[],
): GridColumnModel<T>[] {
  return useMemo(() => {
    const edgeColIds = new Set<string>();
    groups.forEach((g) => {
      edgeColIds.add(last(g.childrenIds));
    });
    const columnModels: GridColumnModel<T>[] = colInfos.map((info, i) => ({
      info,
      index: i + startIdx,
      separator: edgeColIds.has(info.props.id) ? "groupEdge" : "regular",
    }));
    return columnModels;
  }, [colInfos, startIdx, groups]);
}

// Returns a function that scrolls the grid to the given cell.
export function useScrollToCell<T>(
  visRowRng: NumberRange,
  rowHeight: number,
  clientMidHeight: number,
  midCols: GridColumnModel<T>[],
  bodyVisColRng: NumberRange,
  clientMidWidth: number,
  scroll: (left?: number, top?: number, source?: "user" | "table") => void,
) {
  return useCallback(
    (part: FocusedPart, rowIdx: number, colIdx: number) => {
      if (part !== "body") {
        return; // TODO
      }
      let x: number | undefined;
      let y: number | undefined;
      if (rowIdx <= visRowRng.start) {
        // First row is 1px wider than other rows (additional top border)
        y = rowIdx === 0 ? 0 : 1 + rowHeight * rowIdx;
      } else if (rowIdx >= visRowRng.end - 1) {
        const extraBorder = rowIdx > 0 ? 1 : 0;
        y = Math.max(
          0,
          rowHeight * rowIdx + extraBorder - clientMidHeight + rowHeight,
        );
      }
      const isMidCol =
        midCols.length > 0 &&
        colIdx >= midCols[0].index &&
        colIdx <= last(midCols).index;
      if (isMidCol) {
        const midColIdx = colIdx - midCols[0].index;
        if (midColIdx <= bodyVisColRng.start) {
          let w = 0;
          for (let i = 0; i < midColIdx; ++i) {
            w += midCols[i].info.width;
          }
          x = w;
        } else if (midColIdx >= bodyVisColRng.end - 1) {
          let w = 0;
          for (let i = 0; i <= midColIdx; ++i) {
            w += midCols[i].info.width;
          }
          x = Math.max(0, w - clientMidWidth);
        }
      }
      if (x !== undefined || y !== undefined) {
        scroll(x, y, "table");
      }
    },
    [
      visRowRng,
      rowHeight,
      clientMidHeight,
      midCols,
      bodyVisColRng,
      clientMidWidth,
      scroll,
    ],
  );
}

const MIN_COLUMN_WIDTH = 10;

// Returns onMouseDown handler to be attached to column resize handlers.
// TODO There might be some problems if column is removed while it is being resized
export function useColumnResize<T>(
  cols: GridColumnModel<T>[],
  resizeColumn: (columnIndex: number, width: number) => void,
) {
  const columnResizeDataRef = useRef<{
    startX: number;
    startY: number;
    eventsUnsubscription: () => void;
    columnIndex: number;
    initialColumnWidth: number;
    minWidth: number;
    resizeColumn: (columnIndex: number, width: number) => void;
  }>();

  const onMouseUp = useCallback(() => {
    columnResizeDataRef.current?.eventsUnsubscription();
    columnResizeDataRef.current = undefined;
  }, []);

  const onMouseMove = useCallback((event: MouseEvent) => {
    const x = event.screenX;
    const { startX, columnIndex, initialColumnWidth, minWidth } =
      columnResizeDataRef.current!;
    const shift = x - startX;
    const width = Math.max(minWidth, initialColumnWidth + shift);
    columnResizeDataRef.current!.resizeColumn(columnIndex, Math.round(width));
  }, []);

  return useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      const targetElement = event.target as HTMLElement;
      const [columnIndexAttribute, thElement] = getAttribute(
        targetElement,
        "data-column-index",
      );

      const columnIndex = Number.parseInt(columnIndexAttribute, 10);

      document.addEventListener("mouseup", onMouseUp);
      document.addEventListener("mousemove", onMouseMove);

      const initialColumnWidth = thElement.getBoundingClientRect().width;

      columnResizeDataRef.current = {
        startX: event.screenX,
        startY: event.screenY,
        eventsUnsubscription: () => {
          document.removeEventListener("mouseup", onMouseUp);
          document.removeEventListener("mousemove", onMouseMove);
        },
        columnIndex,
        initialColumnWidth,
        resizeColumn,
        minWidth: cols[columnIndex].info.props.minWidth || MIN_COLUMN_WIDTH,
      };

      event.preventDefault();
    },
    [resizeColumn],
  );
}

// Map values to array.
export function useFlatten<T>(map: Map<number, T>): T[] {
  return useMemo(() => {
    const entries = [...map.entries()].filter(([, value]) => !!value);
    entries.sort((a, b) => a[0] - b[0]);
    return entries.map((x) => x[1]);
  }, [map]);
}

function useColMap<T>() {
  return useState<Map<number, GridColumnInfo<T>>>(new Map());
}

function useGrpMap() {
  return useState<Map<number, ColumnGroupProps>>(new Map());
}

// Instances of TableColumn and TableColumnGroup register/unregister themselves
// using onColumnAdded, onColumnRemoved, onColumnGroupAdded, onColumnGroupRemoved
// taken from context
// The order of columns/groups is based on the order of "children" (Grid.props children)
export function useColumnRegistry<T>(children: ReactNode) {
  const [leftColMap, setLeftColMap] = useColMap<T>();
  const [rightColMap, setRightColMap] = useColMap<T>();
  const [midColMap, setMidColMap] = useColMap<T>();

  const [leftGrpMap, setLeftGrpMap] = useGrpMap();
  const [rightGrpMap, setRightGrpMap] = useGrpMap();
  const [midGrpMap, setMidGrpMap] = useGrpMap();

  const [editorMap, setEditorMap] = useState<Map<string, CellEditorInfo<T>>>(
    new Map(),
  );

  const leftColInfos = useFlatten(leftColMap);
  const rightColInfos = useFlatten(rightColMap);
  const midColInfos = useFlatten(midColMap);

  const leftGrpPs = useFlatten(leftGrpMap);
  const rightGrpPs = useFlatten(rightGrpMap);
  const midGrpPs = useFlatten(midGrpMap);

  const leftGroups = useColumnGroups(leftGrpPs, 0);
  const midGroups = useColumnGroups(midGrpPs, leftGroups.length);
  const rightGroups = useColumnGroups(
    rightGrpPs,
    leftGroups.length + midGroups.length,
  );
  if (leftGroups.length > 0) {
    last(leftGroups).columnSeparator = "pinned";
  }
  if (rightGroups.length > 0 && midGroups.length > 0) {
    last(midGroups).columnSeparator = "pinned";
  }

  const leftCols: GridColumnModel<T>[] = useCols(leftColInfos, 0, leftGroups);
  const midCols: GridColumnModel<T>[] = useCols(
    midColInfos,
    leftCols.length,
    midGroups,
  );
  const rightCols: GridColumnModel<T>[] = useCols(
    rightColInfos,
    leftCols.length + midCols.length,
    rightGroups,
  );
  if (leftCols.length > 0) {
    last(leftCols).separator = "pinned";
  }
  if (rightCols.length > 0 && midCols.length > 0) {
    last(midCols).separator = "pinned";
  }

  const chPosById = useRef<Map<string, number>>(new Map());

  const indexChildren = () => {
    const m = new Map<string, number>();
    let i = 0;
    const indexChildrenRec = (c: ReactNode) => {
      if (!c) {
        return;
      }
      Children.forEach(c, (x) => {
        if (isValidElement(x) && x.props.id !== undefined) {
          m.set(x.props.id, i);
          i++;
          indexChildrenRec(x.props.children);
        }
      });
    };
    indexChildrenRec(children);
    return m;
  };
  chPosById.current = indexChildren();

  const getChildIndex = useCallback((id: string): number => {
    const idx = chPosById.current.get(id);
    if (idx === undefined) {
      console.log(`Unknown child id "${id}"`);
      console.log(
        `Known ids: ${Array.from(chPosById.current.keys())
          .map((x) => `"${x}"`)
          .join(", ")}`,
      );
      throw new Error(`Unknown child id: "${id}"`);
    }
    return idx;
  }, []);

  const getColMapSet = (pinned?: GridColumnPin) =>
    pinned === "left"
      ? setLeftColMap
      : pinned === "right"
        ? setRightColMap
        : setMidColMap;

  const onColumnAdded = useCallback((columnInfo: GridColumnInfo<T>) => {
    // console.log(
    //   `Column added: "${columnInfo.props.id}"; pinned: ${columnInfo.props.pinned}`
    // );
    const { id, pinned } = columnInfo.props;
    const index = getChildIndex(id);
    getColMapSet(pinned)(makeMapAdder(index, columnInfo));
  }, []);

  const onColumnRemoved = useCallback(
    (index: number, columnInfo: GridColumnInfo<T>) => {
      const { pinned } = columnInfo.props;
      getColMapSet(pinned)(makeMapDeleter(index));
      // console.log(`Column removed: "${columnInfo.props.id}"`);
    },
    [],
  );

  const getGrpMapSet = (pinned?: GridColumnPin) =>
    pinned === "left"
      ? setLeftGrpMap
      : pinned === "right"
        ? setRightGrpMap
        : setMidGrpMap;

  const onColumnGroupAdded = useCallback((colGroupProps: ColumnGroupProps) => {
    const { id, pinned } = colGroupProps;
    getGrpMapSet(pinned)(makeMapAdder(getChildIndex(id), colGroupProps));
    // console.log(`Group added: "${colGroupProps.name}"`);
  }, []);

  const onColumnGroupRemoved = useCallback(
    (index: number, colGroupProps: ColumnGroupProps) => {
      const { pinned } = colGroupProps;
      getGrpMapSet(pinned)(makeMapDeleter(index));
      // console.log(`Group removed: "${colGroupProps.name}"`);
    },
    [],
  );

  const onEditorAdded = useCallback((info: CellEditorInfo<T>) => {
    const { columnId } = info;
    setEditorMap(makeMapAdder(columnId, info));
    // console.log(`Editor added for column ${columnId}`);
  }, []);

  const onEditorRemoved = useCallback((info: CellEditorInfo<T>) => {
    const { columnId } = info;
    setEditorMap(makeMapDeleter(columnId));
    // console.log(`Editor removed for column ${columnId}`);
  }, []);

  const getEditor = useCallback(
    (columnId: string) => editorMap.get(columnId),
    [editorMap],
  );

  const contextValue: GridContext<T> = useMemo(
    () => ({
      getChildIndex,
      onColumnAdded,
      onColumnRemoved,
      onColumnGroupAdded,
      onColumnGroupRemoved,
      onEditorAdded,
      onEditorRemoved,
      getEditor,
    }),
    [
      getChildIndex,
      onColumnAdded,
      onColumnRemoved,
      onColumnGroupAdded,
      onColumnGroupRemoved,
      onEditorAdded,
      onEditorRemoved,
      getEditor,
    ],
  );

  return {
    leftCols,
    midCols,
    rightCols,
    leftGroups,
    midGroups,
    rightGroups,
    contextValue,
  };
}

export type SelectRowsOptions = {
  rowIndex: number;
  isRange?: boolean;
  // Update selection incrementally based on previous state.
  // If rowIndex is selected then unselect it, otherwise select it.
  // This is what happens when the user clicks a row selection checkbox.
  // Shift + Space is another case when this behaviour is used.
  incremental?: boolean;
  // Unusual behaviour, applied on space keypress on a non-checkbox cell
  // The row is toggled, other rows unselected.
  unselectOtherRows?: boolean;
};

// Returns functions related to row selection.
// TODO test use case when selection mode changes
export function useRowSelection<T>(
  rowKeyGetter: RowKeyGetter<T>,
  rowData: T[],
  defaultSelectedRowIdxs?: number[],
  selectedRowIdxs?: number[],
  rowSelectionMode?: GridRowSelectionMode,
  onRowSelected?: (selectedRowIdxs: number[]) => void,
) {
  const selectedRowIdxsProp = useMemo(() => {
    if (selectedRowIdxs === undefined) {
      return undefined;
    }
    return new Set(selectedRowIdxs);
  }, [selectedRowIdxs]);

  const defaultSelectedRowIdxsProp = useMemo(() => {
    if (defaultSelectedRowIdxs === undefined) {
      return new Set([]);
    }
    return new Set(defaultSelectedRowIdxs);
  }, [defaultSelectedRowIdxs]);

  const [selRowIdxs, setSelRowIdxs] = useControlled({
    controlled: selectedRowIdxsProp,
    default: defaultSelectedRowIdxsProp,
    name: "useRowSelection",
    state: "selRowIdxs",
  });

  const [lastSelRowIdx, setLastSelRowIdx] = useState<number | undefined>(
    undefined,
  );

  useEffect(() => {
    if (
      (rowSelectionMode === "none" && selRowIdxs.size > 0) ||
      (rowSelectionMode === "single" && selRowIdxs.size > 1)
    ) {
      setSelRowIdxs(new Set());
    }
  }, [rowSelectionMode, selRowIdxs, setSelRowIdxs]);

  const selectRows = useCallback(
    ({
      rowIndex,
      isRange = false,
      incremental = false,
      unselectOtherRows = false,
    }: SelectRowsOptions) => {
      const idxFrom =
        rowSelectionMode === "multi" && lastSelRowIdx !== undefined && isRange
          ? lastSelRowIdx
          : undefined;

      let nextSelRowIdxs: Set<number> | undefined;
      let nextLastSelRowIdx: number | undefined;

      if (idxFrom === undefined) {
        if (unselectOtherRows) {
          if (incremental && selRowIdxs.has(rowIndex)) {
            nextSelRowIdxs = new Set<number>([]);
            nextLastSelRowIdx = undefined;
          } else {
            nextSelRowIdxs = new Set<number>([rowIndex]);
            nextLastSelRowIdx = rowIndex;
          }
        } else {
          if (incremental && rowSelectionMode === "multi") {
            nextSelRowIdxs = new Set<number>(selRowIdxs);
            if (nextSelRowIdxs.has(rowIndex)) {
              nextSelRowIdxs.delete(rowIndex);
              nextLastSelRowIdx = undefined;
            } else {
              nextSelRowIdxs.add(rowIndex);
              nextLastSelRowIdx = rowIndex;
            }
          } else {
            nextSelRowIdxs = new Set([rowIndex]);
            nextLastSelRowIdx = rowIndex;
          }
        }
      } else {
        const s = incremental ? new Set<number>(selRowIdxs) : new Set<number>();
        const idxs = [rowIndex, idxFrom];
        idxs.sort((a, b) => a - b);
        const rowIdxs: number[] = [];
        for (let i = idxs[0]; i <= idxs[1]; ++i) {
          rowIdxs.push(i);
        }
        if (selRowIdxs.has(rowIndex)) {
          rowIdxs.forEach((k) => s.delete(k));
        } else {
          rowIdxs.forEach((k) => s.add(k));
        }
        nextSelRowIdxs = s;
        nextLastSelRowIdx = rowIndex;
      }

      setSelRowIdxs(nextSelRowIdxs);
      setLastSelRowIdx(nextLastSelRowIdx);
      if (onRowSelected) {
        onRowSelected(Array.from(nextSelRowIdxs.keys()));
      }
    },
    [
      selRowIdxs,
      lastSelRowIdx,
      setSelRowIdxs,
      setLastSelRowIdx,
      rowData,
      rowKeyGetter,
      onRowSelected,
    ],
  );

  const isAllSelected = selRowIdxs.size === rowData.length;
  const isAnySelected = selRowIdxs.size > 0;

  const selectAll = useCallback(() => {
    const allRowIdxs = [...new Array(rowData.length).keys()].map((_, i) => i);
    setSelRowIdxs(new Set(allRowIdxs));
    if (onRowSelected) {
      onRowSelected(allRowIdxs);
    }
  }, [rowData, setSelRowIdxs]);

  const unselectAll = useCallback(() => {
    setSelRowIdxs(new Set());
    if (onRowSelected) {
      onRowSelected([]);
    }
  }, [setSelRowIdxs]);

  const onMouseDown = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (rowSelectionMode === "none") {
        return;
      }
      const target = event.target as HTMLElement;
      try {
        const [rowIndex] = getCellPosition(target);
        selectRows({
          rowIndex,
          isRange: event.shiftKey,
          incremental: event.metaKey || event.ctrlKey,
        });
      } catch (e) {}
    },
    [selectRows, rowSelectionMode],
  );

  return {
    onMouseDown,
    selRowIdxs,
    isAllSelected,
    isAnySelected,
    selectRows,
    selectAll,
    unselectAll,
  };
}

export interface ColumnDragState {
  columnIndex: number;
  x: number;
  y: number;
}

const COLUMN_DRAG_TOLERANCE = 10;

export interface Target {
  columnIndex: number;
  x: number;
}

// Returns onMouseDown handler to be attached to column headers (or any element
// working as a drag-and-drop handle for moving columns)
// Also returns dragState and active target (the drop target nearest to current
// mouse positions.
export function useColumnMove<T = any>(
  columnMove: boolean | undefined,
  rootRef: RefObject<HTMLDivElement>,
  leftCols: GridColumnModel<T>[],
  midCols: GridColumnModel<T>[],
  rightCols: GridColumnModel<T>[],
  cols: GridColumnModel<T>[],
  scrollLeft: number,
  clientMidWidth: number,
  onColumnMove: GridColumnMoveHandler,
) {
  const moveRef = useRef<{
    unsubscribe: () => void;
    startScreenX: number;
    startScreenY: number;
    startHeaderX: number;
    startHeaderY: number;

    columnIndex: number;
    columnId: string;
    dragTriggered: boolean;
    onColumnMove: GridColumnMoveHandler;
  }>();

  const activeTargetRef = useRef<Target | undefined>(undefined);

  const [dragState, setDragState] = useState<ColumnDragState | undefined>(
    undefined,
  );

  const columnDragStart = useCallback(
    (columnIndex: number, x: number, y: number) => {
      setDragState({ columnIndex, x, y });
    },
    [],
  );

  const columnDrag = useCallback((x: number, y: number) => {
    setDragState((old) => {
      return { ...old!, x, y };
    });
  }, []);

  const columnDrop = useCallback(() => {
    const toIndex = activeTargetRef.current?.columnIndex;
    const fromIndex = moveRef.current?.columnIndex;
    const columnId = moveRef.current?.columnId;
    const handler = moveRef.current?.onColumnMove;
    if (
      toIndex !== undefined &&
      fromIndex !== undefined &&
      handler !== undefined &&
      columnId !== undefined
    ) {
      handler(columnId, fromIndex, toIndex);
    }
    setDragState(undefined);
  }, [setDragState]);

  const onMouseUp = useCallback(() => {
    if (moveRef.current?.dragTriggered) {
      columnDrop();
    }
    moveRef.current?.unsubscribe();
    moveRef.current = undefined;
  }, [columnDrop]);

  const onMouseMove = useCallback(
    (event: MouseEvent) => {
      const {
        columnIndex,
        startHeaderX,
        startHeaderY,
        startScreenX,
        startScreenY,
        dragTriggered,
      } = moveRef.current!;

      const shiftX = event.screenX - startScreenX;
      const shiftY = event.screenY - startScreenY;
      const x = startHeaderX + shiftX;
      const y = startHeaderY + shiftY;

      if (!dragTriggered) {
        if (
          Math.sqrt(shiftX * shiftX + shiftY * shiftY) > COLUMN_DRAG_TOLERANCE
        ) {
          moveRef.current!.dragTriggered = true;
          columnDragStart(columnIndex, x, y);
        }
      } else {
        columnDrag(x, y);
      }
    },
    [columnDrag],
  );

  const onColumnMoveHandleMouseDown: MouseEventHandler<HTMLDivElement> =
    useCallback(
      (event) => {
        const [columnIndexAttribute, thElement] = getAttribute(
          event.target as HTMLElement,
          "data-column-index",
        );
        const rootElement = rootRef.current;

        if (!rootElement) {
          return;
        }

        document.addEventListener("mouseup", onMouseUp);
        document.addEventListener("mousemove", onMouseMove);

        const columnIndex = Number.parseInt(columnIndexAttribute, 10);
        const columnId = cols[columnIndex].info.props.id;

        const thRect = thElement.getBoundingClientRect();
        const rootRect = rootElement.getBoundingClientRect();

        const x = thRect.x - rootRect.x;
        const y = thRect.y - rootRect.y;

        moveRef.current = {
          unsubscribe: () => {
            document.removeEventListener("mouseup", onMouseUp);
            document.removeEventListener("mousemove", onMouseMove);
          },
          startScreenX: event.screenX,
          startScreenY: event.screenY,
          startHeaderX: x,
          startHeaderY: y,
          columnIndex,
          columnId,
          dragTriggered: false,
          onColumnMove,
        };

        event.preventDefault();
      },
      [columnDragStart, cols],
    );

  const onColumnMoveCancel = useCallback(() => {
    setDragState(undefined);
    moveRef.current?.unsubscribe();
    moveRef.current = undefined;
  }, []);

  const targets = useMemo(() => {
    if (!dragState) {
      return undefined;
    }
    const ts: Target[] = [];
    let x = 0;
    leftCols.forEach((c) => {
      ts.push({ columnIndex: c.index, x });
      x += c.info.width;
    });
    let w = scrollLeft;
    let i = 0;
    while (w > 0 && i < midCols.length) {
      w -= midCols[i].info.width;
      i++;
    }
    x -= w;
    w += clientMidWidth;
    while (w > 0 && i < midCols.length) {
      const c = midCols[i];
      ts.push({ columnIndex: c.index, x });
      x += c.info.width;
      w -= c.info.width;
      i++;
    }
    if (rightCols.length > 0) {
      x += w;
      rightCols.forEach((c) => {
        ts.push({ columnIndex: c.index, x });
        x += c.info.width;
      });
      ts.push({ columnIndex: last(rightCols).index + 1, x });
    } else {
      ts.push({ columnIndex: last(midCols).index + 1, x });
    }
    return ts;
  }, [dragState, leftCols, midCols, rightCols, scrollLeft, clientMidWidth]);

  const activeTargetIdx = useMemo(() => {
    const x = dragState?.x;
    if (x === undefined || targets === undefined || targets.length < 1) {
      return undefined;
    }
    let i = 0;
    while (i < targets.length && targets[i].x < x) {
      i++;
    }
    if (i === 0) {
      return 0;
    }
    if (i >= targets.length) {
      return targets.length - 1;
    }
    return targets[i].x - x < x - targets[i - 1].x ? i : i - 1;
  }, [targets, dragState?.x]);

  const activeTarget =
    activeTargetIdx === undefined ? undefined : targets![activeTargetIdx];

  activeTargetRef.current = activeTarget;

  return {
    onColumnMoveHandleMouseDown,
    dragState,
    activeTarget,
    onColumnMoveCancel,
  };
}

export interface CellPosition {
  rowIdx: number;
  colIdx: number;
}

export interface CellRange {
  start: CellPosition;
  end: CellPosition;
}

export function cellPositionEquals(a: CellPosition, b: CellPosition) {
  return a.rowIdx === b.rowIdx && a.colIdx === b.colIdx;
}

export function cellRangeEquals(
  a: CellRange | undefined,
  b: CellRange | undefined,
) {
  if (!a) {
    return !b;
  }
  return (
    !!b &&
    cellPositionEquals(a.start, b.start) &&
    cellPositionEquals(a.end, b.end)
  );
}

// TODO test the use case when cellSelectionMode changes during dnd.
// Cell range selection. This is experimental.
export function useRangeSelection(cellSelectionMode?: GridCellSelectionMode) {
  const mouseSelectionRef = useRef<{
    unsubscribe: () => void;
    start: CellPosition;
  }>();

  const keyboardSelectionRef = useRef<{
    start: CellPosition;
  }>();

  if (cellSelectionMode !== "range") {
    if (mouseSelectionRef.current) {
      mouseSelectionRef.current.unsubscribe();
      mouseSelectionRef.current = undefined;
    }
    if (keyboardSelectionRef.current) {
      keyboardSelectionRef.current = undefined;
    }
  }

  const [selectedCellRange, setSelectedCellRange] = useState<
    CellRange | undefined
  >(undefined);

  const onMouseMove = useCallback((event: MouseEvent) => {
    const { clientX, clientY } = event;
    const element = document.elementFromPoint(clientX, clientY) as HTMLElement;
    try {
      const [rowIdx, colIdx] = getCellPosition(element);

      setSelectedCellRange((old) => {
        const { start } = mouseSelectionRef.current!;
        const p: CellRange = { start, end: { rowIdx, colIdx } };
        return cellRangeEquals(old, p) ? old : p;
      });
    } catch (exc) {}
  }, []);

  const onMouseUp = useCallback((event: MouseEvent) => {
    if (!mouseSelectionRef.current) {
      throw new Error("useRangeSelection state is not initialized");
    }
    mouseSelectionRef.current.unsubscribe();
    mouseSelectionRef.current = undefined;
  }, []);

  const onCellMouseDown = useCallback(
    (event: ReactMouseEvent) => {
      if (cellSelectionMode !== "range") {
        return;
      }
      const target = event.target as HTMLElement;
      try {
        const [rowIdx, colIdx] = getCellPosition(target);
        document.addEventListener("mouseup", onMouseUp);
        document.addEventListener("mousemove", onMouseMove);
        const pos: CellPosition = { rowIdx, colIdx };
        mouseSelectionRef.current = {
          start: pos,
          unsubscribe: () => {
            document.removeEventListener("mouseup", onMouseUp);
            document.removeEventListener("mousemove", onMouseMove);
          },
        };
        setSelectedCellRange({ start: pos, end: pos });
      } catch (exc) {}
    },
    [cellSelectionMode],
  );

  const onKeyboardRangeSelectionStart = useCallback((pos: CellPosition) => {
    keyboardSelectionRef.current = {
      start: pos,
    };
  }, []);

  const onKeyboardRangeSelectionEnd = useCallback(() => {
    keyboardSelectionRef.current = undefined;
  }, []);

  const onCursorMove = useCallback((pos: CellPosition) => {
    if (!keyboardSelectionRef.current) {
      return;
    }
    setSelectedCellRange((old) => {
      if (!keyboardSelectionRef.current) {
        return old;
      }
      const { start } = keyboardSelectionRef.current;
      const p: CellRange = { start, end: pos };
      return cellRangeEquals(old, p) ? old : p;
    });
  }, []);

  const selectRange = useCallback((range: CellRange) => {
    if (cellSelectionMode !== "range") {
      return;
    }
    setSelectedCellRange(range);
  }, []);

  return {
    selectedCellRange,
    onCellMouseDown,
    onKeyboardRangeSelectionStart,
    onKeyboardRangeSelectionEnd,
    onCursorMove,
    selectRange,
  };
}

export function useFocusableContent<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [isFocusableContent, setFocusableContent] = useState<boolean>(false);

  const onFocus: FocusEventHandler<T> = (event) => {
    if (event.target === ref.current) {
      const nestedInteractive = ref.current.querySelector(`[tabindex="0"]`);
      if (nestedInteractive) {
        (nestedInteractive as HTMLElement).focus();
        setFocusableContent(true);
      }
    }
  };

  return { ref, isFocusableContent, onFocus };
}
