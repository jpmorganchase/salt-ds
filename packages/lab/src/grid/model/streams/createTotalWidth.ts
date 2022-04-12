import { BehaviorSubject, combineLatest, map, tap } from "rxjs";
import { scrollBarSize } from "../utils";

// Total width of the table. This is how wide the grid would be without scrolling.
export function createTotalWidth<T>(
  leftWidth$: BehaviorSubject<number>,
  middleWidth$: BehaviorSubject<number>,
  rightWidth$: BehaviorSubject<number>
) {
  const totalWidth$ = new BehaviorSubject<number>(0);

  combineLatest([leftWidth$, middleWidth$, rightWidth$])
    .pipe(
      map(
        ([leftWidth, middleWidth, rightWidth]) =>
          leftWidth + middleWidth + rightWidth + scrollBarSize
      )
      // tap((totalWidth) => {
      //   console.log(`totalWidth$: ${totalWidth}`);
      // })
    )
    .subscribe(totalWidth$);

  return totalWidth$;
}
