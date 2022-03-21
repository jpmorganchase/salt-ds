import { MouseEventHandler, useCallback, useRef } from "react";
import { getAttribute } from "./getAttribute";
import { getGridRoot } from "../model/utils";
import { useGridContext } from "../GridContext";

// Returns onMouseDown handler that can be attached to column move handles.
export function useColumnMove() {
  const columnMoveDataRef = useRef<{
    unsubscribe: () => void;
    startScreenX: number;
    startScreenY: number;
    startHeaderX: number;
    startHeaderY: number;
  }>();

  const { model } = useGridContext();

  const onMouseUp = useCallback(() => {
    columnMoveDataRef.current?.unsubscribe();
    columnMoveDataRef.current = undefined;
    model.columnDragAndDrop.drop();
  }, []);

  const onMouseMove = useCallback((event: MouseEvent) => {
    const { startHeaderX, startHeaderY, startScreenX, startScreenY } =
      columnMoveDataRef.current!;
    const shiftX = event.screenX - startScreenX;
    const shiftY = event.screenY - startScreenY;
    const x = startHeaderX + shiftX;
    const y = startHeaderY + shiftY;
    model.columnDragAndDrop.move(x, y);
  }, []);

  const onColumnMoveHandleMouseDown: MouseEventHandler<HTMLDivElement> =
    useCallback((event) => {
      const [columnIndexAttribute, thElement] = getAttribute(
        event.target as HTMLElement,
        "data-column-index"
      );
      const rootElement = getGridRoot(event.target as HTMLElement);

      document.addEventListener("mouseup", onMouseUp);
      document.addEventListener("mousemove", onMouseMove);

      const columnIndex = parseInt(columnIndexAttribute, 10);

      const thRect = thElement.getBoundingClientRect();
      const rootRect = rootElement!.getBoundingClientRect();

      const x = thRect.x - rootRect.x;
      const y = thRect.y - rootRect.y;

      columnMoveDataRef.current = {
        unsubscribe: () => {
          document.removeEventListener("mouseup", onMouseUp);
          document.removeEventListener("mousemove", onMouseMove);
        },
        startScreenX: event.screenX,
        startScreenY: event.screenY,
        startHeaderX: x,
        startHeaderY: y,
      };

      event.preventDefault();
      model.columnDragAndDrop.start(columnIndex, x, y);
    }, []);

  return onColumnMoveHandleMouseDown;
}
