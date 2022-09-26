import React, {
  Children,
  isValidElement,
  MouseEventHandler,
  ReactNode,
  RefObject,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  RowKeyGetter,
  GridColumnGroupModel,
  GridColumnModel,
  GridRowModel,
  GridRowSelectionMode,
  GridCellSelectionMode,
} from "../Grid";
import { ColumnGroupProps } from "../ColumnGroup";
import { Rng } from "../Rng";
import { GridColumnInfo, GridColumnPin } from "../GridColumn";
import {
  getAttribute,
  getCellPosition,
  makeMapAdder,
  makeMapDeleter,
} from "./utils";
import { GridContext } from "../GridContext";
import { SelectionContext } from "../SelectionContext";
import { CellEditorInfo } from "../CellEditor";

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
function sumRangeWidth<T>(columns: GridColumnModel<T>[], range: Rng) {
  let w = 0;
  range.forEach((i) => {
    w += columns[i].info.width;
  });
  return w;
}

// Sum width of the given range of columns wrapped in useMemo.
export function useSumRangeWidth<T>(columns: GridColumnModel<T>[], range: Rng) {
  return useMemo(() => sumRangeWidth(columns, range), [columns, range]);
}

// Product of the given numbers.
export function useProd(source: number[]) {
  return useMemo(() => source.reduce((p, x) => p * x, 1), source);
}

// Range memoization using Rng.equals comparator.
function useMemoRng(fn: () => Rng, deps: any[]) {
  const prevRef = useRef<Rng>(Rng.empty);
  const range = useMemo(fn, deps);
  if (!Rng.equals(prevRef.current, range)) {
    prevRef.current = range;
  }
  return prevRef.current;
}

// Visible range of columns within the body.
export function useBodyVisibleColumnRange<T>(
  midColumns: GridColumnModel<T>[],
  scrollLeft: number,
  clientMidWidth: number
): Rng {
  return useMemoRng(() => {
    if (clientMidWidth === 0 || midColumns.length === 0) {
      return Rng.empty;
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
    return new Rng(start, end);
  }, [midColumns, scrollLeft, clientMidWidth]);
}

// Client width of the middle (scrollable) part of the grid.
export function useClientMidWidth(
  clientWidth: number,
  leftWidth: number,
  rightWidth: number
) {
  return useMemo(
    () => clientWidth - leftWidth - rightWidth,
    [clientWidth, leftWidth, rightWidth]
  );
}

// Client height of the middle part of the grid.
export function useClientMidHeight(
  clientHeight: number,
  topHeight: number,
  botHeight: number
) {
  return useMemo(
    () => clientHeight - topHeight - botHeight,
    [clientHeight, topHeight, botHeight]
  );
}

// Y coordinate of the visible area within the virtual space.
export function useBodyVisibleAreaTop<T>(
  rowHeight: number,
  visibleRowRange: Rng,
  topHeight: number
) {
  return useMemo(
    () => topHeight + visibleRowRange.start * rowHeight,
    [rowHeight, visibleRowRange, topHeight]
  );
}

// Visible range of rows.
export function useVisibleRowRange(
  scrollTop: number,
  clientMidHeight: number,
  rowHeight: number,
  rowCount: number
) {
  return useMemoRng(() => {
    if (rowHeight < 1) {
      return Rng.empty;
    }
    const start = Math.floor(scrollTop / rowHeight);
    let end = Math.max(
      start,
      Math.ceil((scrollTop + clientMidHeight) / rowHeight)
    );
    if (end > rowCount) {
      end = rowCount;
    }
    return new Rng(start, end);
  }, [scrollTop, clientMidHeight, rowHeight, rowCount]);
}

export function useColumnRange<T>(
  columns: GridColumnModel<T>[],
  range: Rng
): GridColumnModel<T>[] {
  return useMemo(() => columns.slice(range.start, range.end), [columns, range]);
}

// Total width of the columns scrolled out to the left of the visible area.
export function useLeftScrolledOutWidth<T>(
  midColumns: GridColumnModel<T>[],
  bodyVisibleColumnRange: Rng
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
  return useMemo(
    () =>
      new Map<string, number>(rowData.map((r, i) => [rowKeyGetter(r, i), i])),
    [rowData, rowKeyGetter]
  );
}

export type SetState<T> = (v: T | ((p: T) => T)) => void;

// Row models for the visible rows.
export function useRowModels<T>(
  getKey: RowKeyGetter<T>,
  rowData: T[],
  visibleRowRange: Rng
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
  startIdx: number
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
    [grpPs, startIdx]
  );
export const PAGE_SIZE = 10;

// Visible range of column groups.
export function useVisibleColumnGroupRange<T>(
  bodyVisColRng: Rng,
  midCols: GridColumnModel<T>[],
  midGrpByColId: Map<string, GridColumnGroupModel>,
  leftGrpCount: number
): Rng {
  return useMemoRng(() => {
    if (bodyVisColRng.length === 0) {
      return Rng.empty;
    }
    const firstVisibleCol = midCols[bodyVisColRng.start];
    const lastVisibleCol = midCols[bodyVisColRng.end - 1];
    const firstVisibleGroup = midGrpByColId.get(firstVisibleCol.info.props.id);
    const lastVisibleGroup = midGrpByColId.get(lastVisibleCol.info.props.id);
    if (!firstVisibleGroup || !lastVisibleGroup) {
      return Rng.empty;
    }
    return new Rng(
      firstVisibleGroup.index - leftGrpCount,
      lastVisibleGroup.index + 1 - leftGrpCount
    );
  }, [bodyVisColRng, midCols, midGrpByColId, leftGrpCount]);
}

export function last<T>(source: T[]): T {
  return source[source.length - 1];
}

// Range of columns visible in the header.
export function useHeadVisibleColumnRange<T>(
  bodyVisColRng: Rng,
  visColGrps: GridColumnGroupModel[],
  midColsById: Map<string, GridColumnModel<T>>,
  leftColCount: number
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
      return Rng.empty;
    }
    return new Rng(firstColIdx - leftColCount, lastColIdx + 1 - leftColCount);
  }, [bodyVisColRng, visColGrps, midColsById, leftColCount]);
}

