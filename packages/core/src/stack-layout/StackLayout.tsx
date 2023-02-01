import { ElementType, forwardRef, ReactElement } from "react";
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
import "./StackLayout.css";

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
      separators?: LayoutSeparator | true | false;
    }
  >;

type StackLayoutComponent = <T extends ElementType = "div">(
  props: StackLayoutProps<T>
) => ReactElement | null;

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
    const flexGap = useResponsiveProp(gap, 3);
    const separatorAlignment = separators === true ? "center" : separators;
    const flexDirection = useResponsiveProp(direction, "column");
    const stackLayoutStyles = {
      ...style,
      "--stackLayout-gap-multiplier": flexGap,
    };
    return (
      <FlexLayout
        className={clsx(className, withBaseName(), {
          [withBaseName("separator")]: separatorAlignment,
          [withBaseName(
            `separator-${flexDirection || "row"}-${
              separatorAlignment || "center"
            }`
          )]: separatorAlignment,
          [withBaseName(`separator-${flexDirection || "row"}`)]:
            separatorAlignment,
        })}
        ref={ref}
        direction={direction}
        style={stackLayoutStyles}
        wrap={false}
        gap={gap}
        {...rest}
      >
        {children}
      </FlexLayout>
    );
  }
);
