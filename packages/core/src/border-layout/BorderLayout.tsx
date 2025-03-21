import { clsx } from "clsx";
import {
  Children,
  type ElementType,
  type ReactElement,
  forwardRef,
  useEffect,
} from "react";

import type { BorderItemProps } from "../border-item";
import { GridLayout, type GridLayoutProps } from "../grid-layout";
import {
  type PolymorphicComponentPropWithRef,
  type PolymorphicRef,
  type ResponsiveProp,
  makePrefixer,
} from "../utils";

export type BorderLayoutProps<T extends ElementType> =
  PolymorphicComponentPropWithRef<
    T,
    {
      /**
       * Defines the size of the gutter between the columns and the rows by setting a density multiplier. Defaults to 0
       */
      gap?: GridLayoutProps<T>["gap"];
      /**
       * Defines the size of the gutter between the columns by setting a density multiplier. Defaults to 0
       */
      columnGap?: GridLayoutProps<T>["columnGap"];
      /**
       * Defines the size of the gutter between the rows by setting a density multiplier. Defaults to 0
       */
      rowGap?: GridLayoutProps<T>["rowGap"];
      /**
       * Border item components to be rendered.
       */
      children:
        | ReactElement<BorderItemProps<T>>[]
        | ReactElement<BorderItemProps<T>>;
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

const withBaseName = makePrefixer("saltBorderLayout");

const numberOfColumns = 3;

type BorderLayoutComponent = <T extends ElementType = "div">(
  props: BorderLayoutProps<T>,
) => ReactElement | null;

export const BorderLayout: BorderLayoutComponent = forwardRef(
  <T extends ElementType>(
    { children, className, gap, style, ...rest }: BorderLayoutProps<T>,
    ref?: PolymorphicRef<T>,
  ) => {
    const borderAreas = Children.map(
      children,
      (child: ReactElement<BorderItemProps<T>>) => child.props.position,
    );

    const topSection = borderAreas.includes("north")
      ? "north ".repeat(numberOfColumns)
      : "none ".repeat(numberOfColumns);

    const leftSection = borderAreas.includes("west") ? "west" : "center";

    const rightSection = borderAreas.includes("east") ? "east" : "center";

    const midSection = `${leftSection} center ${rightSection}`;

    const bottomSection = borderAreas.includes("south")
      ? "south ".repeat(numberOfColumns)
      : "none ".repeat(numberOfColumns);

    const gridTemplateAreas = `"${topSection}" "${midSection}" "${bottomSection}"`;

    const hasMainSection = borderAreas.includes("center");

    useEffect(() => {
      if (process.env.NODE_ENV !== "production") {
        if (!hasMainSection) {
          console.warn(
            "No main section has been found. A main section should be provided.",
          );
        }
      }
    }, [hasMainSection]);

    const borderLayoutStyles = {
      ...style,
      "--gridLayout-gridTemplate": gridTemplateAreas,
    };

    return (
      <GridLayout
        className={clsx(withBaseName(), className, "saltGridLayout-area")}
        columns={numberOfColumns}
        gap={gap || 0}
        style={borderLayoutStyles}
        ref={ref}
        {...rest}
      >
        {children}
      </GridLayout>
    );
  },
);
