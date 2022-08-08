import { Portal } from "@jpmorganchase/uitk-core";
import { forwardRef } from "react";
import { Rect } from "./dragDropTypes";

import "./DropIndicator.css";

export const DropIndicator = forwardRef<
  HTMLDivElement,
  { className?: string; rect: Rect }
>(function DropIndicator({ rect }, forwardedRef) {
  const { left, top, width, height } = rect;
  return (
    <Portal>
      <div
        className={`uitkDropIndicator`}
        ref={forwardedRef}
        style={{ left, top, width, height }}
      />
    </Portal>
  );
});
