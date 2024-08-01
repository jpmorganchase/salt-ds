import { clsx } from "clsx";
import { type ElementType, type ReactElement, forwardRef } from "react";

import {
  type PolymorphicComponentPropWithRef,
  type PolymorphicRef,
  type ResponsiveProp,
  makePrefixer,
  resolveResponsiveValue,
} from "../utils";

import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { useBreakpoint } from "../breakpoints";
import flexLayoutCss from "./FlexLayout.css";

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
      gap?: ResponsiveProp<number | string>;
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
  props: FlexLayoutProps<T>,
) => ReactElement | null;

function parseAlignment(style: string | undefined) {
  return style === "start" || style === "end" ? `flex-${style}` : style;
}

function parseSpacing(value: number | string | undefined) {
  if (value === undefined || typeof value === "string") {
    return value;
  }

  return `calc(var(--salt-spacing-100) * ${value})`;
}

export const FlexLayout: FlexLayoutComponent = forwardRef(
  <T extends ElementType = "div">(
    {
      as,
      align,
      children,
      className,
      direction = "row",
      gap = 3,
      justify,
      separators,
      style,
      wrap = false,
      ...rest
    }: FlexLayoutProps<T>,
    ref?: PolymorphicRef<T>,
  ) => {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-flex-layout",
      css: flexLayoutCss,
      window: targetWindow,
    });

    const Component = as || "div";
    const separatorAlignment = separators === true ? "center" : separators;

    const { matchedBreakpoints } = useBreakpoint();
    const flexGap = resolveResponsiveValue(gap, matchedBreakpoints);
    const flexDirection = resolveResponsiveValue(direction, matchedBreakpoints);
    const flexWrap = resolveResponsiveValue(wrap, matchedBreakpoints);
    const flexLayoutStyles = {
      ...style,
      "--flexLayout-align": parseAlignment(align),
      "--flexLayout-direction": flexDirection,
      "--flexLayout-gap": parseSpacing(flexGap),
      "--flexLayout-justify": parseAlignment(justify),
      "--flexLayout-wrap": flexWrap ? "wrap" : "nowrap",
    };

    return (
      <Component
        className={clsx(
          withBaseName(),
          {
            [withBaseName("separator")]: separatorAlignment && !wrap,
            [withBaseName(
              `separator-${flexDirection ?? "row"}-${
                separatorAlignment ?? "center"
              }`,
            )]: separatorAlignment && !wrap,
            [withBaseName(`separator-${flexDirection ?? "row"}`)]:
              separatorAlignment && !wrap,
          },
          className,
        )}
        ref={ref}
        style={flexLayoutStyles}
        {...rest}
      >
        {children}
      </Component>
    );
  },
);