// Creates column models.
export function useCols<T>(
  colInfos: GridColumnInfo<T>[],
  startIdx: number,
  groups: GridColumnGroupModel[]
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
  visRowRng: Rng,
  rowHeight: number,
  clientMidHt: number,
  midCols: GridColumnModel<T>[],
  bodyVisColRng: Rng,
  clientMidWidth: number,
  scroll: (left?: number, top?: number, source?: "user" | "table") => void
) {
  return useCallback(
    (rowIdx: number, colIdx: number) => {
      let x: number | undefined = undefined;
      let y: number | undefined = undefined;
      if (rowIdx <= visRowRng.start) {
        y = rowHeight * rowIdx;
      } else if (rowIdx >= visRowRng.end - 1) {
        y = Math.max(0, rowHeight * rowIdx - clientMidHt + rowHeight);
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
          x = w - clientMidWidth;
        }
      }
      if (x !== undefined || y !== undefined) {
        scroll(x, y, "table");
      }
    },
    [
      visRowRng,
      rowHeight,
      clientMidHt,
      midCols,
      bodyVisColRng,
      clientMidWidth,
      scroll,
    ]
  );
}

const MIN_COLUMN_WIDTH = 10;

// Returns onMouseDown handler to be attached to column resize handlers.
// TODO There might be some problems if column is removed while it is being resized
export function useColumnResize<T>(
  resizeColumn: (columnIndex: number, width: number) => void
) {
  const columnResizeDataRef = useRef<{
    startX: number;
    startY: number;
    eventsUnsubscription: () => void;
    columnIndex: number;
    initialColumnWidth: number;
    resizeColumn: (columnIndex: number, width: number) => void;
  }>();

  const onMouseUp = useCallback(() => {
    columnResizeDataRef.current?.eventsUnsubscription();
    columnResizeDataRef.current = undefined;
  }, []);

  const onMouseMove = useCallback((event: MouseEvent) => {
    const x = event.screenX;
    const { startX, columnIndex, initialColumnWidth } =
      columnResizeDataRef.current!;
    const shift = x - startX;
    let width = initialColumnWidth + shift;
    if (width < MIN_COLUMN_WIDTH) {
      width = MIN_COLUMN_WIDTH;
    }
    columnResizeDataRef.current!.resizeColumn(columnIndex, Math.round(width));
  }, []);

  return useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const targetElement = event.target as HTMLElement;
      const [columnIndexAttribute, thElement] = getAttribute(
        targetElement,
        "data-column-index"
      );

      const columnIndex = parseInt(columnIndexAttribute, 10);

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
      };

      event.preventDefault();
    },
    [resizeColumn]
  );
}

