import { BehaviorSubject, combineLatest, map, tap } from "rxjs";
import { ColumnGroup } from "../ColumnGroup";
import { Rng } from "../Rng";

export function createVisibleColumnGroups<T>(
  middleColumnGroups$: BehaviorSubject<ColumnGroup<T>[] | undefined>,
  visibleColumnGroupRange$: BehaviorSubject<Rng | undefined>
) {
  const visibleColumnGroups$ = new BehaviorSubject<
    ColumnGroup<T>[] | undefined
  >(undefined);

  combineLatest([middleColumnGroups$, visibleColumnGroupRange$])
    .pipe(
      map(([groups, range]) => {
        if (!groups || !range) {
          return undefined;
        }
        return groups.slice(range.start, range.end);
      })
    )
    .subscribe(visibleColumnGroups$);

  return visibleColumnGroups$;
}
