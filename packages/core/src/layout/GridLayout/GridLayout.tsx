import { forwardRef, HTMLAttributes } from "react";
import cx from "classnames";

import { makePrefixer, ResponsiveProp, useResponsiveProp } from "../../utils";
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

const withBaseName = makePrefixer("uitkGridLayout");

export const GridLayout = forwardRef<HTMLDivElement, GridLayoutProps>(
  function GridLayout(
    {
      children,
      className,
      columns = 12,
      rows = 1,
      gap,
      columnGap,
      rowGap,
      style,
      ...rest
    },
    ref
  ) {
    const gridColumns = useResponsiveProp(columns, 12);

    const gridRows = useResponsiveProp(rows, 1);

    const gridGap = useResponsiveProp(gap, 3);

    const gridColumnGap = useResponsiveProp(columnGap, 3);

    const gridRowGap = useResponsiveProp(rowGap, 3);

    const gridLayoutStyles = {
      ...style,
      "--grid-layout-columns": gridColumns,
      "--grid-layout-rows": gridRows,
      "--grid-layout-columnGap": gridColumnGap || gridGap,
      "--grid-layout-rowGap": gridRowGap || gridGap,
    };

    return (
      <div
        className={cx(withBaseName(), className)}
        style={gridLayoutStyles}
        ref={ref}
        {...rest}
      >
        {children}
      </div>
    );
  }
);
