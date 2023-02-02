import { Rect } from "./dragDropTypes";
import { forwardRef } from "react";
import { Portal } from "../../portal";

import "./DropIndicator.css";

export const DropIndicator = forwardRef<
  HTMLDivElement,
  { className?: string; rect: Rect }
>(function DropIndicator({ rect }, forwardedRef) {
  const { left, top, width, height } = rect;
  return (
    <Portal>
      <div
        className={`saltDropIndicator`}
        ref={forwardedRef}
        style={{ left, top, width, height }}
      />
    </Portal>
  );
});
