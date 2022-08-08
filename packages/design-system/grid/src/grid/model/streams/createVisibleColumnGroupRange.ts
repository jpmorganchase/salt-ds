import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  of,
  switchMap,
} from "rxjs";
import { Rng } from "../Rng";
import { ColumnGroup } from "../ColumnGroup";

export function createGroupWidths<T>(
  groups$: BehaviorSubject<ColumnGroup<T>[] | undefined>
) {
  const widths$ = new BehaviorSubject<number[] | undefined>(undefined);

  groups$
    .pipe(
      map((columnGroups) => {
        if (columnGroups == undefined) {
          return of(undefined);
        }
        const widthStreams = columnGroups.map((g) => g.width);
        return combineLatest(widthStreams);
      }),
      switchMap((x) => x)
    )
    .subscribe(widths$);

  return widths$;
}

export function createVisibleColumnGroupRange<T>(
  middleColumnGroups$: BehaviorSubject<ColumnGroup<T>[] | undefined>,
  scrollLeft$: BehaviorSubject<number>,
  clientMiddleWidth$: BehaviorSubject<number>
) {
  const visibleColumnGroupRange$ = new BehaviorSubject<Rng | undefined>(
    undefined
  );
  const middleColumnGroupWidths$ = createGroupWidths(middleColumnGroups$);
  combineLatest([middleColumnGroupWidths$, scrollLeft$, clientMiddleWidth$])
    .pipe(
      map(([groupWidths, scrollLeft, clientMiddleWidth]) => {
        if (groupWidths == undefined) {
          return undefined;
        }
        let width = scrollLeft;
        let start = 0;
        for (let i = 0; i < groupWidths.length; ++i) {
          const groupWidth = groupWidths[i];
          if (width > groupWidth) {
            width -= groupWidth;
          } else {
            width = clientMiddleWidth + width;
            start = i;
            break;
          }
        }
        let end = start + 1;
        for (let i = start; i < groupWidths.length; ++i) {
          const groupWidth = groupWidths[i];
          width -= groupWidth;
          end = i + 1;
          if (width <= 0) {
            break;
          }
        }
        return new Rng(start, end);
      }),
      distinctUntilChanged<Rng | undefined>(Rng.equals)
    )
    .subscribe(visibleColumnGroupRange$);
  return visibleColumnGroupRange$;
}
