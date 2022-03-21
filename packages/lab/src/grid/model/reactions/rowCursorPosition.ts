import { BehaviorSubject } from "rxjs";
import { CellPosition } from "../GridModel";
import { Row } from "../Row";
import { prevNextPairs } from "../utils";

// There is a cursorPosition stream but row components don't listen to it.
// Each row component subscribes to the row model's cursorColumnIndex and
// updates only when the cursor moves within the row. Row node doesn't care
// where the cursor is unless it is within the row that it represents.
export function rowCursorPosition(
  cursorPosition$: BehaviorSubject<CellPosition | undefined>,
  rows$: BehaviorSubject<Row[]>
) {
  cursorPosition$.pipe(prevNextPairs()).subscribe(([prev, next]) => {
    const rows = rows$.getValue();
    if (!rows || rows.length < 1) {
      return;
    }
    const firstRowIndex = rows[0].index$.getValue();
    if (next) {
      const nextRow = rows[next.rowIndex - firstRowIndex];
      // Cursor can jump to a row that doesn't exist yet. This is ok. The row
      // will take care of that when it is created.
      if (nextRow) {
        nextRow.cursorColumnIndex$.next(next.columnIndex);
      }
    }
    if (prev && (!next || next.rowIndex !== prev.rowIndex)) {
      const prevRow = rows[prev.rowIndex - firstRowIndex];
      if (prevRow) {
        prevRow.cursorColumnIndex$.next(undefined);
      }
    }
  });
}
