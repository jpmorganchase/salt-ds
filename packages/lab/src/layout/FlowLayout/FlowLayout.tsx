import { makePrefixer } from "@brandname/core";
import { forwardRef, HTMLAttributes, ComponentPropsWithoutRef } from "react";
import cx from "classnames";
import "./FlowLayout.css";
import { FlexLayout } from "../FlexLayout";
import { VerticalSeparatorVariant } from "../Separator";
const withBaseName = makePrefixer("uitkFlowLayout");

type FlexLayoutProps = ComponentPropsWithoutRef<typeof FlexLayout>;

export interface FlowLayoutProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Aligns a flex container’s lines within when there is extra space in the cross-axis.
   */
  alignContent?: FlexLayoutProps["alignContent"];
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
  justifyContent?: FlexLayoutProps["justifyContent"];
  /**
   * Controls the space between columns.
   */
  gap?: number;
}

export const FlowLayout = forwardRef<HTMLDivElement, FlowLayoutProps>(
  function FlowLayout(
    {
      children,
      className,
      gap,
      justifyContent = "flex-start",
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
        justifyContent={justifyContent}
        colGap={gap}
        className={cx(className, withBaseName())}
        style={flowLayoutStyles}
        ref={ref}
        {...rest}
      >
        {children}
      </FlexLayout>
    );
  }
);
