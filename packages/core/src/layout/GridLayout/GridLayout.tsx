import { forwardRef, HTMLAttributes } from "react";
import cx from "classnames";

import { makePrefixer } from "@jpmorganchase/uitk-core";
import {
  ResponsiveProp,
  useResponsiveProp,
} from "@jpmorganchase/uitk-lab/src/utils";
import "./GridLayout.css";

export interface GridLayoutProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Number of columns to be displayed. Defaults to 12
   */
  columns?: ResponsiveProp<number>;
  /**
   * Number of rows to be displayed. Defaults to 1
   */
  rows?: ResponsiveProp<number>;
  /**
   * Defines the size of the gutter between the columns and the rows by setting a density multiplier. Defaults to 1
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
      "--grid-layout-column-gap":
        gridColumnGap !== undefined ? gridColumnGap : gridGap,
      "--grid-layout-row-gap": gridRowGap !== undefined ? gridRowGap : gridGap,
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
