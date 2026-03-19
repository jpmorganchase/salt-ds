import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import toolbarRegionCss from "./ToolbarRegion.css";

export type ToolbarRegionPosition = "start" | "center" | "end";

export interface ToolbarRegionProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Controls where the region is placed across the full toolbar.
   */
  position: ToolbarRegionPosition;
}

const withBaseName = makePrefixer("saltToolbarRegion");

export const ToolbarRegion = forwardRef<HTMLDivElement, ToolbarRegionProps>(
  function ToolbarRegion({ children, className, position, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-toolbar-region",
      css: toolbarRegionCss,
      window: targetWindow,
    });

    return (
      <div
        className={clsx(withBaseName(), className)}
        data-position={position}
        ref={ref}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
