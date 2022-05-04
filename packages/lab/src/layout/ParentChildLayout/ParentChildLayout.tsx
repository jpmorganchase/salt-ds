import {
  forwardRef,
  HTMLAttributes,
  ReactNode,
  useEffect,
  useState,
  ComponentPropsWithoutRef,
} from "react";
import cx from "classnames";

import { makePrefixer, Breakpoints } from "@jpmorganchase/uitk-core";
import { FlexLayout } from "../FlexLayout";
import { ParentChildItem, SlideDirection } from "../ParentChildItem";
import "./ParentChildLayout.css";
import { useIsStacked } from "./";

type FlexLayoutProps = ComponentPropsWithoutRef<typeof FlexLayout>;

export type StackedViewElement = "parent" | "child";

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
  orientation?: "horizontal" | "vertical";
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
  const [direction, setDirection] = useState<SlideDirection>("right");

  useEffect(() => {
    if (orientation === "horizontal") {
      stackedViewElement === "parent"
        ? setDirection("left")
        : setDirection("right");
    } else {
      stackedViewElement === "parent"
        ? setDirection("bottom")
        : setDirection("top");
    }
  }, [orientation, stackedViewElement]);

  const stackedView = useIsStacked(stackedAtBreakpoint);

  const stackedViewChildren = {
    parent: (
      <ParentChildItem
        disableAnimations={disableAnimations}
        direction={direction}
        isStacked={stackedView}
      >
        {parent}
      </ParentChildItem>
    ),
    child: (
      <ParentChildItem
        disableAnimations={disableAnimations}
        direction={direction}
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
          <ParentChildItem grow={0}>{parent}</ParentChildItem>
          <ParentChildItem grow={2}>{child}</ParentChildItem>
        </>
      )}
    </FlexLayout>
  );
});
