import {
  BehaviorSubject,
  distinctUntilChanged,
  filter,
  map,
  Subject,
  throttleTime,
} from "rxjs";
import { ColumnDefinition } from "./ColumnDefinition";
import { ColumnGroupDefinition } from "./ColumnGroupDefinition";
import { Column } from "./Column";
import { ColumnGroup } from "./ColumnGroup";
import { Row } from "./Row";
import {
  addAutoColumnsAndGroups,
  createBodyVisibleAreaLeft,
  createBodyVisibleAreaTop,
  createBodyVisibleColumnRange,
  createBodyVisibleColumns,
  createBodyVisibleColumnWidth,
  createBottomHeight,
  createClientMiddleHeight,
  createClientMiddleWidth,
  createColumns,
  createColumnsAndColumnGroups,
  createColumnsWidth,
  createFooterRowCount,
  createHeaderRowCount,
  createHeaderVisibleAreaLeft,
  createHeaderVisibleColumnRange,
  createHeaderVisibleColumns,
  createHeaderVisibleColumnWidth,
  createIsAllEditable,
  createIsLeftRaised,
  createIsRightRaised,
  createMiddleHeight,
  createRows,
  createTopHeight,
  createTotalHeight,
  createTotalWidth,
  createVisibleColumnGroupRange,
  createVisibleColumnGroups,
  createVisibleRowRange,
} from "./streams";
import { IRowSelection, RowSelection } from "./RowSelection";
import {
  columnMove,
  hoverOverRows,
  keyboardNavigation,
  mindTheGap,
  rowCursorPosition,
  scrollToCell,
} from "./reactions";
import { ColumnDragAndDrop, IColumnDragAndDrop } from "./ColumnDragAndDrop";
import { GridScrollPosition } from "./GridScrollPosition";
import { EditMode, IEditMode } from "./EditMode";
import { createHandler, createHook, prevNextPairs } from "./utils";
import { RowKeyGetter } from "../Grid";
import { CellSelection, ICellSelection } from "./CellSelection";
import { Rng } from "./Rng";

export type KeyOfType<T, U> = {
  [P in keyof T]: T[P] extends U ? P : never;
}[keyof T];

export interface CellProps<TRowData, TCellValue = any, TColumnData = any> {}

export interface CellValueProps<TRowData, TCellValue = any, TColumnData = any> {
  column: Column<TRowData, TCellValue, TColumnData>;
  row: Row<TRowData>;
  value: TCellValue;
}

export interface HeaderValueProps<
  TRowData,
  TCellValue = any,
  TColumnData = any
> {
  column: Column<TRowData, TCellValue, TColumnData>;
}

export interface HeaderProps<TRowData> {}

export interface EditorProps<T, U> {
  // row: Row<T>;
  // column: Column<T, U>;
  // inputValue: string;
  // onChange: (inputValue: string) => void;
}

export function sum(values: number[]) {
  return values.reduce((a, v) => a + v, 0);
}

export interface CellPosition {
  rowIndex: number;
  columnIndex: number;
}

export interface ColumnResizeEvent {
  columnIndex: number;
  width: number;
}

export interface ColumnMoveEvent {
  columnIndex: number; // What to move
  newIndex: number; // and where
}

export interface ColumnsAndGroups<TRowData = any> {
  leftColumns: Column<TRowData>[];
  middleColumns: Column<TRowData>[];
  rightColumns: Column<TRowData>[];
  leftColumnGroups?: ColumnGroup<TRowData>[];
  middleColumnGroups?: ColumnGroup<TRowData>[];
  rightColumnGroups?: ColumnGroup<TRowData>[];
}

export interface GridScrollEvent {
  scrollLeft: number;
  scrollTop: number;
}

export interface GridSize {
  width: number;
  height: number;
}

export type RowSelectionMode = "single" | "multi" | "none";
export type CellSelectionMode = "single" | "multi" | "none";
export type GridBackgroundVariant = "primary" | "secondary" | "zebra";

