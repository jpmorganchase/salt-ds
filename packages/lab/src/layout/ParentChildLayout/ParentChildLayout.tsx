import {
  forwardRef,
  HTMLAttributes,
  ReactNode,
  useEffect,
  useState,
} from "react";
import cx from "classnames";

import { makePrefixer } from "@brandname/core";
import { FlexLayout } from "../FlexLayout";
import { ParentChildItem, SlideDirection } from "../ParentChildItem";
import "./ParentChildLayout.css";
import { AnimationsDirection } from "../types";
import { useId } from "../../utils";
import { useIsStacked } from "./";

export type StackedViewElement = "parent" | "child";

export interface ParentChildLayoutProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Width to be applied to the parent element
   */
  parentWidth?: number | string;
  /**
   * Breakpoint at which the parent and child will stack.
   */
  stackedAtBreakpoint?: number;
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
  orientation?: AnimationsDirection;
  /**
   * Controls the space between columns.
   */
  gap?: number | string;
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
    parentWidth,
    stackedAtBreakpoint = 600,
    stackedViewElement = "parent",
    disableAnimations = false,
    parent,
    child,
    className,
    style,
    orientation = "horizontal",
    gap,
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

  const stackedViewStyles = { width: "100%", height: "100%" };

  const stackedViewChildren = {
    parent: (
      <ParentChildItem
        id={useId()}
        disableAnimations={disableAnimations}
        direction={direction}
        {...stackedViewStyles}
      >
        {parent}
      </ParentChildItem>
    ),
    child: (
      <ParentChildItem
        id={useId()}
        disableAnimations={disableAnimations}
        direction={direction}
        {...stackedViewStyles}
      >
        {child}
      </ParentChildItem>
    ),
  };

  return (
    <FlexLayout
      className={cx(className, withBaseName(), {
        [withBaseName("stacked")]: stackedView,
      })}
      ref={ref}
      wrap="nowrap"
      colGap={gap}
      style={style}
      {...rest}
    >
      {stackedView ? (
        stackedViewChildren[stackedViewElement]
      ) : (
        <>
          <ParentChildItem stretch={0} width={parentWidth}>
            {parent}
          </ParentChildItem>
          <ParentChildItem stretch={2}>{child}</ParentChildItem>
        </>
      )}
    </FlexLayout>
  );
});
