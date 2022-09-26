import React, {
  CSSProperties,
  KeyboardEventHandler,
  MouseEventHandler,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  WheelEventHandler,
} from "react";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { GridColumnInfo } from "./GridColumn";
import { GridContext } from "./GridContext";
import cx from "classnames";
import {
  CellMeasure,
  clamp,
  getCellPosition,
  LeftPart,
  MiddlePart,
  PAGE_SIZE,
  RightPart,
  Scrollable,
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
  useProd,
  useRangeSelection,
  useRowIdxByKey,
  useRowModels,
  useRowSelection,
  useScrollToCell,
  useSum,
  useSumRangeWidth,
  useSumWidth,
  useVisibleColumnGroupRange,
  useVisibleRowRange,
} from "./internal";
import "./Grid.css";
import { SelectionContext } from "./SelectionContext";
import { SizingContext } from "./SizingContext";
import { LayoutContext } from "./LayoutContext";
import { EditorContext } from "./EditorContext"; // TODO remove
import { CursorContext } from "./CursorContext";
import { ColumnGroupProps } from "./ColumnGroup";
import { ColumnDragContext } from "./ColumnDragContext";
import { ColumnGhost } from "./internal/ColumnGhost";
import { ColumnDropTarget } from "./internal/ColumnDropTarget";
import { range } from "./Rng";

const withBaseName = makePrefixer("uitkGrid");

export type ColumnSeparatorType = "regular" | "none" | "groupEdge";
export type ColumnGroupRowSeparatorType = "first" | "regular" | "last";
export type ColumnGroupColumnSeparatorType = "regular" | "none";
export type GridRowSelectionMode = "single" | "multi" | "none";
export type GridCellSelectionMode = "range" | "none";

export type RowKeyGetter<T> = (row: T, index: number) => string;

export interface GridProps<T = any> {
  children: ReactNode;
  zebra?: boolean;
  hideHeader?: boolean;
  columnSeparators?: boolean;
  rowData: T[];
  rowKeyGetter?: RowKeyGetter<T>;
  defaultSelectedRowKeys?: Set<string>;
  className?: string;
  style?: CSSProperties;
  variant?: "primary" | "secondary";
  rowSelectionMode?: GridRowSelectionMode;
  onRowSelected?: (selectedRowIdxs: number[]) => void;
  columnDnD?: boolean;
  onColumnMoved?: (fromIndex: number, toIndex: number) => void;
  cellSelectionMode?: GridCellSelectionMode;
  onVisibleRowRangeChange?: (start: number, end: number) => void;
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

export const Grid = function <T>(props: GridProps<T>) {
  const {
    rowData,
    zebra,
    hideHeader,
    columnSeparators,
    className,
    style,
    rowKeyGetter = defaultRowKeyGetter,
    children,
    defaultSelectedRowKeys,
    variant = "primary",
    rowSelectionMode = "multi",
    onRowSelected,
    columnDnD,
    onColumnMoved,
    cellSelectionMode = "range",
    onVisibleRowRangeChange,
  } = props;

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

  const [clientWidth, setClientWidth] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);
  const [scrollBarHeight, setScrollBarHeight] = useState(0);
  const [scrollBarWidth, setScrollBarWidth] = useState(0);

  const [rowHeight, setRowHeight] = useState<number>(0);

  const [cursorRowIdx, setCursorRowIdx] = useState<number | undefined>(
    undefined
  );
  const [cursorColIdx, setCursorColIdx] = useState<number | undefined>(
    undefined
  );

  const [editMode, setEditMode] = useState<boolean>(false);

  const resizeClient = useCallback(
    (clW: number, clH: number, sbW: number, sbH: number) => {
      setClientHeight(clH);
      setClientWidth(clW);
      setScrollBarHeight(sbH);
      setScrollBarWidth(sbW);
    },
    [setClientHeight, setClientWidth, setScrollBarHeight, setScrollBarWidth]
  );

  const {
    leftCols, // Columns pinned to left
    midCols, // Scrollable columns
    rightCols, // Columns pinned to right
    leftGroups,
    midGroups,
    rightGroups,
    contextValue,
  } = useColumnRegistry(children);

  const midColsById = useMemo(
    () =>
      new Map<string, GridColumnModel<T>>(
        midCols.map((c) => [c.info.props.id, c] as [string, GridColumnModel<T>])
      ),
    [midCols]
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
  const topHeight = useProd([rowHeight, headRowCount]);
  // Height of the middle part (virtual height)
  const midHeight = useProd([rowHeight, rowCount]);
  // Height of the footer
  const botHeight = useProd([botRowCount, rowHeight]);
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
    clientMidWidth
  );

