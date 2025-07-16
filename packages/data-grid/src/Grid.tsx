import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type CSSProperties,
  type KeyboardEvent,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ColumnDataContext } from "./ColumnDataContext";
import { ColumnDragContext } from "./ColumnDragContext";
import type { ColumnGroupProps } from "./ColumnGroup";
import { ColumnSortContext } from "./ColumnSortContext";
import { CursorContext, type FocusedPart } from "./CursorContext";
import { EditorContext } from "./EditorContext"; // TODO remove
import gridCss from "./Grid.css";
import type {
  CellValidationState,
  GridColumnInfo,
  GridColumnProps,
} from "./GridColumn";
import { GridContext } from "./GridContext";
import {
  CellMeasure,
  clamp,
  getFocusablePosition,
  LeftPart,
  MiddlePart,
  RightPart,
  Scrollable,
  type ScrollableProps,
  TopLeftPart,
  TopPart,
  TopRightPart,
  useBodyVisibleAreaTop,
  useBodyVisibleColumnRange,
  useClientMidHeight,
  useClientMidWidth,
  useColumnMove,
  useColumnRange,
  useColumnRegistry,
  useColumnResize,
  useHeadVisibleColumnRange,
  useLeftScrolledOutWidth,
  useRangeSelection,
  useRowModels,
  useRowSelection,
  useScrollToCell,
  useSum,
  useSumRangeWidth,
  useSumWidth,
  useVisibleColumnGroupRange,
  useVisibleRowRange,
} from "./internal";
import { ColumnDropTarget } from "./internal/ColumnDropTarget";
import { ColumnGhost } from "./internal/ColumnGhost";
import { LayoutContext } from "./LayoutContext";
import { SelectionContext } from "./SelectionContext";
import { SizingContext } from "./SizingContext";

const withBaseName = makePrefixer("saltGrid");

export type ColumnSeparatorType = "regular" | "none" | "groupEdge" | "pinned";
export type ColumnGroupRowSeparatorType = "first" | "regular" | "last";
export type ColumnGroupColumnSeparatorType = "regular" | "none" | "pinned";
export type GridRowSelectionMode = "single" | "multi" | "none";
export type GridCellSelectionMode = "range" | "none";

export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
  NONE = "none",
}

export type RowKeyGetter<T> = (row: T, index: number) => string;

export type GridColumnMoveHandler = (
  columnId: string,
  fromIndex: number,
  toIndex: number,
) => void;

export interface GridProps<T = any> {
  /**
   * At least 1 children is expected, options are `ColumnGroup` or `GridColumn`.
   * */
  children: ReactNode;
  /**
   * If `true`, zebra stripes are enabled (odd/even rows have alternate colours)
   * */
  zebra?: boolean;
  /**
   * If `true`, grid header is hidden.
   * */
  hideHeader?: boolean;
  /**
   * If `true`, column separators are rendered.
   * */
  columnSeparators?: boolean;
  /**
   * If `true`, separators are rendered between pinned and unpinned columns.
   * */
  pinnedSeparators?: boolean;
  /**
   * Row data objects. Sparse arrays are supported.
   * */
  rowData: T[];
  /**
   * Should return unique string for a given row data object.
   * If rowData is sparse then this function should work with undefined row data
   * objects and create keys based on row index. `(row: T, index: number) => string`
   * */
  rowKeyGetter?: RowKeyGetter<T>;
  /**
   * Rows with these indices are selected by default.
   * */
  defaultSelectedRowIdxs?: number[];
  /**
   * Selected row indices for controlled mode.
   * */
  selectedRowIdxs?: number[];
  className?: string;
  style?: CSSProperties;
  /**
   * The variant to use. Options are `primary` and `secondary`. Default value is
   * `primary`. `secondary` variant changes grid background to reduce contrast.
   * */
  variant?: "primary" | "secondary";
  /**
   * Options are `single`, `multi` and `none`.
   * */
  rowSelectionMode?: GridRowSelectionMode;
  onRowSelected?: (selectedRowIdxs: number[]) => void;
  /**
   * If `true`, user will be able to move columns using drag and drop.
   * */
  columnMove?: boolean;
  /**
   * Accepts `(columnId: string, fromIndex: number, toIndex: number) => void`
   * */
  onColumnMoved?: GridColumnMoveHandler;
  /**
   * Options are `range` and `none`.
   * */
  cellSelectionMode?: GridCellSelectionMode;
  onVisibleRowRangeChange?: (start: number, end: number) => void;
  /**
   * If `true`, keyboard navigation is enabled for the header.
   * */
  headerIsFocusable?: boolean;

