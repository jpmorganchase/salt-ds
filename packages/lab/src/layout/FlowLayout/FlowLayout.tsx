import { makePrefixer } from "@brandname/core";
import { forwardRef, HTMLAttributes } from "react";
import cx from "classnames";
import "./FlowLayout.css";
import { flexContentAlignment, FlexLayout } from "../FlexLayout";
import { VerticalSeparatorVariant } from "../Separator";
const withBaseName = makePrefixer("uitkFlowLayout");

export interface FlowLayoutProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Aligns a flex container’s lines within when there is extra space in the cross-axis.
   */
  alignContent?: flexContentAlignment | "stretch";
  /**
   * Allow the items to wrap as needed.
   */
  wrap?: "nowrap" | "wrap";
  /**
   * Adds a line separator between items
   */
  separator?: VerticalSeparatorVariant;
  /**
   * Defines the alignment along the main axis.
   */
  justifyContent?: flexContentAlignment;

  /**
   * Controls the space between columns.
   */
  gap?: number;
}

export const FlowLayout = forwardRef<HTMLDivElement, FlowLayoutProps>(
  function FlowLayout(
    {
      alignContent,
      children,
      className,
      gap,
      justifyContent = "flex-start",
      separator,
      style,
      wrap = "wrap",
      ...rest
    },
    ref
  ) {
    const flowLayoutStyles = {
      flexFlow: `row ${wrap}`,
      ...style,
    };
    return (
      <FlexLayout
        alignContent={alignContent}
        justifyContent={justifyContent}
        colGap={gap}
        className={cx(className, withBaseName())}
        style={flowLayoutStyles}
        separator={separator}
        ref={ref}
        {...rest}
      >
        {children}
      </FlexLayout>
    );
  }
);
