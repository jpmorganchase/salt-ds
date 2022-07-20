import { BehaviorSubject, combineLatest, map, tap } from "rxjs";
import { Rng } from "../Rng";

// Y coordinate of the visible area of the body
export function createBodyVisibleAreaTop<T>(
  rowHeight$: BehaviorSubject<number>,
  visibleRowRange$: BehaviorSubject<Rng>,
  topHeight$: BehaviorSubject<number>
) {
  const bodyVisibleAreaTop$ = new BehaviorSubject<number>(0);

  combineLatest([rowHeight$, visibleRowRange$, topHeight$])
    .pipe(
      map(([rowHeight, visibleRowRange, topHeight]) => {
        return topHeight + visibleRowRange.start * rowHeight;
      })
    )
    .subscribe(bodyVisibleAreaTop$);

  return bodyVisibleAreaTop$;
}
