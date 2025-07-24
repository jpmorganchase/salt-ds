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
  FlexLayout,
  type FlexLayoutProps,
  type LayoutDirection,
  type LayoutSeparator,
} from "../flex-layout";
import {
  makePrefixer,
  type PolymorphicComponentPropWithRef,
  type ResponsiveProp,
  resolveResponsiveValue,
} from "../utils";
import stackLayoutCss from "./StackLayout.css";

const withBaseName = makePrefixer("saltStackLayout");

export type StackLayoutProps<T extends ElementType> =
  PolymorphicComponentPropWithRef<
    T,
    {
      /**
       * Defines the default behavior for how flex items are laid out along the cross axis on the current line, default is "stretch".
       */
      align?: FlexLayoutProps<ElementType>["align"];
      /**
       * Establishes the main-axis, defining the direction children are placed. Default is "column".
       */
      direction?: ResponsiveProp<LayoutDirection>;
      /**
       * Controls the space between items, default is 3.
       */
      gap?: FlexLayoutProps<ElementType>["gap"];
      /**
       * Adds a separator between elements, default is false.
       */
      separators?: LayoutSeparator | boolean;
      /**
       * Defines the margin around the component. It can be specified as a number (which acts as a multiplier) or a string representing the margin value. Default is `0`.
       */
      margin?: FlexLayoutProps<ElementType>["margin"];
      /**
       * Defines the padding within the component. It can be specified as a number (which acts as a multiplier) or a string representing the padding value. Default is `0`.
       */
      padding?: FlexLayoutProps<ElementType>["padding"];
    }
  >;

type StackLayoutComponent = <T extends ElementType = "div">(
  props: StackLayoutProps<T>,
) => ReturnType<FunctionComponent>;

function parseSpacing(value: number | string | undefined) {
  if (value === undefined || typeof value === "string") {
    return value;
  }

  return `calc(var(--salt-spacing-100) * ${value})`;
}

export const StackLayout: StackLayoutComponent = forwardRef(
  function StackLayout<T extends ElementType = "div">(
    {
      as,
      children,
      className,
      direction = "column",
      gap = 3,
      separators,
      style,
      ...rest
    }: StackLayoutProps<T>,
    ref?: ForwardedRef<unknown>,
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-stack-layout",
      css: stackLayoutCss,
      window: targetWindow,
    });

    const { matchedBreakpoints } = useBreakpoint();

    const flexGap = resolveResponsiveValue(gap, matchedBreakpoints);
    const separatorAlignment = separators === true ? "center" : separators;
    const flexDirection = resolveResponsiveValue(direction, matchedBreakpoints);
    const stackLayoutStyles = {
      ...style,
      "--stackLayout-gap": parseSpacing(flexGap),
    };
    return (
      <FlexLayout
        as={as as ElementType}
        className={clsx(
          withBaseName(),
          {
            [withBaseName(flexDirection ?? "")]: flexDirection,
            [withBaseName("separator")]: !!separatorAlignment,
            [separatorAlignment
              ? withBaseName(`separator-${separatorAlignment}`)
              : ""]: separatorAlignment,
          },
          className,
        )}
        ref={ref}
        direction={direction}
        style={stackLayoutStyles}
        wrap={false}
        gap={flexGap}
        {...rest}
      >
        {children}
      </FlexLayout>
    );
  },
);
