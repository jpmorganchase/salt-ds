import {
  BehaviorSubject,
  distinctUntilChanged,
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
  createBodyVisibleAreaLeft,
  createBodyVisibleAreaTop,
  createBodyVisibleColumnRange,
  createBodyVisibleColumns,
  createBodyVisibleColumnWidth,
  createBottomHeight,
  createClientMiddleHeight,
  createClientMiddleWidth,
  createColumnGroups,
  createColumns,
  createColumnsAndColumnGroups,
  createColumnsWidth,
  createFooterRowCount,
  createHeaderRowCount,
  createHeaderVisibleAreaLeft,
  createHeaderVisibleColumnRange,
  createHeaderVisibleColumns,
  createHeaderVisibleColumnWidth,
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
import { createHandler, createHook } from "./utils";

export type KeyOfType<T, U> = {
  [P in keyof T]: T[P] extends U ? P : never;
}[keyof T];

export interface CellProps<T, U = any> {}

export interface CellValueProps<T, U = any> {
  column: Column<T, U>;
  row: Row<T>;
  value: U;
}

export interface HeaderValueProps<T, U = any> {
  column: Column<T, U>;
}

export interface HeaderProps<T> {}

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

export interface ColumnsAndGroups<T = any> {
  leftColumns: Column<T>[];
  middleColumns: Column<T>[];
  rightColumns: Column<T>[];
  leftColumnGroups?: ColumnGroup<T>[];
  middleColumnGroups?: ColumnGroup<T>[];
  rightColumnGroups?: ColumnGroup<T>[];
}

export interface GridScrollEvent {
  scrollLeft: number;
  scrollTop: number;
}

export interface GridSize {
  width: number;
  height: number;
}

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
export interface IGridModel<T> {
  // Parts
  readonly columnDragAndDrop: IColumnDragAndDrop<T>;
  readonly editMode: IEditMode;
  readonly rowSelection: IRowSelection<T>;
  // Props
  readonly setShowFooter: (showFooter?: boolean) => void;
  readonly setShowTree: (showTree?: boolean) => void;
  readonly setShowCheckboxes: (showCheckboxes?: boolean) => void;
  readonly setColumnDefinitions: (
    columnDefinitions?: ColumnDefinition<T>[]
  ) => void;
  readonly setData: (data: T[]) => void;
  readonly setColumnGroupDefinitions: (
    groupDefinitions?: ColumnGroupDefinition<T>[]
  ) => void;
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
  readonly useLeftColumns: () => Column<T>[];
  readonly useRightColumns: () => Column<T>[];
  readonly useRows: () => Row<T>[];
  readonly useBodyVisibleColumns: () => Column<T>[];
  readonly useHeaderVisibleColumns: () => Column<T>[];
  readonly useLeftColumnGroups: () => ColumnGroup<T>[] | undefined;
  readonly useRightColumnGroups: () => ColumnGroup<T>[] | undefined;
  readonly useVisibleColumnGroups: () => ColumnGroup<T>[] | undefined;
}

export class GridModel<T = any> implements IGridModel<T> {
  // Parts
  public readonly columnDragAndDrop: ColumnDragAndDrop<T>;
  public readonly editMode: EditMode;
  public readonly rowSelection: RowSelection<T>;
  // Props
  public readonly setShowFooter: (showFooter?: boolean) => void;
  public readonly setShowTree: (showTree?: boolean) => void;
  public readonly setShowCheckboxes: (showCheckboxes?: boolean) => void;
  public readonly setColumnDefinitions: (
    columnDefinitions?: ColumnDefinition<T>[]
  ) => void;
  public readonly setData: (data: T[]) => void;
  public readonly setColumnGroupDefinitions: (
    groupDefinitions?: ColumnGroupDefinition<T>[]
  ) => void;
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
  public readonly useLeftColumns: () => Column<T>[];
  public readonly useRightColumns: () => Column<T>[];
  public readonly useRows: () => Row<T>[];
  public readonly useBodyVisibleColumns: () => Column<T>[];
  public readonly useHeaderVisibleColumns: () => Column<T>[];
  public readonly useLeftColumnGroups: () => ColumnGroup<T>[] | undefined;
  public readonly useRightColumnGroups: () => ColumnGroup<T>[] | undefined;
  public readonly useVisibleColumnGroups: () => ColumnGroup<T>[] | undefined;

  public constructor(getKey: (x: T) => string) {
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
      ColumnDefinition<T>[] | undefined
    >([]);
    const data$ = new BehaviorSubject<T[]>([]);
    const columnGroupDefinitions$ = new BehaviorSubject<
      ColumnGroupDefinition<T>[] | undefined
    >(undefined);
    const showFooter$ = new BehaviorSubject<boolean | undefined>(undefined);
    const showTree$ = new BehaviorSubject<boolean | undefined>(undefined);
    const showCheckboxes$ = new BehaviorSubject<boolean | undefined>(undefined);
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
    const leftColumns$ = new BehaviorSubject<Column<T>[]>([]);
    const middleColumns$ = new BehaviorSubject<Column<T>[]>([]);
    const rightColumns$ = new BehaviorSubject<Column<T>[]>([]);

    const leftWidth$ = createColumnsWidth(leftColumns$);
    const middleWidth$ = createColumnsWidth(middleColumns$);
    const rightWidth$ = createColumnsWidth(rightColumns$);

    const leftColumnGroups$ = new BehaviorSubject<ColumnGroup<T>[] | undefined>(
      undefined
    );
    const middleColumnGroups$ = new BehaviorSubject<
      ColumnGroup<T>[] | undefined
    >(undefined);
    const rightColumnGroups$ = new BehaviorSubject<
      ColumnGroup<T>[] | undefined
    >(undefined);

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
    const columnsAndGroups$ = createColumnsAndColumnGroups(
      columnDefinitions$,
      columnGroupDefinitions$
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

    this.rowSelection = new RowSelection<T>(data$, getKey);

    const rows$ = createRows<T>(
      getKey,
      data$,
      visibleRowRange$,
      this.rowSelection,
      cursorPosition$
    );

    const isLeftRaised$ = createIsLeftRaised(scrollLeft$);
    const isRightRaised$ = createIsRightRaised(
      scrollLeft$,
      clientMiddleWidth$,
      middleWidth$
    );

    // Interface implementation
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
    this.editMode = new EditMode();
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

    columnsAndGroups$.subscribe((x) =>
      console.log(
        `columns: ${x.leftColumns.map((c) => c.key)} | ${x.middleColumns.map(
          (c) => c.key
        )} | ${x.rightColumns.map((c) => c.key)}`
      )
    );

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
  }
}
