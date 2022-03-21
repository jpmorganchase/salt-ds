import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  tap,
} from "rxjs";
import { Rng } from "../Rng";
import { ColumnGroup } from "../ColumnGroup";

// Range within the middle columns.
export function createHeaderVisibleColumnRange<T>(
  visibleColumnGroupRange$: BehaviorSubject<Rng | undefined>,
  middleColumnGroups$: BehaviorSubject<ColumnGroup<T>[] | undefined>,
  bodyVisibleColumnRange$: BehaviorSubject<Rng>
) {
  const headerVisibleColumnRange$ = new BehaviorSubject<Rng>(Rng.empty);

  combineLatest([
    visibleColumnGroupRange$,
    middleColumnGroups$,
    bodyVisibleColumnRange$,
  ])
    .pipe(
      map(([visibleGroupRange, middleColumnGroups, bodyVisibleColumnRange]) => {
        if (visibleGroupRange == undefined || middleColumnGroups == undefined) {
          return bodyVisibleColumnRange;
        }
        const firstMiddleGroup = middleColumnGroups[0];
        const firstMiddleColumn = firstMiddleGroup.columns.getValue()[0];
        const firstVisibleGroup = middleColumnGroups[visibleGroupRange.start];
        const lastVisibleGroup = middleColumnGroups[visibleGroupRange.end - 1];
        const firstGroupColumns = firstVisibleGroup.columns.getValue();
        const lastGroupColumns = lastVisibleGroup.columns.getValue();
        const firstVisibleColumn = firstGroupColumns[0];
        const lastVisibleColumn = lastGroupColumns[lastGroupColumns.length - 1];
        return new Rng(
          firstVisibleColumn.index - firstMiddleColumn.index,
          lastVisibleColumn.index - firstMiddleColumn.index + 1
        );
      }),
      distinctUntilChanged<Rng>(Rng.equals)
    )
    .subscribe(headerVisibleColumnRange$);

  return headerVisibleColumnRange$;
}
