import { BehaviorSubject, combineLatest, map } from "rxjs";

// Height of the grid header
export function createTopHeight(
  rowHeight$: BehaviorSubject<number>,
  headerRowCount$: BehaviorSubject<number>
) {
  const topHeight$ = new BehaviorSubject<number>(0);

  combineLatest([rowHeight$, headerRowCount$])
    .pipe(map(([rowHeight, headerRowCount]) => rowHeight * headerRowCount))
    .subscribe(topHeight$);

  return topHeight$;
}
