import { BehaviorSubject, distinctUntilChanged, map } from "rxjs";

// Whether the left part (columns pinned to the left) should have a shadow
export function createIsLeftRaised(scrollLeft$: BehaviorSubject<number>) {
  const isLeftRaised$ = new BehaviorSubject<boolean>(false);
  scrollLeft$
    .pipe(
      map((scrollLeft) => scrollLeft > 0),
      distinctUntilChanged()
    )
    .subscribe(isLeftRaised$);
  return isLeftRaised$;
}
