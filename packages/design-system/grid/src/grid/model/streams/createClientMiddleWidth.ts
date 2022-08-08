import { BehaviorSubject, combineLatest, map } from "rxjs";
import { scrollBarSize } from "../utils";

// Width of the scrollable part of the grid
export function createClientMiddleWidth<T>(
  clientWidth$: BehaviorSubject<number>,
  leftWidth$: BehaviorSubject<number>,
  rightWidth$: BehaviorSubject<number>
) {
  const clientMiddleWidth$ = new BehaviorSubject<number>(0);

  combineLatest([clientWidth$, leftWidth$, rightWidth$])
    .pipe(
      map(
        ([clientWidth, leftWidth, rightWidth]) =>
          clientWidth - leftWidth - rightWidth - scrollBarSize
      )
    )
    .subscribe(clientMiddleWidth$);

  return clientMiddleWidth$;
}
