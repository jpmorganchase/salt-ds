import {
  Breakpoints,
  FlexLayout,
  FlexLayoutProps,
  makePrefixer,
} from "@salt-ds/core";

import { clsx } from "clsx";
import { ElementType, forwardRef, HTMLAttributes, ReactNode } from "react";
import { ParentChildItem } from "./ParentChildItem";
import { useIsViewportLargerThanBreakpoint } from "../utils";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import parentChildLayoutCss from "./ParentChildLayout.css";

export type StackedViewElement = "parent" | "child";

export interface ParentChildLayoutProps extends HTMLAttributes<HTMLDivElement> {
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
   * Controls the space between columns.
   */
  gap?: FlexLayoutProps<ElementType>["gap"];
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

  const stackedView = useIsViewportLargerThanBreakpoint(collapseAtBreakpoint);

  const stackedViewChildren = {
    parent: (
      <ParentChildItem
        disableAnimations={disableAnimations}
        isStacked={stackedView}
        className={withBaseName("parent")}
      >
        {parent}
      </ParentChildItem>
    ),
    child: (
      <ParentChildItem
        disableAnimations={disableAnimations}
        isStacked={stackedView}
        className={withBaseName("child")}
      >
        {child}
      </ParentChildItem>
    ),
  };

  return (
    <FlexLayout ref={ref} className={clsx(withBaseName(), className)} {...rest}>
      {stackedView ? (
        stackedViewChildren[collapsedViewElement]
      ) : (
        <>
          <ParentChildItem grow={0} disableAnimations={disableAnimations}>
            {parent}
          </ParentChildItem>
          <ParentChildItem grow={2} disableAnimations={disableAnimations}>
            {child}
          </ParentChildItem>
        </>
      )}
    </FlexLayout>
  );
});
