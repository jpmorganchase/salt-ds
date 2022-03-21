import { MouseEvent as ReactMouseEvent, useCallback, useRef } from "react";
import { useGridContext } from "../GridContext";
import { getAttribute } from "./getAttribute";

const minColumnWidth = 20;

// Returns onMouseDown event handler that can be attached to column resize
// handles.
export function useColumnResize<T>() {
  const { model } = useGridContext();

  const columnResizeDataRef = useRef<{
    startX: number;
    startY: number;
    eventsUnsubscription: () => void;
    columnIndex: number;
    initialColumnWidth: number;
  }>();

  const onColumnResizeHandleMouseDown = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      const targetElement = event.target as HTMLElement;
      const [columnIndexAttribute, thElement] = getAttribute(
        targetElement,
        "data-column-index"
      );

      const columnIndex = parseInt(columnIndexAttribute, 10);

      document.addEventListener("mouseup", onMouseUp);
      document.addEventListener("mousemove", onMouseMove);

      const initialColumnWidth = thElement.getBoundingClientRect().width;

      columnResizeDataRef.current = {
        startX: event.screenX,
        startY: event.screenY,
        eventsUnsubscription: () => {
          document.removeEventListener("mouseup", onMouseUp);
          document.removeEventListener("mousemove", onMouseMove);
        },
        columnIndex,
        initialColumnWidth,
      };

      event.preventDefault();
    },
    []
  );

  const onMouseUp = useCallback(() => {
    columnResizeDataRef.current?.eventsUnsubscription();
    columnResizeDataRef.current = undefined;
  }, []);

  const onMouseMove = useCallback((event: MouseEvent) => {
    const x = event.screenX;
    const { startX, columnIndex, initialColumnWidth } =
      columnResizeDataRef.current!;
    const shift = x - startX;
    let width = initialColumnWidth + shift;
    if (width < minColumnWidth) {
      width = minColumnWidth;
    }
    model.resizeColumn({ columnIndex, width: Math.round(width) });
  }, []);

  return onColumnResizeHandleMouseDown;
}
