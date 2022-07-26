import { MouseEventHandler, useCallback, useRef, useState } from "react";

import { DragDropHook, Direction } from "./dragDropTypes";
import { useDragSpacers } from "./useDragSpacers";

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

export const useDragDropNaturalMovement: DragDropHook = ({
  onDrop,
  orientation = "horizontal",
  containerRef,
  itemQuery = "*",
}) => {
  const [showOverflow, setShowOverflow] = useState(false);
  const overflowMenuShowingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPortal, setDragPortal] = useState<JSX.Element | null>(null);
  const draggableRef = useRef<HTMLDivElement>(null);
  const startPos = useRef(0);
  const previousPos = useRef(0);
  const mouseOffset = useRef(0);
  const mouseDownTimer = useRef<number | null>(null);
  const dragLimits = useRef({ start: 0, end: 0 });
  const dragDirection = useRef<Direction | undefined>();
  const dropTarget = useRef<MeasuredDropTarget | null>(null);
  const measuredDropTargets = useRef<MeasuredDropTarget[]>([]);
  const { clearSpacers, displaceItem, displaceLastItem } = useDragSpacers();

  const dragMouseMoveHandler = useCallback(
    (evt: MouseEvent) => {
      const { POS } = dimensions(orientation);
      const { [POS]: clientPos } = evt;
      const { current: lastClientPos } = previousPos;
      const { current: currentDropTarget } = dropTarget;
      const { current: dropTargets } = measuredDropTargets;
      const draggedItem = getDraggedItem(dropTargets);

      if (Math.abs(lastClientPos - clientPos) > 0) {
        previousPos.current = clientPos;

        const moveDistance = clientPos - startPos.current;

        const pos = startPos.current - mouseOffset.current + moveDistance;
        const renderPos = Math.max(
          dragLimits.current.start,
          Math.min(dragLimits.current.end, pos)
        );

        if (draggableRef.current && containerRef.current) {
          // Have to redefine the following here as we're using it as a style type not a DOMRect type
          const START = orientation === "horizontal" ? "left" : "top";
          draggableRef.current.style[START] = `${renderPos}px`;

          const direction = lastClientPos < clientPos ? "fwd" : "bwd";
          const offsetPos = clientPos - mouseOffset.current;
          const leadingEdge =
            direction === "fwd" ? offsetPos + draggedItem.size : offsetPos;

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
            if (nextDropTarget.isOverflowIndicator) {
              // Does this belong in here or can we abstract it out
              setShowOverflow((overflowMenuShowingRef.current = true));
            } else {
              const newDropTargets = moveDragItem(dropTargets, nextDropTarget);
              const draggedItem = getDraggedItem(newDropTargets);

              const nextDisplacedItem =
                newDropTargets[draggedItem.currentIndex + 1];
              if (nextDisplacedItem) {
                displaceItem(
                  nextDisplacedItem,
                  draggedItem.size,
                  true,
                  direction
                );
              } else {
                const displacedItem =
                  newDropTargets[draggedItem.currentIndex - 1];
                displaceLastItem(displacedItem, draggedItem.size, true);
              }
              measuredDropTargets.current = newDropTargets;
              setShowOverflow((overflowMenuShowingRef.current = false));
            }

            dropTarget.current = nextDropTarget;
            dragDirection.current = direction;
          }
        }
      }
    },
    [containerRef, displaceItem, displaceLastItem, orientation]
  );

  const dragMouseUpHandler = useCallback(() => {
    window.removeEventListener("mousemove", dragMouseMoveHandler, false);
    window.removeEventListener("mouseup", dragMouseUpHandler, false);

    clearSpacers();

    const { current: dropTargets } = measuredDropTargets;
    const draggedItem = getDraggedItem(dropTargets);
    const { dataIndex = -1, index, currentIndex: toIndex } = draggedItem;

    const fromIndex = dataIndex !== -1 ? dataIndex : index;
    dropTarget.current = null;
    dragDirection.current = undefined;

    setDragPortal(null);

    if (overflowMenuShowingRef.current) {
      onDrop(fromIndex, -1);
    } else if (fromIndex !== toIndex) {
      onDrop(fromIndex, toIndex);
    }
    setShowOverflow(false);
    setIsDragging(false);
  }, [clearSpacers, dragMouseMoveHandler, onDrop]);

  const enterDraggingState = useCallback(
    (evt: MouseEvent) => {
      const { POS, START } = dimensions(orientation);
      const { [POS]: clientPos } = evt;

      const evtTarget = evt.target as HTMLElement;
      const dragElement = evtTarget.closest(itemQuery) as HTMLElement;
      if (dragElement) {
        // TODO this is very specific to responsive Container
        const query = `:is(${itemQuery}:not([data-overflowed="true"]),[data-overflow-indicator])`;
        const dropTargets = measureDropTargets(
          containerRef.current as HTMLElement,
          orientation,
          dragElement,
          query
        );

        const draggedItem = dropTargets.find(isDraggedElement);
        if (draggedItem && containerRef.current) {
          measuredDropTargets.current = dropTargets;
          dropTarget.current = draggedItem;

          const containerRect = containerRef.current.getBoundingClientRect();
          const draggableRect = draggedItem.element.getBoundingClientRect();
          mouseOffset.current = clientPos - draggedItem.start;
          const [lastItem] = dropTargets.slice(-1);
          const lastChildEnd = lastItem.end;

          console.log({ lastItem });

          dragLimits.current.start = containerRect[START];
          dragLimits.current.end = lastItem.isOverflowIndicator
            ? Math.max(lastItem.start, containerRect.right - draggedItem.size)
            : lastChildEnd - draggedItem.size;

          setDragPortal(
            <Draggable
              wrapperClassName={`tabstrip-${orientation}`}
              ref={draggableRef}
              rect={draggableRect}
              element={dragElement.cloneNode(true) as HTMLElement}
            />
          );

          if (draggedItem !== lastItem) {
            const nextItem = dropTargets[draggedItem.index + 1];
            displaceItem(nextItem, draggedItem.size, false);
          } else {
            const displacedItem = dropTargets[draggedItem.index];
            displaceLastItem(displacedItem, draggedItem.size, false);
          }

          setIsDragging(true);
        }

        window.addEventListener("mousemove", dragMouseMoveHandler, false);
        window.addEventListener("mouseup", dragMouseUpHandler, false);
      }
    },
    [
      containerRef,
      displaceItem,
      displaceLastItem,
      dragMouseMoveHandler,
      dragMouseUpHandler,
      itemQuery,
      orientation,
      setIsDragging,
    ]
  );

  const preDragMouseMoveHandler = useCallback(
    (evt: MouseEvent) => {
      const { POS } = dimensions(orientation);
      const { [POS]: clientPos } = evt;
      const mouseMoveDistance = Math.abs(clientPos - startPos.current);
      if (mouseMoveDistance > dragThreshold && containerRef.current) {
        if (mouseDownTimer.current) {
          window.clearTimeout(mouseDownTimer.current);
          mouseDownTimer.current = null;
        }
        window.removeEventListener("mousemove", preDragMouseMoveHandler, false);
        window.removeEventListener("mouseup", preDragMouseUpHandler, false);

        enterDraggingState(evt);
      }
    },
    [containerRef, enterDraggingState, orientation]
  );

  const preDragMouseUpHandler = useCallback(() => {
    if (mouseDownTimer.current) {
      window.clearTimeout(mouseDownTimer.current);
      mouseDownTimer.current = null;
    }
    window.removeEventListener("mousemove", preDragMouseMoveHandler, false);
    window.removeEventListener("mouseup", preDragMouseUpHandler, false);
  }, [preDragMouseMoveHandler]);

  const mouseDownHandler: MouseEventHandler = useCallback(
    (evt) => {
      if (containerRef.current) {
        const { POS } = dimensions(orientation);
        const { [POS]: clientPos } = evt;
        startPos.current = clientPos;
        previousPos.current = clientPos;

        window.addEventListener("mousemove", preDragMouseMoveHandler, false);
        window.addEventListener("mouseup", preDragMouseUpHandler, false);

        evt.persist();

        mouseDownTimer.current = window.setTimeout(() => {
          window.removeEventListener(
            "mousemove",
            preDragMouseMoveHandler,
            false
          );
          window.removeEventListener("mouseup", preDragMouseUpHandler, false);

          enterDraggingState(evt.nativeEvent);
        }, 500);
      }
    },
    [
      containerRef,
      enterDraggingState,
      orientation,
      preDragMouseMoveHandler,
      preDragMouseUpHandler,
    ]
  );

  const draggedItemIndex = isDragging
    ? getDraggedItem(measuredDropTargets.current).dataIndex
    : -1;

  return {
    draggable: dragPortal,
    dropIndicator: null,
    draggedItemIndex,
    isDragging,
    onMouseDown: mouseDownHandler,
    revealOverflowedItems: showOverflow,
  };
};
