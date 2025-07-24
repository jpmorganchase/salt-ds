import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ElementType,
  type ForwardedRef,
  type FunctionComponent,
  forwardRef,
} from "react";
import { useBreakpoint } from "../breakpoints";
import { parseSpacing } from "../flex-layout/parseSpacing";
import {
  makePrefixer,
  type PolymorphicComponentPropWithRef,
  type PolymorphicRef,
  type ResponsiveProp,
  resolveResponsiveValue,
} from "../utils";
import gridItemCss from "./GridItem.css";

export const GRID_ALIGNMENT_BASE = [
  "start",
  "end",
  "center",
  "stretch",
] as const;

type GridAlignment = (typeof GRID_ALIGNMENT_BASE)[number];

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
      /**
       * Defines the margin around the component. It can be specified as a number (which acts as a multiplier) or a string representing the margin value. Default is `0`.
       */
      margin?: ResponsiveProp<number | string>;
      /**
       * Defines the padding within the component. It can be specified as a number (which acts as a multiplier) or a string representing the padding value. Default is `0`.
       */
      padding?: ResponsiveProp<number | string>;
    }
  >;

const withBaseName = makePrefixer("saltGridItem");

const colStart = "auto";
const colEnd = "auto";
const rowStart = "auto";
const rowEnd = "auto";

type GridItemComponent = <T extends ElementType = "div">(
  props: GridItemProps<T>,
) => ReturnType<FunctionComponent>;

export const GridItem: GridItemComponent = forwardRef(function GridItem<
  T extends ElementType = "div",
>(
  {
    as,
    children,
    className,
    margin = 0,
    padding = 0,
    colSpan = "auto",
    rowSpan = "auto",
    horizontalAlignment = "stretch",
    verticalAlignment = "stretch",
    style,
    ...rest
  }: GridItemProps<T>,
  ref?: ForwardedRef<unknown>,
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-grid-item",
    css: gridItemCss,
    window: targetWindow,
  });

  const { matchedBreakpoints } = useBreakpoint();

  const Component = as || "div";
  const gridItemColSpan = resolveResponsiveValue(colSpan, matchedBreakpoints);

  const gridItemRowSpan = resolveResponsiveValue(rowSpan, matchedBreakpoints);
  const gridItemMargin = resolveResponsiveValue(margin, matchedBreakpoints);
  const gridItemPadding = resolveResponsiveValue(padding, matchedBreakpoints);
  const gridColumnStart = gridItemColSpan
    ? `span ${gridItemColSpan}`
    : colStart;

  const gridColumnEnd = gridItemColSpan ? `span ${gridItemColSpan}` : colEnd;

  const gridRowStart = gridItemRowSpan ? `span ${gridItemRowSpan}` : rowStart;

  const gridRowEnd = gridItemRowSpan ? `span ${gridItemRowSpan}` : rowEnd;

  const gridStyles = {
    "--gridItem-margin": parseSpacing(gridItemMargin),
    "--gridItem-padding": parseSpacing(gridItemPadding),
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
      ref={ref as PolymorphicRef<T>}
      {...rest}
    >
      {children}
    </Component>
  );
});
