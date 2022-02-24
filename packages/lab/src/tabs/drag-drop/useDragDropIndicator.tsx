import { useCallback, useRef, useState } from "react";

import { DragDropHook, Direction, FWD, BWD } from "./dragDropTypes";

import {
  dimensions,
  isDraggedElement,
  MeasuredDropTarget,
  measureDropTargets,
  getDraggedItem,
  getNextDropTarget,
} from "./drag-utils";

import { Draggable } from "./Draggable";
import { DropIndicator } from "./DropIndicator";

const dragThreshold = 3;

export const useDragDropIndicator: DragDropHook = ({
  onDrop,
  orientation,
  containerRef,
  itemQuery = "*",
  extendedDropZone,
}) => {
  const [dragPortal, setDragPortal] = useState<JSX.Element | null>(null);
  const [dropIndicator, setDropIndicator] = useState<JSX.Element | null>(null);
  const overExtendedDropZone = useRef(false);
  const draggableRef = useRef<HTMLDivElement>(null);
  const dropIndicatorRef = useRef<HTMLDivElement>(null);
  const startPos = useRef(0);
  const previousPos = useRef(0);
  const mouseOffset = useRef(0);
  const dragLimits = useRef({ start: 0, end: 0, end2: 0 });

  const dropTarget = useRef<{
    target: MeasuredDropTarget;
    direction?: Direction;
  } | null>(null);
  const measuredDropTargets = useRef<MeasuredDropTarget[]>([]);

  const dragMouseMoveHandler = useCallback(
    (evt) => {
      const { POS, CONTRA_POS } = dimensions(orientation);
      const { [POS]: clientPos, [CONTRA_POS]: contraPos } = evt;
      const { current: wasOverExtendedDropZone } = overExtendedDropZone;
      const { current: lastClientPos } = previousPos;
      const { current: currentDropTarget } = dropTarget;
      const { current: dropTargets } = measuredDropTargets;
      const draggedItem = getDraggedItem(dropTargets);

      if (Math.abs(lastClientPos - clientPos) > 0) {
        previousPos.current = clientPos;

        let moveDistance = clientPos - startPos.current;

        // const pos = startPos.current - mouseOffset.current + moveDistance;
        const pos = clientPos;
        const renderPos = Math.max(
          dragLimits.current.start,
          Math.min(dragLimits.current.end2, pos)
        );

        const isOverExtendedDropZone =
          renderPos - mouseOffset.current > dragLimits.current.end;

        if (draggableRef.current && containerRef.current) {
          // Have to redefine the following here as we're using it as a style type not a DOMRect type
          const START = orientation === "horizontal" ? "left" : "top";
          const CONTRA = orientation === "horizontal" ? "top" : "left";

          draggableRef.current.style[START] = renderPos + "px";
          draggableRef.current.style[CONTRA] = contraPos - 10 + "px";

          const direction = lastClientPos < clientPos ? FWD : BWD;
          const isFwd = direction === FWD;
          // const offsetPos = clientPos - mouseOffset.current;
          // const leadingEdge = isFwd
          //   ? offsetPos + (draggedItem.size as number)
          //   : offsetPos;

          const nextDropTarget = getNextDropTarget(
            measuredDropTargets.current,
            clientPos,
            direction
          );

          if (isOverExtendedDropZone && !wasOverExtendedDropZone) {
            console.log(`now were over the extended drop zone`);
            // draggableRef.current.style.transform = `scale(.5,.5)`;
            overExtendedDropZone.current = true;
          } else if (wasOverExtendedDropZone && !isOverExtendedDropZone) {
            console.log(`no longer over the extended drop zone`);
            // draggableRef.current.style.transform = `scale(.8,.8)`;
            overExtendedDropZone.current = false;
          }

          if (dropIndicatorRef.current) {
            const newDropTarget =
              nextDropTarget && nextDropTarget !== currentDropTarget?.target;
            const sameDropTarget =
              nextDropTarget && nextDropTarget === currentDropTarget?.target;
            if (newDropTarget) {
              const nextDropPosition = isFwd
                ? nextDropTarget.end
                : nextDropTarget.start;
              dropIndicatorRef.current.style.width = "2px";
              dropIndicatorRef.current.style.left = nextDropPosition + "px";
              dropTarget.current = { target: nextDropTarget, direction };
            } else if (
              sameDropTarget &&
              direction !== currentDropTarget.direction
            ) {
              const nextDropPosition = isFwd
                ? nextDropTarget.end
                : nextDropTarget.start;
              dropIndicatorRef.current.style.left = nextDropPosition + "px";
            } else if (!nextDropTarget || nextDropTarget.isDraggedElement) {
              dropIndicatorRef.current.style.width = "0px";
              dropTarget.current = nextDropTarget
                ? { target: nextDropTarget, direction }
                : null;
            }
          }
        }
      }
    },
    [containerRef, orientation]
  );

  const dragMouseUpHandler = useCallback(() => {
    removeEventListener("mousemove", dragMouseMoveHandler, false);
    removeEventListener("mouseup", dragMouseUpHandler, false);

    const { current: currentDropTarget } = dropTarget;
    const { current: dropTargets } = measuredDropTargets;
    const draggedItem = getDraggedItem(dropTargets);

    dropTarget.current = null;

    setDragPortal(null);
    setDropIndicator(null);

    if (currentDropTarget && !currentDropTarget?.target.isDraggedElement) {
      const { index: fromIndex } = draggedItem;
      const { index: toIndex } = currentDropTarget.target;
      onDrop(fromIndex, toIndex);
    }
  }, [dragMouseMoveHandler, onDrop]);

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
            dragElement,
            itemQuery
          );
          const draggedItem = dropTargets.find(isDraggedElement);
          if (draggedItem) {
            measuredDropTargets.current = dropTargets;
            dropTarget.current = { target: draggedItem };

            const containerRect = containerRef.current.getBoundingClientRect();
            const { left, top, width, height } =
              draggedItem.element.getBoundingClientRect();
            mouseOffset.current = clientPos - draggedItem.start;
            const [lastItem] = dropTargets.slice(-1);
            const lastChildEnd = lastItem.end;

            dragLimits.current.start = containerRect[START];
            dragLimits.current.end = lastChildEnd - draggedItem.size;
            // TODO what do we call it ?
            dragLimits.current.end2 = extendedDropZone
              ? containerRect.right - draggedItem.size
              : dragLimits.current.end;

            setDropIndicator(
              <DropIndicator
                ref={dropIndicatorRef}
                rect={{ left, top, width: 0, height }}
              />
            );
            setDragPortal(
              <Draggable
                className="tabstrip tooltip"
                ref={draggableRef}
                rect={{ left, top: top + 4, width, height: 20 }}
                element={dragElement.cloneNode(true) as HTMLElement}
              />
            );
          }

          addEventListener("mousemove", dragMouseMoveHandler, false);
          addEventListener("mouseup", dragMouseUpHandler, false);
        }
      }
    },
    [
      containerRef,
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

  const isDragging = dragPortal !== null;
  const draggedItemIndex = isDragging
    ? getDraggedItem(measuredDropTargets.current).index
    : -1;

  return {
    draggable: dragPortal,
    dropIndicator,
    draggedItemIndex,
    isDragging: draggedItemIndex !== -1,
    onMouseDown: mouseDownHandler,
  };
};
