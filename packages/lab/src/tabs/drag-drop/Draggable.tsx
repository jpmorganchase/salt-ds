import { Portal, useForkRef } from "@jpmorganchase/uitk-core";
import cx from "classnames";
import { forwardRef, MutableRefObject, useCallback } from "react";
import { Rect } from "./dragDropTypes";

import "./Draggable.css";

const makeClassNames = (classNames: string) =>
  classNames.split(" ").map((className) => `uitkDraggable-${className}`);
export const Draggable = forwardRef<
  HTMLDivElement,
  { wrapperClassName: string; element: HTMLElement; rect: Rect; scale?: number }
>(function Draggable(
  { wrapperClassName, element, rect, scale = 1 },
  forwardedRef
) {
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
    [element, scale]
  );
  const forkedRef = useForkRef<HTMLDivElement>(forwardedRef, callbackRef);

  const { left, top, width, height } = rect;

  return (
    <Portal>
      <div
        className={cx("uitkDraggable", ...makeClassNames(wrapperClassName))}
        ref={forkedRef}
        style={{ left, top, width, height }}
      />
    </Portal>
  );
});

export const createDragSpacer = (
  transitioning?: MutableRefObject<boolean>
): HTMLElement => {
  const spacer = document.createElement("div");
  spacer.className = "uitkDraggable-spacer";
  if (transitioning) {
    spacer.addEventListener("transitionend", () => {
      transitioning.current = false;
    });
  }
  return spacer;
};
