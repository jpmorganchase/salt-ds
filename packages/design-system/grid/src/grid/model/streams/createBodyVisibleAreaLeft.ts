import { BehaviorSubject, combineLatest, map, tap } from "rxjs";
import { Column } from "../Column";
import { sumWidths } from "../sumWidths";
import { Rng } from "../Rng";

// Middle columns scrolled out of view on the left
export function createLeftScrolledOutColumns<T>(
  columns$: BehaviorSubject<Column<T>[]>,
  visibleRange$: BehaviorSubject<Rng>
) {
  const leftScrolledOutColumns$ = new BehaviorSubject<Column<T>[]>([]);
  combineLatest([columns$, visibleRange$])
    .pipe(
      map(([middleColumns, range]) => {
        return middleColumns.slice(0, range.start);
      })
    )
    .subscribe(leftScrolledOutColumns$);
  return leftScrolledOutColumns$;
}

// X coordinate of the visible area
export function createBodyVisibleAreaLeft<T>(
  middleColumns$: BehaviorSubject<Column<T>[]>,
  bodyVisibleColumnRange$: BehaviorSubject<Rng>,
  leftWidth$: BehaviorSubject<number>
) {
  const bodyVisibleAreaLeft$ = new BehaviorSubject<number>(0);

  const leftScrolledOutColumns$ = createLeftScrolledOutColumns(
    middleColumns$,
    bodyVisibleColumnRange$
  );

  const leftScrolledOutWidth = new BehaviorSubject<number>(0);
  sumWidths(leftScrolledOutColumns$).subscribe(leftScrolledOutWidth);

  combineLatest([leftScrolledOutWidth, leftWidth$])
    .pipe(map(([a, b]) => a + b))
    .subscribe(bodyVisibleAreaLeft$);

  return bodyVisibleAreaLeft$;
}
