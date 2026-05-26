import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import toolbarContentNextCss from "./ToolbarContentNext.css";

export type ToolbarContentNextPosition = "start" | "center" | "end";

export interface ToolbarContentNextProps
  extends ComponentPropsWithoutRef<"div"> {
  /**
   * Controls where the content is placed across the full toolbar.
   * If any content uses `"center"`, `ToolbarNext` reserves symmetric side space
   * so the center band stays on the toolbar midpoint.
   */
  position: ToolbarContentNextPosition;
}

const withBaseName = makePrefixer("saltToolbarContentNext");

export const ToolbarContentNext = forwardRef<
  HTMLDivElement,
  ToolbarContentNextProps
>(function ToolbarContentNext({ children, className, position, ...rest }, ref) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-toolbar-content-next",
    css: toolbarContentNextCss,
    window: targetWindow,
  });

  return (
    <div
      className={clsx(withBaseName(), className)}
      {...rest}
      data-position={position}
      ref={ref}
    >
      {children}
    </div>
  );
});
