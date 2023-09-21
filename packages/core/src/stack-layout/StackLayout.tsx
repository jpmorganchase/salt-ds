import { ElementType, forwardRef, ReactNode } from "react";
import {
  FlexLayout,
  FlexLayoutProps,
  LayoutDirection,
  LayoutSeparator,
} from "../flex-layout";
import {
  makePrefixer,
  PolymorphicComponentPropWithRef,
  PolymorphicRef,
  ResponsiveProp,
  useResponsiveProp,
} from "../utils";
import { clsx } from "clsx";
import stackLayoutCss from "./StackLayout.css";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

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
    }
  >;

type StackLayoutComponent = <T extends ElementType = "div">(
  props: StackLayoutProps<T>
) => ReactNode;

export const StackLayout: StackLayoutComponent = forwardRef(
  <T extends ElementType = "div">(
    {
      children,
      className,
      direction = "column",
      gap,
      separators,
      style,
      ...rest
    }: StackLayoutProps<T>,
    ref?: PolymorphicRef<T>
  ) => {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-stack-layout",
      css: stackLayoutCss,
      window: targetWindow,
    });

    const flexGap = useResponsiveProp(gap, 3);
    const separatorAlignment = separators === true ? "center" : separators;
    const flexDirection = useResponsiveProp(direction, "column");
    const stackLayoutStyles = {
      ...style,
      "--stackLayout-gap-multiplier": flexGap,
    };
    return (
      <FlexLayout
        className={clsx(
          withBaseName(),
          withBaseName(flexDirection),
          {
            [withBaseName("separator")]: !!separatorAlignment,
            [separatorAlignment
              ? withBaseName(`separator-${separatorAlignment}`)
              : ""]: separatorAlignment,
          },
          className
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
  }
);
