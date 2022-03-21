import { BehaviorSubject, filter, map, Subject } from "rxjs";
import { Column } from "../Column";
import { CellPosition } from "../GridModel";

// Listens to keyboardEvents$, calculates new cursor position and generates
// moveCursorEvents$
export function keyboardNavigation(
  keyboardEvents$: Subject<React.KeyboardEvent>,
  cursorPosition$: BehaviorSubject<CellPosition | undefined>,
  columns$: BehaviorSubject<Column[]>,
  data$: BehaviorSubject<any[]>,
  moveCursorEvents$: Subject<CellPosition>
) {
  const addKeyHandler = function addKeyHandler(
    key: string,
    handler: (event: React.KeyboardEvent, cursorPosition: CellPosition) => void
  ) {
    keyboardEvents$
      .pipe(
        filter((event) => event.key === key),
        map((event) => {
          const cursorPosition = cursorPosition$.getValue();
          if (!cursorPosition) {
            return undefined;
          }
          return [event, cursorPosition] as [React.KeyboardEvent, CellPosition];
        })
      )
      .subscribe((x) => {
        if (x) {
          const [event, cursorPosition] = x;
          handler(event, cursorPosition);
        }
      });
  };

  addKeyHandler("ArrowLeft", (event, { rowIndex, columnIndex }) => {
    if (columnIndex === 0) {
      return;
    }
    const nextColumnIndex = columnIndex - 1;
    moveCursorEvents$.next({ rowIndex, columnIndex: nextColumnIndex });
  });

  addKeyHandler("ArrowRight", (event, { rowIndex, columnIndex }) => {
    if (columnIndex === columns$.getValue().length - 1) {
      return;
    }
    const nextColumnIndex = columnIndex + 1;
    moveCursorEvents$.next({ rowIndex, columnIndex: nextColumnIndex });
  });

  addKeyHandler("ArrowUp", (event, { rowIndex, columnIndex }) => {
    if (rowIndex === 0) {
      return;
    }
    const nextRowIndex = rowIndex - 1;
    moveCursorEvents$.next({ rowIndex: nextRowIndex, columnIndex });
  });

  addKeyHandler("ArrowDown", (event, { rowIndex, columnIndex }) => {
    if (rowIndex === data$.getValue().length) {
      return;
    }
    const nextRowIndex = rowIndex + 1;
    moveCursorEvents$.next({ rowIndex: nextRowIndex, columnIndex });
  });
}
