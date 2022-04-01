import { makePrefixer } from "@brandname/core";
import { forwardRef, HTMLAttributes } from "react";
import cx from "classnames";
import "./SplitLayout.css";
import { FlexLayout } from "../FlexLayout";
import { SeparatorVariant } from "../Separator";

const withBaseName = makePrefixer("uitkSplitLayout");

export interface SplitLayoutProps extends HTMLAttributes<HTMLDivElement> {
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
    { children, className, separator, stretchedItem, style, ...rest },
    ref
  ) {
    const flowLayoutStyles = {
      flexFlow: "row nowrap",
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
