import { ElementType, forwardRef, ReactElement, ReactNode } from "react";
import { FlexLayout, FlexLayoutProps } from "../flex-layout";
import { PolymorphicComponentPropWithRef, PolymorphicRef } from "../utils";

export type SplitLayoutProps<T extends ElementType> =
  PolymorphicComponentPropWithRef<
    T,
    {
      /**
       * Defines the default behavior for how flex items are laid out along the cross axis on the current line.
       */
      align?: FlexLayoutProps<ElementType>["align"];
      /**
       * Allow the items to wrap as needed, default is true.
       */
      wrap?: FlexLayoutProps<ElementType>["wrap"];
      /**
       * The minimum gap between the 2 sides of the layout.
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
  >;

type SplitLayoutComponent = <T extends ElementType = "div">(
  props: SplitLayoutProps<T>
) => ReactElement | null;

export const SplitLayout: SplitLayoutComponent = forwardRef(
  <T extends ElementType = "div">(
    {
      align,
      leftSplitItem,
      rightSplitItem,
      wrap = true,
      gap,
      ...rest
    }: SplitLayoutProps<T>,
    ref?: PolymorphicRef<T>
  ) => {
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
        {leftSplitItem}
        {rightSplitItem}
      </FlexLayout>
    );
  }
);
