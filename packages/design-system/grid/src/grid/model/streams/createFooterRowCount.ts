import { BehaviorSubject, map } from "rxjs";

export function createFooterRowCount<T>(
  showFooter$: BehaviorSubject<boolean | undefined>
) {
  const footerRowCount$ = new BehaviorSubject<number>(0);
  showFooter$
    .pipe(map((showFooter) => (showFooter ? 1 : 0)))
    .subscribe(footerRowCount$);
  return footerRowCount$;
}
