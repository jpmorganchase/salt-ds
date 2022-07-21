import { BehaviorSubject, map } from "rxjs";
import { ColumnGroup } from "../ColumnGroup";
import { ColumnsAndGroups } from "../GridModel";

// All column groups
export function createColumnGroups<T>(
  columnsAndGroups$: BehaviorSubject<ColumnsAndGroups<T>>
) {
  const columnGroups$ = new BehaviorSubject<ColumnGroup<T>[] | undefined>(
    undefined
  );
  columnsAndGroups$
    .pipe(
      map(({ leftColumnGroups, middleColumnGroups, rightColumnGroups }) => {
        return leftColumnGroups == null ||
          middleColumnGroups == null ||
          rightColumnGroups == null
          ? undefined
          : [...leftColumnGroups, ...middleColumnGroups, ...rightColumnGroups];
      })
    )
    .subscribe(columnGroups$);

  return columnGroups$;
}
