import { makePrefixer } from "../../utils";

import cx from "classnames";
import {
  ComponentPropsWithoutRef,
  forwardRef,
  HTMLAttributes,
  ReactNode,
} from "react";
import { ParentChildItem, SlideDirection } from "../ParentChildItem";
import { useIsStacked } from "./useIsStacked";

import "./ParentChildLayout.css";
import { FlexLayout } from "../FlexLayout";
import { Breakpoints } from "../../breakpoints";

type FlexLayoutProps = ComponentPropsWithoutRef<typeof FlexLayout>;

export type StackedViewElement = "parent" | "child";

type Orientation = "horizontal" | "vertical";

export interface ParentChildLayoutProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Breakpoint at which the parent and child will stack.
   */
  stackedAtBreakpoint?: keyof Breakpoints;
  /**
   * Change element that is displayed when in staked view.
   */
  stackedViewElement?: StackedViewElement;
  /**
   * Disable all animations.
   */
  disableAnimations?: boolean;
  /**
   * Orientation for slide animations.
   */
  orientation?: Orientation;
  /**
   * Controls the space between columns.
   */
  gap?: FlexLayoutProps["gap"];
  /**
   * Parent component to be rendered
   */
  parent: ReactNode;
  /**
   * Child component to be rendered
   */
  child: ReactNode;
}

const withBaseName = makePrefixer("uitkParentChildLayout");

const getDirection = (
  orientation: Orientation,
  stackedViewElement: StackedViewElement
) => {
  let direction: SlideDirection = "right";

  if (orientation === "horizontal") {
    if (stackedViewElement === "parent") {
      direction = "left";
    } else {
      direction = "right";
    }
  } else {
    if (stackedViewElement === "parent") {
      direction = "bottom";
    } else {
      direction = "top";
    }
  }

  return direction;
};

export const ParentChildLayout = forwardRef<
  HTMLDivElement,
  ParentChildLayoutProps
>(function ParentChildLayout(
  {
    stackedAtBreakpoint = "sm",
    stackedViewElement = "parent",
    disableAnimations = false,
    parent,
    child,
    className,
    orientation = "horizontal",
    ...rest
  },
  ref
) {
  const stackedView = useIsStacked(stackedAtBreakpoint);

  const parentChildDirection = getDirection(orientation, stackedViewElement);

  const stackedViewChildren = {
    parent: (
      <ParentChildItem
        disableAnimations={disableAnimations}
        direction={parentChildDirection}
        isStacked={stackedView}
      >
        {parent}
      </ParentChildItem>
    ),
    child: (
      <ParentChildItem
        disableAnimations={disableAnimations}
        direction={parentChildDirection}
        isStacked={stackedView}
      >
        {child}
      </ParentChildItem>
    ),
  };

  return (
    <FlexLayout
      className={cx(className, withBaseName())}
      ref={ref}
      wrap={false}
      {...rest}
    >
      {stackedView ? (
        stackedViewChildren[stackedViewElement]
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
