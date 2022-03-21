import { BehaviorSubject, filter, map, take } from "rxjs";
import { Row } from "../Row";

// In addition to the grid's hoverOverRowIndex, each row has isHoverOver flag.
// This is an optimization. Each row component can listen to the row's isHoverOver
// flag. When hoverOverRowIndex changes, only the relevant rows are notified
// and rerender (the row that is loosing isHoverOver and the one that gets highlighted)
export function hoverOverRows(
  hoverOverRowIndex$: BehaviorSubject<number | undefined>,
  rows$: BehaviorSubject<Row[]>
) {
  hoverOverRowIndex$.subscribe((index) => {
    if (index !== undefined) {
      const rows = rows$.getValue();
      const firstRowIndex = rows[0].index$.getValue();
      const row = rows[index - firstRowIndex];
      if (row.index$.getValue() !== index) {
        throw new Error(`Unexpected row index`);
      }
      row.isHoverOver$.next(true);
      hoverOverRowIndex$
        .pipe(
          filter((newIndex) => newIndex !== index),
          take(1),
          map((_) => false)
        )
        .subscribe((_) => {
          row.isHoverOver$.next(false);
        });
    }
  });
}
