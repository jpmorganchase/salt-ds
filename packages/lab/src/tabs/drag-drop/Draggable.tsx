import { Portal, useForkRef } from "@jpmorganchase/uitk-core";
import cx from "classnames";
import { forwardRef, useCallback } from "react";
import { Rect } from "./dragDropTypes";

import "./Draggable.css";

const makeClassNames = (classNames: string) =>
  classNames.split(" ").map((className) => `uitkDraggable-${className}`);
export const Draggable = forwardRef<
  HTMLDivElement,
  { className: string; element: HTMLElement; rect: Rect; scale?: number }
>(function Draggable({ className, element, rect, scale = 1 }, forwardedRef) {
  const callbackRef = useCallback((el: HTMLDivElement) => {
    if (el) {
      el.innerHTML = "";
      el.appendChild(element);
      if (scale !== 1) {
        el.style.transform = `scale(${scale},${scale})`;
      }
    }
  }, []);
  const forkedRef = useForkRef<HTMLDivElement>(forwardedRef, callbackRef);

  const { left, top, width, height } = rect;

  return (
    <Portal>
      <div
        className={cx("uitkDraggable", ...makeClassNames(className))}
        ref={forkedRef}
        style={{ left, top, width, height }}
      />
    </Portal>
  );
});
