import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  tap,
} from "rxjs";
import { Rng } from "../Rng";

export function createVisibleRowRange<T>(
  scrollTop$: BehaviorSubject<number>,
  clientMiddleHeight$: BehaviorSubject<number>,
  rowHeight$: BehaviorSubject<number>,
  data$: BehaviorSubject<T[]>
) {
  const visibleRowRange$ = new BehaviorSubject<Rng>(Rng.empty);
  combineLatest([scrollTop$, clientMiddleHeight$, rowHeight$, data$])
    .pipe(
      map(([scrollTop, clientMiddleHeight, rowHeight, data]) => {
        if (rowHeight < 1) {
          return Rng.empty;
        }
        const start = Math.floor(scrollTop / rowHeight);
        let end = Math.max(
          start,
          Math.ceil((scrollTop + clientMiddleHeight) / rowHeight)
        );
        if (end > data.length) {
          end = data.length;
        }
        return new Rng(start, end);
      }),
      distinctUntilChanged((a, b) => Rng.equals(a, b))
      // tap((rng) => {
      //   console.log(`visibleRowRange$: ${rng}`);
      // })
    )
    .subscribe(visibleRowRange$);
  return visibleRowRange$;
}