  const midGrpByColId = useMemo(() => {
    const m = new Map<string, GridColumnGroupModel>();
    for (let g of midGroups) {
      for (let c of g.childrenIds) {
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
    leftGroups.length
  );

  const visColGrps = useMemo(() => {
    return midGroups.slice(visColGrpRng.start, visColGrpRng.end);
  }, [visColGrpRng, midGroups]);

  const headVisColRng = useHeadVisibleColumnRange(
    bodyVisColRng,
    visColGrps,
    midColsById,
    leftCols.length
  );

  const bodyScrOutColWh = useLeftScrolledOutWidth(midCols, bodyVisColRng);
  const headScrOutColWh = useLeftScrolledOutWidth(midCols, headVisColRng);

  const bodyVisAreaLeft = useSum([leftWidth, bodyScrOutColWh]);
  const headVisAreaLeft = useSum([leftWidth, headScrOutColWh]);
  const clientMidHeight = useClientMidHeight(
    clientHeight,
    topHeight,
    botHeight
  );
  const visRowRng = useVisibleRowRange(
    scrollTop,
    clientMidHeight,
    rowHeight,
    rowCount
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
    ]
  );

  const onWheel: WheelEventHandler<HTMLTableElement> = useCallback(
    (event) => {
      let { deltaX, deltaY, shiftKey } = event;
      if (deltaX === 0 && shiftKey) {
        deltaX = deltaY;
        deltaY = 0;
      }
      const s = scrollableRef.current;
      if (s) {
        s.scrollLeft += deltaX;
        s.scrollTop += deltaY;
      }
    },
    [scrollableRef.current]
  );

  const cols = useMemo(
    () => [...leftCols, ...midCols, ...rightCols],
    [leftCols, midCols, rightCols]
  );

  const colIdxByKey = useMemo(
    () =>
      new Map<string, number>(cols.map((c, i) => [c.info.props.id, c.index])),
    [cols]
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
    [setScrollLeft, setScrollTop, setScrollSource]
  );

  const scrollToCell = useScrollToCell(
    visRowRng,
    rowHeight,
    clientMidHeight,
    midCols,
    bodyVisColRng,
    clientMidWidth,
    scroll
  );

  const startEditMode = (text?: string) => {
    if (editMode || cursorRowIdx == undefined || cursorColIdx == undefined) {
      return;
    }
    const r = rowData[cursorRowIdx];
    const c = cols[cursorColIdx];
    if (c.info.props.editable) {
      setEditMode(true);
    }
  };

  const endEditMode = (value: string) => {
    if (!editMode) {
      return;
    }
    if (cursorColIdx == undefined) {
      console.error(`endEditMode: cursorColIdx is undefined in edit mode`);
      return;
    }
    const c = cols[cursorColIdx];
    const handler = c.info.props.onChange;
    if (cursorRowIdx == undefined) {
      console.error(`endEditMode: cursorRowIdx is undefined in edit mode`);
      return;
    }
    if (!handler) {
      console.warn(
        `onChange is not specified for editable column "${c.info.props.id}".`
      );
    } else {
      handler(rowData[cursorRowIdx], cursorRowIdx, value);
    }
    setEditMode(false);
    if (rootRef.current) {
      rootRef.current.focus();
    }
  };

  const cancelEditMode = () => {
    if (!editMode) {
      return;
    }
    setEditMode(false);
    if (rootRef.current) {
      rootRef.current.focus();
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
    rowData,
    defaultSelectedRowKeys,
    rowSelectionMode,
    onRowSelected
  );

  const rangeSelection = useRangeSelection(cellSelectionMode);

  const moveCursor = useCallback(
    (rowIdx?: number, colIdx?: number) => {
      cancelEditMode();
      if (rowData.length < 1 || cols.length < 1) {
        return;
      }
      rowIdx = clamp(rowIdx, 0, rowData.length - 1);
      colIdx = clamp(colIdx, 0, cols.length - 1);
      setCursorRowIdx(rowIdx);
      setCursorColIdx(colIdx);
      scrollToCell(rowIdx, colIdx);
      rootRef.current?.focus();
      rangeSelection.onCursorMove({ rowIdx, colIdx });
    },
    [
      setCursorRowIdx,
      setCursorColIdx,
      rowData,
      rowKeyGetter,
      cols,
      rootRef.current,
      scrollToCell,
      endEditMode,
      rangeSelection.onCursorMove,
    ]
  );

  const rows = useRowModels(rowKeyGetter, rowData, visRowRng);

  const isLeftRaised = scrollLeft > 0;
  const isRightRaised = scrollLeft + clientMidWidth < midWidth;

  const resizeColumn = useCallback(
    (colIdx: number, width: number) => {
      const col = cols[colIdx];
      col.info.onWidthChanged(width);
    },
    [cols]
  );

  const onResizeHandleMouseDown = useColumnResize(resizeColumn);

  const sizingContext: SizingContext = useMemo(
    () => ({
      resizeColumn,
      rowHeight,
      onResizeHandleMouseDown,
    }),
    [resizeColumn, rowHeight, onResizeHandleMouseDown]
  );

  const layoutContext: LayoutContext = useMemo(
    () => ({
      totalHeight,
      totalWidth,
      clientWidth,
      clientHeight,
    }),
    [totalHeight, totalWidth]
  );

  const editorContext: EditorContext = useMemo(
    () => ({
      editMode,
      startEditMode,
      endEditMode,
      cancelEditMode,
    }),
    [editMode, startEditMode, endEditMode, cancelEditMode]
  );

  const cursorContext: CursorContext = useMemo(
    () => ({
      cursorRowIdx,
      cursorColIdx,
      moveCursor,
    }),
    [cursorRowIdx, cursorColIdx, moveCursor]
  );

  const onColumnMove = (fromIndex: number, toIndex: number) => {
    if (onColumnMoved && fromIndex !== toIndex) {
      onColumnMoved(fromIndex, toIndex);
    }
  };

  const { dragState, onColumnMoveHandleMouseDown, activeTarget } =
    useColumnMove(
      columnDnD,
      rootRef,
      leftCols,
      midCols,
      rightCols,
      scrollLeft,
      clientMidWidth,
      onColumnMove
    );

  const columnDragContext: ColumnDragContext = useMemo(
    () => ({
      columnDnD,
      onColumnMoveHandleMouseDown,
    }),
    [columnDnD, onColumnMoveHandleMouseDown]
  );

  const onMouseDown: MouseEventHandler<HTMLDivElement> = (event) => {
    onRowSelectionMouseDown(event);
    rangeSelection.onCellMouseDown(event);

    const target = event.target as HTMLElement;
    try {
      const [rowIdx, colIdx] = getCellPosition(target);
      if (colIdx >= 0) {
        moveCursor(rowIdx, colIdx);
      }
      // event.preventDefault();
      // event.stopPropagation();
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
    [rangeSelection.onKeyboardRangeSelectionEnd]
  );

  const onKeyDown: KeyboardEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      const { key } = event;
      // console.log(`onKeyDown. key: ${event.key}`);

      if (key === "Shift") {
        rangeSelection.onKeyboardRangeSelectionStart({
          rowIdx: cursorRowIdx || 0,
          colIdx: cursorColIdx || 0,
        });
        return;
      }
      if (key === "ArrowLeft") {
        moveCursor(cursorRowIdx, (cursorColIdx || 0) - 1);
        return;
      }
      if (key === "ArrowRight") {
        moveCursor(cursorRowIdx, (cursorColIdx || 0) + 1);
        return;
      }
      if (key === "ArrowUp") {
        moveCursor((cursorRowIdx || 0) - 1, cursorColIdx);
        return;
      }
      if (key === "ArrowDown") {
        moveCursor((cursorRowIdx || 0) + 1, cursorColIdx);
        return;
      }
      if (key === "PageUp") {
        moveCursor((cursorRowIdx || 0) - PAGE_SIZE, cursorColIdx);
        return;
      }
      if (key === "PageDown") {
        moveCursor((cursorRowIdx || 0) + PAGE_SIZE, cursorColIdx);
        return;
      }
      if (key === "Home") {
        if (!event.ctrlKey) {
          moveCursor(cursorRowIdx, 0);
        } else {
          moveCursor(0, 0);
        }
        return;
      }
      if (key === "End") {
        if (!event.ctrlKey) {
          moveCursor(cursorRowIdx, cols.length - 1);
        } else {
          moveCursor(rowData.length - 1, cols.length - 1);
        }
        return;
      }
      if (key === "F2" || key === "Backspace") {
        startEditMode();
        return;
      }
      if (key === "Tab") {
        if (!event.ctrlKey && !event.metaKey && !event.altKey) {
          if (cursorColIdx == undefined || cursorRowIdx == undefined) {
            moveCursor(0, 0);
          } else {
            if (!event.shiftKey) {
              if (cursorColIdx < cols.length - 1) {
                moveCursor(cursorRowIdx, cursorColIdx + 1);
              } else {
                if (cursorRowIdx < rowData.length - 1) {
                  moveCursor(cursorRowIdx + 1, 0);
                }
              }
            } else {
              if (cursorColIdx > 0) {
                moveCursor(cursorRowIdx, cursorColIdx - 1);
              } else {
                if (cursorRowIdx > 0) {
                  moveCursor(cursorRowIdx - 1, cols.length - 1);
                }
              }
            }
          }
          event.preventDefault();
          event.stopPropagation();
          return;
        }
      }
      if (key === "Enter") {
        if (
          !event.ctrlKey &&
          !event.metaKey &&
          !event.altKey &&
          !event.shiftKey
        ) {
          if (cursorRowIdx == undefined) {
            moveCursor(0, 0);
          } else {
            moveCursor(cursorRowIdx + 1, cursorColIdx);
          }
          event.preventDefault();
          event.stopPropagation();
          return;
        }
      }
      if (key === "Escape") {
        cancelEditMode();
        return;
      }
      if (key === " ") {
        if (cursorRowIdx != undefined) {
          selectRows(cursorRowIdx, event.shiftKey, event.metaKey);
        }
        return;
      }
      if (
        !editMode &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        /^[\w\d ]$/.test(key)
      ) {
        startEditMode("");
        return;
      }
      if (key === "c" && (event.ctrlKey || event.metaKey)) {
        if (!rangeSelection.selectedCellRange) {
          return;
        }
        const { start, end } = rangeSelection.selectedCellRange;
        const c = (x: number, y: number) => x - y;
        const [minRow, maxRow] = [start.rowIdx, end.rowIdx].sort(c);
        const [minCol, maxCol] = [start.colIdx, end.colIdx].sort(c);
        const text: string[] = [];
        for (let r = minRow; r <= maxRow; ++r) {
          const row = rowData[r];
          const rowText: string[] = [];
          for (let c = minCol; c <= maxCol; ++c) {
            const col = cols[c]!;
            const cellValue = col.info.props.getValue!(row);
            rowText.push(cellValue);
          }
          text.push(rowText.join("\t"));
        }
        navigator.clipboard.writeText(text.join("\n"));
        return;
      }
      // TODO Ctrl + D copies from the first cell to the selection down
      // TODO Ctrl + R copies from the first cell to the selection right
      console.log(`onKeyDown unhandled. key=${key}`);
    },
    [cursorRowIdx, cursorColIdx, moveCursor, startEditMode, rowData, cols]
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
    ]
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
                  {props.children}
                  <div
                    className={cx(
                      withBaseName(),
                      {
                        [withBaseName("zebra")]: zebra,
                        [withBaseName("columnSeparators")]: columnSeparators,
                        [withBaseName("primaryBackground")]:
                          variant === "primary",
                        [withBaseName("secondaryBackground")]:
                          variant === "secondary",
                      },
                      className
                    )}
                    style={rootStyle}
                    ref={rootRef}
                    tabIndex={0}
                    onKeyDown={onKeyDown}
                    onKeyUp={onKeyUp}
                    onMouseDown={onMouseDown}
                    // onCopy={onCopy}
                    data-name="grid-root"
                    role="grid"
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
                    <MiddlePart
                      middleRef={middleRef}
                      onWheel={onWheel}
                      columns={bodyVisibleColumns}
                      rows={rows}
                      hoverOverRowKey={hoverRowKey}
                      setHoverOverRowKey={setHoverRowKey}
                      midGap={midGap}
                      zebra={zebra}
                    />
                    {!hideHeader && (
                      <TopPart
                        columns={headVisibleColumns}
                        columnGroups={visColGrps}
                        topRef={topRef}
                        onWheel={onWheel}
                        midGap={midGap}
                      />
                    )}
                    <LeftPart
                      leftRef={leftRef}
                      onWheel={onWheel}
                      columns={leftCols}
                      rows={rows}
                      isRaised={isLeftRaised}
                      hoverOverRowKey={hoverRowKey}
                      setHoverOverRowKey={setHoverRowKey}
                      zebra={zebra}
                    />
                    <RightPart
                      rightRef={rightRef}
                      onWheel={onWheel}
                      columns={rightCols}
                      rows={rows}
                      isRaised={isRightRaised}
                      hoverOverRowKey={hoverRowKey}
                      setHoverOverRowKey={setHoverRowKey}
                      zebra={zebra}
                    />
                    {!hideHeader && (
                      <TopLeftPart
                        onWheel={onWheel}
                        columns={leftCols}
                        columnGroups={leftGroups}
                        isRaised={isLeftRaised}
                      />
                    )}
                    {!hideHeader && (
                      <TopRightPart
                        onWheel={onWheel}
                        columns={rightCols}
                        columnGroups={rightGroups}
                        isRaised={isRightRaised}
                      />
                    )}
                    <ColumnGhost
                      columns={cols}
                      rows={rows}
                      dragState={dragState}
                    />
                    <ColumnDropTarget x={activeTarget?.x} />
                  </div>
                </EditorContext.Provider>
              </SizingContext.Provider>
            </CursorContext.Provider>
          </ColumnDragContext.Provider>
        </SelectionContext.Provider>
      </LayoutContext.Provider>
    </GridContext.Provider>
  );
};
