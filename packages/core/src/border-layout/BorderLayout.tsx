import { clsx } from "clsx";
import {
  Children,
  type ElementType,
  type ForwardedRef,
  type FunctionComponent,
  forwardRef,
  isValidElement,
  type ReactNode,
  useEffect,
} from "react";

import type { BorderPosition } from "../border-item";
import { GridLayout, type GridLayoutProps } from "../grid-layout";
import {
  makePrefixer,
  type PolymorphicComponentPropWithRef,
  type ResponsiveProp,
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
      children: ReactNode;
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
) => ReturnType<FunctionComponent>;

export const BorderLayout: BorderLayoutComponent = forwardRef(
  function BorderLayout<T extends ElementType>(
    props: unknown,
    ref?: ForwardedRef<unknown>,
  ) {
    // Props need to be typed this way due to polymorphic types not working with required props.
    const { as, children, className, gap, style, ...rest } =
      props as BorderLayoutProps<T>;

    const borderAreas = Children.map(
      children,
      (child) => isValidElement(child) && child.props.position,
    ) as BorderPosition[];

    const hasNorth = borderAreas.includes("north");
    const hasWest = borderAreas.includes("west");
    const hasEast = borderAreas.includes("east");
    const hasSouth = borderAreas.includes("south");

    const middleColumns = [
      hasWest ? "west" : undefined,
      "center",
      hasEast ? "east" : undefined,
    ].filter(Boolean) as BorderPosition[];

    const gridTemplateColumns = [
      hasWest ? "min-content" : undefined,
      "1fr",
      hasEast ? "min-content" : undefined,
    ]
      .filter(Boolean)
      .join(" ");

    const gridTemplateRows = [
      hasNorth ? "min-content" : undefined,
      "1fr",
      hasSouth ? "min-content" : undefined,
    ]
      .filter(Boolean)
      .join(" ");

    const gridTemplateSections = [
      hasNorth
        ? `"${"north ".repeat(middleColumns.length).trimEnd()}"`
        : undefined,
      `"${middleColumns.join(" ")}"`,
      hasSouth
        ? `"${"south ".repeat(middleColumns.length).trimEnd()}"`
        : undefined,
    ].filter(Boolean);

    const gridTemplateAreas = gridTemplateSections.join(" ");

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
      "--gridLayout-areaColumns": gridTemplateColumns,
      "--gridLayout-areaRows": gridTemplateRows,
    };

    return (
      <GridLayout
        as={as as ElementType}
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
