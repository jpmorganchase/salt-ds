import { forwardRef, HTMLAttributes } from "react";
import { makePrefixer } from "@brandname/core";
import "./FlexItem.css";
import cx from "classnames";

const withBaseName = makePrefixer("uitkFlexItem");
export const FLEX_ITEM_ALIGNMENTS = [
  "auto",
  "start",
  "end",
  "center",
  "baseline",
  "stretch",
];

export type flexItemAlignment = typeof FLEX_ITEM_ALIGNMENTS[number];

export interface FlexItemProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Allows the alignment specified by parent to be overridden for individual items.
   */
  alignSelf?: flexItemAlignment;
  /**
   * Controls the order in which the item appears in the flex container.
   */
  order?: number;
  resizeable?: boolean;
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
  /**
   * Defines the item's width
   */
  width?: number | string;
  /**
   * Defines the item's height
   */
  height?: number | string;
}

export const FlexItem = forwardRef<HTMLDivElement, FlexItemProps>(
  function FlexItem(
    {
      alignSelf = "auto",
      children,
      className,
      order,
      resizeable,
      shrink = 1,
      stretch,
      width,
      height,
      style,
      ...rest
    },
    ref
  ) {
    const flexStyles = {
      ...style,
      alignSelf,
      order,
      flexGrow: stretch,
      flexShrink: shrink,
      width,
      height,
    };
    return (
      <div
        className={cx(className, withBaseName())}
        style={flexStyles}
        ref={ref}
        {...rest}
      >
        {children}
      </div>
    );
  }
);
