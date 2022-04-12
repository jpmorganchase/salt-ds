import { BehaviorSubject, combineLatest, map } from "rxjs";
import { Row } from "../Row";
import { Rng } from "../Rng";
import { RowSelection } from "../RowSelection";
import { CellPosition } from "../GridModel";
import { RowKeyGetter } from "../../Grid";

export function createRows<T>(
  getKey: RowKeyGetter<T>,
  data: BehaviorSubject<T[]>,
  visibleRowRange: BehaviorSubject<Rng>,
  rowSelection: RowSelection<T>,
  cursorPosition: BehaviorSubject<CellPosition | undefined>
) {
  const rows$ = new BehaviorSubject<Row<T>[]>([]);

  combineLatest([data, visibleRowRange])
    .pipe(
      map(([data, visibleRowRange]) => {
        const oldRows = new Map(rows$.getValue().map((row) => [row.key, row]));

        const rows: Row<T>[] = [];
        const cursor = cursorPosition.getValue();
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
              rowSelection.selectedKeys$.getValue().has(row.key)
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

  rowSelection.selectedKeys$.subscribe((selectedKeys) => {
    const rows = rows$.getValue();
    rows.forEach((row) => {
      const isSelected = selectedKeys.has(row.key);
      if (row.isSelected$.getValue() !== isSelected) {
        row.isSelected$.next(isSelected);
      }
    });
  });

  return rows$;
}
