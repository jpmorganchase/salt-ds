import { forwardRef, ReactNode } from "react";
import { FlexLayout } from "../FlexLayout";
import { FlexLayoutProps } from "../types";
import "./SplitLayout.css";
import { makePrefixer } from "@jpmorganchase/uitk-core";

export interface SplitItemProps {
  /**
   * Defines the default behavior for how flex items are laid out along the cross axis on the current line.
   */
  align?: FlexLayoutProps["align"];
  /**
   * A list of items. Required to have some children.
   */
  children: ReactNode;
  /**
   * Controls the space between items.
   */
  gap?: FlexLayoutProps["gap"];
  /**
   * Adds a separator between elements.
   */
  separators?: FlexLayoutProps["separators"];
  /**
   * Determins the side of the SplitItem.
   */
  side: "left" | "right";
}

export interface SplitLayoutProps {
  /**
   * Defines the default behavior for how flex items are laid out along the cross axis on the current line.
   */
  align?: FlexLayoutProps["align"];
  /**
   * Controls the space between items.
   */
  gap?: FlexLayoutProps["gap"];
  /**
   * Adds a separator between elements.
   */
  separators?: FlexLayoutProps["separators"];
  /**
   * Allow the items to wrap as needed, default is true.
   */
  wrap?: FlexLayoutProps["wrap"];
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
  { align, gap, separators, children, side, ...rest },
  ref
) {
  return (
    <FlexLayout
      align={align}
      gap={gap}
      separators={separators}
      className={withBaseName(`${side}-split`)}
      ref={ref}
      {...rest}
    >
      {children}
    </FlexLayout>
  );
});

export const SplitLayout = forwardRef<HTMLDivElement, SplitLayoutProps>(
  function SplitLayout(
    {
      align,
      gap,
      leftSplitItem,
      rightSplitItem,
      separators,
      wrap = true,
      ...rest
    },
    ref
  ) {
    const sideProps = { align, gap, separators };

    return (
      <FlexLayout
        direction="row"
        ref={ref}
        wrap={wrap}
        {...rest}
        className={withBaseName()}
      >
        <SplitItem side="left" {...sideProps}>
          {leftSplitItem}
        </SplitItem>
        <SplitItem side="right" {...sideProps}>
          {rightSplitItem}
        </SplitItem>
      </FlexLayout>
    );
  }
);
