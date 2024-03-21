import {
  Breakpoints,
  FlexLayout,
  FlexItem,
  FlexLayoutProps,
  makePrefixer,
} from "@salt-ds/core";

import { clsx } from "clsx";
import { forwardRef, ReactNode, useCallback, useEffect } from "react";
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
   * Position of the parent component within the layout.
   */
  parentPosition?: "left" | "right";
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
    collapseChildElement,
    disableAnimations,
    parentPosition = "left",
    parent,
    child,
    gap = 0,
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

  console.log(collapseChildElement);

  // const collapsedViewChildren = {
  //   parent: (
  //     <FlexItem
  //       style={{ background: "pink" }}
  //       className={clsx(withBaseName("parent"), {
  //         ["saltFlexItem-stacked"]: isCollapsed,
  //       })}
  //     >
  //       {parent}
  //     </FlexItem>
  //   ),
  //   child: (
  //     <FlexItem
  //       className={clsx(withBaseName("child"), {
  //         ["saltFlexItem-stacked"]: isCollapsed,
  //       })}
  //     >
  //       {child}
  //     </FlexItem>
  //   ),
  // };

  // This is being called every time the componet gets mounted
  useEffect(() => {
    onCollapseChange?.(isCollapsed);
  }, [isCollapsed, onCollapseChange]);

  return (
    <FlexLayout
      ref={ref}
      className={clsx(
        withBaseName(),
        {
          [withBaseName(`no-animations`)]: disableAnimations,
          [withBaseName(`reversed`)]: parentPosition === "right",
        },
        className
      )}
      gap={gap}
      {...rest}
    >
      {isCollapsed ? (
        <FlexItem
          style={{ background: "pink" }}
          className={clsx(
            // { [withBaseName("parent")]: collapseChildElement },
            // { [withBaseName("child")]: !collapseChildElement },
            {
              ["saltFlexItem-stacked"]: isCollapsed,
            }
          )}
        >
          {isCollapsed && collapseChildElement ? parent : child}
        </FlexItem>
      ) : (
        <>
          <FlexItem grow={0}>{parent}</FlexItem>
          <FlexItem grow={2}>{child}</FlexItem>
        </>
      )}
    </FlexLayout>
  );
});
