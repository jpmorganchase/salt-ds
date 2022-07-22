import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
} from "rxjs";

export function createIsRightRaised(
  scrollLeft$: BehaviorSubject<number>,
  clientMiddleWidth$: BehaviorSubject<number>,
  middleWidth$: BehaviorSubject<number>
) {
  const isRightRaised$ = new BehaviorSubject<boolean>(false);

  combineLatest([scrollLeft$, clientMiddleWidth$, middleWidth$])
    .pipe(
      map(
        ([scrollLeft, clientMiddleWidth, middleWidth]) =>
          scrollLeft + clientMiddleWidth < middleWidth
      ),
      distinctUntilChanged()
    )
    .subscribe(isRightRaised$);

  return isRightRaised$;
}
