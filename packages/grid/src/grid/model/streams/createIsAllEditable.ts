import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  of,
  switchMap,
} from "rxjs";
import { Column } from "../Column";

export function createIsAllEditable<T>(columns$: BehaviorSubject<Column<T>[]>) {
  const isAllEditable$ = new BehaviorSubject<boolean>(false);
  columns$
    .pipe(
      map((columns) => {
        if (columns.length === 0) {
          return of(false);
        }
        const isEditableStreams = columns.map((column) => column.isEditable$);
        return combineLatest(isEditableStreams).pipe(
          map((isEditables) => isEditables.every((x) => x))
        );
      }),
      switchMap((x) => x),
      distinctUntilChanged()
    )
    .subscribe(isAllEditable$);
  return isAllEditable$;
}
