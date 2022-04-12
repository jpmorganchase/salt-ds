import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  Subject,
  take,
  tap,
} from "rxjs";
import { Column } from "../Column";
import { ColumnResizeEvent, ColumnsAndGroups } from "../GridModel";

interface ColumnToResize {
  column: Column;
  canShrink: boolean;
}

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
      map(
        ([clientMiddleWidth, middleWidth]) => clientMiddleWidth - middleWidth
      ),
      distinctUntilChanged()
      // tap((gap) => console.log(`gap$: ${gap}`))
    )
    .subscribe(gap$);

  const columnToResize$ = new BehaviorSubject<ColumnToResize | undefined>(
    undefined
  );

  // Initialize columnToFillTheGap$ when columns become available
  columnsAndGroups$
    .pipe(
      map(({ middleColumns, rightColumns }) => {
        return middleColumns[middleColumns.length - 1] || rightColumns[0];
      }),
      filter((c) => c != null),
      // take(1),
      map((column) => ({
        column,
        canShrink: false,
      }))
    )
    .subscribe((c) => {
      columnToResize$.next(c);
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
        // If there is nothing pinned to the right then the last middle column
        // is a dummy column that can expand and shrink to fill the space
        const isNoRightColumns = rightColumns.length === 0;
        if (isNoRightColumns) {
          return {
            column: middleColumns[middleColumns.length - 1],
            canShrink: true,
          };
        }
        return {
          column: isRightColumn
            ? middleColumns[middleColumns.length - 1]
            : rightColumns[0],
          canShrink: false,
        };
      })
    )
    .subscribe((column) => {
      columnToResize$.next(column);
    });

  combineLatest([gap$, columnToResize$]).subscribe(([gap, columnToResize]) => {
    if (columnToResize == null) {
      // console.log(`columnToResize is null. Doing nothing`);
      return;
    }
    const { column, canShrink } = columnToResize;
    // console.log(
    //   `Resizing column ${column.key}. canShrink: ${canShrink}. gap: ${gap}`
    // );
    if (gap > 0 || canShrink) {
      const newWidth = Math.max(0, column.width$.getValue() + gap);
      // console.log(`New width: ${newWidth}`);
      column.width$.next(newWidth);
    }
  });
}
