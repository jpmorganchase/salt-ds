/* eslint-disable react/display-name */
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
      columns?: ResponsiveProp<number> | ResponsiveProp<(number | string)[]>;
      /**
       * Number of rows to be displayed. Defaults to 1
       */
      rows?: ResponsiveProp<number | string>;
      /**
       * Defines the size of the gutter between the columns and the rows by setting a density multiplier. Defaults to 3
       */
      gap?: ResponsiveProp<number>;
      /**
       * Defines the size of the gutter between the columns by setting a density multiplier. Defaults to 1
       */
      columnGap?: ResponsiveProp<number>;
      /**
       * Defines the size of the gutter between the rows by setting a density multiplier. Defaults to 1
       */
      rowGap?: ResponsiveProp<number>;
    }
  >;

type GridLayoutComponent = <T extends ElementType = "div">(
  props: GridLayoutProps<T>
) => ReactElement | null;

const withBaseName = makePrefixer("saltGridLayout");

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
    const Component = as ?? "div";

    const gridColumns = useResponsiveProp<number | string>(
      !Array.isArray(columns)
        ? Number(columns)
        : columns
            .map((column) =>
              typeof column === "number" ? `${column}fr` : column
            )
            .join(" "),
      12
    );

    const gridRows = useResponsiveProp(
      typeof rows === "number" ? rows : undefined,
      1
    );

    const gridAutoRows = useResponsiveProp(
      typeof rows === "string" ? rows : undefined,
      "auto"
    );

    const gridGap = useResponsiveProp(gap, 3);

    const gridColumnGap = useResponsiveProp(columnGap, 3);

    const gridRowGap = useResponsiveProp(rowGap, 3);

    const gridLayoutStyles = {
      ...style,
      [!Array.isArray(columns)
        ? "--gridLayout-columns"
        : "--gridLayout-columnTemplate"]: gridColumns,
      "--gridLayout-rows": gridRows,
      "--gridLayout-autoRows": gridAutoRows,
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
