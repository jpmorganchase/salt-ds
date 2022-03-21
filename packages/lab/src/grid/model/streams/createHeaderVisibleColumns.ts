import { BehaviorSubject, combineLatest, map, tap } from "rxjs";
import { Column } from "../Column";
import { Rng } from "../Rng";

// Columns to be rendered in the scrollable part of the header
export function createHeaderVisibleColumns<T>(
  middleColumns$: BehaviorSubject<Column<T>[]>,
  headerVisibleColumnRange$: BehaviorSubject<Rng>
) {
  const headerVisibleColumns$ = new BehaviorSubject<Column<T>[]>([]);

  combineLatest([middleColumns$, headerVisibleColumnRange$])
    .pipe(
      map(([middleColumns, headerVisibleColumnRange]) => {
        return middleColumns.slice(
          headerVisibleColumnRange.start,
          headerVisibleColumnRange.end
        );
      })
    )
    .subscribe(headerVisibleColumns$);

  return headerVisibleColumns$;
}
