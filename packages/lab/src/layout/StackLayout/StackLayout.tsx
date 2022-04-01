import { makePrefixer } from "@brandname/core";
import { forwardRef, HTMLAttributes, SyntheticEvent } from "react";
import cx from "classnames";
import { flexAlignment, FlexLayout } from "../FlexLayout";
import { HorizontalSeparatorVariant } from "../Separator";

const withBaseName = makePrefixer("uitkStackLayout");

export interface StackLayoutProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Defines the default behavior for how flex items are laid out along the cross axis on the current line.
   */
  alignItems?: flexAlignment | "stretch" | "baseline";
  /**
   * Controls the space between rows.
   */
  rowGap?: number | string;
  /**
   * Adds a line separator between items
   */
  separator?: HorizontalSeparatorVariant;
  /**
   * Allows the items to resize with a splitter
   */
  splitter?: boolean;
  /**
   * Callback for when the splitter moves
   */
  onSplitterMoved?: (event: SyntheticEvent | Event) => void;
}

export const StackLayout = forwardRef<HTMLDivElement, StackLayoutProps>(
  function StackLayout(
    {
      alignItems,
      children,
      className,
      rowGap,
      style,
      separator,
      splitter,
      onSplitterMoved,
      ...rest
    },
    ref
  ) {
    return (
      <FlexLayout
        direction="column"
        rowGap={rowGap}
        separator={separator}
        splitter={splitter}
        onSplitterMoved={onSplitterMoved}
        alignItems={alignItems}
        className={cx(className, withBaseName())}
        style={style}
        ref={ref}
        wrap={"nowrap"}
        {...rest}
      >
        {children}
      </FlexLayout>
    );
  }
);
