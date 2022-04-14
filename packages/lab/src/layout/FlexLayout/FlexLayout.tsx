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

type Wrap = "nowrap" | "wrap";
type DensityMultiplier = 1 | 2 | 3 | 4;

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
  gapMultiplier?: DensityMultiplier | number;
  /**
   * Defines the alignment along the main axis.
   */
  justify?: FlexContentAlignment;
  /**
   * Allow the items to wrap as needed.
   * Value can be "nowrap", "wrap", or an array of values for each breakpoint e.g. ["wrap", "nowrap", "wrap", "nowrap"]
   */
  wrap?: Wrap;
}

export const FlexLayout = forwardRef<HTMLDivElement, FlexLayoutProps>(
  function FlexLayout(
    {
      align,
      children,
      className,
      direction,
      gapMultiplier,
      justify,
      style,
      wrap,
      ...rest
    },
    ref
  ) {
    const flexLayoutStyles = {
      ...style,
      "--align": align,
      "--direction": direction,
      "--gap-multiplier": gapMultiplier,
      "--justify": justify,
      "--wrap": wrap,
    };

    return (
      <div
        className={cx(className, withBaseName())}
        ref={ref}
        style={flexLayoutStyles}
        {...rest}
      >
        {children}
      </div>
    );
  }
);
