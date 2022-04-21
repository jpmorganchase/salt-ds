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
import { CellPosition } from "../GridModel";
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
  isZebra$: BehaviorSubject<boolean | undefined>
) {
  const rows$ = new BehaviorSubject<Row<T>[]>([]);

  combineLatest([data$, visibleRowRange$])
    .pipe(
      map(([data, visibleRowRange]) => {
        const oldRows = new Map(rows$.getValue().map((row) => [row.key, row]));

        const rows: Row<T>[] = [];
        const cursor = cursorPosition$.getValue();
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
            rows.push(row);
          }
        });
        return rows;
      })
    )
    .subscribe(rows$);

  combineLatest([rows$, isZebra$]).subscribe(([rows, isZebra]) => {
    rows.forEach((row, index) => {
      row.isZebra$.next(!!isZebra && index % 2 === 0);
    });
  });

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
