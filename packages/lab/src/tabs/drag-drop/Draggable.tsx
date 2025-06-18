import { useForkRef } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef, type MutableRefObject, useCallback } from "react";
import { Portal } from "../../portal";
import draggableCss from "./Draggable.css";
import type { Rect } from "./dragDropTypes";

const makeClassNames = (classNames: string) =>
  classNames.split(" ").map((className) => `saltDraggable-${className}`);
export const Draggable = forwardRef<
  HTMLDivElement,
  { wrapperClassName: string; element: HTMLElement; rect: Rect; scale?: number }
>(function Draggable(
  { wrapperClassName, element, rect, scale = 1 },
  forwardedRef,
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-draggable",
    css: draggableCss,
    window: targetWindow,
  });

  const callbackRef = useCallback(
    (el: HTMLDivElement) => {
      if (el) {
        el.innerHTML = "";
        el.appendChild(element);
        if (scale !== 1) {
          el.style.transform = `scale(${scale},${scale})`;
        }
      }
    },
    [element, scale],
  );
  const forkedRef = useForkRef<HTMLDivElement>(forwardedRef, callbackRef);

  const { left, top, width, height } = rect;

  return (
    <Portal>
      <div
        className={clsx("saltDraggable", ...makeClassNames(wrapperClassName))}
        ref={forkedRef}
        style={{ left, top, width, height }}
      />
    </Portal>
  );
});

export const createDragSpacer = (
  transitioning?: MutableRefObject<boolean>,
): HTMLElement => {
  const spacer = document.createElement("div");
  spacer.className = "saltDraggable-spacer";
  if (transitioning) {
    spacer.addEventListener("transitionend", () => {
      transitioning.current = false;
    });
  }
  return spacer;
};
