import { forwardRef, ReactElement, ElementType } from "react";
import { clsx } from "clsx";

import {
  makePrefixer,
  ResponsiveProp,
  PolymorphicComponentPropWithRef,
  PolymorphicRef,
  resolveResponsiveValue,
} from "../utils";

import gridLayoutCss from "./GridLayout.css";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useMatchedBreakpointContext } from "../salt-provider/matched-breakpoints";

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
    }
  >;

type GridLayoutComponent = <T extends ElementType = "div">(
  props: GridLayoutProps<T>
) => ReactElement | null;

const withBaseName = makePrefixer("saltGridLayout");

function parseGridValue(value: number | string | undefined) {
  if (value === undefined || typeof value === "string") {
    return value;
  }

  return `repeat(${value}, 1fr)`;
}

function parseSpacing(value: number | string | undefined) {
  if (value === undefined || typeof value === "string") {
    return value;
  }

  return `calc(var(--salt-spacing-100) * ${value})`;
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
      columnGap,
      rowGap,
      style,
      ...rest
    }: GridLayoutProps<T>,
    ref?: PolymorphicRef<T>
  ) => {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-grid-layout",
      css: gridLayoutCss,
      window: targetWindow,
    });
    const Component = as || "div";

    const { matchedBreakpoints } = useMatchedBreakpointContext();

    const gridColumns = resolveResponsiveValue(columns, matchedBreakpoints);

    const gridRows = resolveResponsiveValue(rows, matchedBreakpoints);

    const gridGap = resolveResponsiveValue(gap, matchedBreakpoints);

    const gridColumnGap = resolveResponsiveValue(columnGap, matchedBreakpoints);

    const gridRowGap = resolveResponsiveValue(rowGap, matchedBreakpoints);

    const gridLayoutStyles = {
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
  }
);