// 1. Any component rendered within a Grid should be able to access any part of
//    the grid model. For example a checkbox column header cell needs to be able
//    to select/unselect all rows in the grid. Passing everything as props to
//    every piece of the grid is not ideal. Context can solve this problem.
//    Using the context directly is not ideal either because (2, 3)
// 2. A component should not be re-rendered on irrelevant changes in the model.
// 3. A component should not have to filter irrelevant changes. No extra effort
//    should be required to ignore things that the component doesn't use.
//    An instance of GridModel is used as the context value. The context value
//    itself doesn't change (the reference) so a component that uses the context
//    doesn't get re-rendered on context changes. It can subscribe to specific
//    streams within the context (GridModel) and re-render on updates on those
//    streams only.
// 4. The model is quite big and it is expected to grow in the future. It would
//    be nice to make it as modular as possible.
export interface IGridModel<TRowData> {
  // Parts
  readonly columnDragAndDrop: IColumnDragAndDrop<TRowData>;
  readonly editMode: IEditMode;
  readonly rowSelection: IRowSelection<TRowData>;
  readonly cellSelection: ICellSelection<TRowData>;
  // Props
  readonly setShowFooter: (showFooter?: boolean) => void;
  readonly setShowTree: (showTree?: boolean) => void;
  readonly setBackgroundVariant: (
    backgroundVariant?: GridBackgroundVariant
  ) => void;
  readonly useBackgroundVariant: () => GridBackgroundVariant | undefined;
  // TODO checkboxes can be radio buttons in single-row mode. Rename this.
  readonly setShowCheckboxes: (showCheckboxes?: boolean) => void;
  readonly setColumnDefinitions: (
    columnDefinitions?: ColumnDefinition<TRowData>[]
  ) => void;
  readonly setData: (data: TRowData[]) => void;
  readonly setColumnGroupDefinitions: (
    groupDefinitions?: ColumnGroupDefinition<TRowData>[]
  ) => void;
  readonly setOnVisibleRowRangeChange: (
    handler?: VisibleRowRangeChangeHandler
  ) => void;
  readonly setRowDividers: (rowDividers: number[]) => void;
  // Events
  readonly resize: (size: GridSize) => void;
  readonly scroll: (event: GridScrollEvent) => void;
  readonly setHoverOverRowIndex: (rowIndex?: number) => void;
  readonly moveCursor: (position: CellPosition) => void;
  readonly setRowHeight: (rowHeight: number) => void;
  readonly resizeColumn: (event: ColumnResizeEvent) => void;
  readonly onKeyDown: (event: React.KeyboardEvent) => void;
  // Other things
  readonly useShowToolbar: () => boolean | undefined;
  readonly useCursorPosition: () => CellPosition | undefined;
  readonly useIsLeftRaised: () => boolean | undefined;
  readonly useIsRightRaised: () => boolean | undefined;
  // Layout (heights, widths and scrolls)
  readonly useRowHeight: () => number;
  readonly useLeftWidth: () => number;
  readonly useRightWidth: () => number;
  readonly useTopHeight: () => number;
  readonly useBottomHeight: () => number;
  readonly useTotalHeight: () => number;
  readonly useTotalWidth: () => number;
  readonly useBodyVisibleColumnWidth: () => number;
  readonly useBodyVisibleAreaLeft: () => number;
  readonly useBodyVisibleAreaTop: () => number;
  readonly useHeaderVisibleAreaLeft: () => number;
  readonly useHeaderVisibleColumnWidth: () => number;
  readonly useScrollPosition: () => GridScrollPosition;
  // Columns and rows
  readonly useLeftColumns: () => Column<TRowData>[];
  readonly useRightColumns: () => Column<TRowData>[];
  readonly useRows: () => Row<TRowData>[];
  readonly useBodyVisibleColumns: () => Column<TRowData>[];
  readonly useHeaderVisibleColumns: () => Column<TRowData>[];
  readonly useLeftColumnGroups: () => ColumnGroup<TRowData>[] | undefined;
  readonly useRightColumnGroups: () => ColumnGroup<TRowData>[] | undefined;
  readonly useVisibleColumnGroups: () => ColumnGroup<TRowData>[] | undefined;
  readonly useIsAllEditable: () => boolean;
}

export type VisibleRowRangeChangeHandler = (
  visibleRowRange: [number, number]
) => void;

