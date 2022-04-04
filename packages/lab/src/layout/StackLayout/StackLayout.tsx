import { makePrefixer } from "@brandname/core";
import {
  forwardRef,
  HTMLAttributes,
  SyntheticEvent,
  ComponentPropsWithoutRef,
} from "react";
import cx from "classnames";
import { FlexLayout } from "../FlexLayout";
import { HorizontalSeparatorVariant } from "../Separator";

const withBaseName = makePrefixer("uitkStackLayout");

type FlexLayoutProps = ComponentPropsWithoutRef<typeof FlexLayout>;

export interface StackLayoutProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Defines the default behavior for how flex items are laid out along the cross axis on the current line.
   */
  alignItems?: FlexLayoutProps["alignItems"];
  /**
   * Controls the space between rows.
   */
  gap?: number | string;
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
      gap,
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
        rowGap={gap}
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
