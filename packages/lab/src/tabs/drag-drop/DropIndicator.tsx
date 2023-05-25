import { Portal } from "../../portal";
import { forwardRef } from "react";
import { Rect } from "./dragDropTypes";

import dropIndicatorCss from "./DropIndicator.css";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

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
        className={`saltDropIndicator`}
        ref={forwardedRef}
        style={{ left, top, width, height }}
      />
    </Portal>
  );
});