// Map values to array.
export function useFlatten<T>(map: Map<number, T>): T[] {
  return useMemo(() => {
    const entries = [...map.entries()].filter(([index, value]) => !!value);
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
    new Map()
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
    leftGroups.length + midGroups.length
  );

  const leftCols: GridColumnModel<T>[] = useCols(leftColInfos, 0, leftGroups);
  const midCols: GridColumnModel<T>[] = useCols(
    midColInfos,
    leftCols.length,
    midGroups
  );
  const rightCols: GridColumnModel<T>[] = useCols(
    rightColInfos,
    leftCols.length + midCols.length,
    rightGroups
  );

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

  const getChildIndex = (id: string): number => {
    const idx = chPosById.current.get(id);
    if (idx === undefined) {
      throw new Error(`Unknown child id: "${id}"`);
    }
    return idx;
  };

  const getColMapSet = (pinned?: GridColumnPin) =>
    pinned === "left"
      ? setLeftColMap
      : pinned === "right"
      ? setRightColMap
      : setMidColMap;

  const onColumnAdded = useCallback((columnInfo: GridColumnInfo<T>) => {
    // console.log(
    //   `Column added: "${columnInfo.props.name}"; pinned: ${columnInfo.props.pinned}`
    // );
    const { id, pinned } = columnInfo.props;
    getColMapSet(pinned)(makeMapAdder(getChildIndex(id), columnInfo));
  }, []);

  const onColumnRemoved = useCallback((columnInfo: GridColumnInfo<T>) => {
    const { id, pinned } = columnInfo.props;
    getColMapSet(pinned)(makeMapDeleter(getChildIndex(id)));
    // console.log(`Column removed: "${columnProps.name}"`);
  }, []);

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
    (colGroupProps: ColumnGroupProps) => {
      const { id, pinned } = colGroupProps;
      getGrpMapSet(pinned)(makeMapDeleter(getChildIndex(id)));
      // console.log(`Group removed: "${colGroupProps.name}"`);
    },
    []
  );

  const onEditorAdded = useCallback((info: CellEditorInfo<T>) => {
    const { columnId } = info;
    setEditorMap(makeMapAdder(columnId, info));
    console.log(`Editor added for column ${columnId}`);
  }, []);

  const onEditorRemoved = useCallback((info: CellEditorInfo<T>) => {
    const { columnId } = info;
    setEditorMap(makeMapDeleter(columnId));
    console.log(`Editor removed for column ${columnId}`);
  }, []);

  const getEditor = useCallback(
    (columnId: string) => editorMap.get(columnId),
    [editorMap]
  );

  const contextValue: GridContext<T> = useMemo(
    () => ({
      onColumnAdded,
      onColumnRemoved,
      onColumnGroupAdded,
      onColumnGroupRemoved,
      onEditorAdded,
      onEditorRemoved,
      getEditor,
    }),
    [
      onColumnAdded,
      onColumnRemoved,
      onColumnGroupAdded,
      onColumnGroupRemoved,
      onEditorAdded,
      onEditorRemoved,
      getEditor,
    ]
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

// Returns functions related to row selection.
// TODO test use case when selection mode changes
export function useRowSelection<T>(
  rowKeyGetter: RowKeyGetter<T>,
  rowData: T[],
  rowIdxByKey: Map<string, number>,
  defaultSelectedRowKeys?: Set<string>,
  rowSelectionMode?: GridRowSelectionMode,
  onRowSelected?: (selectedRows: T[]) => void
) {
  const [selRowKeys, setSelRowKeys] = useState<Set<string>>(
    defaultSelectedRowKeys || new Set()
  );

  const [lastSelRowKey, setLastSelRowKey] = useState<string | undefined>(
    undefined
  );

  const selectRows = useCallback(
    (rowIdx: number, shift: boolean, meta: boolean) => {
      const rowKey = rowKeyGetter(rowData[rowIdx], rowIdx);
      const idxFrom =
        rowSelectionMode === "multi" && lastSelRowKey !== undefined && shift
          ? rowIdxByKey.get(lastSelRowKey)
          : undefined;

      let nextSelRowKeys: Set<string> | undefined = undefined;
      let nextLastSelRowKey: string | undefined = undefined;

      if (idxFrom === undefined) {
        if (rowSelectionMode !== "multi" || !meta) {
          nextSelRowKeys = new Set([rowKey]);
          nextLastSelRowKey = rowKey;
        } else {
          const n = new Set<string>(selRowKeys);
          if (n.has(rowKey)) {
            n.delete(rowKey);
            nextLastSelRowKey = undefined;
          } else {
            n.add(rowKey);
            nextLastSelRowKey = rowKey;
          }
          nextSelRowKeys = n;
        }
      } else {
        const s = meta ? new Set<string>(selRowKeys) : new Set<string>();
        const idxs = [rowIdxByKey.get(rowKey)!, idxFrom];
        idxs.sort((a, b) => a - b);
        const rowKeys = [];
        for (let i = idxs[0]; i <= idxs[1]; ++i) {
          rowKeys.push(rowKeyGetter(rowData[i], i));
        }
        if (selRowKeys.has(rowKey)) {
          rowKeys.forEach((k) => s.delete(k));
        } else {
          rowKeys.forEach((k) => s.add(k));
        }
        nextSelRowKeys = s;
        nextLastSelRowKey = rowKey;
      }

      setSelRowKeys(nextSelRowKeys);
      setLastSelRowKey(nextLastSelRowKey);
      if (onRowSelected) {
        onRowSelected(
          [...nextSelRowKeys.keys()].map((k) => rowData[rowIdxByKey.get(k)!])
        );
      }
    },
    [
      lastSelRowKey,
      setSelRowKeys,
      setLastSelRowKey,
      rowData,
      rowIdxByKey,
      rowKeyGetter,
      onRowSelected,
    ]
  );

  const isAllSelected = selRowKeys.size === rowData.length;
  const isAnySelected = selRowKeys.size > 0;

  const selectAll = useCallback(() => {
    setSelRowKeys(new Set(rowData.map((d, i) => rowKeyGetter(d, i))));
    if (onRowSelected) {
      onRowSelected(rowData);
    }
  }, [rowData, setSelRowKeys]);

  const unselectAll = useCallback(() => {
    setSelRowKeys(new Set());
    if (onRowSelected) {
      onRowSelected([]);
    }
  }, [setSelRowKeys]);

  const onMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (rowSelectionMode === "none") {
        return;
      }
      const target = event.target as HTMLElement;
      try {
        const [rowIdx] = getCellPosition(target);
        selectRows(rowIdx, event.shiftKey, event.metaKey || event.ctrlKey);
      } catch (e) {}
    },
    [selectRows]
  );

  return {
    onMouseDown,
    selRowKeys,
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
  columnDnD: boolean | undefined,
  rootRef: RefObject<HTMLDivElement>,
  leftCols: GridColumnModel<T>[],
  midCols: GridColumnModel<T>[],
  rightCols: GridColumnModel<T>[],
  scrollLeft: number,
  clientMidWidth: number,
  onColumnMove: (fromIndex: number, toIndex: number) => void
) {
  const moveRef = useRef<{
    unsubscribe: () => void;
    startScreenX: number;
    startScreenY: number;
    startHeaderX: number;
    startHeaderY: number;

    columnIndex: number;
    dragTriggered: boolean;
    onColumnMove: (fromIndex: number, toIndex: number) => void;
  }>();

  const activeTargetRef = useRef<Target | undefined>(undefined);

  const [dragState, setDragState] = useState<ColumnDragState | undefined>(
    undefined
  );

  const columnDragStart = useCallback(
    (columnIndex: number, x: number, y: number) => {
      setDragState({ columnIndex, x, y });
    },
    [setDragState]
  );

  const columnDrag = useCallback(
    (x: number, y: number) => {
      setDragState((old) => {
        return { ...old!, x, y };
      });
    },
    [setDragState]
  );

  const columnDrop = useCallback(() => {
    const toIndex = activeTargetRef.current?.columnIndex;
    const fromIndex = moveRef.current?.columnIndex;
    const handler = moveRef.current?.onColumnMove;
    if (
      toIndex !== undefined &&
      fromIndex !== undefined &&
      handler !== undefined
    ) {
      handler(fromIndex, toIndex);
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
    [columnDrag]
  );

  const onColumnMoveHandleMouseDown: MouseEventHandler<HTMLDivElement> =
    useCallback(
      (event) => {
        const [columnIndexAttribute, thElement] = getAttribute(
          event.target as HTMLElement,
          "data-column-index"
        );
        const rootElement = rootRef.current!;

        document.addEventListener("mouseup", onMouseUp);
        document.addEventListener("mousemove", onMouseMove);

        const columnIndex = parseInt(columnIndexAttribute, 10);

        const thRect = thElement.getBoundingClientRect();
        const rootRect = rootElement!.getBoundingClientRect();

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
          dragTriggered: false,
          onColumnMove,
        };

        event.preventDefault();
      },
      [columnDragStart]
    );

  const targets = useMemo(() => {
    if (!dragState) {
      return undefined;
    }
    let ts: Target[] = [];
    let x = 0;
    leftCols.forEach((c, i) => {
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
      rightCols.forEach((c, i) => {
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

  return { onColumnMoveHandleMouseDown, dragState, activeTarget };
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
  b: CellRange | undefined
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
  const ref = useRef<{
    unsubscribe: () => void;
    start: CellPosition;
  }>();

  if (cellSelectionMode !== "range" && ref.current) {
    ref.current.unsubscribe();
    ref.current = undefined;
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
        const { start } = ref.current!;
        const p: CellRange = { start, end: { rowIdx, colIdx } };
        return cellRangeEquals(old, p) ? old : p;
      });
    } catch (exc) {}
  }, []);

  const onMouseUp = useCallback((event: MouseEvent) => {
    if (!ref.current) {
      throw new Error(`useRangeSelection state is not initialized`);
    }
    ref.current.unsubscribe();
    ref.current = undefined;
  }, []);

  const onCellMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (cellSelectionMode !== "range") {
        return;
      }
      const target = event.target as HTMLElement;
      try {
        const [rowIdx, colIdx] = getCellPosition(target);
        document.addEventListener("mouseup", onMouseUp);
        document.addEventListener("mousemove", onMouseMove);
        const pos: CellPosition = { rowIdx, colIdx };
        ref.current = {
          start: pos,
          unsubscribe: () => {
            document.removeEventListener("mouseup", onMouseUp);
            document.removeEventListener("mousemove", onMouseMove);
          },
        };
        setSelectedCellRange({ start: pos, end: pos });
      } catch (exc) {}
    },
    [cellSelectionMode]
  );

  return { selectedCellRange, onCellMouseDown };
}
