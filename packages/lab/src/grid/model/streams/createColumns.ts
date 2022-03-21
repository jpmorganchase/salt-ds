import { BehaviorSubject, combineLatest, map } from "rxjs";
import { Column } from "../Column";
import { ColumnsAndGroups } from "../GridModel";

// All columns
export function createColumns<T>(
  columnsAndGroups$: BehaviorSubject<ColumnsAndGroups<T>>
) {
  const columns$ = new BehaviorSubject<Column<T>[]>([]);
  columnsAndGroups$
    .pipe(
      map(({ leftColumns, middleColumns, rightColumns }) => {
        return [...leftColumns, ...middleColumns, ...rightColumns];
      })
    )
    .subscribe(columns$);
  return columns$;
}
