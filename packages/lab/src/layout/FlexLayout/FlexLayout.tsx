import { forwardRef, HTMLAttributes } from "react";
import cx from "classnames";

import { makePrefixer } from "@jpmorganchase/uitk-core";
import { ResponsiveProp, useResponsiveProp } from "../../utils";
import "./FlexLayout.css";

const withBaseName = makePrefixer("uitkFlexLayout");

export const FLEX_ALIGNMENT_BASE = ["start", "end", "center"] as const;
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
   */
  direction?: ResponsiveProp<Direction>;
  /**
   * Controls the space between items.
   */
  gap?: ResponsiveProp<number>;
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
   */
  wrap?: ResponsiveProp<boolean>;
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
      wrap,
      ...rest
    },
    ref
  ) {
    const separatorAlignment = separators === true ? "center" : separators;
    const addPrefix = (style: string) => {
      return style === "start" || style === "end" ? `flex-${style}` : style;
    };

    const flexGap = useResponsiveProp(gap, 1);
    const flexDirection = useResponsiveProp(direction, "row");
    const flexWrap = useResponsiveProp(wrap, false);

    const flexLayoutStyles = {
      ...style,
      "--uitkFlexLayout-align": align && addPrefix(align),
      "--uitkFlexLayout-direction": flexDirection,
      "--uitkFlexLayout-gap-multiplier": flexGap,
      "--uitkFlexLayout-justify": justify && addPrefix(justify),
      "--uitkFlexLayout-wrap": flexWrap ? "wrap" : "nowrap",
    };

    return (
      <div
        className={cx(className, withBaseName(), {
          [withBaseName("separator")]: separatorAlignment,
          [withBaseName(
            `separator-${flexDirection || "row"}-${separatorAlignment}`
          )]: separatorAlignment,
          [withBaseName(`separator-${flexDirection || "row"}`)]:
            separatorAlignment,
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
