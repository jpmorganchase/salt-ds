import { forwardRef, ReactNode, HTMLAttributes } from "react";
import { FlexLayout, FlexLayoutProps } from "@jpmorganchase/uitk-core";
import "./SplitLayout.css";
import { makePrefixer } from "@jpmorganchase/uitk-core";
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
   * Allow the items to wrap as needed, default is true.
   */
  wrap?: FlexLayoutProps["wrap"];
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
      wrap = true,
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
        wrap={wrap}
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
