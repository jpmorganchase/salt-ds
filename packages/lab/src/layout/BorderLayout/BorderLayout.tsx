import {
  Children,
  forwardRef,
  HTMLAttributes,
  ReactElement,
  useEffect,
  useMemo,
  ComponentPropsWithoutRef,
} from "react";
import cx from "classnames";
import warning from "warning";

import { makePrefixer } from "@jpmorganchase/uitk-core";
import { GridLayout } from "../GridLayout";
import { BorderItemProps } from "../BorderItem";
import "./BorderLayout.css";

type GridLayoutProps = ComponentPropsWithoutRef<typeof GridLayout>;

export interface BorderLayoutProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Defines the size of the gutter between the columns and the rows by setting a density multiplier. Defaults to 0
   */
  gap?: GridLayoutProps["gap"];
  /**
   * Defines the size of the gutter between the columns by setting a density multiplier. Defaults to 0
   */
  columnGap?: GridLayoutProps["columnGap"];
  /**
   * Defines the size of the gutter between the rows by setting a density multiplier. Defaults to 0
   */
  rowGap?: GridLayoutProps["rowGap"];
  /**
   * Border item components to be rendered.
   */
  children: ReactElement<BorderItemProps>[];
}

const withBaseName = makePrefixer("uitkBorderLayout");

const numberOfColumns = 3;

export const BorderLayout = forwardRef<HTMLDivElement, BorderLayoutProps>(
  function BorderLayout({ children, className, gap = 0, style, ...rest }, ref) {
    const borderAreas = useMemo(
      () =>
        Children.map(
          children,
          (child: ReactElement<BorderItemProps>) => child.props.position
        ),
      []
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

    useEffect(() => {
      if (process.env.NODE_ENV !== "production") {
        const hasMainSection = borderAreas.includes("main");

        warning(
          hasMainSection,
          "No main section has been found. A main section should be provided."
        );
      }
    }, [children]);

    const borderLayoutStyles = {
      ...style,
      "--border-layout-grid-template": gridTemplateAreas,
    };

    return (
      <GridLayout
        className={cx(withBaseName(), className)}
        columns={numberOfColumns}
        gap={gap}
        style={borderLayoutStyles}
        ref={ref}
        {...rest}
      >
        {children}
      </GridLayout>
    );
  }
);
