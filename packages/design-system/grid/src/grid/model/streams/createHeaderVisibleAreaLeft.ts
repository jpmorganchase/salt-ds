import { BehaviorSubject, combineLatest, map, tap } from "rxjs";
import { Column } from "../Column";
import { Rng } from "../Rng";
import { sumWidths } from "../sumWidths";

// Column scrolled out of view on the left. If a column is in a group that is at
// least partially visible then it is not scrolled out and should be rendered
// even if the column itself is invisible.
export function createHeaderScrolledOutColumns<T>(
  middleColumns$: BehaviorSubject<Column<T>[]>,
  headerVisibleColumnRange$: BehaviorSubject<Rng>
) {
  const headerScrolledOutColumns$ = new BehaviorSubject<Column<T>[]>([]);
  combineLatest([middleColumns$, headerVisibleColumnRange$])
    .pipe(
      map(([middleColumns, range]) => {
        return middleColumns.slice(0, range.start);
      })
    )
    .subscribe(headerScrolledOutColumns$);
  return headerScrolledOutColumns$;
}

// X coordinate of the visible area of the header
export function createHeaderVisibleAreaLeft<T>(
  middleColumns$: BehaviorSubject<Column<T>[]>,
  headerVisibleColumnRange$: BehaviorSubject<Rng>,
  leftWidth$: BehaviorSubject<number>
) {
  const headerVisibleAreaLeft$ = new BehaviorSubject<number>(0);

  const headerScrolledOutColumns$ = createHeaderScrolledOutColumns(
    middleColumns$,
    headerVisibleColumnRange$
  );
  const headerScrolledOutWidth$ = new BehaviorSubject<number>(0);
  sumWidths(headerScrolledOutColumns$).subscribe(headerScrolledOutWidth$);

  combineLatest([headerScrolledOutWidth$, leftWidth$])
    .pipe(map(([a, b]) => a + b))
    .subscribe(headerVisibleAreaLeft$);

  return headerVisibleAreaLeft$;
}
