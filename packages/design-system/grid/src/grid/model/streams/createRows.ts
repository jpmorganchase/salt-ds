import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  take,
} from "rxjs";
import { Row } from "../Row";
import { Rng } from "../Rng";
import { RowSelection } from "../RowSelection";
import { CellPosition, GridBackgroundVariant } from "../GridModel";
import { RowKeyGetter } from "../../Grid";
import { CellSelection } from "../CellSelection";
import { EditMode } from "../EditMode";

export function createRows<T>(
  getKey: RowKeyGetter<T>,
  data$: BehaviorSubject<T[]>,
  visibleRowRange$: BehaviorSubject<Rng>,
  rowSelection$: RowSelection<T>,
  cellSelection$: CellSelection<T>,
  cursorPosition$: BehaviorSubject<CellPosition | undefined>,
  editMode: EditMode,
  backgroundVariant$: BehaviorSubject<GridBackgroundVariant | undefined>,
  rowDividers$: BehaviorSubject<number[] | undefined>
) {
  const rows$ = new BehaviorSubject<Row<T>[]>([]);
  const rowDividerSets$ = new BehaviorSubject<Set<number> | undefined>(
    undefined
  );

  rowDividers$
    .pipe(
      map((rowDividers) => (rowDividers ? new Set(rowDividers) : undefined))
    )
    .subscribe(rowDividerSets$);

  combineLatest([data$, visibleRowRange$])
    .pipe(
      map(([data, visibleRowRange]) => {
        const oldRows = new Map(rows$.getValue().map((row) => [row.key, row]));
        const rows: Row<T>[] = [];
        const cursor = cursorPosition$.getValue();
        const rowDividers = rowDividerSets$.getValue();
        visibleRowRange.forEach((i) => {
          const key = getKey(data[i], i);
          const oldRow = oldRows.get(key);
          if (oldRow) {
            if (oldRow.data$.getValue() !== data[i]) {
              oldRow.data$.next(data[i]);
            }
            if (oldRow.index$.getValue() !== i) {
              oldRow.index$.next(i);
            }
            rows.push(oldRow);
          } else {
            const row = new Row(key, i, data[i]);
            row.isSelected$.next(
              rowSelection$.selectedKeys$.getValue().has(row.key)
            );
            if (cursor && cursor.rowIndex === i) {
              row.cursorColumnIndex$.next(cursor.columnIndex);
            }
            row.isDivided$.next(rowDividers != null && rowDividers.has(i));
            rows.push(row);
          }
        });
        return rows;
      })
    )
    .subscribe(rows$);

  combineLatest([rows$, backgroundVariant$]).subscribe(
    ([rows, backgroundVariant]) => {
      rows.forEach((row) => {
        row.isZebra$.next(
          backgroundVariant === "zebra" && row.index$.getValue() % 2 === 0
        );
      });
    }
  );

  rowSelection$.selectedKeys$.subscribe((selectedKeys) => {
    const rows = rows$.getValue();
    rows.forEach((row) => {
      const isSelected = selectedKeys.has(row.key);
      if (row.isSelected$.getValue() !== isSelected) {
        row.isSelected$.next(isSelected);
      }
    });
  });

  cellSelection$.selectedCells$.subscribe((selectedCells) => {
    const rows = rows$.getValue();
    rows.forEach((row) => {
      const rowSelectedCells = selectedCells.get(row.key);
      row.selectedCells$.next(rowSelectedCells);
    });
  });

  rowDividerSets$.subscribe((rowDividers) => {
    const rows = rows$.getValue();
    rows.forEach((row, index) => {
      row.isDivided$.next(rowDividers != null ? rowDividers.has(index) : false);
    });
  });

  editMode.isActive$.pipe(distinctUntilChanged()).subscribe((isActive) => {
    if (isActive) {
      const rows = rows$.getValue();
      const cursorPosition = cursorPosition$.getValue();
      if (cursorPosition) {
        const row = rows.find(
          (r) => cursorPosition?.rowIndex === r.index$.getValue()
        );
        if (row) {
          row.isEditMode$.next(true);
          editMode.isActive$
            .pipe(
              filter((isActive) => !isActive),
              take(1)
            )
            .subscribe(() => {
              row.isEditMode$.next(false);
            });
        }
      }
    }
  });

  return rows$;
}
