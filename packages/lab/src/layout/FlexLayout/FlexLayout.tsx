import { Children, forwardRef, HTMLAttributes, SyntheticEvent } from "react";
import { makePrefixer } from "@brandname/core";
import cx from "classnames";

import "./FlexLayout.css";
import { useForkRef } from "../../utils";
import { useSplitterResizing } from "./useSplitterResizing";
import { Separator, SeparatorVariant } from "../Separator";
import useViewport, { Viewport } from "../internal/useViewport";

const withBaseName = makePrefixer("uitkFlexLayout");

export const FLEX_ALIGNMENT_BASE = ["flex-start", "flex-end", "center"];
export const FLEX_CONTENT_ALIGNMENT_BASE = [
  ...FLEX_ALIGNMENT_BASE,
  "space-between",
  "space-around",
  "space-evenly",
];

export type flexAlignment = typeof FLEX_ALIGNMENT_BASE[number];
export type flexContentAlignment = typeof FLEX_CONTENT_ALIGNMENT_BASE[number];

type Direction = "row" | "column";

type Wrap = "nowrap" | "wrap";

export interface FlexLayoutProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Defines a flex container; inline or block depending on the given value.
   */
  display?: "flex" | "inline-flex";
  /**
   * Establishes the main-axis, defining the direction children are placed.
   * Value can be "row", "column" or an array of values for each breakpoint e.g. ["column", "row", "column", "column", "row"]
   */
  direction?: Direction | Direction[];
  /**
   * Allow the items to wrap as needed.
   * Value can be "nowrap", "wrap", or an array of values for each breakpoint e.g. ["wrap", "nowrap", "wrap", "nowrap"]
   */
  wrap?: Wrap | Wrap[];
  /**
   * Defines the alignment along the main axis.
   */
  justifyContent?: flexContentAlignment;
  /**
   * Defines the default behavior for how flex items are laid out along the cross axis on the current line.
   */
  alignItems?: flexAlignment | "stretch" | "baseline";
  /**
   * Aligns a flex container’s lines within when there is extra space in the cross-axis.
   */
  alignContent?: flexContentAlignment | "stretch";
  resizeable?: boolean;
  /**
   * Controls the space between rows.
   */
  rowGap?: number | string;
  /**
   * Controls the space between columns.
   */
  colGap?: number | string;
  /**
   * Defines the item's width
   */
  width?: number | string;
  /**
   * Defines the item's height
   */
  height?: number | string;
  /**
   * Adds a line separator between items
   */
  separator?: SeparatorVariant;
  /**
   * Stretches the separator with index of stretchedItem
   */
  stretchedItem?: number;
  /**
   * Allows the items to resize with a splitter
   */
  splitter?: boolean;
  /**
   * Callback for when the splitter moves
   */
  onSplitterMoved?: (event: SyntheticEvent | Event) => void;
}

function getResponsiveValue<T>(value: T[], viewport: Viewport): T {
  const flexBreakpoints = Object.values(Viewport);

  const customResponsiveProps = flexBreakpoints.map((breakpoint, index) => ({
    [breakpoint]: value[index] ? value[index] : value[0],
  }));

  const responsiveValue =
    customResponsiveProps.find((breakpoint) => breakpoint[viewport]) || {};

  return responsiveValue[viewport];
}

export const FlexLayout = forwardRef<HTMLDivElement, FlexLayoutProps>(
  function FlexLayout(
    {
      alignContent,
      alignItems = "stretch",
      children,
      className,
      colGap,
      display = "flex",
      direction = "row",
      justifyContent = "flex-start",
      rowGap,
      style,
      wrap = "wrap",
      onSplitterMoved,
      width,
      height,
      separator,
      stretchedItem,
      splitter,
      ...rest
    },
    ref
  ) {
    const viewport = useViewport();

    const flexDirection = !Array.isArray(direction)
      ? direction
      : getResponsiveValue(direction, viewport);

    const flexWrap = !Array.isArray(wrap)
      ? wrap
      : getResponsiveValue(wrap, viewport);

    const flexLayoutStyles = {
      alignContent,
      alignItems,
      display,
      flexFlow: `${flexDirection} ${flexWrap}`,
      justifyContent,
      columnGap: colGap,
      rowGap,
      width,
      height,
      ...style,
    };
    let flexRef = ref;
    let flexContent = children;

    if (splitter) {
      const { content, rootRef } = useSplitterResizing({
        children,
        onSplitterMoved,
        direction,
      });
      flexRef = useForkRef(ref, rootRef);
      flexContent = content;
    }

    return (
      <div
        className={cx(
          className,
          withBaseName(),
          splitter && withBaseName("split")
        )}
        ref={flexRef || ref}
        style={flexLayoutStyles}
        {...rest}
      >
        {separator && !splitter
          ? Children.map(children, (child, index) => {
              return index < Children.count(children) - 1 ? (
                <>
                  {child}
                  <Separator
                    variant={separator}
                    stretch={index === stretchedItem}
                  />
                </>
              ) : (
                child
              );
            })
          : flexContent}
      </div>
    );
  }
);
