import { forwardRef, ReactNode, HTMLAttributes } from "react";
import { FlexLayout, FlexLayoutProps } from "../FlexLayout";

import { makePrefixer } from "../../utils";
import "./SplitLayout.css";
import cx from "classnames";

export interface SplitItemProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * A list of items. Required to have some children.
   */
  children: ReactNode;
}

export interface SplitLayoutProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Defines the default behavior for how flex items are laid out along the cross axis on the current line.
   */
  align?: FlexLayoutProps["align"];
  /**
   * Adds a separator between elements.
   */
  separators?: FlexLayoutProps["separators"];
  /**
   * Disable wrapping so flex items try to fit onto one line, default is false.
   */
  disableWrap?: FlexLayoutProps["disableWrap"];
  /**
   * Controls the space between items.
   */
  gap?: FlexLayoutProps["gap"];
  /**
   * Parent component to be rendered
   */
  leftSplitItem: ReactNode;
  /**
   * Child component to be rendered
   */
  rightSplitItem: ReactNode;
}

const withBaseName = makePrefixer("uitkSplitLayout");

const SplitItem = forwardRef<HTMLDivElement, SplitItemProps>(function SplitItem(
  { children, ...rest },
  ref
) {
  return (
    <div {...rest} ref={ref}>
      {children}
    </div>
  );
});

export const SplitLayout = forwardRef<HTMLDivElement, SplitLayoutProps>(
  function SplitLayout(
    {
      align,
      leftSplitItem,
      rightSplitItem,
      separators,
      disableWrap = false,
      className,
      gap,
      ...rest
    },
    ref
  ) {
    return (
      <FlexLayout
        direction="row"
        ref={ref}
        disableWrap={disableWrap}
        gap={gap}
        separators={separators}
        className={cx(withBaseName(), className)}
        {...rest}
      >
        <SplitItem>{leftSplitItem}</SplitItem>
        <SplitItem>{rightSplitItem}</SplitItem>
      </FlexLayout>
    );
  }
);
