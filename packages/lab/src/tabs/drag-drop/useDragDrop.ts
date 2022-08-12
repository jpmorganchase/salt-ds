import { DragDropHook } from "./dragDropTypes";
import { useDragDropIndicator } from "./useDragDropIndicator";
import { useDragDropNaturalMovement } from "./useDragDropNaturalMovement";

const NULL_DRAG_DROP_RESULT = {
  draggable: null,
  isDragging: false,
  dropIndicator: null,
};
const noDragDrop: DragDropHook = () => NULL_DRAG_DROP_RESULT;

export const useDragDrop: DragDropHook = ({
  allowDragDrop,
  extendedDropZone = false,
  onDrop,
  orientation = "horizontal",
  containerRef,
  itemQuery = "uitkTab",
}) => {
  const isDropIndicator = allowDragDrop === "drop-indicator";
  const useDragDropHook: DragDropHook = isDropIndicator
    ? useDragDropIndicator
    : allowDragDrop
    ? useDragDropNaturalMovement
    : noDragDrop;

  const dragDropHook = useDragDropHook({
    containerRef,
    extendedDropZone: isDropIndicator,
    onDrop,
    orientation,
    itemQuery,
  });

  return dragDropHook;
};
