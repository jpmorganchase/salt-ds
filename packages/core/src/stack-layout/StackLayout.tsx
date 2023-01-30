import { ElementType, forwardRef, ReactElement } from "react";
import { FlexLayout, FlexLayoutProps, LayoutDirection } from "../flex-layout";
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

export type LayoutSeparator = "start" | "center" | "end";

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
      separators?: LayoutSeparator | true;
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
      separators,
      ...rest
    }: StackLayoutProps<T>,
    ref?: PolymorphicRef<T>
  ) => {
    const separatorAlignment = separators === true ? "center" : separators;
    const flexDirection = useResponsiveProp(direction, "row");

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
        {...rest}
      >
        {children}
      </FlexLayout>
    );
  }
);
