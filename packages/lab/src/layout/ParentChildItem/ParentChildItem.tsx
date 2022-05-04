import { forwardRef } from "react";
import cx from "classnames";

import { makePrefixer } from "@jpmorganchase/uitk-core";
import { FlexItem, FlexItemProps } from "../FlexItem";
import "./ParentChildItem.css";

export type SlideDirection = "top" | "bottom" | "left" | "right";

export interface ParentChildItemProps extends FlexItemProps {
  /**
   * Disable all animations.
   */
  disableAnimations?: boolean;
  /**
   * Direction for slide animations.
   */
  direction?: SlideDirection;
  /**
   * Determines whether the component is stacked
   */
  isStacked?: boolean;
}

const withBaseName = makePrefixer("uitkParentChildItem");
export const ParentChildItem = forwardRef<HTMLDivElement, ParentChildItemProps>(
  function ParentChildItem(
    {
      disableAnimations = true,
      direction,
      isStacked,
      children,
      className,
      ...rest
    },
    ref
  ) {
    return (
      <FlexItem
        className={cx(className, withBaseName(), {
          [withBaseName(`slide-${direction}`)]: !disableAnimations,
          [withBaseName("stacked")]: isStacked,
        })}
        ref={ref}
        {...rest}
      >
        {children}
      </FlexItem>
    );
  }
);
