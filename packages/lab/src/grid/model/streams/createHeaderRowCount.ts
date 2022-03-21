import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  tap,
} from "rxjs";
import { ColumnGroupDefinition } from "../ColumnGroupDefinition";

export function createHeaderRowCount<T>(
  columnGroupDefinitions$: BehaviorSubject<
    ColumnGroupDefinition<T>[] | undefined
  >,
  showToolbar$: BehaviorSubject<boolean | undefined>
) {
  const headerRowCount$ = new BehaviorSubject<number>(1);
  combineLatest([columnGroupDefinitions$, showToolbar$])
    .pipe(
      map(([columnGroupDefinitions, showToolbar]) => {
        return (
          1 +
          (columnGroupDefinitions != undefined ? 1 : 0) +
          (showToolbar ? 1 : 0)
        );
      }),
      distinctUntilChanged()
    )
    .subscribe(headerRowCount$);

  return headerRowCount$;
}
