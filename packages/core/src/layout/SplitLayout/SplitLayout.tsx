import { forwardRef, ReactNode, HTMLAttributes, ElementType } from "react";
import { FlexLayout, FlexLayoutProps } from "../FlexLayout";
import "./SplitLayout.css";
import { FlexItem, FlexItemProps } from "../FlexItem";

export interface SplitItemProps extends FlexItemProps<ElementType> {
  /**
   * A list of items. Required to have some children.
   */
  children: ReactNode;
}

export interface SplitLayoutProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Defines the default behavior for how flex items are laid out along the cross axis on the current line.
   */
  align?: FlexLayoutProps<ElementType>["align"];
  /**
   * Allow the items to wrap as needed, default is true.
   */
  wrap?: FlexLayoutProps<ElementType>["wrap"];
  /**
   * Controls the space between items.
   */
  gap?: FlexLayoutProps<ElementType>["gap"];
  /**
   * Parent component to be rendered
   */
  leftSplitItem: ReactNode;
  /**
   * Child component to be rendered
   */
  rightSplitItem: ReactNode;
}

const SplitItem = forwardRef<HTMLDivElement, SplitItemProps>(function SplitItem(
  { children, ...rest },
  ref
) {
  return (
    <FlexItem {...rest} ref={ref}>
      {children}
    </FlexItem>
  );
});

export const SplitLayout = forwardRef<HTMLDivElement, SplitLayoutProps>(
  function SplitLayout(
    { align, leftSplitItem, rightSplitItem, wrap = true, gap, ...rest },
    ref
  ) {
    return (
      <FlexLayout
        align={align}
        direction="row"
        ref={ref}
        wrap={wrap}
        gap={gap}
        justify="space-between"
        {...rest}
      >
        <SplitItem>{leftSplitItem}</SplitItem>
        <SplitItem>{rightSplitItem}</SplitItem>
      </FlexLayout>
    );
  }
);
