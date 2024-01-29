import {
  Breakpoints,
  FlexLayout,
  FlexLayoutProps,
  makePrefixer,
} from "@salt-ds/core";

import { clsx } from "clsx";
import { forwardRef, ReactNode } from "react";
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
   * Parent component to be rendered
   */
  parent: ReactNode;
  /**
   * Child component to be rendered
   */
  child: ReactNode;
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
    parent,
    child,
    className,
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

  const isStacked = useIsViewportLargerThanBreakpoint(collapseAtBreakpoint);

  const stackedViewChildren = {
    parent: (
      <ParentChildItem isStacked className={withBaseName("parent")}>
        {parent}
      </ParentChildItem>
    ),
    child: (
      <ParentChildItem isStacked className={withBaseName("child")}>
        {child}
      </ParentChildItem>
    ),
  };

  return (
    <FlexLayout
      ref={ref}
      className={clsx(
        withBaseName(),
        { [withBaseName(`no-animations`)]: disableAnimations },
        className
      )}
      {...rest}
    >
      {isStacked ? (
        stackedViewChildren[collapsedViewElement]
      ) : (
        <>
          <ParentChildItem grow={0}>{parent}</ParentChildItem>
          <ParentChildItem grow={2}>{child}</ParentChildItem>
        </>
      )}
    </FlexLayout>
  );
});
