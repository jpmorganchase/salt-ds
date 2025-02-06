import { clsx } from "clsx";
import { type ElementType, type ReactElement, forwardRef } from "react";

import {
  type PolymorphicComponentPropWithRef,
  type PolymorphicRef,
  type ResponsiveProp,
  makePrefixer,
  resolveResponsiveValue,
} from "../utils";

import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { useBreakpoint } from "../breakpoints";
import { parseSpacing } from "../flex-layout/parseSpacing";
import gridLayoutCss from "./GridLayout.css";

export type GridLayoutProps<T extends ElementType> =
  PolymorphicComponentPropWithRef<
    T,
    {
      /**
       * Number of columns to be displayed. Defaults to 12
       */
      columns?: ResponsiveProp<number | string>;
      /**
       * Number of rows to be displayed. Defaults to 1
       */
      rows?: ResponsiveProp<number | string>;
      /**
       * Defines the size of the gutter between the columns and the rows by setting a density multiplier. Defaults to 3
       */
      gap?: ResponsiveProp<number | string>;
      /**
       * Defines the size of the gutter between the columns by setting a density multiplier. Defaults to 1
       */
      columnGap?: ResponsiveProp<number | string>;
      /**
       * Defines the size of the gutter between the rows by setting a density multiplier. Defaults to 1
       */
      rowGap?: ResponsiveProp<number | string>;
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

type GridLayoutComponent = <T extends ElementType = "div">(
  props: GridLayoutProps<T>,
) => ReactElement | null;

const withBaseName = makePrefixer("saltGridLayout");

function parseGridValue(value: number | string | undefined) {
  if (value === undefined || typeof value === "string") {
    return value;
  }

  return `repeat(${value}, 1fr)`;
}

export const GridLayout: GridLayoutComponent = forwardRef(
  <T extends ElementType = "div">(
    {
      as,
      children,
      className,
      columns = 12,
      rows = 1,
      gap = 3,
      margin,
      padding,
      columnGap,
      rowGap,
      style,
      ...rest
    }: GridLayoutProps<T>,
    ref?: PolymorphicRef<T>,
  ) => {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-grid-layout",
      css: gridLayoutCss,
      window: targetWindow,
    });
    const Component = as || "div";

    const { matchedBreakpoints } = useBreakpoint();

    const gridColumns = resolveResponsiveValue(columns, matchedBreakpoints);

    const gridRows = resolveResponsiveValue(rows, matchedBreakpoints);

    const gridGap = resolveResponsiveValue(gap, matchedBreakpoints);

    const gridColumnGap = resolveResponsiveValue(columnGap, matchedBreakpoints);

    const gridRowGap = resolveResponsiveValue(rowGap, matchedBreakpoints);
    const gridMargin = resolveResponsiveValue(margin, matchedBreakpoints);
    const gridPadding = resolveResponsiveValue(padding, matchedBreakpoints);
    const gridLayoutStyles = {
      "--gridLayout-margin": parseSpacing(gridMargin),
      "--gridLayout-padding": parseSpacing(gridPadding),
      ...style,
      "--gridLayout-columns": parseGridValue(gridColumns),
      "--gridLayout-rows": parseGridValue(gridRows),
      "--gridLayout-columnGap": parseSpacing(gridColumnGap ?? gridGap),
      "--gridLayout-rowGap": parseSpacing(gridRowGap ?? gridGap),
    };

    return (
      <Component
        className={clsx(withBaseName(), className)}
        style={gridLayoutStyles}
        ref={ref}
        {...rest}
      >
        {children}
      </Component>
    );
  },
);
