import { forwardRef, ReactElement, ElementType } from "react";
import { clsx } from "clsx";

import {
  makePrefixer,
  ResponsiveProp,
  useResponsiveProp,
  PolymorphicComponentPropWithRef,
  PolymorphicRef,
} from "../utils";

import gridLayoutCss from "./GridLayout.css";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

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

function parseGridValue(value: number | string) {
  if (typeof value === "string") {
    return value;
  }

  return `repeat(${value}, 1fr)`;
}

function parseGridGap(value: number | string) {
  if (typeof value === "string") {
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
      gap,
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

    const gridColumns = useResponsiveProp(columns, 12, parseGridValue);

    const gridRows = useResponsiveProp(rows, 1, parseGridValue);

    const gridGap = useResponsiveProp(gap, 3, parseGridGap);

    const gridColumnGap = useResponsiveProp(columnGap, 3, parseGridGap);

    const gridRowGap = useResponsiveProp(rowGap, 3, parseGridGap);

    const gridLayoutStyles = {
      ...style,
      "--gridLayout-columns": gridColumns,
      "--gridLayout-rows": gridRows,
      "--gridLayout-columnGap": gridColumnGap ?? gridGap,
      "--gridLayout-rowGap": gridRowGap ?? gridGap,
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
