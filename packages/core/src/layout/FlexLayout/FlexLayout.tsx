import { Children, forwardRef, HTMLAttributes } from "react";
import cx from "classnames";

import { makePrefixer, ResponsiveProp, useResponsiveProp } from "../../utils";

import "./FlexLayout.css";
import { LayoutDirection, LayoutSeparator } from "../types";

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

export interface FlexLayoutProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Defines the default behavior for how flex items are laid out along the cross axis on the current line, default is "stretch".
   */
  align?: FlexAlignment | "stretch" | "baseline";
  /**
   * Establishes the main-axis, defining the direction children are placed. Default is "row".
   */
  direction?: ResponsiveProp<LayoutDirection>;
  /**
   * Controls the space between items, default is 3.
   */
  gap?: ResponsiveProp<number>;
  /**
   * Defines the alignment along the main axis, default is "start".
   */
  justify?: FlexContentAlignment;
  /**
   * Adds a separator between elements if wrap is not active, default is false.
   */
  separators?: LayoutSeparator | true;
  /**
   * Allow the items to wrap as needed, default is false.
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

    const flexGap = useResponsiveProp(gap, 3);
    const flexDirection = useResponsiveProp(direction, "row");
    const flexWrap = useResponsiveProp(wrap, false);
    const flexLayoutStyles = {
      ...style,
      "--flexLayout-align": align && addPrefix(align),
      "--flexLayout-direction": flexDirection,
      "--flexLayout-gap-multiplier": flexGap,
      "--flexLayout-justify": justify && addPrefix(justify),
      "--flexLayout-wrap": flexWrap ? "wrap" : "nowrap",
    };

    return (
      <div
        className={cx(className, withBaseName(), {
          [withBaseName("separator")]: separatorAlignment && !wrap,
          [withBaseName(
            `separator-${flexDirection || "row"}-${
              separatorAlignment || "center"
            }`
          )]: separatorAlignment && !wrap,
          [withBaseName(`separator-${flexDirection || "row"}`)]:
            separatorAlignment && !wrap,
        })}
        ref={ref}
        style={flexLayoutStyles}
        {...rest}
      >
        {separators
          ? Children.map(children, (child) => (
              <div className={withBaseName("separator-wrapper")}>{child}</div>
            ))
          : children}
      </div>
    );
  }
);
