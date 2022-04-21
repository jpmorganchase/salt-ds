import { BehaviorSubject, distinctUntilChanged, Subject } from "rxjs";
import { RowKeyGetter } from "../Grid";
import { CellSelectionMode } from "./GridModel";
import { Column } from "./Column";
import { createHandler, createHook } from "./utils";

export interface CellKey {
  rowKey: string;
  rowIndex: number;
  // columnKey: string;
  columnIndex: number;
}

export interface SelectCellsEvent {
  clearPrevious?: boolean;
  cellKeys: CellKey[];
}

export interface RangeSelectEvent {
  cellKey: CellKey;
}

export interface ICellSelection<T> {
  readonly selectCells: (event: SelectCellsEvent) => void;
  readonly selectionStart: (event: RangeSelectEvent) => void;
  readonly selectionMove: (event: RangeSelectEvent) => void;
  readonly selectionEnd: (event: RangeSelectEvent) => void;
  readonly useIsRangeSelectionInProgress: () => boolean;
}

export class CellSelection<T> implements ICellSelection<T> {
  public readonly selectedCells$ = new BehaviorSubject<
    Map<string, Set<string>>
  >(new Map());
  private readonly cellSelectionMode$: BehaviorSubject<CellSelectionMode>;

  public readonly selectCellsEvents$ = new Subject<SelectCellsEvent>();
  public readonly rangeSelectionStart$ = new Subject<RangeSelectEvent>();
  private lastRangeSelectionStart?: CellKey;
  public readonly rangeSelectionMove$ = new Subject<RangeSelectEvent>();
  public readonly rangeSelectionEnd$ = new Subject<RangeSelectEvent>();
  public readonly isRangeSelectionInProgress$ = new BehaviorSubject<boolean>(
    false
  );

  public selectCells(event: SelectCellsEvent) {
    this.selectCellsEvents$.next(event);
  }

  public readonly selectionStart = createHandler(this.rangeSelectionStart$);
  public readonly selectionMove = createHandler(this.rangeSelectionMove$);
  public readonly selectionEnd = createHandler(this.rangeSelectionEnd$);
  public readonly useIsRangeSelectionInProgress = createHook(
    this.isRangeSelectionInProgress$
  );

  public constructor(
    data$: BehaviorSubject<T[]>,
    getRowKey: RowKeyGetter<T>,
    cellSelectionMode$: BehaviorSubject<CellSelectionMode>,
    columns$: BehaviorSubject<Column<T>[]>
  ) {
    this.cellSelectionMode$ = cellSelectionMode$;

    data$.subscribe((data) => {
      // TODO update selection
      this.selectedCells$.next(new Map());
    });

    this.selectCellsEvents$.subscribe((event) => {
      const cellSelectionMode = this.cellSelectionMode$.getValue();
      if (cellSelectionMode === "single") {
        const newSelectedCells = new Map<string, Set<string>>();
        const { rowKey, columnIndex } = event.cellKeys[0];
        const columns = columns$.getValue();
        const columnKey = columns[columnIndex].key;
        newSelectedCells.set(rowKey, new Set<string>([columnKey]));
        this.selectedCells$.next(newSelectedCells);
      } else {
        const { cellKeys, clearPrevious } = event;
        const newSelectedCells = new Map<string, Set<string>>();
        const columns = columns$.getValue();
        cellKeys.forEach((cellKey) => {
          const { rowKey, columnIndex, rowIndex } = cellKey;
          const columnKey = columns[columnIndex].key;
          let rowSelection = newSelectedCells.get(rowKey);
          if (rowSelection) {
            rowSelection.add(columnKey);
          } else {
            rowSelection = new Set<string>([columnKey]);
            newSelectedCells.set(rowKey, rowSelection);
          }
        });
        this.selectedCells$.next(newSelectedCells);
      }
    });

    this.rangeSelectionStart$.subscribe((event) => {
      const { cellKey } = event;
      const { columnIndex, rowIndex, rowKey } = cellKey;
      const columns = columns$.getValue();
      const columnKey = columns[columnIndex].key;
      const newSelectedCells = new Map<string, Set<string>>();
      newSelectedCells.set(rowKey, new Set<string>([columnKey]));
      this.selectedCells$.next(newSelectedCells);
      this.lastRangeSelectionStart = cellKey;
      this.isRangeSelectionInProgress$.next(true);
    });

    this.rangeSelectionEnd$.subscribe((event) => {
      this.isRangeSelectionInProgress$.next(false);
      this.lastRangeSelectionStart = undefined;
    });

    this.rangeSelectionMove$
      .pipe(
        distinctUntilChanged(
          (prev, curr) =>
            prev.cellKey.rowKey === curr.cellKey.rowKey &&
            prev.cellKey.columnIndex === curr.cellKey.columnIndex
        )
      )
      .subscribe((event) => {
        const { cellKey } = event;
        const { columnIndex, rowIndex } = cellKey;
        const columns = columns$.getValue();
        const data = data$.getValue();
        const newSelectedCells = new Map<string, Set<string>>();
        const start = this.lastRangeSelectionStart;
        if (!start) {
          console.warn(
            `Range selection move event occurred before range selection start.`
          );
          return;
        }
        const rowRange = [start.rowIndex, rowIndex];
        if (rowRange[1] < rowRange[0]) {
          rowRange.reverse();
        }
        const columnRange = [start.columnIndex, columnIndex];
        if (columnRange[1] < columnRange[0]) {
          columnRange.reverse();
        }
        for (let r = rowRange[0]; r <= rowRange[1]; ++r) {
          const rowData = data[r];
          const rowKey = getRowKey(rowData, r);
          let rowSelection = newSelectedCells.get(rowKey);
          if (!rowSelection) {
            rowSelection = new Set<string>([rowKey]);
            newSelectedCells.set(rowKey, rowSelection);
          }
          for (let c = columnRange[0]; c <= columnRange[1]; ++c) {
            const columnKey = columns[c].key;
            rowSelection!.add(columnKey);
          }
        }
        this.selectedCells$.next(newSelectedCells);
      });
  }
}
