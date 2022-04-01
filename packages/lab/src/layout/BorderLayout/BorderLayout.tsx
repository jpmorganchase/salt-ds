import {
  Children,
  forwardRef,
  HTMLAttributes,
  ReactElement,
  useEffect,
  useMemo,
} from "react";
import cx from "classnames";
import warning from "warning";

import { makePrefixer } from "@brandname/core";
import { GridLayout } from "../GridLayout";
import { BorderItemProps } from "../BorderItem";
import "./BorderLayout.css";

export interface BorderLayoutProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Defines the size of the gutter between the columns
   */
  columnGap?: number | string;
  /**
   * Defines the size of the gutter between the rows
   */
  rowGap?: number | string;
  /**
   * Border item components to be rendered.
   */
  children: ReactElement<BorderItemProps>[];
}

const withBaseName = makePrefixer("uitkBorderLayout");

const numberOfColumns = 3;

export const BorderLayout = forwardRef<HTMLDivElement, BorderLayoutProps>(
  function BorderLayout({ children, className, ...rest }, ref) {
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

    return (
      <GridLayout
        className={cx(withBaseName(), className)}
        columns={numberOfColumns}
        gridTemplateAreas={gridTemplateAreas}
        gridTemplateColumns="min-content 1fr min-content"
        gridTemplateRows="min-content 1fr min-content"
        ref={ref}
        {...rest}
      >
        {children}
      </GridLayout>
    );
  }
);
