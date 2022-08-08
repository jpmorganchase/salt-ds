import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
} from "rxjs";

// The height required to display all scrollable rows without scrolling
export function createMiddleHeight(
  data$: BehaviorSubject<any[]>,
  rowHeight$: BehaviorSubject<number>
) {
  const middleHeight$ = new BehaviorSubject<number>(0);
  combineLatest([data$, rowHeight$])
    .pipe(
      map(([data, rowHeight]) => {
        return data.length * rowHeight;
      }),
      distinctUntilChanged()
    )
    .subscribe(middleHeight$);
  return middleHeight$;
}
