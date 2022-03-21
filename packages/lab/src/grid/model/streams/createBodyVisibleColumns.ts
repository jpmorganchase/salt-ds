import { BehaviorSubject, combineLatest, map, tap } from "rxjs";
import { Column } from "../Column";
import { Rng } from "../Rng";

// Columns to be rendered in the body of the middle part
export function createBodyVisibleColumns<T>(
  middleColumns$: BehaviorSubject<Column<T>[]>,
  bodyVisibleColumnRange$: BehaviorSubject<Rng>
) {
  const bodyVisibleColumns$ = new BehaviorSubject<Column<T>[]>([]);

  combineLatest([middleColumns$, bodyVisibleColumnRange$])
    .pipe(
      map(([middleColumns, bodyVisibleColumnRange]) => {
        return middleColumns.slice(
          bodyVisibleColumnRange.start,
          bodyVisibleColumnRange.end
        );
      })
    )
    .subscribe(bodyVisibleColumns$);

  return bodyVisibleColumns$;
}
