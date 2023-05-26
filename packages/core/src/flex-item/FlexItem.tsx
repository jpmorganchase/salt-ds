import { forwardRef, ElementType, ReactElement, CSSProperties } from "react";
import {
  makePrefixer,
  ResponsiveProp,
  useResponsiveProp,
  PolymorphicComponentPropWithRef,
  PolymorphicRef,
} from "../utils";
import flexItemCss from "./FlexItem.css";
import { clsx } from "clsx";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

const withBaseName = makePrefixer("saltFlexItem");
export const FLEX_ITEM_ALIGNMENTS = [
  "start",
  "end",
  "center",
  "stretch",
] as const;

export type flexItemAlignment = typeof FLEX_ITEM_ALIGNMENTS[number];

export type FlexItemProps<T extends ElementType> =
  PolymorphicComponentPropWithRef<
    T,
    {
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
      /**
       * Sets the initial main size of a flex item, default is "auto".
       */
      basis?: ResponsiveProp<CSSProperties["flexBasis"]>;
    }
  >;

type FlexItemComponent = <T extends ElementType = "div">(
  props: FlexItemProps<T>
) => ReactElement | null;

export const FlexItem: FlexItemComponent = forwardRef(
  <T extends ElementType = "div">(
    {
      as,
      align,
      children,
      className,
      shrink,
      grow,
      basis,
      style,
      ...rest
    }: FlexItemProps<T>,
    ref?: PolymorphicRef<T>
  ) => {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-flex-item",
      css: flexItemCss,
      window: targetWindow,
    });

    const Component = as || "div";
    const flexItemShrink = useResponsiveProp(shrink, 1);
    const flexItemGrow = useResponsiveProp(grow, 0);
    const flexItemBasis = useResponsiveProp(basis, "auto");

    const itemStyle = {
      "--saltFlexItem-alignment": align,
      "--saltFlexItem-shrink": flexItemShrink,
      "--saltFlexItem-grow": flexItemGrow,
      "--saltFlexItem-basis": flexItemBasis,
      ...style,
    };
    return (
      <Component
        className={clsx(withBaseName(), className)}
        ref={ref}
        style={itemStyle}
        {...rest}
      >
        {children}
      </Component>
    );
  }
);
