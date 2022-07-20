import { BehaviorSubject, combineLatest, map, tap } from "rxjs";
import { scrollBarSize } from "../utils";

// Height available for scrollable rows
export function createClientMiddleHeight<T>(
  clientHeight$: BehaviorSubject<number>,
  topHeight$: BehaviorSubject<number>,
  bottomHeight$: BehaviorSubject<number>
) {
  const clientMiddleHeight$ = new BehaviorSubject<number>(0);

  combineLatest([clientHeight$, topHeight$, bottomHeight$])
    .pipe(
      map(([clientHeight, topHeight, bottomHeight]) => {
        return clientHeight - topHeight - bottomHeight - scrollBarSize;
      })
    )
    .subscribe(clientMiddleHeight$);

  return clientMiddleHeight$;
}
