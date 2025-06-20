import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { forwardRef } from "react";
import { Portal } from "../../portal";
import dropIndicatorCss from "./DropIndicator.css";
import type { Rect } from "./dragDropTypes";

export const DropIndicator = forwardRef<
  HTMLDivElement,
  { className?: string; rect: Rect }
>(function DropIndicator({ rect }, forwardedRef) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-drop-indicator",
    css: dropIndicatorCss,
    window: targetWindow,
  });

  const { left, top, width, height } = rect;
  return (
    <Portal>
      <div
        className={"saltDropIndicator"}
        ref={forwardedRef}
        style={{ left, top, width, height }}
      />
    </Portal>
  );
});
