import { forwardRef, HTMLAttributes } from "react";
import { clsx } from "clsx";
import {
  FlexItem,
  flexItemAlignment,
  makePrefixer,
  ResponsiveProp,
} from "@salt-ds/core";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import parentChildItemCss from "./ParentChildItem.css";

export type SlideDirection = "top" | "bottom" | "left" | "right";

export interface ParentChildItemProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Allows the alignment specified by parent to be overridden for individual items, default is "start".
   */
  align?: flexItemAlignment;
  /**
   * Disable all animations.
   */
  disableAnimations?: boolean;
  /**
   * Direction for slide animations.
   */
  direction?: SlideDirection;
  /**
   * Defines the ability for an item to grow x times more compared to it's siblings, default is 0.
   */
  grow?: ResponsiveProp<number>;
  /**
   * Determines whether the component is stacked
   */
  isStacked?: boolean;
  /**
   * Defines the ability for an item to shrink x times more compared to it's siblings, default is 1.

   */
  shrink?: ResponsiveProp<number>;
}

const withBaseName = makePrefixer("saltParentChildItem");
export const ParentChildItem = forwardRef<HTMLDivElement, ParentChildItemProps>(
  function ParentChildItem(
    {
      disableAnimations = false,
      direction,
      isStacked,
      children,
      className,
      ...rest
    },
    ref
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-parent-child-item",
      css: parentChildItemCss,
      window: targetWindow,
    });

    return (
      <FlexItem
        className={clsx(
          withBaseName(),
          {
            ...(direction && {
              [withBaseName(`slide-${direction}`)]: !disableAnimations,
            }),
            "saltFlexItem-stacked": isStacked,
          },
          className
        )}
        ref={ref}
        {...rest}
      >
        {children}
      </FlexItem>
    );
  }
);
