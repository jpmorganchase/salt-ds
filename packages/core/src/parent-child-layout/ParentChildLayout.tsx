import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
  useEffect,
} from "react";
import type { Breakpoints } from "../breakpoints";
import { makePrefixer } from "../utils";
import parentChildLayoutCss from "./ParentChildLayout.css";
import { useIsViewportLargerThanBreakpoint } from "./useIsViewportLargerThanBreakpoint";
export interface ParentChildLayoutProps
  extends ComponentPropsWithoutRef<"div"> {
  /**
   * Breakpoint at which the parent and child will stack.
   */
  collapseAtBreakpoint?: keyof Breakpoints;
  /**
   * View that is displayed when in a collapsed state.
   */
  visibleView?: "child" | "parent";
  /**
   * Controls the space between parent and child components, default is 0.
   */
  gap?: number;
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
    visibleView = "child",
    parent,
    child,
    className,
    gap = 0,
    onCollapseChange,
    style,
    ...rest
  },
  ref,
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
          key={visibleView}
          className={clsx({
            [withBaseName("collapsed")]: isCollapsed,
            [withBaseName("childAnimation")]: visibleView === "child",
            [withBaseName("parentAnimation")]: visibleView === "parent",
          })}
        >
          {isCollapsed && visibleView === "child" ? child : parent}
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
