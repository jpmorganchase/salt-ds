import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  Subject,
  take,
} from "rxjs";
import { Column } from "../Column";
import { ColumnResizeEvent, ColumnsAndGroups } from "../GridModel";

// When a column resizes, a gap may appear between the middle columns and the right (pinned) columns
// This gap has to be filled by expanding either
// 1) the last scrollable column or
// 2) the first pinned right column
// If the gap appeared because the user resized a column that is pinned right then we do 1
// otherwise 2.
export function mindTheGap(
  clientMiddleWidth$: BehaviorSubject<number>,
  middleWidth$: BehaviorSubject<number>,
  columnResize$: Subject<ColumnResizeEvent>,
  columnsAndGroups$: BehaviorSubject<ColumnsAndGroups>
) {
  const gap$ = new BehaviorSubject<number>(0);
  combineLatest([clientMiddleWidth$, middleWidth$])
    .pipe(
      map(([clientMiddleWidth, middleWidth]) =>
        Math.max(0, clientMiddleWidth - middleWidth)
      ),
      distinctUntilChanged()
      // tap((gap) => console.log(`gap$: ${gap}`))
    )
    .subscribe(gap$);

  // The column to be expanded to fill the gap
  const columnToFillTheGap$ = new BehaviorSubject<Column | undefined>(
    undefined
  );

  // Initialize columnToFillTheGap$ when columns become available
  columnsAndGroups$
    .pipe(
      map(({ middleColumns, rightColumns }) => {
        return middleColumns[middleColumns.length - 1] || rightColumns[0];
      }),
      filter((c) => c != null),
      take(1)
    )
    .subscribe((c) => {
      columnToFillTheGap$.next(c);
    });

  // When the user resizes a pinned right column then the last scrollable column
  // should fill the gap. If the user resizes any other column then the first
  // column pinned to the right is the one to be expanded to fill the gap.
  columnResize$
    .pipe(
      map(({ columnIndex }) => {
        const { leftColumns, middleColumns, rightColumns } =
          columnsAndGroups$.getValue();
        const isRightColumn =
          columnIndex >= leftColumns.length + middleColumns.length;
        return isRightColumn
          ? middleColumns[middleColumns.length - 1]
          : rightColumns[0];
      })
    )
    .subscribe((column) => {
      columnToFillTheGap$.next(column);
    });

  combineLatest([gap$, columnToFillTheGap$]).subscribe(
    ([gap, columnToFillTheGap]) => {
      if (gap > 0 && columnToFillTheGap != null) {
        columnToFillTheGap.width$.next(
          columnToFillTheGap.width$.getValue() + gap
        );
      }
    }
  );
}
