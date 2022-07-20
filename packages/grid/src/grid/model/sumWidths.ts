import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  of,
  switchMap,
} from "rxjs";
import { Column } from "./Column";
import { sum } from "./GridModel";

// Total width of the given columns
export function sumWidths<T>(columns$: BehaviorSubject<Column<T>[]>) {
  return columns$.pipe(
    map((columns) => {
      if (columns.length === 0) {
        return of(0);
      }
      const widthStreams = columns.map((c) => c.width$);
      return combineLatest(widthStreams).pipe(map(sum));
    }),
    switchMap((v) => v),
    distinctUntilChanged()
  );
}
