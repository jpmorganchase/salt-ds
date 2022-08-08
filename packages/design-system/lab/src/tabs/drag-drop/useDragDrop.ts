import { DragDropHook } from "./dragDropTypes";
import { useDragDropNaturalMovement } from "./useDragDropNaturalMovement";

const NULL_DRAG_DROP_RESULT = {
  draggable: null,
  isDragging: false,
  dropIndicator: null,
  revealOverflowedItems: false,
};
const noDragDrop: DragDropHook = () => NULL_DRAG_DROP_RESULT;

export const useDragDrop: DragDropHook = ({
  allowDragDrop,
  ...dragDropProps
}) => {
  const useDragDropHook: DragDropHook = allowDragDrop
    ? useDragDropNaturalMovement
    : noDragDrop;

  return useDragDropHook(dragDropProps);
};
