import { forwardRef, HTMLAttributes } from "react";
import { makePrefixer, ResponsiveProp, useResponsiveProp } from "../../utils";
import "./FlexItem.css";
import cx from "classnames";

const withBaseName = makePrefixer("uitkFlexItem");
export const FLEX_ITEM_ALIGNMENTS = [
  "start",
  "end",
  "center",
  "stretch",
] as const;

export type flexItemAlignment = typeof FLEX_ITEM_ALIGNMENTS[number];

export interface FlexItemProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Allows the alignment specified by parent to be overridden for individual items, default is "start".
   */
  align?: flexItemAlignment;
  /**
   * Defines the ability for an item to shrink x times more compared to it's siblings, default is 1.
   
   */
  shrink?: ResponsiveProp<number>;
  /**
   * Defines the ability for an item to grow x times more compared to it's siblings, default is 0.
   */
  grow?: ResponsiveProp<number>;
}

export const FlexItem = forwardRef<HTMLDivElement, FlexItemProps>(
  function FlexItem(
    { align, children, className, shrink, grow, style, ...rest },
    ref
  ) {
    const flexItemShrink = useResponsiveProp(shrink, 1);
    const flexItemGrow = useResponsiveProp(grow, 0);

    const itemStyle = {
      "--uitkFlexItem-item-alignment": align,
      "--uitkFlexItem-shrink": flexItemShrink,
      "--uitkFlexItem-grow": flexItemGrow,
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
