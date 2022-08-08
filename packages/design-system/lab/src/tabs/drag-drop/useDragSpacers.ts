import { useCallback, useMemo, useRef } from "react";
import { MeasuredDropTarget } from "./drag-utils";
import { createDragSpacer } from "./Draggable";
import { Direction } from "./dragDropTypes";

export const useDragSpacers = () => {
  const animationFrame = useRef(0);
  const transitioning = useRef(false);

  const spacers = useMemo(
    // We only need to listen for transition end on one of the spacers
    () => [createDragSpacer(transitioning), createDragSpacer()],
    []
  );

  const clearSpacers = useCallback(
    () =>
      spacers.forEach((spacer) => spacer.parentElement?.removeChild(spacer)),
    []
  );

  const animateTransition = useCallback((size: number) => {
    const [spacer1, spacer2] = spacers;
    animationFrame.current = requestAnimationFrame(() => {
      transitioning.current = true;
      spacer1.style.cssText = "width: 0px";
      spacer2.style.cssText = `width: ${size}px`;
      spacers[0] = spacer2;
      spacers[1] = spacer1;
    });
  }, []);

  const cancelAnyPendingAnimation = useCallback(() => {
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = 0;
    }
  }, []);

  const displaceItem = useCallback(
    (
      item: MeasuredDropTarget | null = null,
      size: number,
      useTransition = false,
      direction?: Direction
    ) => {
      if (item) {
        const [spacer1, spacer2] = spacers;
        cancelAnyPendingAnimation();
        if (useTransition) {
          if (transitioning.current) {
            clearSpacers();

            spacer1.style.cssText = `width: ${size}px`;
            spacer2.style.cssText = `width: 0px`;

            const target =
              direction === "fwd"
                ? item.element.previousElementSibling
                : item.element.nextElementSibling;

            item.element.parentElement?.insertBefore(spacer1, target);
            item.element.parentElement?.insertBefore(spacer2, item.element);
          } else {
            item.element.parentElement?.insertBefore(spacer2, item.element);
          }
          animateTransition(size);
        } else {
          spacer1.style.cssText = `width: ${size}px`;
          item.element.parentElement?.insertBefore(spacer1, item.element);
        }
      }
    },
    []
  );
  const displaceLastItem = useCallback(
    (item: MeasuredDropTarget, size: number, useTransition = false) => {
      const [spacer1, spacer2] = spacers;
      cancelAnyPendingAnimation();
      if (useTransition) {
        if (transitioning.current) {
          clearSpacers();

          spacer1.style.cssText = `width: ${size}px`;
          spacer2.style.cssText = `width: 0px`;

          item.element.parentElement?.insertBefore(
            spacer1,
            item.element.previousElementSibling
          );
          item.element.parentElement?.insertBefore(
            spacer2,
            item.element.nextElementSibling
          );
        } else {
          item.element.parentElement?.insertBefore(
            spacer2,
            item.element.nextElementSibling
          );
        }
        animateTransition(size);
      } else {
        spacer1.style.cssText = `width: ${size}px`;
        item.element.parentElement?.insertBefore(
          spacer1,
          item.element.nextElementSibling
        );
      }
    },
    []
  );

  return {
    displaceItem,
    displaceLastItem,
    clearSpacers,
  };
};
