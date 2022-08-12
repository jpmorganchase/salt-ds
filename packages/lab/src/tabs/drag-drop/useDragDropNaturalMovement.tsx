import { useCallback, useRef, useState } from "react";

import { DragDropHook, Direction } from "./dragDropTypes";
import { useTransition } from "./useTransition";

import {
  dimensions,
  isDraggedElement,
  MeasuredDropTarget,
  measureDropTargets,
  moveDragItem,
  getDraggedItem,
  getNextDropTarget,
} from "./drag-utils";

import { Draggable } from "./Draggable";

const dragThreshold = 3;
const animationDuration = "0.15s";

export const useDragDropNaturalMovement: DragDropHook = ({
  onDrop,
  orientation,
  containerRef,
  itemQuery = "*",
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPortal, setDragPortal] = useState<JSX.Element | null>(null);
  const draggableRef = useRef<HTMLDivElement>(null);
  const startPos = useRef(0);
  const previousPos = useRef(0);
  const mouseOffset = useRef(0);
  const dragLimits = useRef({ start: 0, end: 0 });
  const dragDirection = useRef<Direction | undefined>();
  const dropTarget = useRef<MeasuredDropTarget | null>(null);
  const measuredDropTargets = useRef<MeasuredDropTarget[]>([]);
  const { applyTransition } = useTransition();

  const displaceItem = useCallback(
    (
      item: MeasuredDropTarget | null = null,
      size: number,
      useTransition = false
    ) => {
      if (item) {
        const { START } = dimensions(orientation);
        if (useTransition) {
          applyTransition(item.element, "margin-left", `${size}px`);
          // item.element.style.cssText = `margin-${START}: ${size}px;transition: margin-left ${animationDuration};`;
        } else {
          item.element.style.cssText = `margin-${START}: ${size}px;`;
        }
      }
    },
    []
  );

  const clearDisplacedItem = useCallback(
    (item: MeasuredDropTarget | null = null, useTransition = false) => {
      if (item) {
        const { START } = dimensions(orientation);
        if (useTransition) {
          item.element.style.cssText = `transition: margin-${START} ${animationDuration}; margin-left:0px;`;
        } else {
          item.element.style.cssText = ``;
        }
      }
    },
    []
  );

  const dragMouseMoveHandler = useCallback(
    (evt) => {
      const { POS } = dimensions(orientation);
      const { [POS]: clientPos } = evt;
      const { current: lastClientPos } = previousPos;
      const { current: currentDropTarget } = dropTarget;
      const { current: dropTargets } = measuredDropTargets;
      const draggedItem = getDraggedItem(dropTargets);

      if (Math.abs(lastClientPos - clientPos) > 0) {
        previousPos.current = clientPos;

        let moveDistance = clientPos - startPos.current;

        const pos = startPos.current - mouseOffset.current + moveDistance;
        const renderPos = Math.max(
          dragLimits.current.start,
          Math.min(dragLimits.current.end, pos)
        );

        if (draggableRef.current && containerRef.current) {
          // Have to redefine the following here as we're using it as a style type not a DOMRect type
          const START = orientation === "horizontal" ? "left" : "top";
          draggableRef.current.style[START] = renderPos + "px";

          const direction = lastClientPos < clientPos ? "fwd" : "bwd";
          const offsetPos = clientPos - mouseOffset.current;
          const leadingEdge =
            direction === "fwd"
              ? offsetPos + (draggedItem.size as number)
              : offsetPos;

          const nextDropTarget = getNextDropTarget(
            measuredDropTargets.current,
            leadingEdge,
            direction
          );

          if (
            nextDropTarget &&
            (nextDropTarget.index !== currentDropTarget?.index ||
              direction !== dragDirection.current)
          ) {
            const newDropTargets = moveDragItem(dropTargets, nextDropTarget);
            const draggedItem = getDraggedItem(newDropTargets);

            if (currentDropTarget) {
              const displacedItemIndex = currentDropTarget.currentIndex + 1;
              const displacedItem = dropTargets[displacedItemIndex];
              clearDisplacedItem(displacedItem, true);
            }
            const nextDisplacedItem =
              newDropTargets[draggedItem.currentIndex + 1];
            displaceItem(nextDisplacedItem, draggedItem.size, true);

            dropTarget.current = nextDropTarget;
            dragDirection.current = direction;
            measuredDropTargets.current = newDropTargets;
          }
        }
      }
    },
    [clearDisplacedItem, containerRef, displaceItem, orientation]
  );

  const dragMouseUpHandler = useCallback(() => {
    removeEventListener("mousemove", dragMouseMoveHandler, false);
    removeEventListener("mouseup", dragMouseUpHandler, false);

    const { current: dropTargets } = measuredDropTargets;
    const draggedItem = getDraggedItem(dropTargets);
    const { index: fromIndex, currentIndex: toIndex } = draggedItem;

    const displacedItemIndex = toIndex + 1;
    const displacedItem = dropTargets[displacedItemIndex];
    clearDisplacedItem(displacedItem);
    dropTarget.current = null;
    dragDirection.current = undefined;

    setDragPortal(null);

    if (fromIndex !== toIndex) {
      onDrop(fromIndex, toIndex);
    }
    setIsDragging(false);
  }, [clearDisplacedItem, dragMouseMoveHandler, onDrop]);

  const preDragMouseMoveHandler = useCallback(
    (evt: MouseEvent) => {
      const { POS, START } = dimensions(orientation);
      const { [POS]: clientPos } = evt;
      let mouseMoveDistance = Math.abs(clientPos - startPos.current);
      if (mouseMoveDistance > dragThreshold && containerRef.current) {
        removeEventListener("mousemove", preDragMouseMoveHandler, false);
        removeEventListener("mouseup", preDragMouseUpHandler, false);

        const evtTarget = evt.target as HTMLElement;
        const dragElement = evtTarget.closest(itemQuery) as HTMLElement;
        if (dragElement) {
          const dropTargets = measureDropTargets(
            containerRef.current as HTMLElement,
            orientation,
            dragElement
          );
          const draggedItem = dropTargets.find(isDraggedElement);
          if (draggedItem) {
            measuredDropTargets.current = dropTargets;
            dropTarget.current = draggedItem;

            const containerRect = containerRef.current.getBoundingClientRect();
            const draggableRect = draggedItem.element.getBoundingClientRect();
            mouseOffset.current = clientPos - draggedItem.start;
            const [lastItem] = dropTargets.slice(-1);
            const lastChildEnd = lastItem.end;

            dragLimits.current.start = containerRect[START];
            dragLimits.current.end = lastChildEnd - draggedItem.size;

            setDragPortal(
              <Draggable
                className="tabstrip"
                ref={draggableRef}
                rect={draggableRect}
                element={dragElement.cloneNode(true) as HTMLElement}
              />
            );

            if (draggedItem !== lastItem) {
              const nextItem = dropTargets[draggedItem.index + 1];
              displaceItem(nextItem, draggedItem.size, false);
            }

            setIsDragging(true);
          }

          addEventListener("mousemove", dragMouseMoveHandler, false);
          addEventListener("mouseup", dragMouseUpHandler, false);
        }
      }
    },
    [
      containerRef,
      displaceItem,
      dragMouseMoveHandler,
      dragMouseUpHandler,
      itemQuery,
      orientation,
      setIsDragging,
    ]
  );

  const preDragMouseUpHandler = useCallback(() => {
    removeEventListener("mousemove", preDragMouseMoveHandler, false);
    removeEventListener("mouseup", preDragMouseUpHandler, false);
  }, [preDragMouseMoveHandler]);

  const mouseDownHandler = useCallback(
    (evt) => {
      if (containerRef.current) {
        const { POS } = dimensions(orientation);
        const { [POS]: clientPos } = evt;
        startPos.current = clientPos;
        previousPos.current = clientPos;

        addEventListener("mousemove", preDragMouseMoveHandler, false);
        addEventListener("mouseup", preDragMouseUpHandler, false);
      }
    },
    [containerRef, orientation, preDragMouseMoveHandler, preDragMouseUpHandler]
  );

  const draggedItemIndex = isDragging
    ? getDraggedItem(measuredDropTargets.current).index
    : -1;

  return {
    draggable: dragPortal,
    dropIndicator: null,
    draggedItemIndex,
    isDragging,
    onMouseDown: mouseDownHandler,
  };
};
