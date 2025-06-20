import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type CSSProperties,
  type ElementType,
  type ForwardedRef,
  type FunctionComponent,
  forwardRef,
} from "react";
import { useBreakpoint } from "../breakpoints";
import { parseSpacing } from "../flex-layout/parseSpacing";
import {
  makePrefixer,
  type PolymorphicComponentPropWithRef,
  type PolymorphicRef,
  type ResponsiveProp,
  resolveResponsiveValue,
} from "../utils";
import flexItemCss from "./FlexItem.css";

const withBaseName = makePrefixer("saltFlexItem");
export const FLEX_ITEM_ALIGNMENTS = [
  "start",
  "end",
  "center",
  "stretch",
] as const;

export type flexItemAlignment = (typeof FLEX_ITEM_ALIGNMENTS)[number];

export type FlexItemProps<T extends ElementType> =
  PolymorphicComponentPropWithRef<
    T,
    {
      /**
       * Allows the alignment specified by parent to be overridden for individual items, default is "start".
       */
      align?: flexItemAlignment;
      /**
       * Defines the ability for an item to shrink x times more compared to its siblings, default is 1.
       */
      shrink?: ResponsiveProp<number>;
      /**
       * Defines the ability for an item to grow x times more compared to its siblings, default is 0.
       */
      grow?: ResponsiveProp<number>;
      /**
       * Sets the initial main size of a flex item, default is "auto".
       */
      basis?: ResponsiveProp<CSSProperties["flexBasis"]>;
      /**
       * Defines the margin around the component. It can be specified as a number (which acts as a multiplier) or a string representing the margin value. Default is `0`.
       */
      margin?: ResponsiveProp<number | string>;
      /**
       * Defines the padding within the component. It can be specified as a number (which acts as a multiplier) or a string representing the padding value. Default is `0`.
       */
      padding?: ResponsiveProp<number | string>;
    }
  >;

type FlexItemComponent = <T extends ElementType = "div">(
  props: FlexItemProps<T>,
) => ReturnType<FunctionComponent>;

export const FlexItem: FlexItemComponent = forwardRef(function FlexItem<
  T extends ElementType = "div",
>(
  {
    as,
    align,
    children,
    className,
    margin = 0,
    padding = 0,
    shrink,
    grow,
    basis,
    style,
    ...rest
  }: FlexItemProps<T>,
  ref?: ForwardedRef<unknown>,
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-flex-item",
    css: flexItemCss,
    window: targetWindow,
  });
  const { matchedBreakpoints } = useBreakpoint();

  const Component = as || "div";
  const flexItemShrink = resolveResponsiveValue(shrink, matchedBreakpoints);
  const flexItemGrow = resolveResponsiveValue(grow, matchedBreakpoints);
  const flexItemBasis = resolveResponsiveValue(basis, matchedBreakpoints);
  const flexItemMargin = resolveResponsiveValue(margin, matchedBreakpoints);
  const flexItemPadding = resolveResponsiveValue(padding, matchedBreakpoints);

  const itemStyle = {
    "--flexItem-margin": parseSpacing(flexItemMargin),
    "--flexItem-padding": parseSpacing(flexItemPadding),
    "--saltFlexItem-alignment": align,
    "--saltFlexItem-shrink": flexItemShrink,
    "--saltFlexItem-grow": flexItemGrow,
    "--saltFlexItem-basis": flexItemBasis,
    ...style,
  };
  return (
    <Component
      className={clsx(withBaseName(), className)}
      ref={ref as PolymorphicRef<T>}
      style={itemStyle}
      {...rest}
    >
      {children}
    </Component>
  );
});
