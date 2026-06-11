import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { makePrefixer } from "../utils";

import toolbarContentCss from "./ToolbarContent.css";

export type ToolbarContentPosition = "start" | "center" | "end";

export interface ToolbarContentProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Controls where the content is placed across the full toolbar.
   * If any content uses `"center"`, `Toolbar` reserves symmetric side space
   * so the center band stays on the toolbar midpoint.
   */
  position: ToolbarContentPosition;
}

const withBaseName = makePrefixer("saltToolbarContent");

export const ToolbarContent = forwardRef<HTMLDivElement, ToolbarContentProps>(
  function ToolbarContent({ children, className, position, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-toolbar-content",
      css: toolbarContentCss,
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
  },
);
