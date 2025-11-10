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
import {
  makePrefixer,
  type PolymorphicComponentPropWithRef,
  type PolymorphicRef,
  type ResponsiveProp,
  resolveResponsiveValue,
} from "../utils";
import flexLayoutCss from "./FlexLayout.css";
import { parseSpacing } from "./parseSpacing";

const withBaseName = makePrefixer("saltFlexLayout");

export type LayoutSeparator = "start" | "center" | "end";
export type LayoutDirection =
  | "row"
  | "column"
  | "row-reverse"
  | "column-reverse";

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

type FlexLayoutComponent = <T extends ElementType = "div">(
  props: FlexLayoutProps<T>,
) => ReturnType<FunctionComponent>;

function parseAlignment(style: string | undefined) {
  return style === "start" || style === "end" ? `flex-${style}` : style;
}

export const FlexLayout: FlexLayoutComponent = forwardRef(function FlexLayout<
  T extends ElementType = "div",
>(
  {
    as,
    align,
    children,
    className,
    direction = "row",
    gap = 3,
    margin = 0,
    padding = 0,
    justify,
    separators,
    style,
    wrap = false,
    ...rest
  }: FlexLayoutProps<T>,
  ref?: ForwardedRef<unknown>,
) {
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
  const flexMargin = resolveResponsiveValue(margin, matchedBreakpoints);
  const flexPadding = resolveResponsiveValue(padding, matchedBreakpoints);
  const flexDirection = resolveResponsiveValue(direction, matchedBreakpoints);
  const flexWrap = resolveResponsiveValue(wrap, matchedBreakpoints);
  const flexLayoutStyles = {
    ...style,
    "--flexLayout-align": parseAlignment(align),
    "--flexLayout-direction": flexDirection,
    "--flexLayout-gap": parseSpacing(flexGap),
    "--flexLayout-margin": parseSpacing(flexMargin),
    "--flexLayout-padding": parseSpacing(flexPadding),
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
      ref={ref as PolymorphicRef<T>}
      style={flexLayoutStyles}
      {...rest}
    >
      {children}
    </Component>
  );
});
