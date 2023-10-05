import { ElementType, forwardRef, ReactElement } from "react";
import { clsx } from "clsx";

import {
  makePrefixer,
  ResponsiveProp,
  useResponsiveProp,
  PolymorphicComponentPropWithRef,
  PolymorphicRef,
} from "../utils";

import flexLayoutCss from "./FlexLayout.css";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

const withBaseName = makePrefixer("saltFlexLayout");

export type LayoutSeparator = "start" | "center" | "end";
export type LayoutDirection = "row" | "column";

export const FLEX_ALIGNMENT_BASE = ["start", "end", "center"] as const;
export const FLEX_CONTENT_ALIGNMENT_BASE = [
  ...FLEX_ALIGNMENT_BASE,
  "space-between",
  "space-around",
  "space-evenly",
] as const;

export type FlexAlignment = (typeof FLEX_ALIGNMENT_BASE)[number];
export type FlexContentAlignment = (typeof FLEX_CONTENT_ALIGNMENT_BASE)[number];

export type FlexLayoutProps<T extends ElementType> =
  PolymorphicComponentPropWithRef<
    T,
    {
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
       * **Deprecated:** For separators see `StackLayout` component instead.
       *
       * Adds a separator between elements if wrap is not active, default is false.
       */
      separators?: LayoutSeparator | true;
      /**
       * Allow the items to wrap as needed, default is false.
       */
      wrap?: ResponsiveProp<boolean>;
    }
  >;

type FlexLayoutComponent = <T extends ElementType = "div">(
  props: FlexLayoutProps<T>
) => ReactElement | null;

export const FlexLayout: FlexLayoutComponent = forwardRef(
  <T extends ElementType = "div">(
    {
      as,
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
    }: FlexLayoutProps<T>,
    ref?: PolymorphicRef<T>
  ) => {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-flex-layout",
      css: flexLayoutCss,
      window: targetWindow,
    });

    const Component = as || "div";
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
      <Component
        className={clsx(
          withBaseName(),
          {
            [withBaseName("separator")]: separatorAlignment && !wrap,
            [withBaseName(
              `separator-${flexDirection || "row"}-${
                separatorAlignment || "center"
              }`
            )]: separatorAlignment && !wrap,
            [withBaseName(`separator-${flexDirection || "row"}`)]:
              separatorAlignment && !wrap,
          },
          className
        )}
        ref={ref}
        style={flexLayoutStyles}
        {...rest}
      >
        {children}
      </Component>
    );
  }
);
