import { forwardRef, HTMLAttributes } from "react";
import cx from "classnames";

import { makePrefixer } from "@brandname/core";
import { GridAlignment, GridProperty } from "../types";

export interface GridItemProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The item will span across the provided number of grid columns
   */
  colSpan?: GridProperty;
  /**
   * The column where the item begins
   */
  colStart?: GridProperty;
  /**
   * The column where the item ends
   */
  colEnd?: GridProperty;
  /**
   * The item will span across the provided number of grid rows
   */
  rowSpan?: GridProperty;
  /**
   * The row where the item begins
   */
  rowStart?: GridProperty;
  /**
   * The row where the item ends
   */
  rowEnd?: GridProperty;
  /**
   * Aligns a grid item inside a cell along the inline (row) axis
   */
  justify?: GridAlignment;
  /**
   * Aligns a grid item inside a cell along the block (column) axis
   */
  align?: GridAlignment;
  /**
   * Gives an item a name so that it can be referenced by a template created with the grid-template-areas property
   */
  area?: string;
}

const withBaseName = makePrefixer("uitkGridItem");

export const GridItem = forwardRef<HTMLDivElement, GridItemProps>(
  function GridItem(
    {
      children,
      className,
      colSpan,
      colStart = "auto",
      colEnd = "auto",
      rowSpan,
      rowStart = "auto",
      rowEnd = "auto",
      justify = "stretch",
      align = "stretch",
      area = null,
      style,
      ...rest
    },
    ref
  ) {
    const gridColumnStart = colSpan ? `span ${colSpan}` : colStart;

    const gridColumnEnd = colSpan ? `span ${colSpan}` : colEnd;

    const gridRowStart = rowSpan ? `span ${rowSpan}` : rowStart;

    const gridRowEnd = rowSpan ? `span ${rowSpan}` : rowEnd;

    const gridArea = area
      ? area
      : `${gridRowStart} ${gridColumnStart} ${gridRowEnd} ${gridColumnEnd}`;

    const gridStyles = {
      ...style,
      gridColumnStart,
      gridColumnEnd,
      gridRowStart,
      gridRowEnd,
      justifySelf: justify,
      alignSelf: align,
      gridArea,
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