export class GridModel<TRowData = any> implements IGridModel<TRowData> {
  // Callbacks
  public readonly setOnVisibleRowRangeChange: (
    handler?: VisibleRowRangeChangeHandler
  ) => void;
  // Parts
  public readonly columnDragAndDrop: ColumnDragAndDrop<TRowData>;
  public readonly editMode: EditMode;
  public readonly rowSelection: RowSelection<TRowData>;
  public readonly cellSelection: CellSelection<TRowData>;
  // Props
  public readonly setShowFooter: (showFooter?: boolean) => void;
  public readonly setShowTree: (showTree?: boolean) => void;
  public readonly setShowCheckboxes: (showCheckboxes?: boolean) => void;
  public readonly setColumnDefinitions: (
    columnDefinitions?: ColumnDefinition<TRowData>[]
  ) => void;
  public readonly setData: (data: TRowData[]) => void;
  public readonly setColumnGroupDefinitions: (
    groupDefinitions?: ColumnGroupDefinition<TRowData>[]
  ) => void;
  public readonly setRowSelectionMode: (m: RowSelectionMode) => void;
  public readonly setCellSelectionMode: (m: CellSelectionMode) => void;
  public readonly useRowSelectionMode: () => RowSelectionMode;
  public readonly useCellSelectionMode: () => CellSelectionMode;
  public readonly setBackgroundVariant: (
    backgroundVariant?: GridBackgroundVariant
  ) => void;
  public readonly useIsFramed: () => boolean | undefined;
  public readonly setIsFramed: (isFramed: boolean | undefined) => void;
  public readonly useBackgroundVariant: () => GridBackgroundVariant | undefined;
  public readonly setRowDividers: (rowDividers: number[] | undefined) => void;
  // Events
  public readonly resize: (size: GridSize) => void;
  public readonly scroll: (event: GridScrollEvent) => void;
  public readonly setHoverOverRowIndex: (rowIndex?: number) => void;
  public readonly moveCursor: (position: CellPosition) => void;
  public readonly setRowHeight: (rowHeight: number) => void;
  public readonly resizeColumn: (event: ColumnResizeEvent) => void;
  public readonly onKeyDown: (event: React.KeyboardEvent) => void;
  // Other things
  public readonly useShowToolbar: () => boolean | undefined;
  public readonly useCursorPosition: () => CellPosition | undefined;
  public readonly useIsLeftRaised: () => boolean | undefined;
  public readonly useIsRightRaised: () => boolean | undefined;
  // Layout (heights, widths and scrolls)
  public readonly useRowHeight: () => number;
  public readonly useLeftWidth: () => number;
  public readonly useRightWidth: () => number;
  public readonly useTopHeight: () => number;
  public readonly useBottomHeight: () => number;
  public readonly useTotalHeight: () => number;
  public readonly useTotalWidth: () => number;
  public readonly useBodyVisibleColumnWidth: () => number;
  public readonly useBodyVisibleAreaLeft: () => number;
  public readonly useBodyVisibleAreaTop: () => number;
  public readonly useHeaderVisibleAreaLeft: () => number;
  public readonly useHeaderVisibleColumnWidth: () => number;
  public readonly useScrollPosition: () => GridScrollPosition;
  // Columns and rows
  public readonly useLeftColumns: () => Column<TRowData>[];
  public readonly useRightColumns: () => Column<TRowData>[];
  public readonly useRows: () => Row<TRowData>[];
  public readonly useBodyVisibleColumns: () => Column<TRowData>[];
  public readonly useHeaderVisibleColumns: () => Column<TRowData>[];
  public readonly useLeftColumnGroups: () =>
    | ColumnGroup<TRowData>[]
    | undefined;
  public readonly useRightColumnGroups: () =>
    | ColumnGroup<TRowData>[]
    | undefined;
  public readonly useVisibleColumnGroups: () =>
    | ColumnGroup<TRowData>[]
    | undefined;
  public readonly useIsAllEditable: () => boolean;

  public readonly visibleRowRange$: BehaviorSubject<Rng>;

