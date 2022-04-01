import { makePrefixer } from "@brandname/core";
import { forwardRef, HTMLAttributes } from "react";
import cx from "classnames";
import "./SplitLayout.css";
import { FlexLayout } from "../FlexLayout";
import { SeparatorVariant } from "../Separator";

const withBaseName = makePrefixer("uitkSplitLayout");

export interface SplitLayoutProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Reverses the direction of children.
   */
  reverse?: boolean;
  /**
   * Adds a line separator between items
   */
  separator?: SeparatorVariant;
  /**
   * Stretches the separator with index of stretchedItem
   */
  stretchedItem?: number;
}

export const SplitLayout = forwardRef<HTMLDivElement, SplitLayoutProps>(
  function SplitLayout(
    {
      children,
      className,
      reverse = false,
      separator,
      stretchedItem,
      style,
      ...rest
    },
    ref
  ) {
    const flowLayoutStyles = {
      flexFlow: `row${reverse ? "-reverse" : ""} nowrap`,
      ...style,
    };
    return (
      <FlexLayout
        justifyContent="space-between"
        className={cx(className, withBaseName())}
        separator={separator}
        stretchedItem={stretchedItem}
        style={flowLayoutStyles}
        ref={ref}
        {...rest}
      >
        {children}
      </FlexLayout>
    );
  }
);
