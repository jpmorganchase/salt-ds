import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  switchMap,
  tap,
} from "rxjs";
import { Column } from "../Column";
import { Rng } from "../Rng";

export function createColumnWidths<T>(columns$: BehaviorSubject<Column<T>[]>) {
  const widths$ = new BehaviorSubject<number[]>([]);
  columns$
    .pipe(
      map((columns) => {
        const widthStreams = columns.map((c) => c.width$);
        return combineLatest(widthStreams);
      }),
      switchMap((columnWidths) => columnWidths)
    )
    .subscribe(widths$);
  return widths$;
}

// The visible range within the middle columns list.
// To be rendered in the middle part of the body.
// Header is virtualized separately because it has column groups.
export function createBodyVisibleColumnRange<T>(
  middleColumns$: BehaviorSubject<Column<T>[]>,
  scrollLeft$: BehaviorSubject<number>,
  clientMiddleWidth$: BehaviorSubject<number>
) {
  const bodyVisibleColumnRange$ = new BehaviorSubject<Rng>(Rng.empty);
  const middleColumnWidths$ = createColumnWidths(middleColumns$);

  combineLatest([middleColumnWidths$, scrollLeft$, clientMiddleWidth$])
    .pipe(
      map(([middleColumnWidths, scrollLeft, clientMiddleWidth]) => {
        let width = scrollLeft;
        let start = 0;
        for (let i = 0; i < middleColumnWidths.length; ++i) {
          const colWidth = middleColumnWidths[i];
          if (width > colWidth) {
            width -= colWidth;
          } else {
            start = i;
            width = width + clientMiddleWidth;
            break;
          }
        }
        let end = start + 1;
        for (let i = start; i < middleColumnWidths.length; ++i) {
          const colWidth = middleColumnWidths[i];
          width -= colWidth;
          end = i + 1;
          if (width <= 0) {
            break;
          }
        }
        return new Rng(start, end);
      }),
      distinctUntilChanged<Rng>(Rng.equals)
    )
    .subscribe(bodyVisibleColumnRange$);

  return bodyVisibleColumnRange$;
}
