import { forwardRef, ElementType, ReactNode } from "react";
import { clsx } from "clsx";

import {
  makePrefixer,
  ResponsiveProp,
  useResponsiveProp,
  PolymorphicRef,
  PolymorphicComponentPropWithRef,
} from "../utils";
import gridItemCss from "./GridItem.css";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

export const GRID_ALIGNMENT_BASE = [
  "start",
  "end",
  "center",
  "stretch",
] as const;

type GridAlignment = typeof GRID_ALIGNMENT_BASE[number];

type GridProperty = number | "auto";
export type GridItemProps<T extends ElementType> =
  PolymorphicComponentPropWithRef<
    T,
    {
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
  >;

const withBaseName = makePrefixer("saltGridItem");

const colStart = "auto";
const colEnd = "auto";
const rowStart = "auto";
const rowEnd = "auto";

type GridItemComponent = <T extends ElementType = "div">(
  props: GridItemProps<T>
) => ReactNode;

export const GridItem: GridItemComponent = forwardRef(
  <T extends ElementType = "div">(
    {
      as,
      children,
      className,
      colSpan,
      rowSpan,
      horizontalAlignment = "stretch",
      verticalAlignment = "stretch",
      style,
      ...rest
    }: GridItemProps<T>,
    ref?: PolymorphicRef<T>
  ) => {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-grid-item",
      css: gridItemCss,
      window: targetWindow,
    });

    const Component = as ?? "div";
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
      "--gridItem-justifySelf": horizontalAlignment,
      "--gridItem-alignSelf": verticalAlignment,
      "--gridItem-gridRowStart": gridRowStart,
      "--gridItem-gridColumnStart": gridColumnStart,
      "--gridItem-gridRowEnd": gridRowEnd,
      "--gridItem-gridColumnEnd": gridColumnEnd,
    };

    return (
      <Component
        className={clsx(withBaseName(), className)}
        style={gridStyles}
        ref={ref}
        {...rest}
      >
        {children}
      </Component>
    );
  }
);
