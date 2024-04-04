import { Breakpoints, makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";
import {
  ComponentPropsWithoutRef,
  forwardRef,
  ReactNode,
  useEffect,
} from "react";
import { useIsViewportLargerThanBreakpoint } from "../utils";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import parentChildLayoutCss from "./ParentChildLayout.css";

export type StackedViewElement = "parent" | "child";

export interface ParentChildLayoutProps
  extends ComponentPropsWithoutRef<"div"> {
  /**
   * Breakpoint at which the parent and child will stack.
   */
  collapseAtBreakpoint?: keyof Breakpoints;
  /**
   * Change element that is displayed when in staked view.
   */
  collapsableView?: "child" | "parent";
  /**
   * Controls the space between parent and child components, default is 0.
   */
  gap: number;
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
  onCollapseChange?: (isCollapsed: boolean) => void;
}

const withBaseName = makePrefixer("saltParentChildLayout");

export const ParentChildLayout = forwardRef<
  HTMLDivElement,
  ParentChildLayoutProps
>(function ParentChildLayout(
  {
    collapseAtBreakpoint = "sm",
    collapsableView = "child",
    parent,
    child,
    className,
    gap = 0,
    onCollapseChange,
    style,
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
    console.log("useEffect");
  }, [isCollapsed, onCollapseChange]);

  const parentChildLayoutStyles = {
    ...style,
    "--parentChildLayout-gap": `calc(var(--salt-spacing-100) * ${gap})`,
  };

  return (
    <div
      ref={ref}
      className={clsx(withBaseName(), className)}
      style={parentChildLayoutStyles}
      {...rest}
    >
      {isCollapsed ? (
        <div
          className={clsx({
            [withBaseName("collapsed")]: isCollapsed,
            [withBaseName("childAnimation")]: collapsableView === "child",
            [withBaseName("parentAnimation")]: collapsableView === "parent",
          })}
        >
          {isCollapsed && collapsableView === "parent" ? parent : child}
        </div>
      ) : (
        <>
          <div className={withBaseName("parent")}>{parent}</div>
          <div className={withBaseName("child")}>{child}</div>
        </>
      )}
    </div>
  );
});
