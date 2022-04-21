import { forwardRef, HTMLAttributes } from "react";
import { makePrefixer } from "@brandname/core";
import cx from "classnames";
import "./FlexLayout.css";

const withBaseName = makePrefixer("uitkFlexLayout");

export const FLEX_ALIGNMENT_BASE = [
  "flex-start",
  "flex-end",
  "center",
] as const;
export const FLEX_CONTENT_ALIGNMENT_BASE = [
  ...FLEX_ALIGNMENT_BASE,
  "space-between",
  "space-around",
  "space-evenly",
] as const;

export type FlexAlignment = typeof FLEX_ALIGNMENT_BASE[number];
export type FlexContentAlignment = typeof FLEX_CONTENT_ALIGNMENT_BASE[number];

type Direction = "row" | "column";

type Separator = "start" | "center" | "end";

export interface FlexLayoutProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Defines the default behavior for how flex items are laid out along the cross axis on the current line.
   */
  align?: FlexAlignment | "stretch" | "baseline";
  /**
   * Establishes the main-axis, defining the direction children are placed.
   * Value can be "row", "column" or an array of values for each breakpoint e.g. ["column", "row", "column", "column", "row"]
   */
  direction?: Direction;
  /**
   * Controls the space between items.
   */
  gap?: number;
  /**
   * Defines the alignment along the main axis.
   */
  justify?: FlexContentAlignment;
  /**
   * Adds a separator between elements.
   */
  separators?: Separator | true;
  /**
   * Allow the items to wrap as needed.
   * Value can be "nowrap", "wrap", or an array of values for each breakpoint e.g. ["wrap", "nowrap", "wrap", "nowrap"]
   */
  wrap?: boolean;
}

export const FlexLayout = forwardRef<HTMLDivElement, FlexLayoutProps>(
  function FlexLayout(
    {
      align,
      children,
      className,
      direction,
      gap,
      justify,
      separators,
      style,
      wrap = true,
      ...rest
    },
    ref
  ) {
    const separatorAlignment = separators === true ? "center" : separators;
    const flexLayoutStyles = {
      ...style,
      "--align": align,
      "--direction": direction,
      "--gap-multiplier": gap,
      "--justify": justify,
      "--wrap": wrap ? "wrap" : "no-wrap",
    };

    return (
      <div
        className={cx(className, withBaseName(), {
          [withBaseName("separator")]: separatorAlignment,
          [withBaseName(
            `separator-${direction || "row"}-${separatorAlignment}`
          )]: separatorAlignment,
          [withBaseName(`separator-${direction || "row"}`)]: separatorAlignment,
        })}
        ref={ref}
        style={flexLayoutStyles}
        {...rest}
      >
        {children}
      </div>
    );
  }
);
