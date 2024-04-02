import { Breakpoints, FlexLayoutProps, makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";
import { forwardRef, ReactNode, useEffect } from "react";
import { useIsViewportLargerThanBreakpoint } from "../utils";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import parentChildLayoutCss from "./ParentChildLayout.css";

export type StackedViewElement = "parent" | "child";

export interface ParentChildLayoutProps extends FlexLayoutProps<"div"> {
  /**
   * Breakpoint at which the parent and child will stack.
   */
  collapseAtBreakpoint?: keyof Breakpoints;
  /**
   * Change element that is displayed when in staked view.
   */
  collapseChildElement?: boolean;
  /**
   * Disable all animations.
   */
  disableAnimations?: boolean;
  /**
   * Parent component to be rendered
   */
  parent: ReactNode;
  /**
   * Child component to be rendered
   */
  child: ReactNode;
  /**
   * Function called when the viewport size equal to or less than the collapseAtBreakpoint variable
   */
  // What is the use case for this ??
  onCollapseChange?: (isCollapsed: boolean) => void;
}

const withBaseName = makePrefixer("saltParentChildLayout");

export const ParentChildLayout = forwardRef<
  HTMLDivElement,
  ParentChildLayoutProps
>(function ParentChildLayout(
  {
    collapseAtBreakpoint = "sm",
    collapseChildElement,
    parent,
    child,
    disableAnimations,
    className,
    onCollapseChange,
    ...rest
  },
  ref
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-parent-child-layout",
    css: parentChildLayoutCss,
    window: targetWindow,
  });

  const isCollapsed = useIsViewportLargerThanBreakpoint(collapseAtBreakpoint);

  useEffect(() => {
    onCollapseChange?.(isCollapsed);
  }, [isCollapsed, onCollapseChange]);

  return (
    <div ref={ref} className={clsx(withBaseName(), className)} {...rest}>
      {isCollapsed ? (
        <div
          className={clsx({
            [withBaseName("collapsed")]: isCollapsed,
            [withBaseName("childAnimation")]:
              !collapseChildElement && !disableAnimations,
            [withBaseName("parentAnimation")]:
              collapseChildElement && !disableAnimations,
          })}
        >
          {isCollapsed && collapseChildElement ? parent : child}
        </div>
      ) : (
        <>
          <div>{parent}</div>
          <div className={withBaseName("child")}>{child}</div>
        </>
      )}
    </div>
  );
});
