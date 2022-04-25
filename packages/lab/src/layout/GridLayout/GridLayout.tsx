import { forwardRef, HTMLAttributes } from "react";
import cx from "classnames";

import { makePrefixer } from "@brandname/core";
import { ResponsiveProp, useResponsiveProp } from "../../utils";
import "./GridLayout.css";

export interface GridLayoutProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Number of columns to be displayed
   */
  columns?: ResponsiveProp<number>;
  /**
   * Number of rows to be displayed
   */
  rows?: ResponsiveProp<number>;
  /**
   * Defines the size of the gutter between the columns and the rows by setting a density multiplier.
   */
  gap?: ResponsiveProp<number>;
  /**
   * Defines the size of the gutter between the columns by setting a density multiplier.
   */
  columnGap?: ResponsiveProp<number>;
  /**
   * Defines the size of the gutter between the rows by setting a density multiplier
   */
  rowGap?: ResponsiveProp<number>;
}

const withBaseName = makePrefixer("uitkGridLayout");

export const GridLayout = forwardRef<HTMLDivElement, GridLayoutProps>(
  function GridLayout(
    {
      children,
      className,
      columns = 12,
      rows = 1,
      gap = 1,
      columnGap,
      rowGap,
      style,
    },
    ref
  ) {
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
        ref={ref}
      >
        {children}
      </div>
    );
  }
);
