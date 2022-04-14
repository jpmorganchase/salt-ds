import { forwardRef, HTMLAttributes } from "react";
import { makePrefixer } from "@brandname/core";
import "./FlexItem.css";
import cx from "classnames";

const withBaseName = makePrefixer("uitkFlexItem");
export const FLEX_ITEM_ALIGNMENTS = ["start", "end", "center", "stretch"];

export type flexItemAlignment = typeof FLEX_ITEM_ALIGNMENTS[number];

export interface FlexItemProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Allows the alignment specified by parent to be overridden for individual items.
   */
  align?: flexItemAlignment;
  /**
   * Defines the ability for an item to shrink x times more compared to it's siblings,
   *default is 1
   */
  shrink?: number;
  /**
   * Defines the ability for an item to grow x times more compared to it's siblings,
   * default is 0
   */
  stretch?: number;
}

export const FlexItem = forwardRef<HTMLDivElement, FlexItemProps>(
  function FlexItem(
    { align, children, className, shrink, stretch, style, ...rest },
    ref
  ) {
    const itemStyle = {
      "--item-alignment": align,
      "--shrink": shrink,
      "--stretch": stretch,
      ...style,
    };
    return (
      <div
        className={cx(className, withBaseName())}
        ref={ref}
        style={itemStyle}
        {...rest}
      >
        {children}
      </div>
    );
  }
);