  getRowValidationStatus?: (
    row: GridRowModel<T>,
  ) => CellValidationState | undefined;
}

export interface GridRowModel<T> {
  key: string;
  index: number;
  data: T;
}

export interface GridColumnModel<T> {
  index: number;
  separator: ColumnSeparatorType;

  info: GridColumnInfo<T>;
}

export interface GridColumnGroupModel {
  index: number;
  data: ColumnGroupProps;
  childrenIds: string[];
  rowSeparator: ColumnGroupRowSeparatorType;
  columnSeparator: ColumnGroupColumnSeparatorType;
  colSpan: number;
}

function defaultRowKeyGetter<T>(row: T, index: number): string {
  return `${index}`;
}

export const Grid = function Grid<T>(props: GridProps<T>) {
  const {
    rowData,
    zebra,
    hideHeader,
    columnSeparators,
    pinnedSeparators = true,
    className,
    style,
    rowKeyGetter = defaultRowKeyGetter,
    children,
    defaultSelectedRowIdxs,
    selectedRowIdxs,
    variant = "primary",
    rowSelectionMode = "multi",
    onRowSelected,
    columnMove,
    onColumnMoved,
    cellSelectionMode = "none",
    onVisibleRowRangeChange,
    headerIsFocusable,
    getRowValidationStatus,
  } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-grid",
    css: gridCss,
    window: targetWindow,
  });

  const rootRef = useRef<HTMLDivElement>(null);
  const scrollableRef = useRef<HTMLDivElement>(null);
  const middleRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // What caused the latest scroll change. User means the UI (mouse events), table means the component initiated scrolling (scrollToCell was called for example)
  const [scrollSource, setScrollSource] = useState<"user" | "table">("user");
  const [scrollLeft, setScrollLeft] = useState<number>(0);
  const [scrollTop, setScrollTop] = useState<number>(0);

  const [hoverRowKey, setHoverRowKey] = useState<string | undefined>(undefined);

  const [
    { clientWidth, clientHeight, scrollBarHeight, scrollBarWidth },
    setDimensions,
  ] = useState({
    clientWidth: 0,
    clientHeight: 0,
    scrollBarHeight: 0,
    scrollBarWidth: 0,
  });

  const [rowHeight, setRowHeight] = useState<number>(0);

  const [cursorRowIdx, setCursorRowIdx] = useState<number>(0);
  const [cursorColIdx, setCursorColIdx] = useState<number>(0);
  const [focusedPart, setFocusedPart] = useState<FocusedPart>(
    headerIsFocusable ? "header" : "body",
  );

  const [sortByColumnId, setSortByColumnId] =
    useState<GridColumnProps["id"]>("");
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.NONE);

  const [editMode, setEditMode] = useState<boolean>(false);
  const [initialText, setInitialText] = useState<string | undefined>(undefined);

  const resizeClient: ScrollableProps<T>["resizeClient"] = useCallback(
    (dimensions) => {
      setDimensions(dimensions);
    },
    [],
  );

  const {
    leftCols, // Columns pinned to left
    midCols, // Scrollable columns
    rightCols, // Columns pinned to right
    leftGroups,
    midGroups,
    rightGroups,
    contextValue,
  } = useColumnRegistry<T>(children);

  const midColsById = useMemo(
    () =>
      new Map<string, GridColumnModel<T>>(
        midCols.map(
          (c) => [c.info.props.id, c] as [string, GridColumnModel<T>],
        ),
      ),
    [midCols],
  );

  // Width of all columns pinned to left
  const leftWidth = useSumWidth(leftCols);
  // Width of all scrollable columns
  const midWidth = useSumWidth(midCols);
  // Width of all columns pinned to right
  const rightWidth = useSumWidth(rightCols);
  // Total width of all columns
  const totalWidth = useSum([leftWidth, midWidth, rightWidth]);

  const hasColumnGroups =
    leftGroups.length > 0 || midGroups.length > 0 || rightGroups.length > 0;

  const headRowCount = hideHeader ? 0 : hasColumnGroups ? 2 : 1; // TODO multiple group levels
  const rowCount = rowData.length;

  // Footer is not implemented yet.
  const botRowCount = 0; // TODO
  // Height of the header
  const topHeight = rowHeight * headRowCount;
  // Height of the middle part (virtual height)
  const midHeight = rowCount === 0 ? 0 : rowHeight * rowCount + 1;
  // Height of the footer
  const botHeight = botRowCount * rowHeight;
  // Total height of the grid (virtual)
  const totalHeight = useSum([topHeight, midHeight, botHeight]);
  // Client width of the middle part of the grid (viewport)
  const clientMidWidth = useClientMidWidth(clientWidth, leftWidth, rightWidth);
  // Unused width in the middle part, to be filled by an empty column with fake cells.
  const midGap = Math.max(0, Math.floor(clientMidWidth - midWidth));

  // Range of unpinned columns visible in the body of the grid (pinned columns are always visible).
  const bodyVisColRng = useBodyVisibleColumnRange(
    midCols,
    scrollLeft,
    clientMidWidth,
  );

  const midGrpByColId = useMemo(() => {
    const m = new Map<string, GridColumnGroupModel>();
    for (const g of midGroups) {
      for (const c of g.childrenIds) {
        m.set(c, g);
      }
    }
    return m;
  }, [midGroups]);

  // Range of visible column groups.
  const visColGrpRng = useVisibleColumnGroupRange(
    bodyVisColRng,
    midCols,
    midGrpByColId,
    leftGroups.length,
  );

  const visColGrps = useMemo(() => {
    return midGroups.slice(visColGrpRng.start, visColGrpRng.end);
  }, [visColGrpRng, midGroups]);

  const headVisColRng = useHeadVisibleColumnRange(
    bodyVisColRng,
    visColGrps,
    midColsById,
    leftCols.length,
  );

  const bodyScrOutColWh = useLeftScrolledOutWidth(midCols, bodyVisColRng);
  const headScrOutColWh = useLeftScrolledOutWidth(midCols, headVisColRng);

  const bodyVisAreaLeft = useSum([leftWidth, bodyScrOutColWh]);
  const headVisAreaLeft = useSum([leftWidth, headScrOutColWh]);
  const clientMidHeight = useClientMidHeight(
    clientHeight,
    topHeight,
    botHeight,
  );
  const visRowRng = useVisibleRowRange(
    scrollTop,
    clientMidHeight,
    rowHeight,
    rowCount,
  );

  const bodyVisAreaTop = useBodyVisibleAreaTop(rowHeight, visRowRng, topHeight);

  const bodyVisibleColumns = useColumnRange(midCols, bodyVisColRng);
  const headVisibleColumns = useColumnRange(midCols, headVisColRng);
  const bodyVisColWh = useSumRangeWidth(midCols, bodyVisColRng);

  const headVisColWh = bodyVisColWh; // TODO implement groups

  const rootStyle = useMemo(
    () => ({
      ...style,
      "--grid-total-width": `${totalWidth}px`,
      "--grid-total-height": `${totalHeight}px`,
      "--grid-topPart-height": `${topHeight}px`,
      "--grid-leftPart-width": `${leftWidth}px`,
      "--grid-rightPart-width": `${rightWidth}px`,
      "--grid-bodyVisibleColumns-width": `${bodyVisColWh}px`,
      "--grid-bodyVisibleArea-top": `${bodyVisAreaTop}px`,
      "--grid-bodyVisibleArea-left": `${bodyVisAreaLeft}px`,
      "--grid-bottomHeight": `${botHeight}px`,
      "--grid-headerVisibleColumns-width": `${headVisColWh}px`,
      "--grid-headerVisibleArea-left": `${headVisAreaLeft}px`,
      "--grid-scrollBar-height": `${scrollBarHeight}px`,
      "--grid-scrollBar-width": `${scrollBarWidth}px`,
    }),
    [
      style,
      totalHeight,
      totalWidth,
      topHeight,
      leftWidth,
      rightWidth,
      botHeight,
      bodyVisColWh,
      bodyVisAreaLeft,
      bodyVisAreaTop,
      headVisColWh,
      headVisAreaLeft,
      scrollBarHeight,
      scrollBarWidth,
    ],
  );

  const onWheel: EventListener = useCallback(
    (event) => {
      let { deltaX, deltaY, shiftKey } = event as WheelEvent;
      if (deltaX === 0 && shiftKey) {
        deltaX = deltaY;
        deltaY = 0;
      }
      const s = scrollableRef.current;
      if (s) {
        s.scrollLeft += deltaX;
        s.scrollTop += deltaY;
        if (
          !(
            (
              Math.round(s.scrollHeight - s.scrollTop) === s.clientHeight || // reached the bottom
              (s.scrollTop === 0 && deltaY < 0)
            ) // reached the top (upward scroll)
          )
        ) {
          event.preventDefault();
          event.stopPropagation();
        }
      }
    },
    [scrollableRef.current],
  );

  const cols = useMemo(
    () => [...leftCols, ...midCols, ...rightCols],
    [leftCols, midCols, rightCols],
  );

  const colsById = useMemo(
    () =>
      new Map<string, GridColumnModel<T>>(
        cols.map((c) => [c.info.props.id, c] as [string, GridColumnModel<T>]),
      ),
    [cols],
  );

  const getColById = useCallback(
    (id: string) => {
      return colsById.get(id);
    },
    [colsById],
  );

  const columnDataContext: ColumnDataContext<T> = useMemo(
    () => ({
      getColById,
    }),
    [getColById],
  );

  const isSortMode = sortByColumnId && sortOrder !== SortOrder.NONE;

  const onSortOrderChange =
    getColById(sortByColumnId)?.info.props.onSortOrderChange;

  const valueGetter =
    getColById(sortByColumnId)?.info.props.getValue ||
    ((r: T) => {
      return r[sortByColumnId as keyof typeof r];
    });

  const customSortingFn = getColById(sortByColumnId)?.info.props.customSort;

  const sortedRowData = useMemo(() => {
    if (!isSortMode || onSortOrderChange) return rowData;

    if (customSortingFn) {
      return customSortingFn({ rowData, sortOrder });
    }

    const sortedData = [...rowData].sort((a, b) =>
      valueGetter(a) < valueGetter(b) ? -1 : 1,
    );

    if (sortOrder === SortOrder.DESC) {
      return sortedData.reverse();
    }

    return sortedData;
  }, [
    onSortOrderChange,
    valueGetter,
    customSortingFn,
    isSortMode,
    rowData,
    sortByColumnId,
    sortOrder,
  ]);

  const onClickSortColumn = useCallback(
    (colHeaderId: GridColumnProps["id"]) => {
      if (sortByColumnId === colHeaderId) {
        switch (sortOrder) {
          case SortOrder.ASC:
            setSortOrder(SortOrder.DESC);
            break;
          case SortOrder.DESC:
            setSortOrder(SortOrder.NONE);
            break;
          default:
            setSortOrder(SortOrder.ASC);
        }
      } else {
        setSortByColumnId(colHeaderId);
        setSortOrder(SortOrder.ASC);
      }
    },
    [sortByColumnId, sortOrder],
  );

  const columnSortContext: ColumnSortContext = useMemo(
    () => ({
      sortByColumnId,
      setSortByColumnId,
      sortOrder,
      setSortOrder,
      onClickSortColumn,
    }),
    [
      sortByColumnId,
      setSortByColumnId,
      sortOrder,
      setSortOrder,
      onClickSortColumn,
    ],
  );

  const scroll = useCallback(
    (left?: number, top?: number, source?: "user" | "table") => {
      setScrollSource(source || "user");
      if (left !== undefined) {
        setScrollLeft(left);
      }
      if (top !== undefined) {
        setScrollTop(top);
      }
    },
    [setScrollLeft, setScrollTop, setScrollSource],
  );

  const scrollToCell = useScrollToCell(
    visRowRng,
    rowHeight,
    clientMidHeight,
    midCols,
    bodyVisColRng,
    clientMidWidth,
    scroll,
  );

  const focusCellElement = (
    part: FocusedPart,
    rowIdx: number,
    colIdx: number,
  ) => {
    setTimeout(() => {
      const selector =
        part === "body"
          ? `td[data-row-index="${rowIdx}"][data-column-index="${colIdx}"]`
          : `th[data-column-index="${colIdx}"]`;
      const nodeToFocus = rootRef.current?.querySelector(selector);
      if (nodeToFocus) {
        (nodeToFocus as HTMLElement).focus({ preventScroll: true });
      } else {
        console.warn(`focusCellElement can't find the element`);
      }
    }, 0);
  };

  const startEditMode = (text?: string) => {
    if (editMode || cursorRowIdx === undefined || cursorColIdx === undefined) {
      return;
    }
    const c = cols[cursorColIdx];
    const isEditable = !!contextValue.getEditor(c.info.props.id);
    if (isEditable) {
      setInitialText(text);
      setEditMode(true);
    }
  };

  const endEditMode = (value: string) => {
    if (!editMode) {
      return;
    }
    if (cursorColIdx === undefined) {
      console.error("endEditMode: cursorColIdx is undefined in edit mode");
      return;
    }
    const c = cols[cursorColIdx];
    const handler = c.info.props.onChange;
    if (cursorRowIdx === undefined) {
      console.error("endEditMode: cursorRowIdx is undefined in edit mode");
      return;
    }
    if (!handler) {
      console.warn(
        `onChange is not specified for editable column "${c.info.props.id}".`,
      );
    } else {
      handler(sortedRowData[cursorRowIdx], cursorRowIdx, value);
    }
    setEditMode(false);
    focusCellElement(focusedPart, cursorRowIdx, cursorColIdx);
  };

  const cancelEditMode = () => {
    if (!editMode) {
      return;
    }
    setEditMode(false);
    if (cursorRowIdx != null && cursorColIdx != null) {
      focusCellElement(focusedPart, cursorRowIdx, cursorColIdx);
    }
  };

  const {
    selRowIdxs,
    isAllSelected,
    isAnySelected,
    selectAll,
    selectRows,
    unselectAll,
    onMouseDown: onRowSelectionMouseDown,
  } = useRowSelection(
    rowKeyGetter,
    sortedRowData,
    defaultSelectedRowIdxs,
    selectedRowIdxs,
    rowSelectionMode,
    onRowSelected,
  );

  const rangeSelection = useRangeSelection(cellSelectionMode);

  const moveCursor = useCallback(
    (part: FocusedPart, rowIdx: number, colIdx: number) => {
      if (!headerIsFocusable && part === "header") {
        console.warn(
          `Cannot move focus to the header. "headerIsFocusable" prop is false.`,
        );
        return;
      }
      setFocusedPart(part);
      colIdx = clamp(colIdx, 0, cols.length - 1);
      if (part === "body") {
        if (sortedRowData.length < 1 || cols.length < 1) {
          return;
        }
        rowIdx = clamp(rowIdx, 0, sortedRowData.length - 1);
      } else if (part === "header") {
        rowIdx = 0; // There is only one row in the header currently
      }
      setCursorRowIdx(rowIdx);
      setCursorColIdx(colIdx);
      scrollToCell(part, rowIdx, colIdx);
      focusCellElement(part, rowIdx, colIdx);
      if (part === "body") {
        rangeSelection.onCursorMove({ rowIdx, colIdx });
      }
    },
    [
      setCursorRowIdx,
      setCursorColIdx,
      sortedRowData,
      rowKeyGetter,
      cols,
      rootRef.current,
      scrollToCell,
      endEditMode,
      rangeSelection.onCursorMove,
      focusedPart,
      headerIsFocusable,
    ],
  );

  const rows = useRowModels(rowKeyGetter, sortedRowData, visRowRng);

  const isLeftRaised = scrollLeft > 0;
  const isRightRaised = scrollLeft + clientMidWidth < midWidth;
  const isHeaderRaised = scrollTop > 0;

  const resizeColumn = useCallback(
    (colIdx: number, width: number) => {
      const col = cols[colIdx];
      col.info.onWidthChanged(width);
    },
    [cols],
  );

  const onResizeHandleMouseDown = useColumnResize(cols, resizeColumn);

  const sizingContext: SizingContext = useMemo(
    () => ({
      resizeColumn,
      rowHeight,
      onResizeHandleMouseDown,
    }),
    [resizeColumn, rowHeight, onResizeHandleMouseDown],
  );

  const layoutContext: LayoutContext = useMemo(
    () => ({
      totalHeight,
      totalWidth,
      clientWidth,
      clientHeight,
    }),
    [totalHeight, totalWidth],
  );

  const editorContext: EditorContext = useMemo(
    () => ({
      initialText,
      editMode,
      startEditMode,
      endEditMode,
      cancelEditMode,
    }),
    [editMode, startEditMode, endEditMode, cancelEditMode, initialText],
  );

  const [isFocused, setFocused] = useState<boolean>(false);

  const onFocus = useCallback(() => {
    setFocused(true);
  }, []);

  const onBlur = useCallback(() => {
    setFocused(false);
  }, []);

  const cursorContext: CursorContext = useMemo(
    () => ({
      isFocused,
      cursorRowIdx,
      cursorColIdx,
      moveCursor,
      focusedPart,
      headerIsFocusable: Boolean(headerIsFocusable),
    }),
    [
      cursorRowIdx,
      cursorColIdx,
      moveCursor,
      isFocused,
      focusedPart,
      headerIsFocusable,
    ],
  );

  const onColumnMove: GridColumnMoveHandler = (
    columnId,
    fromIndex,
    toIndex,
  ) => {
    if (onColumnMoved && fromIndex !== toIndex) {
      onColumnMoved(columnId, fromIndex, toIndex);
    }
  };

  const {
    dragState,
    onColumnMoveHandleMouseDown,
    activeTarget,
    onColumnMoveCancel,
  } = useColumnMove(
    columnMove,
    rootRef,
    leftCols,
    midCols,
    rightCols,
    cols,
    scrollLeft,
    clientMidWidth,
    onColumnMove,
  );

  const columnDragContext: ColumnDragContext = useMemo(
    () => ({
      columnMove,
      onColumnMoveHandleMouseDown,
    }),
    [columnMove, onColumnMoveHandleMouseDown],
  );

  const onMouseDown: MouseEventHandler<HTMLDivElement> = (event) => {
    onRowSelectionMouseDown(event);
    rangeSelection.onCellMouseDown(event);

    const target = event.target as HTMLElement;
    try {
      const { part, rowIndex, columnIndex } = getFocusablePosition(target);
      if (part === "header" && !headerIsFocusable) {
        return;
      }
      moveCursor(part, rowIndex, columnIndex);
    } catch (e) {
      // TODO
    }
  };

  const onKeyUp: KeyboardEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      const { key } = event;
      if (key === "Shift") {
        rangeSelection.onKeyboardRangeSelectionEnd();
      }
    },
    [rangeSelection.onKeyboardRangeSelectionEnd],
  );

  const editModeKeyHandler = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const { key } = event;
      switch (key) {
        case "F2":
        case "Enter":
          startEditMode();
          break;
        case "Backspace":
          startEditMode("");
          break;
        case "Escape":
          if (editMode) {
            cancelEditMode();
            break;
          }
          return false;
        default:
          if (
            !editMode &&
            !event.ctrlKey &&
            !event.metaKey &&
            !event.altKey &&
            /^[\w\d ]$/.test(key)
          ) {
            startEditMode(key);
          } else {
            return false;
          }
      }
      event.preventDefault();
      event.stopPropagation();
      return true;
    },
    [startEditMode, editMode, cancelEditMode],
  );

  const selectionKeyHandler = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const { key } = event;
      switch (key) {
        case "Shift":
          rangeSelection.onKeyboardRangeSelectionStart({
            rowIdx: cursorRowIdx || 0,
            colIdx: cursorColIdx || 0,
          });
          break;
        case " ":
          if (focusedPart === "body") {
            if (event.ctrlKey) {
              if (cursorColIdx !== undefined) {
                rangeSelection.selectRange({
                  start: { rowIdx: 0, colIdx: cursorColIdx },
                  end: { rowIdx: sortedRowData.length, colIdx: cursorColIdx },
                });
              }
            } else {
              if (cursorRowIdx !== undefined) {
                selectRows({
                  rowIndex: cursorRowIdx,
                  isRange: false,
                  incremental: true,
                  unselectOtherRows: !event.shiftKey,
                });
              }
            }
            break;
          }
          return false;
        case "a":
          if (event.ctrlKey || event.metaKey) {
            rangeSelection.selectRange({
              start: { rowIdx: 0, colIdx: 0 },
              end: { rowIdx: sortedRowData.length, colIdx: cols.length },
            });
            selectAll();
            return true;
          }
          return false;
        default:
          return false;
      }
      event.preventDefault();
      event.stopPropagation();
      return true;
    },
    [
      rangeSelection.selectRange,
      rangeSelection.onKeyboardRangeSelectionStart,
      selectRows,
      selectAll,
      cursorColIdx,
      cursorRowIdx,
      sortedRowData.length,
      cols.length,
      focusedPart,
    ],
  );

  const clipboardKeyHandler = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const { key } = event;
      if (
        key === "c" &&
        (event.ctrlKey || event.metaKey) &&
        rangeSelection.selectedCellRange
      ) {
        const { start, end } = rangeSelection.selectedCellRange;
        const c = (x: number, y: number) => x - y;
        const [minRow, maxRow] = [start.rowIdx, end.rowIdx].sort(c);
        const [minCol, maxCol] = [start.colIdx, end.colIdx].sort(c);
        const text: string[] = [];
        for (let r = minRow; r <= maxRow; ++r) {
          const row = sortedRowData[r];
          const rowText: string[] = [];
          for (let c = minCol; c <= maxCol; ++c) {
            const col = cols[c];
            const cellValue = col?.info.props.getValue?.(row);
            rowText.push(cellValue);
          }
          text.push(rowText.join("\t"));
        }
        navigator.clipboard.writeText(text.join("\n"));
        event.preventDefault();
        event.stopPropagation();
        return true;
      }
      return false;
    },
    [rangeSelection.selectedCellRange],
  );

  const pageSize = Math.max(1, visRowRng.length - 1);

  const navigationKeyHandler = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const { key } = event;
      switch (key) {
        case "ArrowLeft":
          moveCursor(focusedPart, cursorRowIdx, (cursorColIdx || 0) - 1);
          break;
        case "ArrowRight":
          moveCursor(focusedPart, cursorRowIdx, (cursorColIdx || 0) + 1);
          break;
        case "ArrowUp":
          if (cursorRowIdx === 0 && headerIsFocusable) {
            moveCursor("header", 0, cursorColIdx);
          } else {
            moveCursor(focusedPart, (cursorRowIdx || 0) - 1, cursorColIdx);
          }
          break;
        case "ArrowDown":
          if (focusedPart === "header") {
            moveCursor("body", 0, cursorColIdx);
          } else {
            moveCursor(focusedPart, (cursorRowIdx || 0) + 1, cursorColIdx);
          }
          break;
        case "PageUp":
          if (cursorRowIdx === 0 && headerIsFocusable) {
            moveCursor("header", 0, cursorColIdx);
          } else {
            moveCursor(
              focusedPart,
              (cursorRowIdx || 0) - pageSize,
              cursorColIdx,
            );
          }
          break;
        case "PageDown":
          if (focusedPart === "header") {
            moveCursor("body", 0, cursorColIdx);
          } else {
            moveCursor(
              focusedPart,
              (cursorRowIdx || 0) + pageSize,
              cursorColIdx,
            );
          }
          break;
        case "Home":
          if (!event.ctrlKey) {
            moveCursor(focusedPart, cursorRowIdx, 0);
          } else {
            moveCursor(focusedPart, 0, 0);
          }
          break;
        case "End":
          if (!event.ctrlKey) {
            moveCursor(focusedPart, cursorRowIdx, cols.length - 1);
          } else {
            moveCursor(focusedPart, sortedRowData.length - 1, cols.length - 1);
          }
          break;
        case "Tab":
          if (
            !event.ctrlKey &&
            !event.metaKey &&
            !event.altKey &&
            editMode &&
            cursorColIdx != null &&
            cursorRowIdx != null
          ) {
            if (!event.shiftKey) {
              if (cursorColIdx < cols.length - 1) {
                moveCursor(focusedPart, cursorRowIdx, cursorColIdx + 1);
              } else {
                if (cursorRowIdx < sortedRowData.length - 1) {
                  moveCursor(focusedPart, cursorRowIdx + 1, 0);
                }
              }
            } else {
              if (cursorColIdx > 0) {
                moveCursor(focusedPart, cursorRowIdx, cursorColIdx - 1);
              } else {
                if (cursorRowIdx > 0) {
                  moveCursor(focusedPart, cursorRowIdx - 1, cols.length - 1);
                }
              }
            }
          } else {
            return false;
          }
          break;
        case "Enter":
          if (
            editMode &&
            !event.ctrlKey &&
            !event.metaKey &&
            !event.altKey &&
            !event.shiftKey
          ) {
            if (cursorRowIdx === undefined) {
              moveCursor(focusedPart, 0, 0);
            } else {
              moveCursor(focusedPart, cursorRowIdx + 1, cursorColIdx);
            }
          } else {
            return false;
          }
          break;
        default:
          return false;
      }
      event.preventDefault();
      event.stopPropagation();
      return true;
    },
    [
      moveCursor,
      cursorRowIdx,
      cursorRowIdx,
      cols.length,
      sortedRowData.length,
      headerIsFocusable,
      pageSize,
    ],
  );

  const columnMoveKeyHandler = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const { key } = event;
      if (key === "Escape") {
        onColumnMoveCancel();
        event.preventDefault();
        event.stopPropagation();
        return true;
      }
      return false;
    },
    [],
  );

  const onKeyDown: KeyboardEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      if (cursorColIdx !== undefined && cursorRowIdx !== undefined) {
        const column = cols[cursorColIdx];
        if (column.info.props.onKeyDown) {
          column.info.props.onKeyDown(event, cursorRowIdx);
        }
      }
      if (!event.isPropagationStopped()) {
        // each handler returns true or false
        // if the event is handled and should not be handled by anything else return true
        // if the event is not handled and we should keep trying other handlers return false
        [
          navigationKeyHandler,
          clipboardKeyHandler,
          selectionKeyHandler,
          editModeKeyHandler,
          columnMoveKeyHandler,
        ].find((handler) => {
          return handler(event);
        });
      }
    },
    [
      navigationKeyHandler,
      clipboardKeyHandler,
      selectionKeyHandler,
      editModeKeyHandler,
      columnMoveKeyHandler,
    ],
  );

  const selectionContext: SelectionContext = useMemo(
    () => ({
      selRowIdxs,
      selectRows,
      isAllSelected,
      isAnySelected,
      selectAll,
      unselectAll,
      selectedCellRange: rangeSelection?.selectedCellRange,
    }),
    [
      selRowIdxs,
      selectRows,
      isAllSelected,
      isAnySelected,
      selectAll,
      unselectAll,
      rangeSelection?.selectedCellRange,
    ],
  );

  useEffect(() => {
    if (onVisibleRowRangeChange) {
      onVisibleRowRangeChange(visRowRng.start, visRowRng.end);
    }
  }, [onVisibleRowRangeChange, visRowRng]);

  return (
    <GridContext.Provider value={contextValue}>
      <LayoutContext.Provider value={layoutContext}>
        <SelectionContext.Provider value={selectionContext}>
          <ColumnDragContext.Provider value={columnDragContext}>
            <CursorContext.Provider value={cursorContext}>
              <SizingContext.Provider value={sizingContext}>
                <EditorContext.Provider value={editorContext}>
                  <ColumnDataContext.Provider value={columnDataContext}>
                    <ColumnSortContext.Provider value={columnSortContext}>
                      {props.children}
                      <div
                        className={clsx(
                          withBaseName(),
                          {
                            [withBaseName("zebra")]: zebra,
                            [withBaseName("columnSeparators")]:
                              columnSeparators,
                            [withBaseName("pinnedSeparators")]:
                              pinnedSeparators,
                            [withBaseName("primaryBackground")]:
                              variant === "primary",
                            [withBaseName("secondaryBackground")]:
                              variant === "secondary",
                          },
                          className,
                        )}
                        style={rootStyle}
                        ref={rootRef}
                        onKeyDown={onKeyDown}
                        onKeyUp={onKeyUp}
                        onMouseDown={onMouseDown}
                        onFocus={onFocus}
                        onBlur={onBlur}
                        data-name="grid-root"
                        role="grid"
                        aria-colcount={cols.length}
                        aria-rowcount={rowCount + headRowCount}
                        aria-multiselectable={rowSelectionMode === "multi"}
                      >
                        <CellMeasure setRowHeight={setRowHeight} />
                        <Scrollable
                          resizeClient={resizeClient}
                          scrollLeft={scrollLeft}
                          scrollTop={scrollTop}
                          scrollSource={scrollSource}
                          scroll={scroll}
                          scrollerRef={scrollableRef}
                          topRef={topRef}
                          rightRef={rightRef}
                          bottomRef={bottomRef}
                          leftRef={leftRef}
                          middleRef={middleRef}
                        />
                        {!hideHeader && leftCols.length > 0 && (
                          <TopLeftPart
                            onWheel={onWheel}
                            columns={leftCols}
                            columnGroups={leftGroups}
                            rightShadow={isLeftRaised}
                            bottomShadow={isHeaderRaised}
                          />
                        )}
                        {!hideHeader && (
                          <TopPart
                            columns={headVisibleColumns}
                            columnGroups={visColGrps}
                            topRef={topRef}
                            onWheel={onWheel}
                            midGap={midGap}
                            bottomShadow={isHeaderRaised}
                          />
                        )}
                        {!hideHeader && rightCols.length > 0 && (
                          <TopRightPart
                            onWheel={onWheel}
                            columns={rightCols}
                            columnGroups={rightGroups}
                            leftShadow={isRightRaised}
                            bottomShadow={isHeaderRaised}
                          />
                        )}
                        {leftCols.length > 0 && (
                          <LeftPart
                            leftRef={leftRef}
                            onWheel={onWheel}
                            columns={leftCols}
                            rows={rows}
                            rightShadow={isLeftRaised}
                            hoverOverRowKey={hoverRowKey}
                            setHoverOverRowKey={setHoverRowKey}
                            zebra={zebra}
                            getRowValidationStatus={getRowValidationStatus}
                          />
                        )}
                        <MiddlePart
                          middleRef={middleRef}
                          onWheel={onWheel}
                          columns={bodyVisibleColumns}
                          rows={rows}
                          hoverOverRowKey={hoverRowKey}
                          setHoverOverRowKey={setHoverRowKey}
                          midGap={midGap}
                          zebra={zebra}
                          getRowValidationStatus={getRowValidationStatus}
                        />
                        {rightCols.length > 0 && (
                          <RightPart
                            rightRef={rightRef}
                            onWheel={onWheel}
                            columns={rightCols}
                            rows={rows}
                            leftShadow={isRightRaised}
                            hoverOverRowKey={hoverRowKey}
                            setHoverOverRowKey={setHoverRowKey}
                            zebra={zebra}
                            getRowValidationStatus={getRowValidationStatus}
                          />
                        )}
                        <ColumnDropTarget x={activeTarget?.x} />
                        <ColumnGhost
                          columns={cols}
                          rows={rows}
                          dragState={dragState}
                          zebra={zebra}
                        />
                      </div>
                    </ColumnSortContext.Provider>
                  </ColumnDataContext.Provider>
                </EditorContext.Provider>
              </SizingContext.Provider>
            </CursorContext.Provider>
          </ColumnDragContext.Provider>
        </SelectionContext.Provider>
      </LayoutContext.Provider>
    </GridContext.Provider>
  );
};
