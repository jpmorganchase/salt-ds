import { forwardRef, HTMLAttributes, CSSProperties } from "react";
import cx from "classnames";

import { makePrefixer } from "@brandname/core";
import "./GridLayout.css";
import { GridAlignment, GridProperty, GRID_ALIGNMENT_BASE } from "../types";

export const GRID_LAYOUT_CONTENT_ALIGNMENT = [
  ...GRID_ALIGNMENT_BASE,
  "space-around",
  "space-between",
  "space-evenly",
];

export type gridContentAlignment = typeof GRID_LAYOUT_CONTENT_ALIGNMENT[number];

export interface GridLayoutProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The className(s) of the component.
   */
  className?: string;
  /**
   * Defines a grid container; inline or block depending on the given value.
   */
  display?: "grid" | "inline-grid";
  /**
   * Number of columns to be displayed
   */
  columns?: number;
  /**
   * Number of rows to be displayed
   */
  rows?: number;
  /**
   * Amount of space each grid element should take up
   */
  gridSpace?: string;
  /**
   * Defines the size of the gutter between the columns
   */
  columnGap?: number | string;
  /**
   * Defines the size of the gutter between the rows
   */
  rowGap?: number | string;
  /**
   * Aligns grid items along the inline (row) axis
   */
  justifyItems?: GridAlignment;
  /**
   * Aligns grid items along the block (column) axis
   */
  alignItems?: GridAlignment | "baseline";
  /**
   * Aligns the grid along the inline (row) axis
   */
  justifyContent?: gridContentAlignment;
  /**
   * Aligns the grid along the block (column) axis
   */
  alignContent?: gridContentAlignment;
  /**
   * Specifies the size of any auto-generated grid columns
   */
  autoColumns?: GridProperty;
  /**
   * Specifies the size of any auto-generated grid rows
   */
  autoRows?: GridProperty;
  /**
   * Defines a grid template by referencing the names of the grid areas which are specified with the grid-area property.
   */
  gridTemplateAreas?: string;
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  /**
   * Custom styles
   */
  style?: CSSProperties;
}

const withBaseName = makePrefixer("uitkGridLayout");

export const GridLayout = forwardRef<HTMLDivElement, GridLayoutProps>(
  function GridLayout(
    {
      children,
      className,
      display = "grid",
      columns = 12,
      rows = 1,
      gridSpace = "1fr",
      columnGap = 0,
      rowGap = 0,
      justifyItems = "stretch",
      alignItems = "stretch",
      justifyContent = "stretch",
      alignContent = "stretch",
      autoColumns = "auto",
      autoRows = "auto",
      gridTemplateAreas,
      gridTemplateColumns,
      gridTemplateRows,
      style,
    },
    ref
  ) {
    const gridLayoutStyles = {
      ...style,
      display,
      gridTemplateColumns: gridTemplateColumns
        ? gridTemplateColumns
        : `repeat(${columns}, ${gridSpace})`,
      gridTemplateRows: gridTemplateRows
        ? gridTemplateRows
        : `repeat(${rows}, ${gridSpace})`,
      columnGap,
      rowGap,
      justifyItems,
      alignItems,
      justifyContent,
      alignContent,
      gridAutoColumns: autoColumns,
      gridAutoRows: autoRows,
      gridTemplateAreas,
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
