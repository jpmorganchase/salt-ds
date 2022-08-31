import { forwardRef, HTMLAttributes } from "react";
import cx from "classnames";

import { makePrefixer, ResponsiveProp, useResponsiveProp } from "../../utils";
import "./GridItem.css";

export const GRID_ALIGNMENT_BASE = [
  "start",
  "end",
  "center",
  "stretch",
] as const;

type GridAlignment = typeof GRID_ALIGNMENT_BASE[number];

type GridProperty = number | "auto";
export interface GridItemProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The item will span across the provided number of grid columns. Defaults to "auto"
   */
  colSpan?: ResponsiveProp<GridProperty>;
  /**
   * The item will span across the provided number of grid rows. Defaults to "auto"
   */
  rowSpan?: ResponsiveProp<GridProperty>;
  /**
   * Aligns a grid item inside a cell along the inline (row) axis. Defaults to "stretch"
   */
  horizontalAlignment?: GridAlignment;
  /**
   * Aligns a grid item inside a cell along the block (column) axis. Defaults to "stretch"
   */
  verticalAlignment?: GridAlignment;
}

const withBaseName = makePrefixer("uitkGridItem");

const colStart = "auto";
const colEnd = "auto";
const rowStart = "auto";
const rowEnd = "auto";

export const GridItem = forwardRef<HTMLDivElement, GridItemProps>(
  function GridItem(
    {
      children,
      className,
      colSpan,
      rowSpan,
      horizontalAlignment = "stretch",
      verticalAlignment = "stretch",
      style,
      ...rest
    },
    ref
  ) {
    const gridItemColSpan = useResponsiveProp(colSpan, "auto");

    const gridItemRowSpan = useResponsiveProp(rowSpan, "auto");

    const gridColumnStart = gridItemColSpan
      ? `span ${gridItemColSpan}`
      : colStart;

    const gridColumnEnd = gridItemColSpan ? `span ${gridItemColSpan}` : colEnd;

    const gridRowStart = gridItemRowSpan ? `span ${gridItemRowSpan}` : rowStart;

    const gridRowEnd = gridItemRowSpan ? `span ${gridItemRowSpan}` : rowEnd;

    const gridStyles = {
      ...style,
      "--grid-item-justifySelf": horizontalAlignment,
      "--grid-item-alignSelf": verticalAlignment,
      "--grid-item-gridRowStart": gridRowStart,
      "--grid-item-gridColumnStart": gridColumnStart,
      "--grid-item-gridRowEnd": gridRowEnd,
      "--grid-item-gridColumnEnd": gridColumnEnd,
    };

    return (
      <div
        className={cx(withBaseName(), className)}
        style={gridStyles}
        ref={ref}
        {...rest}
      >
        {children}
      </div>
    );
  }
);
