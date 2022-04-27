import { forwardRef, HTMLAttributes } from "react";
import { makePrefixer } from "@jpmorganchase/uitk-core";
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
  grow?: number;
}

export const FlexItem = forwardRef<HTMLDivElement, FlexItemProps>(
  function FlexItem(
    { align, children, className, shrink, grow, style, ...rest },
    ref
  ) {
    const itemStyle = {
      "--uitkFlexItem-item-alignment": align,
      "--uitkFlexItem-shrink": shrink,
      "--uitkFlexItem-grow": grow,
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
