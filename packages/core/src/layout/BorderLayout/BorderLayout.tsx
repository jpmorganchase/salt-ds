import {
  Children,
  forwardRef,
  ReactElement,
  useEffect,
  ElementType,
} from "react";
import cx from "classnames";

import { GridLayout, GridLayoutProps } from "../GridLayout";
import { makePrefixer } from "../../utils";
import { BorderItemProps } from "../BorderItem";
import { PolymorphicRef, PolymorphicComponentPropWithRef } from "../types";

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
      children: ReactElement<BorderItemProps<T>>[];
    }
  >;

const withBaseName = makePrefixer("uitkBorderLayout");

const numberOfColumns = 3;

type BorderLayoutComponent = <T extends ElementType = "div">(
  props: BorderLayoutProps<T>
) => ReactElement | null;

export const BorderLayout: BorderLayoutComponent = forwardRef(
  <T extends ElementType>(
    { children, className, gap, style, ...rest }: BorderLayoutProps<T>,
    ref?: PolymorphicRef<T>
  ) => {
    const borderAreas = Children.map(
      children,
      (child: ReactElement<BorderItemProps<T>>) => child.props.position
    );

    const topSection = borderAreas.includes("header")
      ? "header ".repeat(numberOfColumns)
      : "none ".repeat(numberOfColumns);

    const leftSection = borderAreas.includes("left") ? "left" : "main";

    const rightSection = borderAreas.includes("right") ? "right" : "main";

    const midSection = `${leftSection} main ${rightSection}`;

    const bottomSection = borderAreas.includes("bottom")
      ? "bottom ".repeat(numberOfColumns)
      : "none ".repeat(numberOfColumns);

    const gridTemplateAreas = `"${topSection}" "${midSection}" "${bottomSection}"`;

    const hasMainSection = borderAreas.includes("main");

    useEffect(() => {
      if (process.env.NODE_ENV !== "production") {
        if (!hasMainSection) {
          console.warn(
            "No main section has been found. A main section should be provided."
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
        className={cx(withBaseName(), className, "uitkGridLayout-area")}
        columns={numberOfColumns}
        gap={gap || 0}
        style={borderLayoutStyles}
        ref={ref}
        {...rest}
      >
        {children}
      </GridLayout>
    );
  }
);
