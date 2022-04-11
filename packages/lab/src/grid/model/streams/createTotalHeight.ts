import { BehaviorSubject, combineLatest, map, tap } from "rxjs";
import { sum } from "../GridModel";

// Total height of the table. This is how much space would be needed to render everything without scrolling.
export function createTotalHeight<T>(
  topHeight$: BehaviorSubject<number>,
  middleHeight$: BehaviorSubject<number>,
  bottomHeight$: BehaviorSubject<number>
) {
  const totalHeight$ = new BehaviorSubject<number>(0);

  combineLatest([topHeight$, middleHeight$, bottomHeight$])
    .pipe(
      map(sum),
      tap((x) => {
        console.log(`totalHeight$: ${x}`);
      })
    )
    .subscribe(totalHeight$);

  return totalHeight$;
}
