import { useCallback, useRef, useState } from "react";

import {
  dimensions,
  isDraggedElement,
  measureDropTargets,
  moveDragItem,
  getDraggedItem,
  getNextDropTarget,
} from "./drag-utils";

import { renderDraggable } from "./Draggable";

const dragThreshold = 3;

export const useDragDrop = ({
  allowDragDrop,
  onDrop,
  orientation,
  containerRef,
  itemQuery = "*",
}) => {
  const [dragPortal, setDragPortal] = useState(null);
  const draggableRef = useRef(null);
  const startPos = useRef(0);
  const previousPos = useRef(0);
  const mouseOffset = useRef(0);
  const dragLimits = useRef({ start: 0, end: 0 });
  const dragDirection = useRef();
  const scrollTimer = useRef(null);
  const isScrollable = useRef(false);
  const isScrolling = useRef(false);

  const displacedItem = useRef(null);
  const dropTarget = useRef(null);
  const measuredDropTargets = useRef([]);

  const displaceItem = useCallback(
    (item = null, size, displaceEnd) => {
      if (item) {
        const { START, END } = dimensions(orientation);
        const pos = displaceEnd ? END : START;
        item.element.style.cssText = `margin-${pos}: ${size}px;`;
        // item.element.style.cssText = `background-color: red;`;
        displacedItem.current = item;
      }
    },
    [orientation]
  );

  const clearDisplacedItem = useCallback(() => {
    if (displacedItem.current) {
      displacedItem.current.element.style.cssText = ``;
      displacedItem.current = null;
    }
  }, []);

  const getScrollDirection = useCallback(
    (mousePos) => {
      const { SCROLL_POS, SCROLL_SIZE, CLIENT_SIZE } = dimensions(orientation);
      // const { current: dropTargets } = measuredDropTargets;
      // const draggedItem = getDraggedItem(dropTargets);
      const {
        [SCROLL_POS]: scrollPos,
        [SCROLL_SIZE]: scrollSize,
        [CLIENT_SIZE]: clientSize,
      } = containerRef.current;
      const maxScroll = scrollSize - clientSize;
      const canScrollFwd = scrollPos < maxScroll;
      const viewportEnd = dragLimits.current.end;
      const bwd =
        scrollPos > 0 &&
        mousePos - mouseOffset.current <= dragLimits.current.start;
      const fwd = canScrollFwd && mousePos - mouseOffset.current >= viewportEnd;
      return bwd ? "bwd" : fwd ? "fwd" : "";
    },
    [containerRef, orientation]
  );

  const stopScrolling = useCallback(() => {
    clearTimeout(scrollTimer.current);
    scrollTimer.current = null;
    isScrolling.current = false;

    let { current: dropTargets } = measuredDropTargets;
    const draggedItem = getDraggedItem(dropTargets);

    // need to restore displaced item,
    measuredDropTargets.current = dropTargets = measureDropTargets(
      containerRef.current,
      orientation,
      draggedItem,
      itemQuery
    );
    const newDraggedItem = getDraggedItem(dropTargets);
    // const displacedItemOffset = scrollDirection === 'bwd' ? 0 : 1;
    if (newDraggedItem.isLast) {
      const nextDisplacedItem = dropTargets[newDraggedItem.currentIndex - 1];
      displaceItem(nextDisplacedItem, draggedItem.size, true);
    } else {
      const nextDisplacedItem = dropTargets[newDraggedItem.currentIndex + 1];
      displaceItem(nextDisplacedItem, draggedItem.size);
    }
  }, [containerRef, displaceItem, itemQuery, orientation]);

  const startScrolling = useCallback(
    (direction, scrollRate, scrollUnit = 30) => {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const maxScroll =
        direction === "fwd"
          ? scrollHeight - clientHeight - scrollTop
          : scrollTop;
      const nextScroll = Math.min(maxScroll, scrollUnit);

      if (direction === "fwd") {
        containerRef.current.scrollTop = scrollTop + nextScroll;
      } else {
        containerRef.current.scrollTop = scrollTop - nextScroll;
      }

      if (nextScroll === maxScroll) {
        stopScrolling();
      } else {
        isScrolling.current = true;
        scrollTimer.current = setTimeout(() => {
          startScrolling(direction, scrollRate, scrollUnit);
        }, 100);
      }
    },
    [containerRef, stopScrolling]
  );

  const dragMouseMoveHandler = useCallback(
    (evt) => {
      const { POS } = dimensions(orientation);
      const { [POS]: clientPos } = evt;
      const { current: lastClientPos } = previousPos;
      const { current: currentDropTarget } = dropTarget;
      let { current: dropTargets } = measuredDropTargets;
      const draggedItem = getDraggedItem(dropTargets);

      if (Math.abs(lastClientPos - clientPos) > 0) {
        previousPos.current = clientPos;

        let moveDistance = clientPos - startPos.current;
        const scrollDirection = getScrollDirection(clientPos);

        const pos = startPos.current - mouseOffset.current + moveDistance;
        const renderPos = Math.max(
          dragLimits.current.start,
          Math.min(dragLimits.current.end, pos)
        );

        if (scrollDirection && isScrollable.current && !isScrolling.current) {
          clearDisplacedItem();
          startScrolling(scrollDirection, 1);
        } else if (!scrollDirection && isScrolling.current) {
          stopScrolling();
        }

        if (!isScrolling.current) {
          // Have to redefine the following here as we're using it as a style type not a DOMRect type
          const START = orientation === "horizontal" ? "left" : "top";
          draggableRef.current.style[START] = renderPos + "px";

          const direction = lastClientPos < clientPos ? "fwd" : "bwd";

          const offsetPos = clientPos - mouseOffset.current;
          const leadingEdge =
            direction === "fwd" ? offsetPos + draggedItem.size : offsetPos;
          const nextDropTarget = getNextDropTarget(
            dropTargets,
            leadingEdge,
            direction
          );
          if (
            nextDropTarget &&
            !nextDropTarget.isDraggedElement &&
            (nextDropTarget.index !== currentDropTarget.index ||
              direction !== dragDirection.current)
          ) {
            const newDropTargets = moveDragItem(dropTargets, nextDropTarget);
            const draggedItem = getDraggedItem(newDropTargets);
            clearDisplacedItem();
            const displacedItemOffset = direction === "fwd" ? 1 : 1;
            if (draggedItem.isLast) {
              const nextDisplacedItem =
                newDropTargets[draggedItem.currentIndex - 1];
              displaceItem(nextDisplacedItem, draggedItem.size, true);
            } else {
              const nextDisplacedItem =
                newDropTargets[draggedItem.currentIndex + displacedItemOffset];
              if (nextDisplacedItem) {
                displaceItem(nextDisplacedItem, draggedItem.size);
              }
            }
            dropTarget.current = nextDropTarget;
            dragDirection.current = direction;
            measuredDropTargets.current = newDropTargets;
          }
        }
      }
    },
    [
      clearDisplacedItem,
      displaceItem,
      getScrollDirection,
      orientation,
      startScrolling,
      stopScrolling,
    ]
  );

  const dragMouseUpHandler = useCallback(() => {
    removeEventListener("mousemove", dragMouseMoveHandler, false);
    removeEventListener("mouseup", dragMouseUpHandler, false);

    const { current: dropTargets } = measuredDropTargets;
    const draggedItem = getDraggedItem(dropTargets);
    const { index: fromIndex, currentIndex: toIndex } = draggedItem;
    clearDisplacedItem();
    dropTarget.current = null;

    delete draggedItem.element.dataset.dragging;

    setDragPortal(null);

    if (fromIndex !== toIndex) {
      onDrop(fromIndex, toIndex);
    }
  }, [clearDisplacedItem, dragMouseMoveHandler, onDrop]);

  const preDragMouseMoveHandler = useCallback(
    (evt) => {
      const { DIMENSION, POS, START } = dimensions(orientation);
      const { [POS]: clientPos } = evt;
      let mouseMoveDistance = Math.abs(clientPos - startPos.current);
      if (mouseMoveDistance > dragThreshold && containerRef.current) {
        removeEventListener("mousemove", preDragMouseMoveHandler, false);
        removeEventListener("mouseup", preDragMouseUpHandler, false);

        const evtTarget = evt.target;
        const dragElement = evtTarget.closest(itemQuery);
        if (dragElement) {
          const dropTargets = measureDropTargets(
            containerRef.current,
            orientation,
            {
              element: dragElement,
            },
            itemQuery
          );

          console.log({ dropTargets });

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
            dragLimits.current.end = isScrollable.current
              ? containerRect[START] +
                containerRect[DIMENSION] -
                draggedItem.size
              : lastChildEnd - draggedItem.size;

            setDragPortal(
              renderDraggable(
                draggableRef,
                dragElement.cloneNode(true),
                "list",
                draggableRect
              )
            );

            dragElement.dataset.dragging = "true";

            if (draggedItem.isLast) {
              const nextItem = dropTargets[draggedItem.index - 1];
              displaceItem(nextItem, draggedItem.size, true);
            } else {
              const nextItem = dropTargets[draggedItem.index + 1];
              displaceItem(nextItem, draggedItem.size);
            }
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
    ]
  );

  const preDragMouseUpHandler = useCallback(() => {
    removeEventListener("mousemove", preDragMouseMoveHandler, false);
    removeEventListener("mouseup", preDragMouseUpHandler, false);
  }, [preDragMouseMoveHandler]);

  const mouseDownHandler = useCallback(
    (evt) => {
      if (containerRef.current) {
        const { POS, SCROLL_SIZE, CLIENT_SIZE } = dimensions(orientation);
        const { [POS]: clientPos } = evt;
        startPos.current = clientPos;
        previousPos.current = clientPos;

        const { [SCROLL_SIZE]: scrollSize, [CLIENT_SIZE]: clientSize } =
          containerRef.current;
        isScrollable.current = scrollSize > clientSize;

        addEventListener("mousemove", preDragMouseMoveHandler, false);
        addEventListener("mouseup", preDragMouseUpHandler, false);
      }
    },
    [containerRef, orientation, preDragMouseMoveHandler, preDragMouseUpHandler]
  );

  const isDragging = dragPortal !== null;
  const draggedItemIndex = isDragging
    ? getDraggedItem(measuredDropTargets.current).index
    : -1;

  return {
    draggable: dragPortal,
    dropIndicator: null,
    draggedItemIndex,
    isDragging: draggedItemIndex !== -1,
    onMouseDown: allowDragDrop ? mouseDownHandler : undefined,
  };
};
