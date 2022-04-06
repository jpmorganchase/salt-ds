import { forwardRef } from "react";
import cx from "classnames";

import { makePrefixer } from "@brandname/core";
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
}

const withBaseName = makePrefixer("uitkParentChildItem");
export const ParentChildItem = forwardRef<HTMLDivElement, ParentChildItemProps>(
  function ParentChildItem(
    {
      disableAnimations = true,
      direction,
      children,
      className,
      style,
      ...rest
    },
    ref
  ) {
    return (
      <FlexItem
        className={cx(className, withBaseName(), {
          [withBaseName(`slide-${direction}`)]: !disableAnimations,
        })}
        ref={ref}
        style={style}
        {...rest}
      >
        {children}
      </FlexItem>
    );
  }
);
