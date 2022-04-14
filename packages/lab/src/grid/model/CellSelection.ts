import { BehaviorSubject, combineLatest, Subject } from "rxjs";
import { RowKeyGetter } from "../Grid";
import { CellSelectionMode } from "./GridModel";
import { Column } from "./Column";

export interface CellKey {
  rowKey: string;
  rowIndex: number;
  // columnKey: string;
  columnIndex: number;
}

export interface SelectCellsEvent {
  cellKeys: CellKey[];
}

export interface ICellSelection<T> {
  readonly selectCells: (event: SelectCellsEvent) => void;
}

export class CellSelection<T> implements ICellSelection<T> {
  public readonly selectedCells$ = new BehaviorSubject<
    Map<string, Set<string>>
  >(new Map());
  private readonly cellSelectionMode$: BehaviorSubject<CellSelectionMode>;

  public readonly selectCellsEvents$ = new Subject<SelectCellsEvent>();

  public selectCells(event: SelectCellsEvent) {
    this.selectCellsEvents$.next(event);
  }

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
        // TODO
        // const newSelectedCells = new Map
      }
    });
  }
}
