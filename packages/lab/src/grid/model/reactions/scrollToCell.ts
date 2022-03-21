import { CellPosition, sum } from "../GridModel";
import { BehaviorSubject, Subject } from "rxjs";
import { Rng } from "../Rng";
import { Column } from "../Column";
import { GridScrollPosition } from "../GridScrollPosition";

// Listens to scrollToCell$, calculates new scroll position and pushes it to
// scrollPosition$
export function scrollToCell(
  scrollToCell$: Subject<CellPosition>,
  visibleRowRange$: BehaviorSubject<Rng>,
  rowHeight$: BehaviorSubject<number>,
  clientMiddleWidth$: BehaviorSubject<number>,
  clientMiddleHeight$: BehaviorSubject<number>,
  middleColumns$: BehaviorSubject<Column[]>,
  bodyVisibleColumnRange$: BehaviorSubject<Rng>,
  scrollPosition$: BehaviorSubject<GridScrollPosition>
) {
  scrollToCell$.subscribe(({ rowIndex, columnIndex }) => {
    const oldScrollPosition = scrollPosition$.getValue();
    let scrollPosition = oldScrollPosition.setSource("model");

    const visibleRowRange = visibleRowRange$.getValue();
    const rowHeight = rowHeight$.getValue();
    const clientMiddleWidth = clientMiddleWidth$.getValue();
    const clientMiddleHeight = clientMiddleHeight$.getValue();
    const middleColumns = middleColumns$.getValue();
    const bodyVisibleColumnRange = bodyVisibleColumnRange$.getValue();

    if (rowIndex <= visibleRowRange.start) {
      scrollPosition = scrollPosition.setScrollTop(rowHeight * rowIndex);
    } else if (rowIndex >= visibleRowRange.end - 1) {
      scrollPosition = scrollPosition.setScrollTop(
        rowHeight * rowIndex - clientMiddleHeight + rowHeight
      );
    }

    const isMiddleColumn =
      middleColumns.length > 0 &&
      columnIndex >= middleColumns[0].index &&
      columnIndex <= middleColumns[middleColumns.length - 1].index;

    if (isMiddleColumn) {
      const midColumnIndex = columnIndex - middleColumns[0].index;
      if (midColumnIndex <= bodyVisibleColumnRange.start) {
        const scrolledOutColumns = middleColumns.slice(0, midColumnIndex);
        scrollPosition = scrollPosition.setScrollLeft(
          sum(scrolledOutColumns.map((c) => c.width$.getValue()))
        );
      } else if (midColumnIndex >= bodyVisibleColumnRange.end - 1) {
        const columnsToMeasure = middleColumns.slice(0, midColumnIndex + 1);
        scrollPosition = scrollPosition.setScrollLeft(
          sum(columnsToMeasure.map((c) => c.width$.getValue())) -
            clientMiddleWidth
        );
      }
    }

    if (!GridScrollPosition.equals(oldScrollPosition, scrollPosition)) {
      scrollPosition$.next(scrollPosition);
    }
  });
}
