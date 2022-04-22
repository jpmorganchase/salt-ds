import { ForwardedRef, forwardRef, HTMLAttributes, ReactElement } from "react";
import cx from "classnames";

import { ResponsiveProp, useResponsiveProp } from "../../utils";
import { DefaultBreakpointType, makePrefixer } from "@brandname/core";
import "./GridLayout.css";

export interface GridLayoutProps<Breakpoint>
  extends HTMLAttributes<HTMLDivElement> {
  /**
   * Number of columns to be displayed
   */
  columns?: ResponsiveProp<number, Breakpoint>;
  /**
   * Number of rows to be displayed
   */
  rows?: ResponsiveProp<number, Breakpoint>;
  /**
   * Defines the size of the gutter between the columns and the rows by setting a density multiplier.
   */
  gap?: ResponsiveProp<number, Breakpoint>;
  /**
   * Defines the size of the gutter between the columns by setting a density multiplier.
   */
  columnGap?: ResponsiveProp<number, Breakpoint>;
  /**
   * Defines the size of the gutter between the rows by setting a density multiplier
   */
  rowGap?: ResponsiveProp<number, Breakpoint>;
}

const withBaseName = makePrefixer("uitkGridLayout");

const GenericGridLayout = <Breakpoint extends Record<string, unknown>>(
  {
    children,
    className,
    columns = 12,
    rows = 1,
    gap = 1,
    columnGap,
    rowGap,
    style,
  }: GridLayoutProps<Breakpoint>,
  forwardedRef: ForwardedRef<HTMLDivElement>
) => {
  const gridColumns = useResponsiveProp(columns, 12);

  const gridRows = useResponsiveProp(rows, 1);

  const gridGap = useResponsiveProp(gap, 1);

  const gridColumnGap = useResponsiveProp(columnGap, 1);

  const gridRowGap = useResponsiveProp(rowGap, 1);

  const gridLayoutStyles = {
    ...style,
    "--grid-layout-columns": gridColumns,
    "--grid-layout-rows": gridRows,
    "--grid-layout-column-gap": gridColumnGap ? gridColumnGap : gridGap,
    "--grid-layout-row-gap": gridRowGap ? gridRowGap : gridGap,
  };

  return (
    <div
      className={cx(withBaseName(), className)}
      style={gridLayoutStyles}
      ref={forwardedRef}
    >
      {children}
    </div>
  );
};

export const GridLayout = forwardRef(GenericGridLayout) as <
  Breakpoint = DefaultBreakpointType
>(
  props: GridLayoutProps<Breakpoint> & {
    ref?: ForwardedRef<HTMLDivElement>;
  }
) => ReactElement<GridLayoutProps<Breakpoint>>;