  public constructor(getKey: RowKeyGetter<TRowData>) {
    const clientSize$ = new BehaviorSubject<GridSize>({
      width: 0,
      height: 0,
    });
    const resizeEvents$ = new Subject<GridSize>();
    const clientWidth$ = new BehaviorSubject<number>(0);
    const clientHeight$ = new BehaviorSubject<number>(0);
    const scrollEvents$ = new Subject<GridScrollEvent>();
    const scrollPosition$ = new BehaviorSubject<GridScrollPosition>(
      new GridScrollPosition(0, 0, "model")
    );
    const scrollLeft$ = new BehaviorSubject<number>(0);
    const scrollTop$ = new BehaviorSubject<number>(0);
    const columnDefinitions$ = new BehaviorSubject<
      ColumnDefinition<TRowData>[] | undefined
    >([]);
    const data$ = new BehaviorSubject<TRowData[]>([]);
    const backgroundVariant$ = new BehaviorSubject<
      GridBackgroundVariant | undefined
    >(undefined);
    const isFramed$ = new BehaviorSubject<boolean | undefined>(undefined);
    const rowDividers$ = new BehaviorSubject<number[] | undefined>(undefined);

    // TODO consider extracting these into a selection model class
    const rowSelectionMode$ = new BehaviorSubject<RowSelectionMode>("single");
    const cellSelectionMode$ = new BehaviorSubject<CellSelectionMode>("none");
    const showCheckboxes$ = new BehaviorSubject<boolean | undefined>(undefined);

    const columnGroupDefinitions$ = new BehaviorSubject<
      ColumnGroupDefinition<TRowData>[] | undefined
    >(undefined);
    const showFooter$ = new BehaviorSubject<boolean | undefined>(undefined);
    const showTree$ = new BehaviorSubject<boolean | undefined>(undefined);

    const showToolbar$ = new BehaviorSubject<boolean | undefined>(undefined);
    const hoverOverRowIndex$ = new BehaviorSubject<number | undefined>(
      undefined
    );
    const cursorPosition$ = new BehaviorSubject<CellPosition | undefined>(
      undefined
    );
    const moveCursorEvents$ = new Subject<CellPosition>();
    const rowHeight$ = new BehaviorSubject<number>(25);
    const columnResizeEvents$ = new Subject<ColumnResizeEvent>();
    const columnMoveEvents$ = new Subject<ColumnMoveEvent>();
    const scrollToCellEvents$ = new Subject<CellPosition>();
    const leftColumns$ = new BehaviorSubject<Column<TRowData>[]>([]);
    const middleColumns$ = new BehaviorSubject<Column<TRowData>[]>([]);
    const rightColumns$ = new BehaviorSubject<Column<TRowData>[]>([]);

    const leftWidth$ = createColumnsWidth(leftColumns$);
    const middleWidth$ = createColumnsWidth(middleColumns$);
    const rightWidth$ = createColumnsWidth(rightColumns$);

    const leftColumnGroups$ = new BehaviorSubject<
      ColumnGroup<TRowData>[] | undefined
    >(undefined);
    const middleColumnGroups$ = new BehaviorSubject<
      ColumnGroup<TRowData>[] | undefined
    >(undefined);
    const rightColumnGroups$ = new BehaviorSubject<
      ColumnGroup<TRowData>[] | undefined
    >(undefined);

    // TODO replace columnGroupDefinitions by columnGroups. There may be auto-groups
    const headerRowCount$ = createHeaderRowCount(
      columnGroupDefinitions$,
      showToolbar$
    );
    const footerRowCount$ = createFooterRowCount(showFooter$);

    const topHeight$ = createTopHeight(rowHeight$, headerRowCount$);
    const middleHeight$ = createMiddleHeight(data$, rowHeight$);
    const bottomHeight$ = createBottomHeight(rowHeight$, footerRowCount$);
    const totalHeight$ = createTotalHeight(
      topHeight$,
      middleHeight$,
      bottomHeight$
    );
    const totalWidth$ = createTotalWidth(leftWidth$, middleWidth$, rightWidth$);
    const clientMiddleHeight$ = createClientMiddleHeight(
      clientHeight$,
      topHeight$,
      bottomHeight$
    );
    const clientMiddleWidth$ = createClientMiddleWidth(
      clientWidth$,
      leftWidth$,
      rightWidth$
    );
    // Columns and groups specified by the user explicitly.
    const userColumnsAndGroups$ = createColumnsAndColumnGroups(
      columnDefinitions$,
      columnGroupDefinitions$
    );
    // User columns and groups + automatic columns (row selection column with checkboxes etc)
    const columnsAndGroups$ = addAutoColumnsAndGroups(
      userColumnsAndGroups$,
      showCheckboxes$,
      rowSelectionMode$
    );
    const columns$ = createColumns(columnsAndGroups$);

    const visibleColumnGroupRange$ = createVisibleColumnGroupRange(
      middleColumnGroups$,
      scrollLeft$,
      clientMiddleWidth$
    );
    const bodyVisibleColumnRange$ = createBodyVisibleColumnRange(
      middleColumns$,
      scrollLeft$,
      clientMiddleWidth$
    );
    const bodyVisibleColumns$ = createBodyVisibleColumns(
      middleColumns$,
      bodyVisibleColumnRange$
    );

    const headerVisibleColumnRange$ = createHeaderVisibleColumnRange(
      visibleColumnGroupRange$,
      middleColumnGroups$,
      bodyVisibleColumnRange$
    );
    const headerVisibleColumns$ = createHeaderVisibleColumns(
      middleColumns$,
      headerVisibleColumnRange$
    );

    const visibleColumnGroups$ = createVisibleColumnGroups(
      middleColumnGroups$,
      visibleColumnGroupRange$
    );
    const keyboardEvents$ = new Subject<React.KeyboardEvent>();
    const visibleRowRange$ = createVisibleRowRange(
      scrollTop$,
      clientMiddleHeight$,
      rowHeight$,
      data$
    );

    const bodyVisibleColumnWidth$ =
      createBodyVisibleColumnWidth(bodyVisibleColumns$);

    const headerVisibleColumnWidth$ = createHeaderVisibleColumnWidth(
      headerVisibleColumns$
    );

    const bodyVisibleAreaLeft$ = createBodyVisibleAreaLeft(
      middleColumns$,
      bodyVisibleColumnRange$,
      leftWidth$
    );

    const bodyVisibleAreaTop$ = createBodyVisibleAreaTop(
      rowHeight$,
      visibleRowRange$,
      topHeight$
    );

    const headerVisibleAreaLeft$ = createHeaderVisibleAreaLeft(
      middleColumns$,
      headerVisibleColumnRange$,
      leftWidth$
    );

    this.rowSelection = new RowSelection<TRowData>(
      data$,
      getKey,
      rowSelectionMode$
    );
    this.cellSelection = new CellSelection<TRowData>(
      data$,
      getKey,
      cellSelectionMode$,
      columns$
    );

    // TODO
    this.editMode = new EditMode();
    cursorPosition$.pipe(distinctUntilChanged()).subscribe((cursorPosition) => {
      this.editMode.isActive$.next(false);
    });

    const rows$ = createRows<TRowData>(
      getKey,
      data$,
      visibleRowRange$,
      this.rowSelection,
      this.cellSelection,
      cursorPosition$,
      this.editMode,
      backgroundVariant$,
      rowDividers$
    );

    const isLeftRaised$ = createIsLeftRaised(scrollLeft$);
    const isRightRaised$ = createIsRightRaised(
      scrollLeft$,
      clientMiddleWidth$,
      middleWidth$
    );

    const isAllEditable$ = createIsAllEditable(columns$);

    const onVisibleRowRangeChange$ = new BehaviorSubject<
      VisibleRowRangeChangeHandler | undefined
    >(undefined);

    // Interface implementation
    this.useRowHeight = createHook(rowHeight$);
    this.resize = createHandler(resizeEvents$);
    this.scroll = createHandler(scrollEvents$);
    this.useScrollPosition = createHook(scrollPosition$);
    this.columnDragAndDrop = new ColumnDragAndDrop(
      columnsAndGroups$,
      scrollLeft$,
      clientMiddleWidth$,
      columnMoveEvents$
    );
    this.setColumnDefinitions = createHandler(columnDefinitions$);
    this.setData = createHandler(data$);
    this.setColumnGroupDefinitions = createHandler(columnGroupDefinitions$);
    this.setShowFooter = createHandler(showFooter$);
    this.setShowTree = createHandler(showTree$);
    this.setShowCheckboxes = createHandler(showCheckboxes$);
    this.useShowToolbar = createHook(showToolbar$);
    this.setHoverOverRowIndex = createHandler(hoverOverRowIndex$);
    this.useCursorPosition = createHook(cursorPosition$);
    this.moveCursor = createHandler(moveCursorEvents$);
    this.setRowHeight = createHandler(rowHeight$);
    this.resizeColumn = createHandler(columnResizeEvents$);
    this.useLeftWidth = createHook(leftWidth$);
    this.useRightWidth = createHook(rightWidth$);
    this.useTopHeight = createHook(topHeight$);
    this.useBottomHeight = createHook(bottomHeight$);
    this.useTotalHeight = createHook(totalHeight$);
    this.useTotalWidth = createHook(totalWidth$);
    this.useLeftColumns = createHook(leftColumns$);
    this.useRightColumns = createHook(rightColumns$);
    this.useBodyVisibleColumns = createHook(bodyVisibleColumns$);
    this.useHeaderVisibleColumns = createHook(headerVisibleColumns$);
    this.useLeftColumnGroups = createHook(leftColumnGroups$);
    this.useRightColumnGroups = createHook(rightColumnGroups$);
    this.useVisibleColumnGroups = createHook(visibleColumnGroups$);
    this.onKeyDown = createHandler(keyboardEvents$);
    this.useBodyVisibleColumnWidth = createHook(bodyVisibleColumnWidth$);
    this.useHeaderVisibleColumnWidth = createHook(headerVisibleColumnWidth$);
    this.useBodyVisibleAreaLeft = createHook(bodyVisibleAreaLeft$);
    this.useBodyVisibleAreaTop = createHook(bodyVisibleAreaTop$);
    this.useHeaderVisibleAreaLeft = createHook(headerVisibleAreaLeft$);
    this.useRows = createHook(rows$);
    this.useIsLeftRaised = createHook(isLeftRaised$);
    this.useIsRightRaised = createHook(isRightRaised$);
    this.useIsAllEditable = createHook(isAllEditable$);
    this.setRowSelectionMode = createHandler(rowSelectionMode$);
    this.setCellSelectionMode = createHandler(cellSelectionMode$);
    this.useRowSelectionMode = createHook(rowSelectionMode$);
    this.useCellSelectionMode = createHook(cellSelectionMode$);
    this.setOnVisibleRowRangeChange = createHandler(onVisibleRowRangeChange$);
    this.setBackgroundVariant = createHandler(backgroundVariant$);
    this.useBackgroundVariant = createHook(backgroundVariant$);
    this.useIsFramed = createHook(isFramed$);
    this.setIsFramed = createHandler(isFramed$);
    this.setRowDividers = createHandler(rowDividers$);

    this.visibleRowRange$ = visibleRowRange$;

    scrollPosition$
      .pipe(
        map((p) => p.scrollTop),
        distinctUntilChanged()
      )
      .subscribe((scrollTop) => scrollTop$.next(scrollTop));

    scrollPosition$
      .pipe(
        map((p) => p.scrollLeft),
        distinctUntilChanged()
      )
      .subscribe((scrollLeft) => scrollLeft$.next(scrollLeft));

    columnsAndGroups$.subscribe((x) => {
      leftColumns$.next(x.leftColumns);
      middleColumns$.next(x.middleColumns);
      rightColumns$.next(x.rightColumns);
      leftColumnGroups$.next(x.leftColumnGroups);
      middleColumnGroups$.next(x.middleColumnGroups);
      rightColumnGroups$.next(x.rightColumnGroups);
    });

    columnResizeEvents$.pipe(throttleTime(50)).subscribe((columnResize) => {
      const { columnIndex, width } = columnResize;
      const column = columns$.getValue()[columnIndex];
      column.width$.next(width);
    });

    mindTheGap(
      clientMiddleWidth$,
      middleWidth$,
      columnResizeEvents$,
      columnsAndGroups$
    );

    hoverOverRows(hoverOverRowIndex$, rows$);
    rowCursorPosition(cursorPosition$, rows$);
    columnMove(columnMoveEvents$, columnsAndGroups$);

    moveCursorEvents$.subscribe((x) => {
      cursorPosition$.next(x);
      scrollToCellEvents$.next(x);
    });

    keyboardNavigation(
      keyboardEvents$,
      cursorPosition$,
      columns$,
      data$,
      moveCursorEvents$
    );

    scrollToCell(
      scrollToCellEvents$,
      visibleRowRange$,
      rowHeight$,
      clientMiddleWidth$,
      clientMiddleHeight$,
      middleColumns$,
      bodyVisibleColumnRange$,
      scrollPosition$
    );

    scrollEvents$.subscribe((event) => {
      scrollPosition$.next(
        new GridScrollPosition(event.scrollLeft, event.scrollTop, "ui")
      );
    });

    resizeEvents$.subscribe((size) => {
      clientSize$.next(size);
    });

    clientSize$
      .pipe(
        map((size) => size.width),
        distinctUntilChanged()
      )
      .subscribe(clientWidth$);

    clientSize$
      .pipe(
        map((size) => size.height),
        distinctUntilChanged()
      )
      .subscribe(clientHeight$);

    visibleRowRange$.subscribe((visibleRowRange) => {
      const currentHandler = onVisibleRowRangeChange$.getValue();
      if (currentHandler) {
        const { start, end } = visibleRowRange;
        currentHandler([start, end]);
      }
    });

    onVisibleRowRangeChange$
      .pipe(
        prevNextPairs(),
        filter(([prev, next]) => prev == null && next != null),
        map(([prev, next]) => next)
      )
      .subscribe((onVisibleRowRangeChange) => {
        const { start, end } = visibleRowRange$.getValue();
        onVisibleRowRangeChange!([start, end]);
      });
  }
}
