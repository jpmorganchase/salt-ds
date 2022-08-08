import { BehaviorSubject, combineLatest, map } from "rxjs";

export function createBottomHeight(
  rowHeight$: BehaviorSubject<number>,
  footerRowCount$: BehaviorSubject<number>
) {
  const bottomHeight$ = new BehaviorSubject<number>(0);

  combineLatest([rowHeight$, footerRowCount$])
    .pipe(map(([rowHeight, footerRowCount]) => rowHeight * footerRowCount))
    .subscribe(bottomHeight$);

  return bottomHeight$;
}
