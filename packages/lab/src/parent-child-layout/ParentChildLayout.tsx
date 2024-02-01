import {
  Breakpoints,
  FlexLayout,
  FlexLayoutProps,
  makePrefixer,
} from "@salt-ds/core";

import { clsx } from "clsx";
import { forwardRef, ReactNode, useEffect } from "react";
import { ParentChildItem } from "./ParentChildItem";
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
  collapsedViewElement?: StackedViewElement;
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
  onCollapseChange?: (isCollapsed: boolean) => void;
}

const withBaseName = makePrefixer("saltParentChildLayout");

export const ParentChildLayout = forwardRef<
  HTMLDivElement,
  ParentChildLayoutProps
>(function ParentChildLayout(
  {
    collapseAtBreakpoint = "sm",
    collapsedViewElement = "parent",
    disableAnimations = false,
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

  const collapsedViewChildren = {
    parent: (
      <ParentChildItem isCollapsed className={withBaseName("parent")}>
        {parent}
      </ParentChildItem>
    ),
    child: (
      <ParentChildItem isCollapsed className={withBaseName("child")}>
        {child}
      </ParentChildItem>
    ),
  };

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
        collapsedViewChildren[collapsedViewElement]
      ) : (
        <>
          <ParentChildItem grow={0}>{parent}</ParentChildItem>
          <ParentChildItem grow={2}>{child}</ParentChildItem>
        </>
      )}
    </FlexLayout>
  );
});
